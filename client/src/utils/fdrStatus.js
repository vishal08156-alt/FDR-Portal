
export const getMaturityStatus = (maturityDate) => {
  if (!maturityDate) return "Date Missing";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maturity = new Date(`${maturityDate}T00:00:00`);

  if (Number.isNaN(maturity.getTime())) {
    return "Date Missing";
  }

  const difference = Math.ceil(
    (maturity - today) / (1000 * 60 * 60 * 24)
  );

  if (difference < 0) return "Matured";
  if (difference <= 30) return "Expiring Soon";

  return "Active";
};
