import { addMonths } from "../../utils/isoDates.js";

// The fixed monthly principal-and-interest payment, rounded to the cent the
// way servicers quote it.
function monthlyPaymentCents({ principalCents, annualRatePercent, termMonths }) {
  const monthlyRate = annualRatePercent / 100 / 12;
  if (monthlyRate === 0) {
    return Math.ceil(principalCents / termMonths);
  }
  return Math.round((principalCents * monthlyRate) / (1 - (1 + monthlyRate) ** -termMonths));
}

// One row per payment. Each month's interest is the balance times the
// monthly rate, rounded to the cent; the rest of the payment is principal.
// The last payment takes whatever balance is left, so principal always
// adds up to the amount borrowed.
function buildSchedule({ principalCents, annualRatePercent, termMonths, firstPaymentDate, monthlyEscrowCents }) {
  const monthlyRate = annualRatePercent / 100 / 12;
  const paymentCents = monthlyPaymentCents({ principalCents, annualRatePercent, termMonths });
  const rows = [];
  let balanceCents = principalCents;

  for (let number = 1; number <= termMonths && balanceCents > 0; number++) {
    const interestCents = Math.round(balanceCents * monthlyRate);
    const principalPartCents =
      number === termMonths ? balanceCents : Math.min(paymentCents - interestCents, balanceCents);
    balanceCents -= principalPartCents;
    rows.push({
      number,
      dueDate: addMonths(firstPaymentDate, number - 1),
      interestCents,
      principalCents: principalPartCents,
      escrowCents: monthlyEscrowCents,
      totalCents: interestCents + principalPartCents + monthlyEscrowCents,
      balanceCents,
    });
  }
  return rows;
}

export { monthlyPaymentCents, buildSchedule };
