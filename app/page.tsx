import { redirect } from "next/navigation";

import { DEFAULT_LOCALE } from "@/lib/locale";
import { localeHomePath } from "@/lib/routes";

export default function RootPage() {
  redirect(localeHomePath(DEFAULT_LOCALE));
}
