/**
 * Vendor custom-order status rules:
 * Order Placed → only Accept / Decline (design-request); no change-status dropdown.
 * Customer Accepted → Processing (then Ready for Pickup).
 * Processing → Ready for Pickup only.
 * Ready for Pickup → no further changes via this control.
 */

export function vendorCanChangeCustomOrderStatus(current: string): boolean {
  return current === "Customer Accepted" || current === "Processing";
}

export function getVendorCustomOrderStatusSelectOptions(current: string): {
  value: string;
  label: string;
}[] {
  if (current === "Customer Accepted") {
    return [
      { value: "Customer Accepted", label: "Customer Accepted" },
      { value: "Processing", label: "Processing" },
    ];
  }
  if (current === "Processing") {
    return [
      { value: "Processing", label: "Processing" },
      { value: "Ready for Pickup", label: "Ready for Pickup" },
    ];
  }
  return [];
}

export function isAllowedVendorCustomOrderStatusTransition(
  from: string,
  to: string,
): boolean {
  if (from === to) return false;
  if (from === "Customer Accepted" && to === "Processing") return true;
  if (from === "Processing" && to === "Ready for Pickup") return true;
  return false;
}
