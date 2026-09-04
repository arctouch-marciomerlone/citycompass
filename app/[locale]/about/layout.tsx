import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { getCities } from "@/lib/hygraph/get-cities";
import type { CitySummary } from "@/lib/hygraph/types";
import { getUiMessages } from "@/lib/i18n/messages";
import { isLocale, type Locale } from "@/lib/locale";

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]/about">): Promise<Metadata> {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) {
    return { title: "CityCompass" };
  }
  const about = getUiMessages(localeParam).about;
  return {
    title: about.title,
    description: about.intro,
  };
}

export default async function AboutLayout({
  children,
  params,
}: LayoutProps<"/[locale]/about">) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) {
    notFound();
  }
  const locale: Locale = localeParam;
  const messages = getUiMessages(locale);
  let cities: CitySummary[] = [];
  try {
    cities = await getCities(locale);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "about city query failed";
    console.error(message);
  }

  return (
    <>
      <SiteHeader locale={locale} cities={cities} messages={messages} />
      {children}
    </>
  );
}
