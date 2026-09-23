import React from 'react';
import {
  Bot,
  Zap,
  ShieldCheck,
  Truck,
  Sparkles,
  ArrowRight,
  Calculator,
  Layers,
  Award,
} from 'lucide-react';
import { CityInfo } from '../types';

interface HeroBannerProps {
  currentCity: CityInfo;
  onOpenChatWithPrompt: (prompt: string) => void;
  onOpenCalculator: () => void;
  onScrollToCatalog: () => void;
  onOpenTeamModal?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  currentCity,
  onOpenChatWithPrompt,
  onOpenCalculator,
  onScrollToCatalog,
  onOpenTeamModal,
}) => {
  const quickPrompts = [
    {
      title: '⚡ Подобрать автомат на 160А',
      prompt: 'Мне нужен 3-фазный силовой автоматический выключатель на 160А для распределительного щита. Что есть в наличии в Нур-Султане?',
    },
    {
      title: '🛡️ Защитить скважинный насос',
      prompt: 'Какое реле контроля напряжения и сухого хода выбрать для 3-фазного скважинного насоса?',
    },
    {
      title: '🧮 Расчет: 30 кВт нагрузки',
      prompt: 'Рассчитай номинал автомата и сечение кабеля для трехфазной нагрузки 30 кВт 380В при cos phi 0.85.',
    },
    {
      title: '🔌 Диф. автомат 16А в квартиру',
      prompt: 'Порекомендуй дифференциальный автомат 16А 30мА Legrand для розеточных групп.',
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-850 to-slate-900 text-white pt-8 pb-12 sm:pt-12 sm:pb-16 border-b border-slate-800">
      {/* Background glow effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Hero Copy */}
          <div className="lg:col-span-7 space-y-6">
            <button
              onClick={onOpenTeamModal}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 text-blue-300 hover:text-white text-xs font-semibold tracking-wide transition group cursor-pointer"
              title="Нажмите, чтобы посмотреть распределение ролей 3 участников и запуск в VS Code"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Команда (3): Backend • Frontend • ИИ-Инженер</span>
              <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold ml-1 group-hover:bg-blue-500 transition">
                Роли & VS Code ➔
              </span>
            </button>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
              Современная электротехника в{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-amber-350">
                {currentCity.name}
              </span>{' '}
              с ИИ-подбором без ожидания
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              Интеллектуальный магазин электротехнического оборудования: автоматические
              выключатели Legrand DRX, реле Schneider Electric, диф. автоматы и освещение. Наш
              ИИ-консультант моментально рассчитывает мощности, токи и подбирает артикулы под вашу
              задачу прямо со склада в г. Астана.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() =>
                  onOpenChatWithPrompt(
                    'Здравствуйте! Помогите мне рассчитать и подобрать электрооборудование для моего объекта.'
                  )
                }
                className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-0.5 transition-all"
              >
                <Bot className="w-4 h-4 text-amber-300" />
                <span>Открыть диалог с ИИ-Консультантом</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenCalculator}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-200 border border-slate-700 text-sm font-semibold transition"
              >
                <Calculator className="w-4 h-4 text-amber-400" />
                <span>Инженерный калькулятор (кВт ↔ А)</span>
              </button>

              <button
                onClick={onScrollToCatalog}
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl hover:bg-slate-800/60 text-slate-300 hover:text-white text-sm font-medium transition"
              >
                <Layers className="w-4 h-4 text-blue-400" />
                <span>В каталог ({currentCity.name})</span>
              </button>
            </div>

            {/* Quick Prompt Chips */}
            <div className="pt-2">
              <div className="text-xs font-semibold text-slate-400 mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Популярные запросы к ИИ-консультанту:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => onOpenChatWithPrompt(qp.prompt)}
                    className="text-xs text-left px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-blue-900/40 text-slate-200 hover:text-blue-200 border border-slate-700/80 hover:border-blue-500/50 transition-all hover:scale-[1.02] active:scale-100"
                  >
                    {qp.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Highlight Card - Live AI Assistant Preview */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-slate-750 p-5 shadow-2xl backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      ЭКТ-Инженер Онлайн
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      База знаний: ПУЭ РК + Каталог ekt.kz
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded">
                  Gemini 3.8 Flash
                </span>
              </div>

              {/* Chat Simulation snippet */}
              <div className="space-y-3 text-xs">
                {/* User msg */}
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white px-3 py-2 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm">
                    Нагрузка 30 кВт, 3 фазы. Какой автомат Legrand DRX поставить?
                  </div>
                </div>

                {/* Assistant reply */}
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0 mt-0.5">
                    <Zap className="w-3 h-3 text-amber-400" />
                  </div>
                  <div className="bg-slate-750/90 text-slate-200 border border-slate-700/80 px-3.5 py-2.5 rounded-2xl rounded-tl-sm space-y-2 max-w-[90%]">
                    <p className="leading-relaxed">
                      При 380В и cos φ = 0.85 рабочий ток нагрузки:{' '}
                      <span className="text-amber-300 font-mono font-bold">I ≈ 53.6 А</span>.
                    </p>
                    <p className="text-slate-300">
                      Рекомендую силовой выключатель с запасом 15-20%:{' '}
                      <strong className="text-white">Legrand DRX125 3ф 63А 20kA</strong> (арт.{' '}
                      <span className="font-mono text-sky-300">200300279_</span>).
                    </p>
                    <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700 flex items-center justify-between text-[11px]">
                      <div>
                        <div className="font-semibold text-white">027220 АВ DRX125 63А 20kA</div>
                        <div className="text-emerald-400 font-bold">31 620 ₸ • В Нур-Султане: 10 шт.</div>
                      </div>
                      <button
                        onClick={() =>
                          onOpenChatWithPrompt(
                            'Расскажи подробнее про автомат 027220 Legrand DRX125 63A'
                          )
                        }
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium text-[10px]"
                      >
                        Выбрать
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom live stats */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-750 text-center">
                <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                  <div className="text-base font-bold text-white">40+</div>
                  <div className="text-[10px] text-slate-400">Товаров в демо</div>
                </div>
                <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                  <div className="text-base font-bold text-emerald-400">8 шт.</div>
                  <div className="text-[10px] text-slate-400">DRX250 160A на складе</div>
                </div>
                <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                  <div className="text-base font-bold text-blue-400">&lt; 1 сек</div>
                  <div className="text-[10px] text-slate-400">Ответ ИИ-инженера</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature badges row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-8 border-t border-slate-800/80">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-750/70">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">ИИ-Консультант 24/7</div>
              <div className="text-[11px] text-slate-400">Подбор по ПУЭ и нагрузкам</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-750/70">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Склад в Нур-Султане</div>
              <div className="text-[11px] text-slate-400">ул. Бейсекбаева 24/1</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-750/70">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Оригинальное качество</div>
              <div className="text-[11px] text-slate-400">Legrand, Schneider, IEK</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-750/70">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">B2B Документы</div>
              <div className="text-[11px] text-slate-400">КП и счета для ТОО и ИП</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
