export interface ProductStore {
  id: number;
  name: string;
  quantity: number;
}

export interface ProductProperties {
  BRAND_PRIORITY?: string;
  CML2_ARTICLE?: string;
  NOVINKA?: string;
  SPETSPREDLOZHENIE?: string;
  RECOMMEND?: string[];
  CML2_BAR_CODE?: string;
  CML2_TRAITS?: string[];
  CML2_TAXES?: string;
  KRATNOST_MIN?: string;
  IMYAKARTINKI?: string;
  ARTIKULPOSTAVSHCHIKA?: string;
  OBYEM?: string;
  KOLICHESTVO_POLYUSOV?: string;
  NOMINALNAYA_OTKLYUCHAYUSHCHAYA_SPOSOBNOST?: string;
  NOMINALNOE_NAPRYAZHENIE?: string;
  NOMINALNYY_TOK?: string;
  TIP_USTANOVKI?: string;
  TORGOVAYA_MARKA?: string;
  [key: string]: any;
}

export interface Product {
  id: number;
  name: string;
  article: string;
  price: number;
  image: string | null;
  url: string;
  url_api_detail: string;
  offers: any[];
  category?: string;
  brand?: string;
  poles?: string;
  current?: string;
  breakingCapacity?: string;
  voltage?: string;
  description?: string;
  quantity?: number;
  stores?: ProductStore[];
  properties?: ProductProperties;
}

export interface ProductDetailResponse {
  id: number;
  name: string;
  article: string;
  description: string;
  price: number;
  quantity: number;
  stores: ProductStore[];
  image: string | null;
  url: string;
  offers: any[];
  properties: ProductProperties;
}

export interface ProductsPageResponse {
  page: number;
  per_page: number;
  count: number;
  total?: number;
  items: Product[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedProductIds?: number[];
  suggestedAction?: {
    type: 'filter' | 'calculator' | 'category' | 'checkout';
    payload?: any;
    label: string;
  };
}

export interface FilterState {
  search: string;
  category: string;
  brand: string;
  current: string;
  poles: string;
  breakingCapacity: string;
  minPrice: number;
  maxPrice: number;
  onlyInStockInCity: boolean;
  sortBy: 'relevance' | 'price-asc' | 'price-desc' | 'name';
  viewMode: 'grid' | 'table';
}

export interface CityInfo {
  id: string;
  name: string;
  storeName: string;
  address: string;
  phone: string;
  isMain: boolean;
}
