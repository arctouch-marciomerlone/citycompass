import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { getCities } from "@/lib/hygraph/get-cities";
import { getCity } from "@/lib/hygraph/get-city";
import { getUiMessages } from "@/lib/i18n/messages";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/locale";

export async function generateStaticParams() {
  try {
    const cities = await getCities(DEFAULT_LOCALE);
    return cities.map((city) => ({ city: city.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]/[city]">): Promise<Metadata> {
  const { locale: localeParam, city: citySlug } = await params;
  if (!isLocale(localeParam)) {
    return { title: "CityCompass" };
  }
  try {
    const city = await getCity({ slug: citySlug, locale: localeParam });
    return {
      title: city?.seo?.title ?? city?.name ?? "CityCompass",
      description: city?.seo?.description ?? "Localized city guide",
      robots:
        city?.seo?.noIndex === true
          ? { index: false, follow: false }
          : undefined,
    };
  } catch {
    return { title: "CityCompass" };
  }
}

export default async function CityLayout({
  children,
  params,
}: LayoutProps<"/[locale]/[city]">) {
  const { locale: localeParam, city: citySlug } = await params;
  if (!isLocale(localeParam)) {
    notFound();
  }
  const locale: Locale = localeParam;
  const [city, cities] = await Promise.all([
    getCity({ slug: citySlug, locale }),
    getCities(locale),
  ]);
  if (city === undefined) {
    notFound();
  }
  const messages = getUiMessages(locale);

  return (
    <>
      <SiteHeader
        locale={locale}
        citySlug={city.slug}
        cityName={city.name}
        cities={cities}
        messages={messages}
      />
      {children}
    </>
  );
}
