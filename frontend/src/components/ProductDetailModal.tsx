import React, { useState } from 'react';
import {
  X,
  Bot,
  ShoppingCart,
  Zap,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  ExternalLink,
  ShieldCheck,
  Check,
  Copy,
  Building2,
} from 'lucide-react';
import { Product, CityInfo } from '../types';
import { formatKZT } from '../services/api';

interface ProductDetailModalProps {
  product: Product | null;
  currentCity: CityInfo;
  onClose: () => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onAskAI: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  currentCity,
  onClose,
  onAddToCart,
  onAskAI,
}) => {
  if (!product) return null;

  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Store distribution
  const stores = product.stores || [];
  const activeCityStore = stores.find((s) => s.name === currentCity.storeName);
  const activeCityQuantity = activeCityStore ? activeCityStore.quantity : (product.quantity || 0);

  const copyArticle = () => {
    navigator.clipboard.writeText(product.article);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
              {product.brand || 'EKT'}
            </span>
            <span className="text-xs font-mono text-slate-400">ID: {product.id}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Col: Image */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="w-full h-64 sm:h-72 bg-slate-50 border border-slate-200 rounded-2xl p-6 flex items-center justify-center relative overflow-hidden">
                {product.image && !imgError ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    onError={() => setImgError(true)}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center text-slate-400 space-y-2">
                    <Zap className="w-16 h-16 text-blue-500 mx-auto" />
                    <div className="text-xs font-mono">Оригинальное оборудование EKT</div>
                  </div>
                )}
                {product.properties?.NOVINKA === 'Да' && (
                  <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">
                    Новинка
                  </span>
                )}
              </div>

              {/* Quick AI button below photo */}
              <button
                onClick={() => {
                  onAskAI(product);
                  onClose();
                }}
                className="mt-3 w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/20 transition"
              >
                <Bot className="w-4 h-4 text-amber-300" />
                <span>Спросить у ИИ об этом товаре</span>
              </button>
            </div>

            {/* Right Col: Title, Pricing, Specs */}
            <div className="md:col-span-7 space-y-4">
              {/* Article code */}
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Артикул EKT:</span>
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  {product.article}
                </span>
                <button
                  onClick={copyArticle}
                  className="text-slate-400 hover:text-slate-700 p-1"
                  title="Скопировать артикул"
                >
                  {copied ? (
                    <span className="text-emerald-600 font-semibold text-[11px] flex items-center gap-0.5">
                      <Check className="w-3 h-3" /> скопирован
                    </span>
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Title */}
              <h2 className="text-xl font-extrabold text-slate-900 leading-snug">
                {product.name}
              </h2>

              {/* Price card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] text-slate-400 uppercase font-bold">
                    Оптовая / Розничная цена (с НДС)
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {formatKZT(product.price)}
                  </div>
                </div>

                {/* In stock badge in chosen city */}
                <div className="text-right">
                  <div className="text-[11px] text-slate-400 font-medium">Склад {currentCity.name}:</div>
                  {activeCityQuantity > 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      В наличии ({activeCityQuantity} шт.)
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      Доставка в {currentCity.name} 1-2 дня
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity selector & Add to cart button */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center border border-slate-300 rounded-xl bg-white shadow-sm overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 font-bold text-sm transition"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-mono font-bold text-slate-900 text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 font-bold text-sm transition"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3 px-5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Добавить в корзину ({formatKZT(product.price * quantity)})</span>
                </button>
              </div>

              {/* Direct link to official site */}
              {product.url && (
                <div className="pt-1">
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                  >
                    <span>Оригинальная карточка на ekt.kz</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Description Section */}
          {product.description && (
            <div className="space-y-2 border-t border-slate-200 pt-5">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[12px]">
                Описание и применение
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                {product.description}
              </p>
            </div>
          )}

          {/* Full Technical Specifications Sheet */}
          <div className="space-y-3 border-t border-slate-200 pt-5">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[12px] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Технические характеристики</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Производитель (бренд):</span>
                <span className="font-bold text-slate-900">{product.brand || 'Legrand'}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Номинальный ток:</span>
                <span className="font-bold font-mono text-blue-700">
                  {product.current || product.properties?.NOMINALNYY_TOK || '—'}
                </span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Количество полюсов:</span>
                <span className="font-bold font-mono text-slate-900">
                  {product.poles || product.properties?.KOLICHESTVO_POLYUSOV || '—'}
                </span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Отключающая способность:</span>
                <span className="font-bold font-mono text-amber-700">
                  {product.breakingCapacity ||
                    product.properties?.NOMINALNAYA_OTKLYUCHAYUSHCHAYA_SPOSOBNOST ||
                    '—'}
                </span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Номинальное напряжение:</span>
                <span className="font-bold text-slate-900">
                  {product.voltage || product.properties?.NOMINALNOE_NAPRYAZHENIE || '400В AC'}
                </span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Тип монтажа:</span>
                <span className="font-bold text-slate-900">
                  {product.properties?.TIP_USTANOVKI || 'Винтовое / DIN-рейка'}
                </span>
              </div>
              {product.properties?.CML2_BAR_CODE && (
                <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-500">Штрихкод EAN:</span>
                  <span className="font-mono text-slate-900">
                    {product.properties.CML2_BAR_CODE}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Regional Warehouses Stock Breakdown (Real Kazakhstan Data) */}
          <div className="space-y-3 border-t border-slate-200 pt-5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-[12px] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Наличие на складах Казахстана ({stores.filter((s) => s.quantity > 0).length} городов)</span>
              </h4>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                Всего по сети: {product.quantity || 0} шт.
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
              {stores
                .filter((s) => s.quantity > 0)
                .map((st) => (
                  <div
                    key={st.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      st.name === currentCity.storeName
                        ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin
                        className={`w-3.5 h-3.5 flex-shrink-0 ${
                          st.name === currentCity.storeName ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                      />
                      <span className="truncate">{st.name}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 ml-2">{st.quantity} шт.</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Официальная гарантия производителя и сертификаты РК в комплекте.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-semibold transition"
            >
              Закрыть
            </button>
            <button
              onClick={handleAddToCart}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Купить {quantity > 1 ? `(${quantity} шт.)` : ''}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
