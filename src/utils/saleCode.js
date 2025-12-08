export function generateSaleCode() {
  const now = new Date();
  return `SALE-${now.getFullYear()}${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}-${now.getTime()}`;
}