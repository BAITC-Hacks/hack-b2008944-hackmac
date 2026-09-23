import React, { useState } from 'react';
import {
  X,
  ShoppingCart,
  Trash2,
  FileSpreadsheet,
  CheckCircle2,
  Printer,
  Building,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { CartItem, CityInfo } from '../types';
import { formatKZT } from '../services/api';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: number, delta: number) => void;
  onRemoveItem: (productId: number) => void;
  onClearCart: () => void;
  currentCity: CityInfo;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  currentCity,
}) => {
  if (!isOpen) return null;

  const [orderStep, setOrderStep] = useState<'cart' | 'checkout' | 'success' | 'offer'>('cart');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+7 ');
  const [companyBin, setCompanyBin] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [address, setAddress] = useState(currentCity.address);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const vat = Math.round(subtotal * (12 / 112)); // 12% VAT in Kazakhstan included

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderStep('success');
  };

  const handlePrintOffer = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {orderStep === 'offer'
                  ? 'Коммерческое предложение (КП)'
                  : orderStep === 'checkout'
                  ? 'Оформление заказа'
                  : orderStep === 'success'
                  ? 'Заказ успешно принят!'
                  : 'Корзина оборудования'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Склад отгрузки: {currentCity.name} ({currentCity.address})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {orderStep === 'cart' && (
            <div className="space-y-6">
              {items.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                    <ShoppingCart className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-slate-800">Ваша корзина пуста</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Выберите автоматические выключатели или реле из каталога, либо воспользуйтесь
                    ИИ-консультантом.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
                  >
                    Перейти в каталог
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={item.product.id}
                        className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 flex flex-wrap items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5 flex-1 min-w-[200px]">
                          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center flex-shrink-0">
                            {item.product.image ? (
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="max-h-full max-w-full object-contain"
                              />
                            ) : (
                              <Zap className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <div className="text-[10px] font-mono text-slate-500">
                              Арт: {item.product.article} • {item.product.brand || 'EKT'}
                            </div>
                            <h5 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-1">
                              {item.product.name}
                            </h5>
                            <div className="text-xs font-extrabold text-blue-700 mt-0.5">
                              {formatKZT(item.product.price)} / шт.
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Counter */}
                          <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shadow-2xs">
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, -1)}
                              className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                            >
                              -
                            </button>
                            <span className="px-3 py-1 font-mono font-bold text-xs text-slate-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, 1)}
                              className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                            >
                              +
                            </button>
                          </div>

                          {/* Line total */}
                          <div className="text-right min-w-[90px]">
                            <div className="text-xs font-black text-slate-900">
                              {formatKZT(item.product.price * item.quantity)}
                            </div>
                          </div>

                          {/* Delete */}
                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary row */}
                  <div className="p-4 bg-slate-100/80 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Сумма без НДС:</span>
                      <span className="font-mono">{formatKZT(subtotal - vat)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>В том числе НДС 12%:</span>
                      <span className="font-mono">{formatKZT(vat)}</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                      <span>Итого к оплате:</span>
                      <span className="text-xl text-blue-700 font-mono">{formatKZT(subtotal)}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={onClearCart}
                        className="text-xs text-slate-500 hover:text-rose-600 font-medium"
                      >
                        Очистить корзину
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        onClick={() => setOrderStep('offer')}
                        className="inline-flex items-center gap-1.5 text-xs text-indigo-700 font-bold hover:underline"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Сформировать КП для ТОО/ИП</span>
                      </button>
                    </div>

                    <button
                      onClick={() => setOrderStep('checkout')}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/25 transition flex items-center gap-2"
                    >
                      <span>Оформить заказ</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Checkout Form */}
          {orderStep === 'checkout' && (
            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ФИО контактного лица:
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Алихан Нурланов"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Телефон в Казахстане (+7):
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+7 777 123 45 67"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Наименование ТОО / ИП (необязательно):
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="ТОО ЭлектроМонтаж Астана"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    БИН / ИИН:
                  </label>
                  <input
                    type="text"
                    value={companyBin}
                    onChange={(e) => setCompanyBin(e.target.value)}
                    placeholder="12-значный БИН"
                    maxLength={12}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* Delivery option */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Способ получения:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('pickup')}
                    className={`p-3 rounded-xl border text-left text-xs transition ${
                      deliveryType === 'pickup'
                        ? 'border-blue-600 bg-blue-50 font-bold text-blue-900'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <div>Самовывоз со склада EKT</div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      {currentCity.name}, {currentCity.address} (Бесплатно, сегодня)
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('delivery')}
                    className={`p-3 rounded-xl border text-left text-xs transition ${
                      deliveryType === 'delivery'
                        ? 'border-blue-600 bg-blue-50 font-bold text-blue-900'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <div>Курьерская доставка по городу</div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      От 2 000 ₸ или бесплатно от 50 000 ₸
                    </div>
                  </button>
                </div>
              </div>

              {deliveryType === 'delivery' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Адрес доставки в г. {currentCity.name}:
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Улица, дом, офис/квартира"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              )}

              <div className="pt-4 flex items-center justify-between border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setOrderStep('cart')}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Вернуться в корзину
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition"
                >
                  Подтвердить заказ ({formatKZT(subtotal)})
                </button>
              </div>
            </form>
          )}

          {/* Success Screen */}
          {orderStep === 'success' && (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Заказ успешно зарегистрирован!</h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Номер заказа: <strong className="text-slate-900 font-mono">EKT-2026-0814</strong>
                <br />
                Товары зарезервированы на складе в г. {currentCity.name} ({currentCity.address}).
                Наш менеджер свяжется с вами по номеру <strong className="text-slate-900">{customerPhone}</strong>.
              </p>
              <div className="pt-3 flex justify-center gap-3">
                <button
                  onClick={() => setOrderStep('offer')}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                  <span>Печать накладной / КП</span>
                </button>
                <button
                  onClick={() => {
                    onClearCart();
                    onClose();
                  }}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                >
                  Завершить
                </button>
              </div>
            </div>
          )}

          {/* Commercial Offer PDF/Print View */}
          {orderStep === 'offer' && (
            <div className="space-y-4 print:p-0">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="text-xs text-slate-500">
                  Документ для бухгалтерии и снабжения (ТОО / ИП)
                </div>
                <button
                  onClick={handlePrintOffer}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-800 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Распечатать / Сохранить в PDF</span>
                </button>
              </div>

              {/* Printable B2B Form */}
              <div className="p-6 bg-white border border-slate-300 rounded-2xl space-y-4 font-sans text-xs text-slate-800 print:border-none print:shadow-none">
                <div className="flex justify-between items-start border-b border-slate-300 pb-4">
                  <div>
                    <div className="text-xl font-black text-slate-900">ТОО «ЭКТ Казахстан»</div>
                    <div className="text-[11px] text-slate-500">
                      БИН: 150440023419 • г. Нур-Султан, ул. Бейсекбаева 24/1
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Тел: +7 (7172) 99-88-77 • info@ekt.kz • https://nursultan.ekt.kz/
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">
                      КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ № КП-{Date.now().toString().slice(-6)}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Дата: {new Date().toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                </div>

                <div className="text-xs">
                  <strong>Заказчик:</strong> {companyName || customerName || 'Покупатель (ТОО/ИП)'}
                  {companyBin && ` • БИН/ИИН: ${companyBin}`}
                </div>

                {/* Table */}
                <table className="w-full border-collapse border border-slate-300 text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 font-bold">
                      <th className="border border-slate-300 p-1.5 w-8">№</th>
                      <th className="border border-slate-300 p-1.5">Артикул</th>
                      <th className="border border-slate-300 p-1.5">Наименование товара</th>
                      <th className="border border-slate-300 p-1.5 w-14">Кол-во</th>
                      <th className="border border-slate-300 p-1.5 w-24">Цена с НДС</th>
                      <th className="border border-slate-300 p-1.5 w-24">Сумма с НДС</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => (
                      <tr key={it.product.id}>
                        <td className="border border-slate-300 p-1.5 text-center">{idx + 1}</td>
                        <td className="border border-slate-300 p-1.5 font-mono">{it.product.article}</td>
                        <td className="border border-slate-300 p-1.5 font-medium">{it.product.name}</td>
                        <td className="border border-slate-300 p-1.5 text-center font-bold">
                          {it.quantity} шт.
                        </td>
                        <td className="border border-slate-300 p-1.5 text-right">
                          {formatKZT(it.product.price)}
                        </td>
                        <td className="border border-slate-300 p-1.5 text-right font-bold">
                          {formatKZT(it.product.price * it.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold bg-slate-50">
                      <td colSpan={5} className="border border-slate-300 p-2 text-right">
                        ИТОГО К ОПЛАТЕ С НДС (12%):
                      </td>
                      <td className="border border-slate-300 p-2 text-right text-blue-700 font-mono text-sm">
                        {formatKZT(subtotal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                <div className="pt-4 flex justify-between items-end text-[11px] text-slate-500">
                  <div>
                    Предложение действительно в течение 5 банковских дней.
                    <br />
                    Отгрузка: склад г. {currentCity.name}, {currentCity.address}.
                  </div>
                  <div className="text-right">
                    <div>Ответственный менеджер: ИИ-Инженер EKT</div>
                    <div className="font-mono text-[10px] text-slate-400">М.П. / ЭЦП подтверждена</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setOrderStep('cart')}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Вернуться в корзину
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
