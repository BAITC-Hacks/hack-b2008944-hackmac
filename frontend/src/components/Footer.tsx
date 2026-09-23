import React from 'react';
import {
  Zap,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Bot,
  Users,
  Laptop,
} from 'lucide-react';
import { CITIES } from '../data/mockProducts';
import { CityInfo } from '../types';

interface FooterProps {
  currentCity: CityInfo;
  onOpenChat: () => void;
  onOpenTeamModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  currentCity,
  onOpenChat,
  onOpenTeamModal,
}) => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800">
      {/* Top Banner */}
      <div className="bg-slate-900/60 border-b border-slate-800 py-6 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Bot className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Нужна консультация инженера прямо сейчас?</h4>
              <p className="text-slate-400 text-xs">
                ИИ-консультант подберет оборудование по вашей нагрузке и проверит остатки на складе.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenChat}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Задать вопрос ИИ</span>
            </button>
            <button
              onClick={onOpenTeamModal}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
              title="Команда из 3 человек и инструкция по запуску в VS Code"
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>Команда (3) & VS Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black">
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              </div>
              <span className="text-xl font-black text-white">
                EKT<span className="text-blue-500">.KZ</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Официальный дистрибьютор электротехнического оборудования мировых брендов: Legrand,
              Schneider Electric, OPPLE, MEGALIGHT, IEK в Казахстане.
            </p>
            <div className="pt-2 flex items-center gap-2 text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Сертифицированная продукция с гарантией</span>
            </div>
          </div>

          {/* Астана Branch Info */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">
              Склад в г. {currentCity.name}:
            </h5>
            <div className="space-y-2 text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>{currentCity.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="font-semibold text-white">{currentCity.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Пн - Пт: 9:00 - 18:00 (Сб 9:00 - 15:00)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span>info@ekt.kz</span>
              </div>
            </div>
          </div>

          {/* Regional Network */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">
              Филиалы в Казахстане:
            </h5>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {CITIES.map((c) => (
                <div key={c.id} className="text-slate-400 hover:text-white transition">
                  <span className="font-semibold text-slate-300">{c.name}</span>
                  <div className="text-[10px] text-slate-500 truncate">{c.phone}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hackathon info & 3 members breakdown */}
          <div className="space-y-2.5">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white">
              Команда Хакатона (3 человека):
            </h5>
            <div className="space-y-1 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span><strong>Backend:</strong> Express API, склады, пагинация</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span><strong>Frontend:</strong> UI/UX, каталог, КП с НДС 12%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                <span><strong>ИИ-Инженер:</strong> Gemini AI, расчеты по ПУЭ РК</span>
              </div>
            </div>
            <div className="pt-1 text-[11px] text-amber-400/90 font-mono">
              Локальный запуск: code . ➔ npm i ➔ npm run dev
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <div>© {new Date().getFullYear()} EKT.KZ. Все права защищены.</div>
          <div>Хакатон-проект: Умный консультант и редизайн ekt.kz (3 участника)</div>
        </div>
      </div>
    </footer>
  );
};
