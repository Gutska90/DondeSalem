const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente de pago",
  PAGADO: "Pagado",
  PREPARANDO: "En preparación",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

export function formatOrderStatus(status: string): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}
