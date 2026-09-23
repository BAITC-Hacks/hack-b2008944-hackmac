import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CatalogSection } from './components/CatalogSection';
import { ProductDetailModal } from './components/ProductDetailModal';
import { AIConsultantChat } from './components/AIConsultantChat';
import { ElectricalCalculatorModal } from './components/ElectricalCalculatorModal';
import { CartModal } from './components/CartModal';
import { TeamModal } from './components/TeamModal';
import { Footer } from './components/Footer';
import { CITIES } from './data/mockProducts';
import { Product, CityInfo, FilterState, CartItem } from './types';
import { getProducts, formatKZT } from './services/api';
import { Bot, ShoppingCart, Check, Zap } from 'lucide-react';

export function App() {
  // City state (Default: Nur-Sultan / Astana)
  const [currentCity, setCurrentCity] = useState<CityInfo>(CITIES[0]);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'Все категории',
    brand: 'Все бренды',
    current: 'Все номиналы',
    poles: 'Любое',
    breakingCapacity: 'Любая',
    minPrice: 0,
    maxPrice: 200000,
    onlyInStockInCity: false,
    sortBy: 'relevance',
    viewMode: 'grid',
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('ekt_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | undefined>(undefined);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState<boolean>(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ekt_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Load products when filters, page or city changes
  useEffect(() => {
    let isMounted = true;
    async function fetchCatalog() {
      setIsLoading(true);
      try {
        const response = await getProducts(filters, currentPage, 20, currentCity.id);
        if (isMounted) {
          setProducts(response.items);
          setTotalProducts(response.total ?? response.items.length);
        }
      } catch (e) {
        console.error('Failed to load products:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchCatalog();
    return () => {
      isMounted = false;
    };
  }, [filters, currentPage, currentCity]);

  // Reset to page 1 on filter changes
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });

    showToast(`Товар "${product.name.slice(0, 30)}..." добавлен в корзину (${quantity} шт.)`);
  };

  const handleUpdateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // AI chat triggers
  const handleOpenChat = (prompt?: string) => {
    setChatInitialPrompt(prompt);
    setIsChatOpen(true);
  };

  const handleAskAIAboutProduct = (product?: Product) => {
    if (product) {
      const prompt = `Расскажи про ${product.brand || 'оборудование'} ${product.name} (арт. ${
        product.article
      }, цена ${formatKZT(product.price)}). Для каких задач оно подходит и есть ли на складе в ${
        currentCity.name
      }?`;
      handleOpenChat(prompt);
    } else {
      handleOpenChat(
        `Помоги мне подобрать электрооборудование для объекта в г. ${currentCity.name}.`
      );
    }
  };

  // Apply current filter from calculator
  const handleApplyCurrentFilter = (currentRating: string) => {
    handleFilterChange({
      ...filters,
      current: currentRating,
      category: 'Силовые автоматические выключатели',
    });
    showToast(`Применен фильтр по току: ${currentRating}`);
    handleScrollToCatalog();
  };

  const handleScrollToCatalog = () => {
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <Header
        currentCity={currentCity}
        onSelectCity={(city) => {
          setCurrentCity(city);
          showToast(`Склад отгрузки изменен на: ${city.name} (${city.address})`);
        }}
        filters={filters}
        onFilterChange={handleFilterChange}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenChat={() => handleOpenChat()}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenTeamModal={() => setIsTeamModalOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section with AI Spotlight & Team Banner */}
        <HeroBanner
          currentCity={currentCity}
          onOpenChatWithPrompt={handleOpenChat}
          onOpenCalculator={() => setIsCalculatorOpen(true)}
          onScrollToCatalog={handleScrollToCatalog}
          onOpenTeamModal={() => setIsTeamModalOpen(true)}
        />

        {/* Catalog Section */}
        <CatalogSection
          products={products}
          totalProducts={totalProducts}
          currentPage={currentPage}
          onPageChange={(page) => {
            setCurrentPage(page);
            handleScrollToCatalog();
          }}
          filters={filters}
          onFilterChange={handleFilterChange}
          currentCity={currentCity}
          onOpenDetail={(product) => setSelectedProduct(product)}
          onAddToCart={(product) => handleAddToCart(product)}
          onAskAI={handleAskAIAboutProduct}
          isLoading={isLoading}
        />
      </main>

      {/* Footer */}
      <Footer
        currentCity={currentCity}
        onOpenChat={() => handleOpenChat()}
        onOpenTeamModal={() => setIsTeamModalOpen(true)}
      />

      {/* Floating Action Button for AI Consultant (When chat closed) */}
      {!isChatOpen && (
        <button
          onClick={() => handleOpenChat()}
          className="fixed bottom-6 right-6 z-40 group flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-2xl shadow-blue-600/40 hover:shadow-blue-600/60 hover:-translate-y-1 active:translate-y-0 transition-all duration-300"
          title="Открыть ИИ-консультанта EKT"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-amber-300">
              <Bot className="w-6 h-6 animate-bounce" />
            </div>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900 animate-pulse"></span>
          </div>

          <div className="text-left hidden sm:block">
            <div className="text-xs font-black tracking-wide flex items-center gap-1.5">
              <span>ИИ-Инженер EKT</span>
              <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded">
                PRO
              </span>
            </div>
            <div className="text-[11px] text-blue-100 font-normal">
              Подобрать товар без менеджера
            </div>
          </div>
        </button>
      )}

      {/* AI Consultant Chat Drawer / Modal */}
      <AIConsultantChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentCity={currentCity}
        onAddToCart={handleAddToCart}
        onOpenProductDetail={(product) => setSelectedProduct(product)}
        initialPrompt={chatInitialPrompt}
        onOpenCalculator={() => {
          setIsChatOpen(false);
          setIsCalculatorOpen(true);
        }}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        currentCity={currentCity}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onAskAI={handleAskAIAboutProduct}
      />

      {/* Electrical Engineering Calculator Modal */}
      <ElectricalCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        onApplyCurrentFilter={handleApplyCurrentFilter}
      />

      {/* Cart & Commercial Offer Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        currentCity={currentCity}
      />

      {/* Team of 3 & VS Code Instructions Modal */}
      <TeamModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
      />

      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default App;
