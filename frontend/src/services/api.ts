import { Product,ProductsPageResponse, FilterState } from '../types';
const BACKEND_URL = 'http://127.0.0.1:8000';

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
  _cityId: string = 'Астана'
): Promise<ProductsPageResponse> {
  try {
    const search = filter.search.trim();

    const url = search
      ? `${BACKEND_URL}/products/search?q=${encodeURIComponent(search)}&max_pages=10&limit=${perPage}`
      : `${BACKEND_URL}/products?page=${page}`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Backend returned ${res.status}`);
    }

    const data = await res.json();
    const items = data.items || [];

    return {
      page,
      per_page: data.per_page ?? perPage,
      count: items.length,
      total: data.total ?? data.count ?? items.length,
      items,
    };
  } catch (error) {
    console.error('Failed to load products from backend:', error);

    return {
      page,
      per_page: perPage,
      count: 0,
      total: 0,
      items: [],
    };
  }
}


// Fetch single product details with warehouse stocks
export async function getProductDetail(
  id: number
): Promise<Product | null> {
  try {
    const res = await fetch(
      `${BACKEND_URL}/products/${id}`
    );

    if (!res.ok) {
      throw new Error(`Backend returned ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error(
      'Failed to load product details from backend:',
      error
    );

    return null;
  }
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
    reply: `Здравствуйте! Я специалист интернет-магазина EKT.kz. В данный момент я анализирую наличие на складе в Астане. Рекомендую обратить внимание на силовые автоматы Legrand серии DRX250 и DRX125, а также реле контроля напряжения Schneider Electric.`,
    suggestedProductIds: [515291, 515285, 35604],
  };
}
