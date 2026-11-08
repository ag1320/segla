import { useSelector } from "react-redux";

// Journal lines and rules carry ids; the screens show names.
export default function useLedgerLookups() {
  const accounts = useSelector((state) => state.businessAccounts.items);
  const properties = useSelector((state) => state.businessProperties.items);
  const vendors = useSelector((state) => state.businessVendors.items);

  const accountsById = Object.fromEntries(accounts.map((account) => [account.id, account]));
  const propertiesById = Object.fromEntries(properties.map((property) => [property.id, property]));
  const vendorsById = Object.fromEntries(vendors.map((vendor) => [vendor.id, vendor]));

  const accountLabel = (accountId) => {
    const account = accountsById[accountId];
    return account ? `${account.number} ${account.name}` : `Account ${accountId}`;
  };

  const propertyLabel = (propertyId) =>
    propertyId === null ? "Company-wide" : propertiesById[propertyId]?.name ?? `Property ${propertyId}`;

  // null when no vendor is set
  const vendorLabel = (vendorId) =>
    vendorId === null ? null : vendorsById[vendorId]?.name ?? `Vendor ${vendorId}`;

  return { accountsById, accountLabel, propertyLabel, vendorLabel };
}
