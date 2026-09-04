import { getUiMessages } from "@/lib/i18n/messages";
import { DEFAULT_LOCALE } from "@/lib/locale";

export default function Loading() {
  const messages = getUiMessages(DEFAULT_LOCALE);
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 items-center px-4 py-16">
      <p>{messages.loading}</p>
    </main>
  );
}
