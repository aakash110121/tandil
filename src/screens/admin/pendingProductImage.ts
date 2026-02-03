/**
 * When user creates or updates a product with images from device, we store the product id
 * and the local file URI here. The product list uses this to show the image instantly
 * instead of waiting for the server URL to load.
 */
let pending: { productId: number; localImageUri: string } | null = null;

export function setPendingProductImage(productId: number, localImageUri: string) {
  pending = { productId, localImageUri };
}

export function getPendingProductImage(productId: number): string | null {
  if (!pending || pending.productId !== productId) return null;
  return pending.localImageUri;
}

export function clearPendingProductImage() {
  pending = null;
}

export function getPendingProductId(): number | null {
  return pending?.productId ?? null;
}
