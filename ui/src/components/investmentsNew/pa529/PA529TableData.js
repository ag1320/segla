export function getColumns() {
  const columns = [
    {
      id: "icon",
      label: "",
      width: "8%",
      align: "center",
      color: (value) => "#fff",
    },
    {
      id: "beneficiary",
      label: "Beneficiary",
      width: "23%",
      align: "left",
      color: (value) => "#fff",
    },
    {
      id: "year",
      label: "Projected Year for College",
      width: "23%",
      align: "center",
      color: (value) => "#fff",
    },
    {
      id: "value",
      label: "Current\u00a0Value",
      width: "23%",
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
      id: "return",
      label: "Total\u00a0Return",
      width: "23%",
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
