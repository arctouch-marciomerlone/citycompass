import type { Locale } from "@/lib/locale";

export interface AboutFeatureItem {
  readonly title: string;
  readonly body: string;
}

export interface AboutMessages {
  readonly title: string;
  readonly intro: string;
  readonly platformHeading: string;
  readonly platformItems: readonly AboutFeatureItem[];
  readonly webhookHeading: string;
  readonly webhookBody: string;
  readonly mapsHeading: string;
  readonly mapsBody: string;
  readonly postMvpHeading: string;
  readonly postMvpIntro: string;
  readonly postMvpItems: readonly string[];
}

export interface UiMessages {
  readonly navHome: string;
  readonly navPlaces: string;
  readonly navMap: string;
  readonly navAbout: string;
  readonly localeLabel: string;
  readonly cityLabel: string;
  readonly placesHeading: string;
  readonly filterCategory: string;
  readonly filterNeighborhood: string;
  readonly filterAll: string;
  readonly emptyPlaces: string;
  readonly weatherUnavailable: string;
  readonly weatherAttribution: string;
  readonly forecastHeading: string;
  readonly mapPlaceholder: string;
  readonly openInGoogleMaps: string;
  readonly opensInNewTab: string;
  readonly mapListHeading: string;
  readonly directions: string;
  readonly featuredFallback: string;
  readonly lastVerified: string;
  readonly openingHours: string;
  readonly closed: string;
  readonly website: string;
  readonly phone: string;
  readonly address: string;
  readonly neighborhood: string;
  readonly categories: string;
  readonly priceBand: string;
  readonly loading: string;
  readonly about: AboutMessages;
}

const MESSAGES: Record<Locale, UiMessages> = {
  en_US: {
    navHome: "City",
    navPlaces: "Places",
    navMap: "Map",
    navAbout: "About",
    localeLabel: "Language",
    cityLabel: "Cities",
    placesHeading: "Places",
    filterCategory: "Category",
    filterNeighborhood: "Neighborhood",
    filterAll: "All",
    emptyPlaces: "No published places match these filters.",
    weatherUnavailable:
      "Weather is unavailable right now. Editorial content is still here.",
    weatherAttribution: "Weather data by Open-Meteo",
    forecastHeading: "Next days",
    mapPlaceholder:
      "Map preview is unavailable until a Maps JavaScript API key is set.",
    openInGoogleMaps: "Open in Google Maps",
    opensInNewTab: "(opens in a new tab)",
    mapListHeading: "Published places",
    directions: "Get directions",
    featuredFallback: "Featured places",
    lastVerified: "Last verified",
    openingHours: "Hours",
    closed: "Closed",
    website: "Website",
    phone: "Phone",
    address: "Address",
    neighborhood: "Neighborhood",
    categories: "Categories",
    priceBand: "Price",
    loading: "Loading",
    about: {
      title: "About CityCompass",
      intro:
        "CityCompass is a Hygraph certification project. Hygraph holds the schema, fixtures, locales, stages, assets, relations, and Map coordinates. The Next.js app queries the Published Content API. Weather is not stored as CMS content; it is federated onto City.weather through a REST Remote Source.",
      platformHeading: "Hygraph platform features used",
      platformItems: [
        {
          title: "Schema as Code / Management API",
          body: "Repository scripts apply models, components, locales, Remote Sources, and fixtures. Studio is not used to create schema or entries.",
        },
        {
          title: "Content models and references",
          body: "City, Place, Category, Neighborhood. A Place belongs to a City, at least one Category, and an optional Neighborhood.",
        },
        {
          title: "Components",
          body: "SEO, OpeningHours, HeroBlock, RichTextBlock, FeaturedPlacesBlock, WeatherBlock, MapBlock, CallToActionBlock.",
        },
        {
          title: "Modular Content",
          body: "City pageSections is a union of those blocks. Editors compose the landing page without frontend changes.",
        },
        {
          title: "Localization",
          body: "en_US, pt_BR, and zh_CN. Missing copy falls back to en_US. URL prefixes use the same locale ids as Hygraph.",
        },
        {
          title: "Content stages",
          body: "DRAFT and PUBLISHED. The public site queries Published only. Seed includes a draft Place.",
        },
        {
          title: "Scheduled publishing",
          body: "Seed schedules one future Place publish through the Content API.",
        },
        {
          title: "Map (Location) fields",
          body: "City, Place, and Neighborhood store location latitude and longitude. Editors set the point in Studio. There are no separate decimal coordinate fields.",
        },
        {
          title: "Remote Sources / Content Federation",
          body: "Open-Meteo REST Remote Source and a City Remote Field. The app reads weather from Hygraph GraphQL, not from Open-Meteo directly.",
        },
        {
          title: "Assets, Rich Text, Slug, enumerations",
          body: "City and place images; localized rich text; native Slug fields; iconKey, priceBand, featured layout, and opening-hours day.",
        },
        {
          title: "GraphQL Content API and Permanent Auth Tokens",
          body: "High Performance Content API for public reads. Separate tokens for Published read, Draft preview, and Management scripts.",
        },
        {
          title: "Webhooks",
          body: "The revalidation handler is implemented. The Studio webhook is not registered in this demo.",
        },
      ],
      webhookHeading: "Webhook (implemented, not connected)",
      webhookBody:
        "Hygraph webhooks notify the frontend when content is published or unpublished so Next.js can revalidate cache tags. POST /api/revalidate verifies gcms-signature and maps __typename to allowlisted tags (city, place, category, neighborhood, map). Callers cannot pass arbitrary paths. The Studio webhook is not set. Hygraph Cloud cannot call localhost and requires a public https URL.",
      mapsHeading: "Google Maps (out of scope)",
      mapsBody:
        "The Google Maps JavaScript API is not integrated. This demo does not load Maps JS, Places, or Geocoding. Coordinates stay in Hygraph Map fields. The map route uses a placeholder and the place list. Directions URLs can still be built from those coordinates, or from an optional editorial googlePlaceId, without embedding Google Maps.",
      postMvpHeading: "Post-MVP: more of the Hygraph platform",
      postMvpIntro:
        "Not required for this demo. Each item uses a Hygraph capability that the MVP only touches or skips.",
      postMvpItems: [
        "Register the Studio webhook on a public https /api/revalidate URL.",
        "Live Preview in Studio (Draft token and Preview widget) and Click-to-Edit.",
        "Content workflows plus distinct editor and publisher roles.",
        "Environments (development / staging / production) kept in sync with the Management SDK.",
        "Scheduled Releases to publish related entries together.",
        "Taxonomies where Category or Neighborhood needs a hierarchy.",
        "Further Remote Sources (air quality, transit, commerce) as GraphQL or REST federation, still without custom Next.js adapters.",
        "Hygraph Asset API transformations instead of shipping full-size images.",
        "New relational models (Events, Itineraries) composed with Modular Content and references.",
      ],
    },
  },
  pt_BR: {
    navHome: "Cidade",
    navPlaces: "Lugares",
    navMap: "Mapa",
    navAbout: "Sobre",
    localeLabel: "Idioma",
    cityLabel: "Cidades",
    placesHeading: "Lugares",
    filterCategory: "Categoria",
    filterNeighborhood: "Bairro",
    filterAll: "Todos",
    emptyPlaces: "Nenhum lugar publicado corresponde a estes filtros.",
    weatherUnavailable:
      "O tempo está indisponível agora. O conteúdo editorial continua aqui.",
    weatherAttribution: "Dados de tempo por Open-Meteo",
    forecastHeading: "Próximos dias",
    mapPlaceholder:
      "O mapa fica indisponível até haver uma chave da Maps JavaScript API.",
    openInGoogleMaps: "Abrir no Google Maps",
    opensInNewTab: "(abre em uma nova aba)",
    mapListHeading: "Lugares publicados",
    directions: "Como chegar",
    featuredFallback: "Lugares em destaque",
    lastVerified: "Última verificação",
    openingHours: "Horário",
    closed: "Fechado",
    website: "Site",
    phone: "Telefone",
    address: "Endereço",
    neighborhood: "Bairro",
    categories: "Categorias",
    priceBand: "Preço",
    loading: "Carregando",
    about: {
      title: "Sobre o CityCompass",
      intro:
        "CityCompass é um projeto de certificação Hygraph. O Hygraph guarda o schema, os fixtures, os locales, os stages, os assets, as relações e as coordenadas de Map. O app Next.js consulta a Content API Published. O tempo não é conteúdo do CMS; ele é federado em City.weather por um REST Remote Source.",
      platformHeading: "Recursos da plataforma Hygraph usados",
      platformItems: [
        {
          title: "Schema as Code / Management API",
          body: "Scripts do repositório aplicam models, components, locales, Remote Sources e fixtures. O Studio não é usado para criar schema ou entradas.",
        },
        {
          title: "Models de conteúdo e referências",
          body: "City, Place, Category, Neighborhood. Um Place pertence a uma City, a pelo menos uma Category e a um Neighborhood opcional.",
        },
        {
          title: "Components",
          body: "SEO, OpeningHours, HeroBlock, RichTextBlock, FeaturedPlacesBlock, WeatherBlock, MapBlock, CallToActionBlock.",
        },
        {
          title: "Modular Content",
          body: "pageSections da City é uma união desses blocos. Editores montam a landing sem mudar o frontend.",
        },
        {
          title: "Localização",
          body: "en_US, pt_BR e zh_CN. Texto ausente cai para en_US. Os prefixos de URL usam os mesmos ids de locale do Hygraph.",
        },
        {
          title: "Content stages",
          body: "DRAFT e PUBLISHED. O site público consulta só Published. O seed inclui um Place em draft.",
        },
        {
          title: "Publicação agendada",
          body: "O seed agenda a publicação futura de um Place pela Content API.",
        },
        {
          title: "Campos Map (Location)",
          body: "City, Place e Neighborhood guardam latitude e longitude. Editores marcam o ponto no Studio. Não há campos decimais separados.",
        },
        {
          title: "Remote Sources / Content Federation",
          body: "REST Remote Source do Open-Meteo e um Remote Field em City. O app lê o tempo no GraphQL do Hygraph, não no Open-Meteo.",
        },
        {
          title: "Assets, Rich Text, Slug, enumerations",
          body: "Imagens de cidade e lugar; rich text localizado; campos Slug nativos; iconKey, priceBand, layout em destaque e day de horário.",
        },
        {
          title: "GraphQL Content API e Permanent Auth Tokens",
          body: "High Performance Content API para leitura pública. Tokens separados para leitura Published, preview Draft e scripts de Management.",
        },
        {
          title: "Webhooks",
          body: "O handler de revalidação está implementado. O webhook do Studio não está registrado neste demo.",
        },
      ],
      webhookHeading: "Webhook (implementado, não conectado)",
      webhookBody:
        "Webhooks do Hygraph avisam o frontend quando o conteúdo é publicado ou despublicado para o Next.js revalidar cache tags. POST /api/revalidate verifica gcms-signature e mapeia __typename para tags permitidas (city, place, category, neighborhood, map). Chamadores não podem passar paths arbitrários. O webhook do Studio não está configurado. O Hygraph Cloud não chama localhost e exige uma URL https pública.",
      mapsHeading: "Google Maps (fora do escopo)",
      mapsBody:
        "A Maps JavaScript API não está integrada. Este demo não carrega Maps JS, Places nem Geocoding. As coordenadas ficam nos campos Map do Hygraph. A rota do mapa usa um placeholder e a lista de lugares. URLs de direções ainda podem ser montadas com essas coordenadas, ou com um googlePlaceId editorial opcional, sem embutir o Google Maps.",
      postMvpHeading: "Pós-MVP: mais da plataforma Hygraph",
      postMvpIntro:
        "Não é exigido neste demo. Cada item usa um recurso Hygraph que o MVP só toca ou omite.",
      postMvpItems: [
        "Registrar o webhook do Studio em uma URL https pública /api/revalidate.",
        "Live Preview no Studio (token Draft e widget Preview) e Click-to-Edit.",
        "Workflows de conteúdo e papéis distintos de editor e publisher.",
        "Environments (development / staging / production) alinhados com o Management SDK.",
        "Scheduled Releases para publicar entradas relacionadas juntas.",
        "Taxonomies quando Category ou Neighborhood precisar de hierarquia.",
        "Mais Remote Sources (qualidade do ar, trânsito, comércio) como federação GraphQL ou REST, ainda sem adapters Next.js.",
        "Transformações da Asset API do Hygraph em vez de imagens em tamanho cheio.",
        "Novos models relacionais (Events, Itineraries) com Modular Content e referências.",
      ],
    },
  },
  zh_CN: {
    navHome: "城市",
    navPlaces: "地点",
    navMap: "地图",
    navAbout: "关于",
    localeLabel: "语言",
    cityLabel: "城市",
    placesHeading: "地点",
    filterCategory: "类别",
    filterNeighborhood: "街区",
    filterAll: "全部",
    emptyPlaces: "没有符合这些筛选条件的已发布地点。",
    weatherUnavailable: "天气暂不可用。编辑内容仍可阅读。",
    weatherAttribution: "天气数据来自 Open-Meteo",
    forecastHeading: "未来几天",
    mapPlaceholder: "尚未设置 Maps JavaScript API 密钥，地图预览不可用。",
    openInGoogleMaps: "在 Google 地图中打开",
    opensInNewTab: "（在新标签页中打开）",
    mapListHeading: "已发布地点",
    directions: "获取路线",
    featuredFallback: "精选地点",
    lastVerified: "上次核实",
    openingHours: "营业时间",
    closed: "休息",
    website: "网站",
    phone: "电话",
    address: "地址",
    neighborhood: "街区",
    categories: "类别",
    priceBand: "价位",
    loading: "加载中",
    about: {
      title: "关于 CityCompass",
      intro:
        "CityCompass 是一个 Hygraph 认证项目。Hygraph 保存 schema、fixtures、locales、stages、assets、关系和 Map 坐标。Next.js 应用查询 Published Content API。天气不作为 CMS 内容存储；它通过 REST Remote Source 联邦到 City.weather。",
      platformHeading: "已使用的 Hygraph 平台能力",
      platformItems: [
        {
          title: "Schema as Code / Management API",
          body: "仓库脚本应用 models、components、locales、Remote Sources 和 fixtures。不在 Studio 中创建 schema 或条目。",
        },
        {
          title: "内容模型和引用",
          body: "City、Place、Category、Neighborhood。Place 属于一座 City、至少一个 Category，以及可选的 Neighborhood。",
        },
        {
          title: "Components",
          body: "SEO、OpeningHours、HeroBlock、RichTextBlock、FeaturedPlacesBlock、WeatherBlock、MapBlock、CallToActionBlock。",
        },
        {
          title: "Modular Content",
          body: "City 的 pageSections 是这些区块的联合。编辑无需改前端即可组合落地页。",
        },
        {
          title: "本地化",
          body: "en_US、pt_BR 和 zh_CN。缺失文案回退到 en_US。URL 前缀与 Hygraph 的 locale id 一致。",
        },
        {
          title: "Content stages",
          body: "DRAFT 和 PUBLISHED。公开站点只查询 Published。Seed 包含一个 draft Place。",
        },
        {
          title: "定时发布",
          body: "Seed 通过 Content API 安排一个未来的 Place 发布。",
        },
        {
          title: "Map（Location）字段",
          body: "City、Place 和 Neighborhood 存储纬度和经度。编辑在 Studio 中标点。没有单独的小数坐标字段。",
        },
        {
          title: "Remote Sources / Content Federation",
          body: "Open-Meteo REST Remote Source 和 City Remote Field。应用从 Hygraph GraphQL 读取天气，不直接请求 Open-Meteo。",
        },
        {
          title: "Assets、Rich Text、Slug、enumerations",
          body: "城市和地点图片；本地化富文本；原生 Slug 字段；iconKey、priceBand、精选布局和营业时间 day。",
        },
        {
          title: "GraphQL Content API 与 Permanent Auth Tokens",
          body: "High Performance Content API 用于公开读取。Published 读取、Draft 预览和管理脚本使用不同 token。",
        },
        {
          title: "Webhooks",
          body: "已实现缓存重新验证处理程序。本演示未在 Studio 注册 webhook。",
        },
      ],
      webhookHeading: "Webhook（已实现，未连接）",
      webhookBody:
        "内容发布或取消发布时，Hygraph webhooks 通知前端，以便 Next.js 重新验证 cache tags。POST /api/revalidate 校验 gcms-signature，并将 __typename 映射到允许的 tags（city、place、category、neighborhood、map）。调用方不能传入任意路径。Studio webhook 未配置。Hygraph Cloud 无法访问 localhost，需要公开 https URL。",
      mapsHeading: "Google Maps（不在范围内）",
      mapsBody:
        "未集成 Google Maps JavaScript API。本演示不加载 Maps JS、Places 或 Geocoding。坐标保留在 Hygraph Map 字段中。地图路由使用占位符和地点列表。仍可用这些坐标或可选的编辑 googlePlaceId 生成路线 URL，而无需嵌入 Google Maps。",
      postMvpHeading: "MVP 之后：更多 Hygraph 平台能力",
      postMvpIntro:
        "本演示不要求这些项。每一项都用到 MVP 仅触及或跳过的 Hygraph 能力。",
      postMvpItems: [
        "在公开 https /api/revalidate URL 上注册 Studio webhook。",
        "Studio 中的 Live Preview（Draft token 与 Preview widget）以及 Click-to-Edit。",
        "内容工作流，以及独立的编辑和发布角色。",
        "用 Management SDK 保持 environments（development / staging / production）同步。",
        "Scheduled Releases，一次性发布相关条目。",
        "当 Category 或 Neighborhood 需要层级时使用 Taxonomies。",
        "更多 Remote Sources（空气质量、交通、商务）作为 GraphQL 或 REST 联邦，仍不使用自定义 Next.js adapter。",
        "使用 Hygraph Asset API 变换，而不是下发原图。",
        "新的关系模型（Events、Itineraries），用 Modular Content 和引用组合。",
      ],
    },
  },
};

export function getUiMessages(locale: Locale): UiMessages {
  return MESSAGES[locale];
}
