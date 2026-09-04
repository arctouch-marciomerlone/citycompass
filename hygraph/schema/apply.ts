import {
  RemoteFieldApiMethod,
  RemoteFieldType,
  RemoteSourceKind,
  RelationalFieldType,
  SimpleFieldType,
  VisibilityTypes,
  type Client,
} from "@hygraph/management-sdk";
import {
  CITY_WEATHER_FIELD,
  ComponentApiId,
  EnumerationApiId,
  HTTP_URL_PATTERN,
  ModelApiId,
  OPEN_METEO_FORECAST_URL,
  PAGE_SECTION_COMPONENT_API_IDS,
  REMOTE_FORECAST_TYPE,
  REMOTE_SOURCE_PREFIX,
  SLUG_RENDERER,
  WEATHER_REMOTE_INPUT_ARGS,
  WEATHER_REST_PATH,
} from "./constants.ts";
import {
  OPEN_METEO_QUERY_INPUT_SDL,
  OPEN_METEO_SDL,
} from "./open-meteo-sdl.ts";

function addSlugField(client: Client, parentApiId: string): void {
  client.createSimpleField({
    parentApiId,
    apiId: "slug",
    displayName: "Slug",
    type: SimpleFieldType.String,
    isRequired: true,
    isUnique: true,
    isLocalized: false,
    formRenderer: SLUG_RENDERER,
    tableRenderer: SLUG_RENDERER,
  });
}

function addUrlField(
  client: Client,
  parentApiId: string,
  apiId: string,
  displayName: string,
): void {
  client.createSimpleField({
    parentApiId,
    apiId,
    displayName,
    type: SimpleFieldType.String,
    isRequired: false,
    isLocalized: false,
    validations: {
      String: {
        matches: {
          regex: HTTP_URL_PATTERN,
          errorMessage: "Use an http or https URL",
        },
      },
    },
  });
}

function addAssetField(
  client: Client,
  parentApiId: string,
  apiId: string,
  displayName: string,
  reverseApiId: string,
  options: { isList: boolean; isRequired: boolean },
): void {
  client.createRelationalField({
    parentApiId,
    apiId,
    displayName,
    type: RelationalFieldType.Asset,
    isList: options.isList,
    isRequired: options.isRequired,
    reverseField: {
      apiId: reverseApiId,
      modelApiId: "Asset",
      displayName: reverseApiId,
      isList: true,
      visibility: VisibilityTypes.Hidden,
    },
  });
}

function addModels(client: Client): void {
  client.createModel({
    apiId: ModelApiId.City,
    apiIdPlural: "Cities",
    displayName: "City",
  });
  client.createModel({
    apiId: ModelApiId.Place,
    apiIdPlural: "Places",
    displayName: "Place",
  });
  client.createModel({
    apiId: ModelApiId.Category,
    apiIdPlural: "Categories",
    displayName: "Category",
  });
  client.createModel({
    apiId: ModelApiId.Neighborhood,
    apiIdPlural: "Neighborhoods",
    displayName: "Neighborhood",
  });
}

function addEnumerations(client: Client): void {
  client.createEnumeration({
    apiId: EnumerationApiId.IconKey,
    displayName: "Icon key",
    values: [
      { apiId: "FOOD_AND_DRINK", displayName: "Food and drink" },
      { apiId: "CULTURE", displayName: "Culture" },
      { apiId: "OUTDOORS", displayName: "Outdoors" },
      { apiId: "SHOPPING", displayName: "Shopping" },
      { apiId: "HISTORIC_SITES", displayName: "Historic sites" },
    ],
  });
  client.createEnumeration({
    apiId: EnumerationApiId.PriceBand,
    displayName: "Price band",
    values: [
      { apiId: "BUDGET", displayName: "Budget" },
      { apiId: "MODERATE", displayName: "Moderate" },
      { apiId: "PREMIUM", displayName: "Premium" },
    ],
  });
  client.createEnumeration({
    apiId: EnumerationApiId.FeaturedPlacesLayout,
    displayName: "Featured places layout",
    values: [
      { apiId: "GRID", displayName: "Grid" },
      { apiId: "CAROUSEL", displayName: "Carousel" },
    ],
  });
  client.createEnumeration({
    apiId: EnumerationApiId.OpeningHoursDay,
    displayName: "Opening hours day",
    values: [
      { apiId: "MONDAY", displayName: "Monday" },
      { apiId: "TUESDAY", displayName: "Tuesday" },
      { apiId: "WEDNESDAY", displayName: "Wednesday" },
      { apiId: "THURSDAY", displayName: "Thursday" },
      { apiId: "FRIDAY", displayName: "Friday" },
      { apiId: "SATURDAY", displayName: "Saturday" },
      { apiId: "SUNDAY", displayName: "Sunday" },
    ],
  });
}

function addCityFields(client: Client): void {
  client.createSimpleField({
    parentApiId: ModelApiId.City,
    apiId: "name",
    displayName: "Name",
    type: SimpleFieldType.String,
    isRequired: true,
    isLocalized: true,
    isTitle: true,
  });
  addSlugField(client, ModelApiId.City);
  client.createSimpleField({
    parentApiId: ModelApiId.City,
    apiId: "country",
    displayName: "Country",
    type: SimpleFieldType.String,
    isRequired: true,
    isLocalized: false,
  });
  client.createSimpleField({
    parentApiId: ModelApiId.City,
    apiId: "timezone",
    displayName: "Timezone",
    type: SimpleFieldType.String,
    isRequired: true,
    isLocalized: false,
    description: "IANA timezone, for example America/Sao_Paulo",
  });
  client.createSimpleField({
    parentApiId: ModelApiId.City,
    apiId: "location",
    displayName: "Location",
    type: SimpleFieldType.Location,
    isRequired: true,
    isLocalized: false,
  });
  client.createSimpleField({
    parentApiId: ModelApiId.City,
    apiId: "intro",
    displayName: "Intro",
    type: SimpleFieldType.Richtext,
    isRequired: true,
    isLocalized: true,
  });
  addAssetField(
    client,
    ModelApiId.City,
    "heroImage",
    "Hero image",
    "cityHeroImage",
    {
      isList: false,
      isRequired: true,
    },
  );
}

function addPlaceFields(client: Client): void {
  client.createSimpleField({
    parentApiId: ModelApiId.Place,
    apiId: "name",
    displayName: "Name",
    type: SimpleFieldType.String,
    isRequired: true,
    isLocalized: true,
    isTitle: true,
  });
  addSlugField(client, ModelApiId.Place);
  client.createSimpleField({
    parentApiId: ModelApiId.Place,
    apiId: "summary",
    displayName: "Summary",
    type: SimpleFieldType.String,
    isRequired: true,
    isLocalized: true,
  });
  client.createSimpleField({
    parentApiId: ModelApiId.Place,
    apiId: "description",
    displayName: "Description",
    type: SimpleFieldType.Richtext,
    isRequired: true,
    isLocalized: true,
  });
  client.createSimpleField({
    parentApiId: ModelApiId.Place,
    apiId: "address",
    displayName: "Address",
    type: SimpleFieldType.String,
    isRequired: true,
    isLocalized: false,
  });
  client.createSimpleField({
    parentApiId: ModelApiId.Place,
    apiId: "location",
    displayName: "Location",
    type: SimpleFieldType.Location,
    isRequired: true,
    isLocalized: false,
  });
  client.createSimpleField({
    parentApiId: ModelApiId.Place,
    apiId: "googlePlaceId",
    displayName: "Google Place ID",
    type: SimpleFieldType.String,
    isRequired: false,
    isLocalized: false,
  });
  addUrlField(client, ModelApiId.Place, "websiteUrl", "Website URL");
  client.createSimpleField({
    parentApiId: ModelApiId.Place,
    apiId: "phone",
    displayName: "Phone",
    type: SimpleFieldType.String,
    isRequired: false,
    isLocalized: false,
  });
  client.createEnumerableField({
    parentApiId: ModelApiId.Place,
    apiId: "priceBand",
    displayName: "Price band",
    enumerationApiId: EnumerationApiId.PriceBand,
    isRequired: false,
  });
  addAssetField(client, ModelApiId.Place, "images", "Images", "placeImages", {
    isList: true,
    isRequired: true,
  });
  client.createSimpleField({
    parentApiId: ModelApiId.Place,
    apiId: "isFeatured",
    displayName: "Featured",
    type: SimpleFieldType.Boolean,
    isRequired: true,
    isLocalized: false,
  });
  client.createSimpleField({
    parentApiId: ModelApiId.Place,
    apiId: "accessibilityNotes",
    displayName: "Accessibility notes",
    type: SimpleFieldType.Richtext,
    isRequired: false,
    isLocalized: true,
  });
  client.createSimpleField({
    parentApiId: ModelApiId.Place,
    apiId: "lastVerified",
    displayName: "Last verified",
    type: SimpleFieldType.Date,
    isRequired: true,
    isLocalized: false,
  });
}

function addCategoryFields(client: Client): void {
  client.createSimpleField({
    parentApiId: ModelApiId.Category,
    apiId: "name",
    displayName: "Name",
    type: SimpleFieldType.String,
    isRequired: true,
    isLocalized: true,
    isTitle: true,
  });
  addSlugField(client, ModelApiId.Category);
  client.createSimpleField({
    parentApiId: ModelApiId.Category,
    apiId: "description",
    displayName: "Description",
    type: SimpleFieldType.Richtext,
    isRequired: false,
    isLocalized: true,
  });
  client.createEnumerableField({
    parentApiId: ModelApiId.Category,
    apiId: "iconKey",
    displayName: "Icon key",
    enumerationApiId: EnumerationApiId.IconKey,
    isRequired: true,
  });
  client.createSimpleField({
    parentApiId: ModelApiId.Category,
    apiId: "sortOrder",
    displayName: "Sort order",
    type: SimpleFieldType.Int,
    isRequired: true,
    isLocalized: false,
  });
}

function addNeighborhoodFields(client: Client): void {
  client.createSimpleField({
    parentApiId: ModelApiId.Neighborhood,
    apiId: "name",
    displayName: "Name",
    type: SimpleFieldType.String,
    isRequired: true,
    isLocalized: true,
    isTitle: true,
  });
  addSlugField(client, ModelApiId.Neighborhood);
  client.createSimpleField({
    parentApiId: ModelApiId.Neighborhood,
    apiId: "description",
    displayName: "Description",
    type: SimpleFieldType.Richtext,
    isRequired: false,
    isLocalized: true,
  });
  client.createSimpleField({
    parentApiId: ModelApiId.Neighborhood,
    apiId: "location",
    displayName: "Location",
    type: SimpleFieldType.Location,
    isRequired: false,
    isLocalized: false,
  });
}

function addComponents(client: Client): void {
  client.createComponent({
    apiId: ComponentApiId.Seo,
    apiIdPlural: "SEOs",
    displayName: "SEO",
  });
  client.createSimpleField({
    parentApiId: ComponentApiId.Seo,
    apiId: "title",
    displayName: "Title",
    type: SimpleFieldType.String,
    isLocalized: true,
  });
  client.createSimpleField({
    parentApiId: ComponentApiId.Seo,
    apiId: "description",
    displayName: "Description",
    type: SimpleFieldType.String,
    isLocalized: true,
  });
  addAssetField(client, ComponentApiId.Seo, "image", "Image", "seoImage", {
    isList: false,
    isRequired: false,
  });
  client.createSimpleField({
    parentApiId: ComponentApiId.Seo,
    apiId: "noIndex",
    displayName: "No index",
    type: SimpleFieldType.Boolean,
    isLocalized: false,
  });

  client.createComponent({
    apiId: ComponentApiId.OpeningHours,
    apiIdPlural: "OpeningHoursItems",
    displayName: "Opening hours",
  });
  client.createEnumerableField({
    parentApiId: ComponentApiId.OpeningHours,
    apiId: "day",
    displayName: "Day",
    enumerationApiId: EnumerationApiId.OpeningHoursDay,
  });
  client.createSimpleField({
    parentApiId: ComponentApiId.OpeningHours,
    apiId: "closed",
    displayName: "Closed",
    type: SimpleFieldType.Boolean,
    isLocalized: false,
  });
  client.createSimpleField({
    parentApiId: ComponentApiId.OpeningHours,
    apiId: "opensAt",
    displayName: "Opens at",
    type: SimpleFieldType.String,
    isLocalized: false,
    description:
      "HH:mm 24-hour. Required in seed/frontend when closed is false.",
  });
  client.createSimpleField({
    parentApiId: ComponentApiId.OpeningHours,
    apiId: "closesAt",
    displayName: "Closes at",
    type: SimpleFieldType.String,
    isLocalized: false,
    description:
      "HH:mm 24-hour. Required in seed/frontend when closed is false.",
  });

  client.createComponent({
    apiId: ComponentApiId.HeroBlock,
    apiIdPlural: "HeroBlocks",
    displayName: "Hero block",
  });
  client.createSimpleField({
    parentApiId: ComponentApiId.HeroBlock,
    apiId: "eyebrow",
    displayName: "Eyebrow",
    type: SimpleFieldType.String,
    isLocalized: true,
  });
  client.createSimpleField({
    parentApiId: ComponentApiId.HeroBlock,
    apiId: "heading",
    displayName: "Heading",
    type: SimpleFieldType.String,
    isLocalized: true,
  });
  client.createSimpleField({
    parentApiId: ComponentApiId.HeroBlock,
    apiId: "body",
    displayName: "Body",
    type: SimpleFieldType.Richtext,
    isLocalized: true,
  });
  addAssetField(
    client,
    ComponentApiId.HeroBlock,
    "image",
    "Image",
    "heroBlockImage",
    {
      isList: false,
      isRequired: false,
    },
  );
  client.createSimpleField({
    parentApiId: ComponentApiId.HeroBlock,
    apiId: "callToActionLabel",
    displayName: "Call to action label",
    type: SimpleFieldType.String,
    isLocalized: true,
  });
  addUrlField(
    client,
    ComponentApiId.HeroBlock,
    "callToActionUrl",
    "Call to action URL",
  );

  client.createComponent({
    apiId: ComponentApiId.RichTextBlock,
    apiIdPlural: "RichTextBlocks",
    displayName: "Rich text block",
  });
  client.createSimpleField({
    parentApiId: ComponentApiId.RichTextBlock,
    apiId: "heading",
    displayName: "Heading",
    type: SimpleFieldType.String,
    isLocalized: true,
  });
  client.createSimpleField({
    parentApiId: ComponentApiId.RichTextBlock,
    apiId: "body",
    displayName: "Body",
    type: SimpleFieldType.Richtext,
    isLocalized: true,
  });

  client.createComponent({
    apiId: ComponentApiId.FeaturedPlacesBlock,
    apiIdPlural: "FeaturedPlacesBlocks",
    displayName: "Featured places block",
  });
  client.createSimpleField({
    parentApiId: ComponentApiId.FeaturedPlacesBlock,
    apiId: "heading",
    displayName: "Heading",
    type: SimpleFieldType.String,
    isLocalized: true,
  });
  client.createEnumerableField({
    parentApiId: ComponentApiId.FeaturedPlacesBlock,
    apiId: "layout",
    displayName: "Layout",
    enumerationApiId: EnumerationApiId.FeaturedPlacesLayout,
  });

  client.createComponent({
    apiId: ComponentApiId.WeatherBlock,
    apiIdPlural: "WeatherBlocks",
    displayName: "Weather block",
  });
  client.createSimpleField({
    parentApiId: ComponentApiId.WeatherBlock,
    apiId: "heading",
    displayName: "Heading",
    type: SimpleFieldType.String,
    isLocalized: true,
  });
  client.createSimpleField({
    parentApiId: ComponentApiId.WeatherBlock,
    apiId: "showCurrent",
    displayName: "Show current",
    type: SimpleFieldType.Boolean,
    isLocalized: false,
  });

  client.createComponent({
    apiId: ComponentApiId.MapBlock,
    apiIdPlural: "MapBlocks",
    displayName: "Map block",
  });
  client.createSimpleField({
    parentApiId: ComponentApiId.MapBlock,
    apiId: "heading",
    displayName: "Heading",
    type: SimpleFieldType.String,
    isLocalized: true,
  });
  client.createSimpleField({
    parentApiId: ComponentApiId.MapBlock,
    apiId: "initialZoom",
    displayName: "Initial zoom",
    type: SimpleFieldType.Int,
    isLocalized: false,
  });
  client.createSimpleField({
    parentApiId: ComponentApiId.MapBlock,
    apiId: "showFeaturedOnly",
    displayName: "Show featured only",
    type: SimpleFieldType.Boolean,
    isLocalized: false,
  });

  client.createComponent({
    apiId: ComponentApiId.CallToActionBlock,
    apiIdPlural: "CallToActionBlocks",
    displayName: "Call to action block",
  });
  client.createSimpleField({
    parentApiId: ComponentApiId.CallToActionBlock,
    apiId: "heading",
    displayName: "Heading",
    type: SimpleFieldType.String,
    isLocalized: true,
  });
  client.createSimpleField({
    parentApiId: ComponentApiId.CallToActionBlock,
    apiId: "body",
    displayName: "Body",
    type: SimpleFieldType.Richtext,
    isLocalized: true,
  });
  client.createSimpleField({
    parentApiId: ComponentApiId.CallToActionBlock,
    apiId: "label",
    displayName: "Label",
    type: SimpleFieldType.String,
    isLocalized: true,
  });
  addUrlField(client, ComponentApiId.CallToActionBlock, "url", "URL");
}

function addComponentEmbeddings(client: Client): void {
  client.createComponentField({
    parentApiId: ModelApiId.City,
    apiId: "seo",
    displayName: "SEO",
    componentApiId: ComponentApiId.Seo,
    isRequired: false,
    isList: false,
  });
  client.createComponentUnionField({
    parentApiId: ModelApiId.City,
    apiId: "pageSections",
    displayName: "Page sections",
    componentApiIds: [...PAGE_SECTION_COMPONENT_API_IDS],
    isList: true,
    isRequired: true,
  });
  client.createComponentField({
    parentApiId: ModelApiId.Place,
    apiId: "seo",
    displayName: "SEO",
    componentApiId: ComponentApiId.Seo,
    isRequired: false,
    isList: false,
  });
  client.createComponentField({
    parentApiId: ModelApiId.Place,
    apiId: "openingHours",
    displayName: "Opening hours",
    componentApiId: ComponentApiId.OpeningHours,
    isRequired: false,
    isList: true,
  });
}

function addRelations(client: Client): void {
  client.createRelationalField({
    parentApiId: ModelApiId.Place,
    apiId: "city",
    displayName: "City",
    type: RelationalFieldType.Relation,
    isList: false,
    reverseField: {
      apiId: "places",
      modelApiId: ModelApiId.City,
      displayName: "Places",
      isList: true,
      visibility: VisibilityTypes.ReadWrite,
    },
  });
  client.createRelationalField({
    parentApiId: ModelApiId.Place,
    apiId: "categories",
    displayName: "Categories",
    type: RelationalFieldType.Relation,
    isList: true,
    reverseField: {
      apiId: "places",
      modelApiId: ModelApiId.Category,
      displayName: "Places",
      isList: true,
      visibility: VisibilityTypes.ReadWrite,
    },
  });
  client.createRelationalField({
    parentApiId: ModelApiId.Place,
    apiId: "neighborhood",
    displayName: "Neighborhood",
    type: RelationalFieldType.Relation,
    isList: false,
    reverseField: {
      apiId: "places",
      modelApiId: ModelApiId.Neighborhood,
      displayName: "Places",
      isList: true,
      visibility: VisibilityTypes.ReadWrite,
    },
  });
  client.createRelationalField({
    parentApiId: ModelApiId.Neighborhood,
    apiId: "city",
    displayName: "City",
    type: RelationalFieldType.Relation,
    isList: false,
    reverseField: {
      apiId: "neighborhoods",
      modelApiId: ModelApiId.City,
      displayName: "Neighborhoods",
      isList: true,
      visibility: VisibilityTypes.ReadWrite,
    },
  });
  client.createRelationalField({
    parentApiId: ComponentApiId.FeaturedPlacesBlock,
    apiId: "places",
    displayName: "Places",
    type: RelationalFieldType.Relation,
    isList: true,
    reverseField: {
      apiId: "featuredInBlocks",
      modelApiId: ModelApiId.Place,
      displayName: "Featured in blocks",
      isList: true,
      visibility: VisibilityTypes.Hidden,
      isUnidirectional: true,
    },
  });
}

function addWeatherRemote(client: Client): void {
  client.createRESTRemoteSource({
    displayName: "Open-Meteo",
    prefix: REMOTE_SOURCE_PREFIX,
    url: OPEN_METEO_FORECAST_URL,
    kind: RemoteSourceKind.Custom,
    remoteTypeDefinitions: {
      sdl: OPEN_METEO_SDL,
    },
  });
  client.createRemoteField({
    parentApiId: ModelApiId.City,
    apiId: CITY_WEATHER_FIELD,
    displayName: "Weather",
    type: RemoteFieldType.Rest,
    remoteConfig: {
      remoteSourcePrefix: REMOTE_SOURCE_PREFIX,
      returnTypeApiId: REMOTE_FORECAST_TYPE,
      method: RemoteFieldApiMethod.Get,
      restPath: WEATHER_REST_PATH,
    },
    inputArgs: [...WEATHER_REMOTE_INPUT_ARGS],
  });
}

export function applyCityWeatherRemotePatch(client: Client): void {
  client.updateRESTRemoteSource({
    prefix: REMOTE_SOURCE_PREFIX,
    displayName: "Open-Meteo",
    remoteTypeDefinitionsToUpsert: {
      remoteTypeDefinitionsToCreate: [{ sdl: OPEN_METEO_QUERY_INPUT_SDL }],
    },
  });
  client.updateRemoteField({
    parentApiId: ModelApiId.City,
    apiId: CITY_WEATHER_FIELD,
    remoteConfig: {
      restPath: WEATHER_REST_PATH,
    },
    inputArgs: {
      fieldInputArgsToCreate: [...WEATHER_REMOTE_INPUT_ARGS],
    },
  });
}

export function applyCityCompassSchema(client: Client): void {
  addModels(client);
  addEnumerations(client);
  addCityFields(client);
  addPlaceFields(client);
  addCategoryFields(client);
  addNeighborhoodFields(client);
  addComponents(client);
  addComponentEmbeddings(client);
  addRelations(client);
  addWeatherRemote(client);
}
