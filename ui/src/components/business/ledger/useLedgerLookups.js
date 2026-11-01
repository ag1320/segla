import { useSelector } from "react-redux";

// Journal lines carry ids; the ledger shows names.
export default function useLedgerLookups() {
  const accounts = useSelector((state) => state.businessAccounts.items);
  const properties = useSelector((state) => state.businessProperties.items);

  const accountsById = Object.fromEntries(accounts.map((account) => [account.id, account]));
  const propertiesById = Object.fromEntries(properties.map((property) => [property.id, property]));

  const accountLabel = (accountId) => {
    const account = accountsById[accountId];
    return account ? `${account.number} ${account.name}` : `Account ${accountId}`;
  };

  const propertyLabel = (propertyId) =>
    propertyId === null ? "Company-wide" : propertiesById[propertyId]?.name ?? `Property ${propertyId}`;

  return { accountsById, accountLabel, propertyLabel };
}
