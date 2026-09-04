import type {
  FeaturedPlacesLayout,
  IconKey,
  OpeningHoursDay,
  PriceBand,
  SectionTypename,
} from "@/lib/hygraph/enumerations";

export interface LocationValue {
  readonly latitude: number;
  readonly longitude: number;
}

export interface AssetView {
  readonly url: string;
  readonly width: number | undefined;
  readonly height: number | undefined;
}

export interface SeoView {
  readonly title: string | undefined;
  readonly description: string | undefined;
  readonly noIndex: boolean;
  readonly image: AssetView | undefined;
}

export interface CategoryView {
  readonly slug: string;
  readonly name: string;
  readonly iconKey: IconKey;
  readonly sortOrder: number | undefined;
}

export interface NeighborhoodView {
  readonly slug: string;
  readonly name: string;
}

export interface CitySummary {
  readonly slug: string;
  readonly name: string;
}

export interface PlaceCardView {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly summary: string;
  readonly address: string;
  readonly priceBand: PriceBand | undefined;
  readonly isFeatured: boolean;
  readonly googlePlaceId: string | undefined;
  readonly location: LocationValue;
  readonly images: readonly AssetView[];
  readonly categories: readonly CategoryView[];
  readonly neighborhood: NeighborhoodView | undefined;
}

export interface OpeningHoursView {
  readonly day: OpeningHoursDay;
  readonly closed: boolean;
  readonly opensAt: string | undefined;
  readonly closesAt: string | undefined;
}

export interface PlaceDetailView extends PlaceCardView {
  readonly descriptionHtml: string;
  readonly accessibilityNotesHtml: string | undefined;
  readonly phone: string | undefined;
  readonly websiteUrl: string | undefined;
  readonly lastVerified: string | undefined;
  readonly openingHours: readonly OpeningHoursView[];
  readonly seo: SeoView | undefined;
  readonly citySlug: string;
  readonly cityTimezone: string;
}

export interface HeroBlockView {
  readonly __typename: typeof SectionTypename.HeroBlock;
  readonly eyebrow: string | undefined;
  readonly heading: string;
  readonly bodyHtml: string | undefined;
  readonly callToActionLabel: string | undefined;
  readonly callToActionUrl: string | undefined;
  readonly image: AssetView | undefined;
}

export interface RichTextBlockView {
  readonly __typename: typeof SectionTypename.RichTextBlock;
  readonly heading: string | undefined;
  readonly bodyHtml: string | undefined;
}

export interface FeaturedPlacesBlockView {
  readonly __typename: typeof SectionTypename.FeaturedPlacesBlock;
  readonly heading: string | undefined;
  readonly layout: FeaturedPlacesLayout;
  readonly places: readonly PlaceCardView[];
}

export interface WeatherBlockView {
  readonly __typename: typeof SectionTypename.WeatherBlock;
  readonly heading: string | undefined;
  readonly showCurrent: boolean;
}

export interface MapBlockView {
  readonly __typename: typeof SectionTypename.MapBlock;
  readonly heading: string | undefined;
  readonly initialZoom: number | undefined;
  readonly showFeaturedOnly: boolean;
}

export interface CallToActionBlockView {
  readonly __typename: typeof SectionTypename.CallToActionBlock;
  readonly heading: string | undefined;
  readonly bodyHtml: string | undefined;
  readonly label: string | undefined;
  readonly url: string | undefined;
}

export type PageSectionView =
  | HeroBlockView
  | RichTextBlockView
  | FeaturedPlacesBlockView
  | WeatherBlockView
  | MapBlockView
  | CallToActionBlockView;

export interface CityView {
  readonly slug: string;
  readonly name: string;
  readonly country: string;
  readonly timezone: string;
  readonly introHtml: string;
  readonly location: LocationValue;
  readonly heroImage: AssetView;
  readonly seo: SeoView | undefined;
  readonly pageSections: readonly PageSectionView[];
}
