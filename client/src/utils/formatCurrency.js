
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || amount === "") {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(Number(amount));
};
