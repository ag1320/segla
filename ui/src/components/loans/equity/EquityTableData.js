export function getColumns() {
  const columns = [
    {
      id: "icon",
      label: "",
      width: "10%",
      align: "center",
      color: (value) => "#fff",
    },
    {
      id: "address",
      label: "Address",
      width: "36%",
      align: "center",
      color: (value) => "#fff",
    },
    {
      id: "valuation",
      label: "Valuation",
      width: "18%",
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
      width: "18%",
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
      id: "equity",
      label: "Estimated\u00a0Equity",
      width: "18%",
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
