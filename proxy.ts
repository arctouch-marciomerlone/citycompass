import { NextResponse, type NextRequest } from "next/server";

import { isLocale, localeFromAcceptLanguage, type Locale } from "@/lib/locale";

function localeFromPathname(pathname: string): Locale | undefined {
  const first = pathname.split("/").find((segment) => segment.length > 0);
  return first !== undefined && isLocale(first) ? first : undefined;
}

function withLocaleHeader(request: NextRequest, locale: Locale) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-locale", locale);
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathLocale = localeFromPathname(pathname);
  if (pathLocale !== undefined) {
    return withLocaleHeader(request, pathLocale);
  }

  const locale = localeFromAcceptLanguage(
    request.headers.get("accept-language") ?? undefined,
  );
  request.nextUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ["/((?!_next/|api/|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)"],
};
