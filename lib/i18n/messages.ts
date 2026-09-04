import type { Locale } from "@/lib/locale";

export interface UiMessages {
  readonly navHome: string;
  readonly navPlaces: string;
  readonly navMap: string;
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
}

const MESSAGES: Record<Locale, UiMessages> = {
  en_US: {
    navHome: "City",
    navPlaces: "Places",
    navMap: "Map",
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
  },
  pt_BR: {
    navHome: "Cidade",
    navPlaces: "Lugares",
    navMap: "Mapa",
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
  },
  zh_CN: {
    navHome: "城市",
    navPlaces: "地点",
    navMap: "地图",
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
  },
};

export function getUiMessages(locale: Locale): UiMessages {
  return MESSAGES[locale];
}
