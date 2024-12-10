//hold duration (today - most recent purchase) days
function holdDuration(transactions) {
  let time = new Date();
  let today = time.getTime();
  let times = transactions.map((transaction) => (new Date(transaction.date)).getTime());
  let sorted = times.sort()
  let result = (today - sorted[0])/1000/60/60/24/365
  return result;
}

//buy total (price*x+price*y...)$
function buyTotal(transactions) {
  let result = transactions.reduce((prev, current) => {
    if (current.order === 'Buy'){
      return prev + current.price * current.shares;
    } else {
      return prev
    }
  }, 0);
  return result;
}

//sell total (price*z+price*w...)$
function sellTotal(transactions) {
  let result = transactions.reduce((prev, current) => {
    if (current.order === 'Sell'){
      return prev + current.price * current.shares;
    } else {
      return prev
    }
  }, 0);
  return result;
}

//invested (buy total - sell total)$
function amountCurrentlyInvested(transactions) {
  let result = buyTotal(transactions) - sellTotal(transactions);
  return result;
}

//current avg invested per share (invested/current shares))$
function avgInvestedPerShare(amountInvested, shares) {
  let result = amountInvested / shares;
  return result;
}

//total current value (current shares * market price)$
function totalValue(shares, price) {
  let result = shares * price;
  return result;
}

//unrealized gains (total current value - invested)$
function unrealizedGains(value, amountInvested) {
  let result = value - amountInvested;
  return result;
}

//realized gains CALCULATE ONCE SHARES REACHES 0 (sell total - buy total)
function realizedGains(asset, transactions) {
  let result =
    asset.realizedGains + (sellTotal(transactions) - buyTotal(transactions));
  return result;
}

export {
  holdDuration,
  buyTotal,
  sellTotal,
  amountCurrentlyInvested,
  avgInvestedPerShare,
  totalValue,
  unrealizedGains,
  realizedGains,
};
