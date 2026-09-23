import { Product, ProductDetailResponse, ProductsPageResponse, FilterState } from '../types';
import { ALL_PRODUCTS, CITIES } from '../data/mockProducts';

// Utility for formatting prices in Kazakhstani Tenge (₸)
export function formatKZT(price: number): string {
  return new Intl.NumberFormat('ru-KZ', {
    style: 'currency',
    currency: 'KZT',
    maximumFractionDigits: 0,
  })
    .format(price)
    .replace('KZT', '₸');
}

// Fetch products list with filters and pagination
export async function getProducts(
  filter: FilterState,
  page: number = 1,
  perPage: number = 20,
  cityId: string = 'nursultan'
): Promise<ProductsPageResponse> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
      search: filter.search,
      category: filter.category,
      brand: filter.brand,
      current: filter.current,
      poles: filter.poles,
      breakingCapacity: filter.breakingCapacity,
      city: cityId,
      inStockOnly: filter.onlyInStockInCity ? 'true' : 'false',
      sortBy: filter.sortBy,
    });

    const res = await fetch(`/api/products?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (e) {
    console.warn('API error, falling back to local dataset:', e);
  }

  // Client-side fallback if server endpoint is temporarily unavailable
  let filtered = [...ALL_PRODUCTS];

  if (filter.search) {
    const q = filter.search.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.article.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q))
    );
  }

  if (filter.category && filter.category !== 'Все категории') {
    filtered = filtered.filter((p) => p.category === filter.category);
  }

  if (filter.brand && filter.brand !== 'Все бренды') {
    filtered = filtered.filter((p) => p.brand === filter.brand);
  }

  if (filter.current && filter.current !== 'Все номиналы') {
    filtered = filtered.filter((p) => p.current === filter.current || p.name.includes(filter.current));
  }

  if (filter.poles && filter.poles !== 'Любое') {
    filtered = filtered.filter((p) => p.poles === filter.poles);
  }

  if (filter.breakingCapacity && filter.breakingCapacity !== 'Любая') {
    filtered = filtered.filter(
      (p) =>
        p.breakingCapacity === filter.breakingCapacity ||
        p.name.toLowerCase().includes(filter.breakingCapacity.toLowerCase().replace(' ', ''))
    );
  }

  if (filter.onlyInStockInCity) {
    const cityObj = CITIES.find((c) => c.id === cityId) || CITIES[0];
    filtered = filtered.filter((p) => {
      const store = p.stores?.find((s) => s.name === cityObj.storeName);
      return store ? store.quantity > 0 : (p.quantity || 0) > 0;
    });
  }

  if (filter.sortBy === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (filter.sortBy === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (filter.sortBy === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  const total = filtered.length;
  const startIndex = (page - 1) * perPage;
  const items = filtered.slice(startIndex, startIndex + perPage);

  return {
    page,
    per_page: perPage,
    count: items.length,
    total,
    items,
  };
}

// Fetch single product details with warehouse stocks
export async function getProductDetail(id: number): Promise<Product | null> {
  try {
    const res = await fetch(`/api/products/detail?id=${id}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('API error, searching in local cache:', e);
  }

  const found = ALL_PRODUCTS.find((p) => p.id === id);
  return found || null;
}

// Send chat message to AI Consultant
export async function sendChatMessage(
  message: string,
  history: Array<{ role: string; content: string }> = []
): Promise<{ reply: string; suggestedProductIds: number[] }> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        reply: data.reply,
        suggestedProductIds: data.suggestedProductIds || [],
      };
    }
  } catch (e) {
    console.warn('Chat request failed, providing local assistant answer:', e);
  }

  // Graceful offline answer
  return {
    reply: `Здравствуйте! Я специалист интернет-магазина EKT.kz. В данный момент я анализирую наличие на складе в Нур-Султане. Рекомендую обратить внимание на силовые автоматы Legrand серии DRX250 и DRX125, а также реле контроля напряжения Schneider Electric.`,
    suggestedProductIds: [515291, 515285, 35604],
  };
}
