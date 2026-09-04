import { notFound } from "next/navigation";

import { AboutContent } from "@/components/about/AboutContent";
import { getUiMessages } from "@/lib/i18n/messages";
import { isLocale } from "@/lib/locale";

export default async function AboutPage({
  params,
}: PageProps<"/[locale]/about">) {
  const { locale: localeParam } = await params;
  if (!isLocale(localeParam)) {
    notFound();
  }
  const messages = getUiMessages(localeParam);
  return <AboutContent about={messages.about} />;
}
