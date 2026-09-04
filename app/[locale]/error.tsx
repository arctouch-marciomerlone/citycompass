"use client";

export default function LocaleError({
  error,
}: {
  readonly error: Error & { digest?: string };
}) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-2 px-4 py-16">
      <h1 className="text-2xl font-semibold">CityCompass</h1>
      <p>This page could not be loaded.</p>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {error.message}
      </p>
    </main>
  );
}
