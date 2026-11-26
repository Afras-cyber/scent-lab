import { publicEnv } from "@/lib/public-env";

/** Default product image until real photos are uploaded. */
export const FALLBACK_PRODUCT_IMAGE = "/images/products/product_image.png";

/**
 * Turns a stored image path into a URL. Paths starting with `/` are files in
 * `public/`; anything else is an object in the public `products` bucket.
 */
export function resolveImagePath(path: string | null | undefined): string {
  if (!path) return FALLBACK_PRODUCT_IMAGE;
  if (path.startsWith("/")) return path;
  const base = publicEnv.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "");
  const object = path.split("/").map(encodeURIComponent).join("/");
  return `${base}/storage/v1/object/public/products/${object}`;
}
