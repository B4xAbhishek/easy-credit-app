/** ID used in GET `/api/mobile/orders/:id` — may differ from list row `id`. */
export function resolveOrderDetailId(row: {
  id: string;
  detailProductId?: string;
  detail_product_id?: string;
}): string {
  return row.detailProductId ?? row.detail_product_id ?? row.id;
}

export function formatInr(n: number): string {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(n);
}

export function toE164(phoneDigits: string): string {
  return `+91${phoneDigits.replace(/\D/g, '').slice(-10)}`;
}

export function buildUpiLink(
  upiId: string,
  payableAmountRupees: number,
  packageName?: string,
): string {
  const params = new URLSearchParams({
    pa: upiId,
    pn: 'Easy Credit',
    cu: 'INR',
    am: payableAmountRupees.toFixed(2),
  }).toString();

  if (!packageName) {
    return `upi://pay?${params}`;
  }

  return `intent://pay?${params}#Intent;scheme=upi;package=${packageName};end`;
}
