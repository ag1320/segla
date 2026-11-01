# Future: moving a property into an LLC

Not scheduled. Only after the property's mortgage is paid off (the
due-on-sale clause doesn't exempt transfers to an LLC).

## Tax (confirm with the CPA)

- A single-member LLC is disregarded, so the transfer isn't a sale.
- Basis, placed-in-service date and the depreciation schedule carry over.
  The property stays on the same Schedule E.
- Legal work outside Segla: deed, title insurance endorsement, insurance in
  the LLC's name, state/county transfer tax, lease assignment.

## Books

History is never re-tagged. Entries before the transfer stay in Gettemy
Properties. On the deed date, post two balanced entries:

1. Gettemy Properties: credit the property's asset accounts (land,
   building, improvements), debit its accumulated depreciation, and put the
   net against Owner Draws.
2. The LLC: the same balances, same basis and accumulated depreciation,
   against Owner Contributions.

## Code changes needed then

- Property ownership by date: a table of (property, entity, from date).
  The posting rule becomes "the property belongs to the entry's entity on
  the entry date". Until then, `editProperty` refuses to change a
  property's entity, on purpose.
- A transfer wizard (like the 4.4 conversion wizard) that builds both
  entries from the property's balances on the transfer date.
- A route to create an entity (only `GET /business/entities` exists).
