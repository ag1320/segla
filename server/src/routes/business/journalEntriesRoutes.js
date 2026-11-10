import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate.js";
import {
  postJournalEntry,
  reverseJournalEntry,
} from "../../services/business/postingService.js";
import {
  findJournalEntriesWithLines,
  findJournalEntryWithLines,
} from "../../services/business/journalEntriesService.js";
import { ID, ID_PARAMS, ISO_DATE, CENTS } from "./schemaFields.js";

const JOURNAL_ENTRY_FILTERS = z.strictObject({
  from: ISO_DATE.optional(),
  to: ISO_DATE.optional(),
  accountId: ID.optional(),
});

// Shape only. The posting service checks that the entry balances, the
// period is open, and the accounts and properties can be used.
const JOURNAL_LINE = z.strictObject({
  accountId: ID,
  propertyId: ID.nullable().optional(),
  vendorId: ID.nullable().optional(),
  debitCents: CENTS.optional(),
  creditCents: CENTS.optional(),
  needsCpaReview: z.boolean().optional(),
});

const NEW_JOURNAL_ENTRY = z.strictObject({
  entityId: ID,
  entryDate: ISO_DATE,
  memo: z.string().trim().max(1000).nullable().optional(),
  lines: z.array(JOURNAL_LINE).min(2),
});

const REVERSAL = z.strictObject({ entryDate: ISO_DATE });

const router = Router();

router.get(
  "/business/journal-entries",
  validate({ query: JOURNAL_ENTRY_FILTERS }),
  async (req, res) => {
    const entries = await findJournalEntriesWithLines(req.validated.query);
    res.status(200).json(entries);
  },
);

router.get(
  "/business/journal-entries/:id",
  validate({ params: ID_PARAMS }),
  async (req, res) => {
    const entry = await findJournalEntryWithLines(req.validated.params.id);
    res.status(200).json(entry);
  },
);

// Entries posted here are manual. Imports and system entries come from
// their own services.
router.post(
  "/business/journal-entries",
  validate({ body: NEW_JOURNAL_ENTRY }),
  async (req, res) => {
    const entry = await postJournalEntry({
      ...req.validated.body,
      source: "manual",
    });
    res.status(201).json(entry);
  },
);

router.post(
  "/business/journal-entries/:id/reversal",
  validate({ params: ID_PARAMS, body: REVERSAL }),
  async (req, res) => {
    const reversal = await reverseJournalEntry(
      req.validated.params.id,
      req.validated.body.entryDate,
    );
    res.status(201).json(reversal);
  },
);

export default router;
