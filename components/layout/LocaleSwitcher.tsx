"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import {
  type Locale,
  replaceLocaleInPathname,
  SUPPORTED_LOCALES,
} from "@/lib/locale";
import { isAppRoute, localeHomePath } from "@/lib/routes";

const LABELS: Record<Locale, string> = {
  en_US: "English",
  pt_BR: "Português",
  zh_CN: "中文",
};

export function LocaleSwitcher({
  locale,
  label,
}: {
  readonly locale: Locale;
  readonly label: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const suffix = query.length > 0 ? `?${query}` : "";

  return (
    <nav aria-label={label} className="flex flex-wrap gap-2 text-sm">
      {SUPPORTED_LOCALES.map((item) => {
        const nextPath = `${replaceLocaleInPathname(pathname, item)}${suffix}`;
        const href = isAppRoute(nextPath) ? nextPath : localeHomePath(item);
        const active = item === locale;
        return (
          <Link
            key={item}
            href={href}
            hrefLang={item.replace("_", "-")}
            className={
              active
                ? "font-medium underline underline-offset-4"
                : "text-zinc-600 hover:underline dark:text-zinc-400"
            }
            aria-current={active ? "page" : undefined}
          >
            {LABELS[item]}
          </Link>
        );
      })}
    </nav>
  );
}
