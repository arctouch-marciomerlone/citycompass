import type { AboutMessages } from "@/lib/i18n/messages";

export function AboutContent({ about }: { readonly about: AboutMessages }) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-8">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">{about.title}</h1>
        <p className="text-zinc-700 dark:text-zinc-300">{about.intro}</p>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">
          {about.platformHeading}
        </h2>
        <ul className="list-disc space-y-3 pl-5 text-zinc-700 dark:text-zinc-300">
          {about.platformItems.map((item) => (
            <li key={item.title}>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {item.title}
              </span>
              {" — "}
              {item.body}
            </li>
          ))}
        </ul>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">
          {about.webhookHeading}
        </h2>
        <p className="text-zinc-700 dark:text-zinc-300">{about.webhookBody}</p>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">
          {about.mapsHeading}
        </h2>
        <p className="text-zinc-700 dark:text-zinc-300">{about.mapsBody}</p>
      </section>
      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">
          {about.postMvpHeading}
        </h2>
        <p className="text-zinc-700 dark:text-zinc-300">{about.postMvpIntro}</p>
        <ul className="list-disc space-y-2 pl-5 text-zinc-700 dark:text-zinc-300">
          {about.postMvpItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
