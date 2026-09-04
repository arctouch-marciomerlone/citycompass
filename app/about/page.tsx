import { redirect } from "next/navigation";

import { DEFAULT_LOCALE } from "@/lib/locale";
import { aboutPath } from "@/lib/routes";

export default function AboutRedirectPage() {
  redirect(aboutPath(DEFAULT_LOCALE));
}
