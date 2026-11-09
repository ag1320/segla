import { findEntity } from "../../controllers/business/entitiesController.js";
import { findProperties, findProperty } from "../../controllers/business/propertiesController.js";
import { findAccountByNumber } from "../../controllers/business/accountsController.js";
import {
  findLeases,
  findLease,
  insertLease,
  updateLease,
  deleteLease,
} from "../../controllers/business/leasesController.js";
import { findAccountTotals } from "../../controllers/business/reportsController.js";
import { postJournalEntry } from "./postingService.js";
import { ValidationError, NotFoundError } from "../../utils/errors.js";

const DEPOSITS_HELD = 2100;
const FEES_AND_OTHER_CHARGES = 4010;

// upcoming → active → (month_to_month once the end date passes with the
// tenant still there) → ended on the move-out date.
function leaseStatus(lease, asOfDate) {
  if (lease.start_date > asOfDate) return "upcoming";
  if (lease.move_out_date && lease.move_out_date <= asOfDate) return "ended";
  if (lease.end_date && lease.end_date < asOfDate) return "month_to_month";
  return "active";
}

async function listLeases(asOfDate) {
  const leases = await findLeases();
  return leases.map((lease) => ({ ...lease, status: leaseStatus(lease, asOfDate) }));
}

async function createLease({ propertyId, ...details }) {
  if (!(await findProperty(propertyId))) {
    throw new NotFoundError(`Property ${propertyId} not found`);
  }
  assertDatesInOrder(details);
  return insertLease({ property_id: propertyId, ...toLeaseColumns(details) });
}

async function editLease(leaseId, changes) {
  const lease = await getLease(leaseId);
  assertDatesInOrder({
    startDate: changes.startDate ?? lease.start_date,
    endDate: changes.endDate === undefined ? lease.end_date : changes.endDate,
    moveOutDate: changes.moveOutDate === undefined ? lease.move_out_date : changes.moveOutDate,
  });
  return updateLease(leaseId, toLeaseColumns(changes));
}

async function removeLease(leaseId) {
  await getLease(leaseId);
  await deleteLease(leaseId);
}

// Money kept from a deposit (for damages or unpaid rent) stops being owed
// to the tenant and becomes income. The rest goes back through the Inbox
// when the refund clears the bank.
async function keepDeposit(leaseId, { entryDate, amountCents }) {
  const lease = await getLease(leaseId);
  const property = await findProperty(lease.property_id);
  const heldCents = (await depositsHeldByProperty({ entityId: property.entity_id, asOfDate: entryDate }))[
    property.property_id
  ] ?? 0;
  if (amountCents > heldCents) {
    throw new ValidationError(
      `${property.name} holds ${formatDollars(heldCents)} in deposits on ${entryDate}, less than ${formatDollars(amountCents)}`,
    );
  }
  const [deposits, fees] = await Promise.all([
    findAccountByNumber(DEPOSITS_HELD),
    findAccountByNumber(FEES_AND_OTHER_CHARGES),
  ]);
  return postJournalEntry({
    entityId: property.entity_id,
    entryDate,
    memo: `Deposit kept, ${lease.tenant_name}`,
    source: "manual",
    lines: [
      { accountId: deposits.account_id, propertyId: property.property_id, debitCents: amountCents },
      { accountId: fees.account_id, propertyId: property.property_id, creditCents: amountCents },
    ],
  });
}

// Every property with its current and upcoming leases on asOfDate, the
// rent they bring in, and two deposit figures that should agree: what
// the leases say was collected and what the books hold in 2100.
async function getRentRoll({ entityId, asOfDate }) {
  if (!(await findEntity(entityId))) {
    throw new NotFoundError(`Entity ${entityId} not found`);
  }
  const [properties, leases, heldByProperty] = await Promise.all([
    findProperties(),
    findLeases({ entityId }),
    depositsHeldByProperty({ entityId, asOfDate }),
  ]);

  const rows = properties
    .filter((property) => property.entity_id === entityId)
    .map((property) => {
      const current = leases
        .filter((lease) => lease.property_id === property.property_id)
        .map((lease) => ({ ...lease, status: leaseStatus(lease, asOfDate) }))
        .filter((lease) => lease.status !== "ended");
      const occupying = current.filter((lease) => lease.status !== "upcoming");
      return {
        property_id: property.property_id,
        name: property.name,
        property_status: property.status,
        is_vacant: property.status === "active" && occupying.length === 0,
        leases: current,
        monthly_rent_cents: sum(occupying, "monthly_rent_cents"),
        deposits_on_leases_cents: sum(current, "deposit_cents"),
        deposits_held_cents: heldByProperty[property.property_id] ?? 0,
      };
    });

  return {
    entity_id: entityId,
    as_of_date: asOfDate,
    rows,
    monthly_rent_cents: sum(rows, "monthly_rent_cents"),
    deposits_on_leases_cents: sum(rows, "deposits_on_leases_cents"),
    deposits_held_cents: sum(rows, "deposits_held_cents"),
  };
}

// { [propertyId]: cents } owed to tenants per the 2100 balance.
async function depositsHeldByProperty({ entityId, asOfDate }) {
  const [deposits, totals] = await Promise.all([
    findAccountByNumber(DEPOSITS_HELD),
    findAccountTotals({ entityId, to: asOfDate, byProperty: true }),
  ]);
  return Object.fromEntries(
    totals
      .filter((row) => row.account_id === deposits.account_id && row.property_id !== null)
      .map((row) => [row.property_id, row.credit_cents - row.debit_cents]),
  );
}

async function getLease(leaseId) {
  const lease = await findLease(leaseId);
  if (!lease) {
    throw new NotFoundError(`Lease ${leaseId} not found`);
  }
  return lease;
}

function assertDatesInOrder({ startDate, endDate, moveOutDate }) {
  if (endDate && endDate < startDate) {
    throw new ValidationError("The lease can't end before it starts");
  }
  if (moveOutDate && moveOutDate < startDate) {
    throw new ValidationError("The move-out date can't be before the start date");
  }
}

function toLeaseColumns({ tenantName, unit, startDate, endDate, moveOutDate, monthlyRentCents, depositCents }) {
  return {
    tenant_name: tenantName,
    unit,
    start_date: startDate,
    end_date: endDate,
    move_out_date: moveOutDate,
    monthly_rent_cents: monthlyRentCents,
    deposit_cents: depositCents,
  };
}

function sum(items, field) {
  return items.reduce((total, item) => total + item[field], 0);
}

function formatDollars(cents) {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export { listLeases, createLease, editLease, removeLease, keepDeposit, getRentRoll };
