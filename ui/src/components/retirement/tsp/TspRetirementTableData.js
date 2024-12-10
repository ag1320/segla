export function getColumns() {
  const columns = [
    {
      id: "icon",
      label: "",
      width: "9%",
      align: "center",
      color: (value) => "#fff",
    },
    {
      id: "holder",
      label: "Account\u00a0Holder",
      width: "13%",
      align: "left",
      color: (value) => "#fff",
    },
    {
      id: "type",
      label: "Account\u00a0Type",
      width: "13%",
      align: "left",
      color: (value) => "#fff",
    },
    
    {
      id: "contribution",
      label: "My Contribution",
      width: "13%",
      align: "center",
      color: (value) => "#fff",
    },
    {
      id: "govtContribution",
      label: "Government Contribution",
      width: "13%",
      align: "center",
      color: (value) => "#fff",
    },
    {
      id: "ytdReturn",
      label: "YTD\u00a0Return\u00a0Percentage",
      width: "13%",
      align: "center",
      color: (value) => "#fff",
    },
    {
      id: "value",
      label: "Current\u00a0Value",
      width: "13%",
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
      width: "13%",
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
