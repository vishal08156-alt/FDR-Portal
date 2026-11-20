
export const formatDate = (date) => {
  if (!date) return "—";

  const [year, month, day] = String(date)
    .slice(0, 10)
    .split("-");

  if (!year || !month || !day) return "—";

  return `${day}-${month}-${year}`;
};
