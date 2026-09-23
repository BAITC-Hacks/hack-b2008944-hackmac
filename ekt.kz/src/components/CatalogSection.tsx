import React, { useState } from 'react';
import {
  Layers,
  Filter,
  SlidersHorizontal,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle,
  Zap,
  Bot,
  Search,
  Check,
} from 'lucide-react';
import { Product, FilterState, CityInfo } from '../types';
import { ProductCard } from './ProductCard';
import {
  CATEGORIES,
  BRANDS,
  CURRENT_RATINGS,
  BREAKING_CAPACITIES,
  POLE_OPTIONS,
} from '../data/mockProducts';

interface CatalogSectionProps {
  products: Product[];
  totalProducts: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  currentCity: CityInfo;
  onOpenDetail: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onAskAI: (product?: Product) => void;
  isLoading?: boolean;
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  products,
  totalProducts,
  currentPage,
  onPageChange,
  filters,
  onFilterChange,
  currentCity,
  onOpenDetail,
  onAddToCart,
  onAskAI,
  isLoading = false,
}) => {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const itemsPerPage = 20;
  const totalPages = Math.max(1, Math.ceil(totalProducts / itemsPerPage));

  const resetFilters = () => {
    onFilterChange({
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
      viewMode: filters.viewMode,
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.category !== 'Все категории' ||
    filters.brand !== 'Все бренды' ||
    filters.current !== 'Все номиналы' ||
    filters.poles !== 'Любое' ||
    filters.breakingCapacity !== 'Любая' ||
    filters.onlyInStockInCity;

  return (
    <section id="catalog-section" className="py-8 sm:py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Category quick chips */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-6 h-6 text-blue-600" />
              <span>Каталог электрооборудования</span>
              <span className="text-sm font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full shadow-sm">
                {totalProducts} товаров
              </span>
            </h2>

            {/* View switcher */}
            <div className="hidden sm:flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
              <button
                onClick={() => onFilterChange({ ...filters, viewMode: 'grid' })}
                className={`p-1.5 rounded-lg transition ${
                  filters.viewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Сетка карточек"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => onFilterChange({ ...filters, viewMode: 'table' })}
                className={`p-1.5 rounded-lg transition ${
                  filters.viewMode === 'table'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Таблица для снабженцев / электриков"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => onFilterChange({ ...filters, category: cat })}
                className={`text-xs whitespace-nowrap px-3.5 py-2 rounded-xl font-semibold transition-all ${
                  filters.category === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-sm'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid: Filters + Products */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar Filter (Desktop) */}
          <aside className="hidden lg:block lg:col-span-1 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-6 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                  <span>Параметры подбора</span>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Сбросить
                  </button>
                )}
              </div>

              {/* Warehouse Stock toggle */}
              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.onlyInStockInCity}
                    onChange={(e) =>
                      onFilterChange({
                        ...filters,
                        onlyInStockInCity: e.target.checked,
                      })
                    }
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 block">
                      В наличии в {currentCity.name}
                    </span>
                    <span className="text-[11px] text-slate-600">
                      Отгрузка со склада в день заказа
                    </span>
                  </div>
                </label>
              </div>

              {/* Brand Selector */}
              <div>
                <label className="text-xs font-bold text-slate-900 mb-2 block uppercase tracking-wider text-[11px]">
                  Производитель / Бренд
                </label>
                <div className="space-y-1">
                  {BRANDS.map((b) => (
                    <button
                      key={b}
                      onClick={() => onFilterChange({ ...filters, brand: b })}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                        filters.brand === b
                          ? 'bg-blue-50 font-bold text-blue-700'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{b}</span>
                      {filters.brand === b && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Amperes (Номинальный ток) */}
              <div>
                <label className="text-xs font-bold text-slate-900 mb-2 block uppercase tracking-wider text-[11px]">
                  Номинальный ток (А)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {CURRENT_RATINGS.map((curr) => (
                    <button
                      key={curr}
                      onClick={() => onFilterChange({ ...filters, current: curr })}
                      className={`py-1.5 px-2 text-xs rounded-lg font-mono font-medium transition text-center ${
                        filters.current === curr
                          ? 'bg-blue-600 text-white font-bold shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Breaking Capacity (Отключающая способность) */}
              <div>
                <label className="text-xs font-bold text-slate-900 mb-2 block uppercase tracking-wider text-[11px]">
                  Отключающая способность (кА)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {BREAKING_CAPACITIES.map((cap) => (
                    <button
                      key={cap}
                      onClick={() =>
                        onFilterChange({ ...filters, breakingCapacity: cap })
                      }
                      className={`py-1.5 px-2 text-xs rounded-lg font-mono font-medium transition text-center ${
                        filters.breakingCapacity === cap
                          ? 'bg-amber-600 text-white font-bold shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {cap}
                    </button>
                  ))}
                </div>
              </div>

              {/* Poles */}
              <div>
                <label className="text-xs font-bold text-slate-900 mb-2 block uppercase tracking-wider text-[11px]">
                  Количество полюсов
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {POLE_OPTIONS.map((p) => (
                    <button
                      key={p}
                      onClick={() => onFilterChange({ ...filters, poles: p })}
                      className={`py-1.5 px-2 text-xs rounded-lg font-medium transition text-center ${
                        filters.poles === p
                          ? 'bg-blue-600 text-white font-bold shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {p === 'Любое' ? 'Любое' : `${p} полюса`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ask AI Card Promo inside filter */}
              <div className="p-3.5 bg-gradient-to-br from-indigo-900 to-blue-900 text-white rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <Bot className="w-4 h-4" />
                  <span>Не уверены в выборе?</span>
                </div>
                <p className="text-[11px] text-slate-200 leading-snug">
                  Задайте вопрос ИИ-инженеру: он рассчитает номинал по нагрузке и проверит остаток в
                  Нур-Султане.
                </p>
                <button
                  onClick={() => onAskAI()}
                  className="w-full py-1.5 bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold rounded-lg transition"
                >
                  Спросить у ИИ
                </button>
              </div>
            </div>
          </aside>

          {/* Right Product Grid Area */}
          <main className="lg:col-span-3 space-y-4">
            {/* Top Toolbar: Sorting & Mobile Filter Trigger */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                  className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Фильтры {hasActiveFilters && '•'}</span>
                </button>

                <div className="text-xs text-slate-500">
                  Показано: <strong className="text-slate-900">{products.length}</strong> из{' '}
                  <strong className="text-slate-900">{totalProducts}</strong> товаров
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500 hidden sm:inline">Сортировка:</label>
                <select
                  value={filters.sortBy}
                  onChange={(e: any) =>
                    onFilterChange({ ...filters, sortBy: e.target.value })
                  }
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                >
                  <option value="relevance">По релевантности</option>
                  <option value="price-asc">Сначала дешевле</option>
                  <option value="price-desc">Сначала дороже</option>
                  <option value="name">По названию (А-Я)</option>
                </select>
              </div>
            </div>

            {/* Mobile Filters collapsible drawer */}
            {mobileFilterOpen && (
              <div className="lg:hidden bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-sm text-slate-900">Фильтры</span>
                  <button
                    onClick={resetFilters}
                    className="text-xs text-rose-600 font-semibold"
                  >
                    Сбросить
                  </button>
                </div>

                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={filters.onlyInStockInCity}
                    onChange={(e) =>
                      onFilterChange({
                        ...filters,
                        onlyInStockInCity: e.target.checked,
                      })
                    }
                    className="rounded text-blue-600 h-4 w-4"
                  />
                  <span className="font-medium text-slate-800">
                    В наличии в {currentCity.name}
                  </span>
                </label>

                <div>
                  <div className="text-xs font-semibold text-slate-700 mb-1">Бренд:</div>
                  <div className="flex flex-wrap gap-1">
                    {BRANDS.map((b) => (
                      <button
                        key={b}
                        onClick={() => onFilterChange({ ...filters, brand: b })}
                        className={`text-xs px-2.5 py-1 rounded-md ${
                          filters.brand === b
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-slate-700 mb-1">Ток (А):</div>
                  <div className="flex flex-wrap gap-1">
                    {CURRENT_RATINGS.slice(0, 8).map((c) => (
                      <button
                        key={c}
                        onClick={() => onFilterChange({ ...filters, current: c })}
                        className={`text-xs px-2 py-1 rounded-md font-mono ${
                          filters.current === c
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Product List Content */}
            {products.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <Search className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Товары по вашим критериям не найдены
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    Попробуйте смягчить параметры фильтра или спросите у ИИ-консультанта: он подберет
                    аналоги или проверит другие склады Казахстана.
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition"
                  >
                    Сбросить фильтры
                  </button>
                  <button
                    onClick={() =>
                      onAskAI(
                        undefined
                      )
                    }
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-1.5"
                  >
                    <Bot className="w-4 h-4 text-amber-300" />
                    <span>Подобрать с помощью ИИ</span>
                  </button>
                </div>
              </div>
            ) : filters.viewMode === 'table' ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                      <th className="py-2.5 px-3">Фото</th>
                      <th className="py-2.5 px-3">Артикул</th>
                      <th className="py-2.5 px-3">Наименование</th>
                      <th className="py-2.5 px-3">Бренд</th>
                      <th className="py-2.5 px-3">Ток</th>
                      <th className="py-2.5 px-3">Полюса</th>
                      <th className="py-2.5 px-3">Откл. сп.</th>
                      <th className="py-2.5 px-3">Наличие</th>
                      <th className="py-2.5 px-3">Цена</th>
                      <th className="py-2.5 px-3 text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((prod) => (
                      <ProductCard
                        key={prod.id}
                        product={prod}
                        currentCity={currentCity}
                        onOpenDetail={onOpenDetail}
                        onAddToCart={onAddToCart}
                        onAskAI={(p) => onAskAI(p)}
                        viewMode="table"
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                {products.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    currentCity={currentCity}
                    onOpenDetail={onOpenDetail}
                    onAddToCart={onAddToCart}
                    onAskAI={(p) => onAskAI(p)}
                    viewMode="grid"
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between mt-6">
                <div className="text-xs text-slate-500 font-medium">
                  Страница <strong className="text-slate-900">{currentPage}</strong> из{' '}
                  <strong className="text-slate-900">{totalPages}</strong>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Назад</span>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <span>Вперед</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </section>
  );
};
