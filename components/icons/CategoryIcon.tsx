import type { IconKey } from "@/lib/hygraph/enumerations";

const PATHS: Record<IconKey, string> = {
  FOOD_AND_DRINK: "M4 4h6v8H4zM14 8h6v12h-6zM4 16h6v4H4z",
  CULTURE: "M4 20V8l8-4 8 4v12H4zm8-8v8",
  OUTDOORS: "M3 20h18L12 4 3 20zm9-6v6",
  SHOPPING: "M6 8h12l-1 12H7L6 8zm3-3h6v3H9V5z",
  HISTORIC_SITES: "M4 20h16M6 20V10l6-4 6 4v10M12 10v10",
};

export function CategoryIcon({
  iconKey,
  label,
}: {
  readonly iconKey: IconKey;
  readonly label: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="inline-block h-4 w-4 shrink-0"
      aria-hidden={false}
      role="img"
      aria-label={label}
    >
      <path
        d={PATHS[iconKey]}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
