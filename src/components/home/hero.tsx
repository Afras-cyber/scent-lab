import { getImageProps } from "next/image";
import Link from "next/link";

import { getBanners } from "@/features/catalog/queries";

// Banner artwork sizes from the design. Admin uploads should match them.
const DESKTOP = { width: 1440, height: 548 };
const MOBILE = { width: 390, height: 172 };

/**
 * Full-width hero banner (the first active `hero` banner). The artwork carries
 * its own text, so the title is only the alt text and link label.
 */
export async function Hero() {
  const [banner] = await getBanners("hero");
  if (!banner) return null;

  const common = { alt: banner.alt, sizes: "100vw", priority: true };
  const {
    props: { srcSet: desktop },
  } = getImageProps({ ...common, ...DESKTOP, src: banner.imageDesktop });
  const {
    props: { srcSet: mobile, ...img },
  } = getImageProps({
    ...common,
    ...MOBILE,
    src: banner.imageMobile ?? banner.imageDesktop,
  });

  const picture = (
    <picture>
      <source media="(min-width: 768px)" srcSet={desktop} />
      <source srcSet={mobile} />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt comes from getImageProps */}
      <img {...img} className="h-auto w-full" />
    </picture>
  );

  return (
    // Edge to edge on desktop; a rounded card inside the gutters on mobile.
    <section aria-label={banner.title}>
      <div className="max-md:container-page max-md:pt-4">
        {banner.ctaHref ? (
          <Link
            href={banner.ctaHref}
            className="block overflow-hidden max-md:rounded-2xl"
          >
            {picture}
          </Link>
        ) : (
          <div className="overflow-hidden max-md:rounded-2xl">{picture}</div>
        )}
      </div>
    </section>
  );
}
