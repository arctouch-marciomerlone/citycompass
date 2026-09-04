import Image from "next/image";
import Link from "next/link";

import { CategoryIcon } from "@/components/icons/CategoryIcon";
import type { PlaceCardView } from "@/lib/hygraph/types";
import type { Locale } from "@/lib/locale";
import { placePath } from "@/lib/routes";

export function PlaceCard({
  locale,
  citySlug,
  place,
}: {
  readonly locale: Locale;
  readonly citySlug: string;
  readonly place: PlaceCardView;
}) {
  const href = placePath(locale, citySlug, place.slug);
  const image = place.images[0];

  return (
    <article className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
      {image !== undefined ? (
        <Link href={href} className="relative block aspect-[16/10]">
          <Image
            src={image.url}
            alt={place.name}
            fill
            sizes="(min-width: 768px) 33vw, 100vw"
            className="object-cover"
          />
        </Link>
      ) : null}
      <div className="space-y-2 p-4">
        <h3 className="text-lg font-medium">
          <Link href={href}>{place.name}</Link>
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {place.summary}
        </p>
        <p className="text-sm">{place.address}</p>
        <ul className="flex flex-wrap gap-2 text-xs">
          {place.categories.map((category) => (
            <li key={category.slug} className="flex items-center gap-1">
              <CategoryIcon iconKey={category.iconKey} label={category.name} />
              {category.name}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
