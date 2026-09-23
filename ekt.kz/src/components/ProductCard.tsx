import React, { useState } from 'react';
import {
  ShoppingCart,
  Bot,
  Info,
  Check,
  Copy,
  Zap,
  PackageCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Product, CityInfo } from '../types';
import { formatKZT } from '../services/api';

interface ProductCardProps {
  product: Product;
  currentCity: CityInfo;
  onOpenDetail: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onAskAI: (product: Product) => void;
  viewMode?: 'grid' | 'table';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currentCity,
  onOpenDetail,
  onAddToCart,
  onAskAI,
  viewMode = 'grid',
}) => {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Determine stock in selected city
  const cityStore = product.stores?.find((s) => s.name === currentCity.storeName);
  const cityQuantity = cityStore !== undefined ? cityStore.quantity : (product.quantity || 0);
  const isAvailableInCity = cityQuantity > 0;

  const copyArticle = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(product.article);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // If table view for technical procurement / contractors
  if (viewMode === 'table') {
    return (
      <tr className="hover:bg-blue-50/50 transition-colors border-b border-slate-200 text-xs text-slate-800">
        <td className="py-3 px-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden flex-shrink-0">
            {product.image && !imgError ? (
              <img
                src={product.image}
                alt={product.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-contain p-1"
                loading="lazy"
              />
            ) : (
              <Zap className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </td>
        <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
          <div className="flex items-center gap-1">
            <span>{product.article}</span>
            <button
              onClick={copyArticle}
              title="Скопировать артикул"
              className="text-slate-400 hover:text-slate-700 p-0.5"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </td>
        <td className="py-3 px-3 font-semibold text-slate-900 max-w-xs">
          <button
            onClick={() => onOpenDetail(product)}
            className="text-left hover:text-blue-600 transition"
          >
            {product.name}
          </button>
        </td>
        <td className="py-3 px-3">
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
            {product.brand || 'EKT'}
          </span>
        </td>
        <td className="py-3 px-3 font-mono">
          {product.current ? (
            <span className="font-bold text-blue-700">{product.current}</span>
          ) : (
            '—'
          )}
        </td>
        <td className="py-3 px-3 font-mono">
          {product.poles ? `${product.poles}P` : '—'}
        </td>
        <td className="py-3 px-3 font-mono">
          {product.breakingCapacity ? (
            <span className="font-semibold text-amber-700">{product.breakingCapacity}</span>
          ) : (
            '—'
          )}
        </td>
        <td className="py-3 px-3">
          {isAvailableInCity ? (
            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {cityQuantity} шт. ({currentCity.name})
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-amber-700 text-[11px] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Под заказ (1-2 дня)
            </span>
          )}
        </td>
        <td className="py-3 px-3 font-extrabold text-sm text-slate-900 whitespace-nowrap">
          {formatKZT(product.price)}
        </td>
        <td className="py-3 px-3 text-right whitespace-nowrap">
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => onAskAI(product)}
              title="Задать вопрос ИИ-консультанту"
              className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition"
            >
              <Bot className="w-4 h-4" />
            </button>
            <button
              onClick={() => onAddToCart(product)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Купить</span>
            </button>
          </div>
        </td>
      </tr>
    );
  }

  // Grid Card View
  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden">
      {/* Top badges bar */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-sm text-white shadow-sm">
            {product.brand || 'EKT'}
          </span>
          {product.properties?.NOVINKA === 'Да' && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-500 text-white shadow-sm">
              Новинка
            </span>
          )}
        </div>

        {/* Stock pill for active city */}
        {isAvailableInCity ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-white/95 backdrop-blur-sm border border-emerald-200 px-2 py-0.5 rounded-full shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {cityQuantity} шт. в {currentCity.name}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50/95 border border-amber-200 px-2 py-0.5 rounded-full shadow-sm">
            Доставка 1-2 дня
          </span>
        )}
      </div>

      {/* Image container */}
      <div
        onClick={() => onOpenDetail(product)}
        className="relative h-48 bg-slate-50/80 p-6 flex items-center justify-center cursor-pointer group-hover:bg-slate-50 transition-colors overflow-hidden"
      >
        {product.image && !imgError ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImgError(true)}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 gap-1.5">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-blue-600">
              <Zap className="w-7 h-7" />
            </div>
            <span className="text-[11px] font-mono text-slate-500">Фото товара EKT</span>
          </div>
        )}
      </div>

      {/* Content info */}
      <div className="flex-1 p-4 flex flex-col justify-between space-y-3">
        <div>
          {/* Article with copy */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-mono text-[11px] text-slate-600">
              Арт: {product.article}
            </span>
            <button
              onClick={copyArticle}
              className="text-slate-400 hover:text-slate-700 transition flex items-center gap-1 text-[10px]"
              title="Скопировать артикул"
            >
              {copied ? (
                <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                  <Check className="w-3 h-3" /> скопировано
                </span>
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>

          {/* Title */}
          <h3
            onClick={() => onOpenDetail(product)}
            className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 hover:text-blue-600 cursor-pointer transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Specs tags pills */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {product.current && (
              <span className="text-[11px] font-semibold font-mono px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                Ток: {product.current}
              </span>
            )}
            {product.poles && (
              <span className="text-[11px] font-semibold font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                {product.poles} Полюса
              </span>
            )}
            {product.breakingCapacity && (
              <span className="text-[11px] font-semibold font-mono px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                {product.breakingCapacity}
              </span>
            )}
            {product.voltage && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200">
                {product.voltage}
              </span>
            )}
          </div>
        </div>

        {/* Pricing and Action row */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-medium">Цена с НДС</div>
            <div className="text-lg font-black text-slate-900 tracking-tight">
              {formatKZT(product.price)}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Ask AI quick button */}
            <button
              onClick={() => onAskAI(product)}
              title="Спросить у ИИ-инженера"
              className="p-2 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition"
            >
              <Bot className="w-4 h-4" />
            </button>

            {/* Add to cart */}
            <button
              onClick={() => onAddToCart(product)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Купить</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
