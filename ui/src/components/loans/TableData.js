export function getColumns() {
  const columns = [
    {
      id: "icon",
      label: "",
      width: "7.5%",
      align: "center",
      color: (value) => "#fff",
    },
    {
      id: "url",
      label: "",
      width: "7.5%",
      align: "center",
      color: (value) => "#fff",
    },
    {
      id: "holder",
      label: "Account\u00a0Holder",
      width: "17%",
      align: "left",
      color: (value) => "#fff",
    },
    {
      id: "interestRate",
      label: "Interest\u00a0Rate",
      width: "17%",
      align: "center",
      color: (value) => "#fff",
    },
    
    {
      id: "payoffDate",
      label: "Estimated\u00a0Payoff\u00a0Date",
      width: "17%",
      align: "center",
      color: (value) => "#fff",
    },
    {
      id: "monthlyPayment",
      label: "Monthly\u00a0Payment",
      width: "17%",
      align: "center",
      color: (value) => "#fff",
      format: (value) => (
        <div className="currency" style={{ textAlign: "center" }}>
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(value)}
        </div>
      ),
    },
    {
      id: "remainingBalance",
      label: "Remaining\u00a0Balance",
      width: "17%",
      align: "center",
      color: (value) => "#fff",
      format: (value) => (
        <div className="currency" style={{ textAlign: "center" }}>
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(value)}
        </div>
      ),
    },
  ];

  return columns;
}
