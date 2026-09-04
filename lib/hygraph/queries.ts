const ASSET_FIELDS = `
  url
  width
  height
`;

const PLACE_CARD_FIELDS = `
  id
  slug
  name
  summary
  address
  priceBand
  isFeatured
  googlePlaceId
  location { latitude longitude }
  images { ${ASSET_FIELDS} }
  categories { slug name iconKey sortOrder }
  neighborhood { slug name }
`;

export const CITY_PAGE_QUERY = `
query CityPage($slug: String!, $locales: [Locale!]!) {
  city(where: { slug: $slug }, locales: $locales, stage: PUBLISHED) {
    slug
    name
    country
    timezone
    intro { html }
    location { latitude longitude }
    heroImage { ${ASSET_FIELDS} }
    seo {
      title
      description
      noIndex
      image { ${ASSET_FIELDS} }
    }
    pageSections {
      __typename
      ... on HeroBlock {
        eyebrow
        heading
        body { html }
        callToActionLabel
        callToActionUrl
        image { ${ASSET_FIELDS} }
      }
      ... on RichTextBlock {
        heading
        body { html }
      }
      ... on FeaturedPlacesBlock {
        heading
        layout
        places { ${PLACE_CARD_FIELDS} }
      }
      ... on WeatherBlock {
        heading
        showCurrent
      }
      ... on MapBlock {
        heading
        initialZoom
        showFeaturedOnly
      }
      ... on CallToActionBlock {
        heading
        body { html }
        label
        url
      }
    }
  }
}
`;

export const CITIES_QUERY = `
query Cities($locales: [Locale!]!) {
  cities(
    locales: $locales
    stage: PUBLISHED
    first: 100
    orderBy: createdAt_ASC
  ) {
    slug
    name
  }
}
`;

export const CITY_WEATHER_QUERY = `
query CityWeather(
  $slug: String!
  $latitude: Float!
  $longitude: Float!
  $timezone: String!
) {
  city(where: { slug: $slug }, stage: PUBLISHED) {
    weather(
      query: {
        latitude: $latitude
        longitude: $longitude
        timezone: $timezone
      }
    ) {
      timezone
      current {
        time
        temperature_2m
        apparent_temperature
        weather_code
        wind_speed_10m
      }
      daily {
        time
        weather_code
        temperature_2m_max
        temperature_2m_min
      }
    }
  }
}
`;

export const PLACES_QUERY = `
query Places($where: PlaceWhereInput!, $locales: [Locale!]!) {
  places(where: $where, locales: $locales, stage: PUBLISHED, first: 100) {
    ${PLACE_CARD_FIELDS}
  }
}
`;

export const PLACE_DETAIL_QUERY = `
query PlaceDetail($slug: String!, $locales: [Locale!]!) {
  place(where: { slug: $slug }, locales: $locales, stage: PUBLISHED) {
    ${PLACE_CARD_FIELDS}
    description { html }
    accessibilityNotes { html }
    phone
    websiteUrl
    lastVerified
    openingHours {
      day
      closed
      opensAt
      closesAt
    }
    seo {
      title
      description
      noIndex
      image { ${ASSET_FIELDS} }
    }
    city { slug timezone }
  }
}
`;

export const FILTERS_QUERY = `
query PlaceFilters($citySlug: String!, $locales: [Locale!]!) {
  categories(locales: $locales, stage: PUBLISHED, orderBy: sortOrder_ASC) {
    slug
    name
    iconKey
    sortOrder
  }
  neighborhoods(where: { city: { slug: $citySlug } }, locales: $locales, stage: PUBLISHED) {
    slug
    name
  }
}
`;

export const PLACE_SLUGS_QUERY = `
query PlaceSlugs($citySlug: String!) {
  places(where: { city: { slug: $citySlug } }, stage: PUBLISHED, first: 100) {
    slug
  }
}
`;
