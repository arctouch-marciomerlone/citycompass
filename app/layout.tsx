import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";

import { DEFAULT_LOCALE, isLocale, toHtmlLang } from "@/lib/locale";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CityCompass",
  description: "Localized city guide",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const headerList = await headers();
  const rawLocale = headerList.get("x-locale");
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  return (
    <html
      lang={toHtmlLang(locale)}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
