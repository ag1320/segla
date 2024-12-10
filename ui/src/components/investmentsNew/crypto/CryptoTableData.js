export function getColumns() {
  const columns = [
    {
      id: "icon",
      label: "",
      width: "9.33%",
      align: "center",
      color: (value) => "#fff",
    },
    {
      id: "url",
      label: "",
      width: "9.33%",
      align: "center",
      color: (value) => "#fff",
    },
    {
      id: "ticker",
      label: "Ticker",
      width: "9.33%",
      align: "left",
      color: (value) => "#fff",
    },
    {
      id: "name",
      label: "Name",
      width: "12%",
      align: "left",
      color: (value) => "#fff",
    },
    
    {
      id: "shares",
      label: "Shares",
      width: "12%",
      align: "center",
      color: (value) => "#fff",
    },
    {
      id: "marketValue",
      label: "Current\u00a0Market\u00a0Value",
      width: "12%",
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
      id: "costBasis",
      label: "Cost\u00a0Basis",
      width: "12%",
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
      id: "value",
      label: "Current\u00a0Value",
      width: "12%",
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
      id: "gains",
      label: "Gains\u00a0Losses",
      width: "12%",
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
