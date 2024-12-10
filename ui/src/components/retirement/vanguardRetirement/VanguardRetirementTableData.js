export function getColumns() {
  const columns = [
    {
      id: "icon",
      label: "",
      width: "7%",
      align: "center",
      color: (value) => "#fff",
    },
    {
      id: "holder",
      label: "Account\u00a0Holder",
      width: "15.5%",
      align: "left",
      color: (value) => "#fff",
    },
    {
      id: "type",
      label: "Account\u00a0Type",
      width: "15.5%",
      align: "left",
      color: (value) => "#fff",
    },
    
    {
      id: "totalReturn",
      label: "Total\u00a0Return\u00a0Percentage",
      width: "15.5%",
      align: "center",
      color: (value) => "#fff",
    },
    {
      id: "ytdReturn",
      label: "YTD\u00a0Return\u00a0Percentage",
      width: "15.5%",
      align: "center",
      color: (value) => "#fff",
    },
    {
      id: "value",
      label: "Current\u00a0Value",
      width: "15.5%",
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
      width: "15.5%",
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
