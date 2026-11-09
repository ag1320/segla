// Straight-line depreciation with the mid-month convention: the month an
// asset goes into service (and the month it's disposed of) counts as half
// a month. For residential rental property (27.5 years) this is exactly
// the IRS method. For the shorter classes the CPA usually depreciates
// faster, so Segla's figure is an estimate that the CPA's number replaces
// at year-end.
const ASSET_CLASSES = {
  land: { accountNumber: 1500, lifeMonths: null },
  building: { accountNumber: 1510, lifeMonths: 330 },
  building_improvement: { accountNumber: 1520, lifeMonths: 330 },
  land_improvement: { accountNumber: 1530, lifeMonths: 180 },
  furnishings: { accountNumber: 1540, lifeMonths: 60 },
};

const monthIndex = (isoDate) => {
  const [year, month] = isoDate.split("-").map(Number);
  return year * 12 + month - 1;
};

const decemberOf = (year) => `${year}-12-31`;

// asset: { assetClass, costCents, inServiceDate, disposalDate }
// The estimate of total depreciation from the start through the end of
// monthEndDate's month, rounded once so the months never drift.
function estimateThrough(asset, monthEndDate) {
  const { lifeMonths } = ASSET_CLASSES[asset.assetClass];
  const start = monthIndex(asset.inServiceDate);
  const month = monthIndex(monthEndDate);
  if (lifeMonths === null || month < start) {
    return 0;
  }
  const disposal = asset.disposalDate ? monthIndex(asset.disposalDate) : null;
  const months = disposal !== null && month >= disposal ? disposal - start : month - start + 0.5;
  return Math.round((asset.costCents * Math.min(months, lifeMonths)) / lifeMonths);
}

function estimateForYear(asset, year) {
  return estimateThrough(asset, decemberOf(year)) - estimateThrough(asset, decemberOf(year - 1));
}

// What accumulated depreciation should be at monthEndDate: the estimate,
// except that each year with a CPA figure uses that figure instead. Within
// a year the months follow the estimate, and December takes up the
// difference (the year-end true-up).
// cpaByYear: { [taxYear]: amountCents }
function targetThrough(asset, cpaByYear, monthEndDate) {
  const [year, month] = monthEndDate.split("-").map(Number);
  const corrections = Object.entries(cpaByYear)
    .map(([taxYear, amountCents]) => [Number(taxYear), amountCents])
    .filter(([taxYear]) => taxYear < year || (taxYear === year && month === 12))
    .reduce((total, [taxYear, amountCents]) => total + amountCents - estimateForYear(asset, taxYear), 0);
  return estimateThrough(asset, monthEndDate) + corrections;
}

// A row per year from the in-service year until fully depreciated or
// disposed of. Land has no rows.
function yearlySchedule(asset, cpaByYear) {
  const { lifeMonths } = ASSET_CLASSES[asset.assetClass];
  if (lifeMonths === null) {
    return [];
  }
  const firstYear = Number(asset.inServiceDate.slice(0, 4));
  const lastMonth = asset.disposalDate
    ? monthIndex(asset.disposalDate)
    : monthIndex(asset.inServiceDate) + lifeMonths;
  const lastYear = Math.floor(lastMonth / 12);

  const rows = [];
  let accumulatedCents = 0;
  for (let year = firstYear; year <= lastYear; year++) {
    const estimateCents = estimateForYear(asset, year);
    const cpaCents = cpaByYear[year] ?? null;
    accumulatedCents += cpaCents ?? estimateCents;
    rows.push({
      taxYear: year,
      estimateCents,
      cpaCents,
      accumulatedCents,
      bookValueCents: asset.costCents - accumulatedCents,
    });
  }
  return rows;
}

export { ASSET_CLASSES, estimateThrough, targetThrough, yearlySchedule };
