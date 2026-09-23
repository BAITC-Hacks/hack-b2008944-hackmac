import React, { useState } from 'react';
import {
  Zap,
  MapPin,
  Phone,
  Search,
  ShoppingCart,
  Bot,
  Calculator,
  Users,
  Laptop,
  ChevronDown,
  Layers,
  Menu,
  X,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { CITIES } from '../data/mockProducts';
import { CityInfo, FilterState } from '../types';

interface HeaderProps {
  currentCity: CityInfo;
  onSelectCity: (city: CityInfo) => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenChat: (initialPrompt?: string) => void;
  onOpenCalculator: () => void;
  onOpenTeamModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCity,
  onSelectCity,
  filters,
  onFilterChange,
  cartCount,
  onOpenCart,
  onOpenChat,
  onOpenCalculator,
  onOpenTeamModal,
}) => {
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ ...filters, search: searchInput });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      {/* Top micro bar for Hackathon & Store Contacts */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              <Zap className="w-3.5 h-3.5" />
              Хакатон EKT.KZ 2026: Умный ИИ-Консультант
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-slate-400">
              <Clock className="w-3 h-3 text-slate-400" />
              Склад в Астане: Пн-Пт 9:00 - 18:00
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={`tel:${currentCity.phone.replace(/[^0-9+]/g, '')}`}
              className="inline-flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
            >
              <Phone className="w-3 h-3 text-emerald-400" />
              <span className="font-semibold">{currentCity.phone}</span>
            </a>

            <button
              onClick={onOpenTeamModal}
              className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 bg-sky-950/60 border border-sky-800/80 px-2.5 py-0.5 rounded hover:bg-sky-900/60 transition"
              title="Команда из 3 человек: Backend, Frontend, ИИ-помощник & Инструкция для VS Code"
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>Команда (3) & VS Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Logo & City Selector */}
          <div className="flex items-center gap-4 sm:gap-6">
            <a href="#" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5 fill-amber-300 text-amber-300 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-black tracking-tight text-slate-900">
                    EKT<span className="text-blue-600">.KZ</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {currentCity.name}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">
                  Электротехника Казахстана
                </span>
              </div>
            </a>

            {/* City Switcher Dropdown */}
            <div className="relative hidden lg:block">
              <button
                type="button"
                onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>{currentCity.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {cityDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Выберите склад отгрузки:
                  </div>
                  {CITIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        onSelectCity(c);
                        setCityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-blue-50 transition ${
                        c.id === currentCity.id
                          ? 'font-bold text-blue-700 bg-blue-50/70'
                          : 'text-slate-700'
                      }`}
                    >
                      <div>
                        <div>{c.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal truncate">
                          {c.address}
                        </div>
                      </div>
                      {c.id === currentCity.id && (
                        <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-xl hidden md:flex items-center relative"
          >
            <div className="relative w-full">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Поиск по артикулу, амперам, бренду (например: DRX 160A Legrand, RM35, 3ф)..."
                className="w-full pl-10 pr-24 py-2 text-sm bg-slate-100/90 border border-slate-300/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 transition-all placeholder:text-slate-400 shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    onFilterChange({ ...filters, search: '' });
                  }}
                  className="absolute right-20 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition shadow-sm"
              >
                Найти
              </button>
            </div>
          </form>

          {/* Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* AI Consultant Button */}
            <button
              onClick={() => onOpenChat()}
              className="relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              <div className="relative flex items-center justify-center">
                <Bot className="w-4 h-4 text-amber-300" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400"></span>
              </div>
              <span className="hidden sm:inline">ИИ-Консультант</span>
              <span className="sm:hidden">ИИ</span>
              <span className="hidden xl:inline text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded font-normal">
                Online
              </span>
            </button>

            {/* Electrical Calculator */}
            <button
              onClick={onOpenCalculator}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-sm transition"
              title="Расчет тока по мощности кВт и сечения кабеля"
            >
              <Calculator className="w-4 h-4 text-amber-500" />
              <span>Калькулятор кВт/А</span>
            </button>

            {/* Team Roles & VS Code */}
            <button
              onClick={onOpenTeamModal}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-sm transition"
              title="Команда (3): Backend, Frontend, ИИ-помощник & Инструкция для VS Code"
            >
              <Users className="w-4 h-4 text-blue-600" />
              <span>Команда (3)</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs sm:text-sm shadow-sm transition"
            >
              <ShoppingCart className="w-4 h-4 text-slate-700" />
              <span className="hidden sm:inline">Корзина</span>
              {cartCount > 0 && (
                <span className="flex items-center justify-center min-w-5 h-5 px-1 text-[11px] font-bold text-white bg-blue-600 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search input bar */}
        <div className="mt-2.5 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Поиск товара или артикула..."
              className="w-full pl-9 pr-16 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs font-medium px-2.5 py-1 rounded"
            >
              Поиск
            </button>
          </form>
        </div>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-3 pb-2 border-t border-slate-200 mt-3 space-y-2">
            <div className="text-xs font-semibold text-slate-500">Город / Склад:</div>
            <div className="grid grid-cols-2 gap-2">
              {CITIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onSelectCity(c);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-1.5 text-xs rounded-lg border text-left flex items-center justify-between ${
                    c.id === currentCity.id
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  <span>{c.name}</span>
                  {c.id === currentCity.id && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              ))}
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  onOpenCalculator();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200 rounded-lg"
              >
                <Calculator className="w-4 h-4 text-amber-600" />
                Инженерный калькулятор (мощность/ток)
              </button>

              <button
                onClick={() => {
                  onOpenTeamModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium bg-slate-900 text-white rounded-lg"
              >
                <Users className="w-4 h-4 text-amber-400" />
                Команда (3): Backend • Frontend • AI & VS Code
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
