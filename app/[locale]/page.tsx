import { notFound, redirect } from "next/navigation";

import { getCities } from "@/lib/hygraph/get-cities";
import { isLocale } from "@/lib/locale";
import { homePath } from "@/lib/routes";

export default async function LocaleIndexPage({
  params,
}: PageProps<"/[locale]">) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) {
    notFound();
  }
  const cities = await getCities(localeParam);
  const first = cities[0];
  if (first === undefined) {
    notFound();
  }
  redirect(homePath(localeParam, first.slug));
}
