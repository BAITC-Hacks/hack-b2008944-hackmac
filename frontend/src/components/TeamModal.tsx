import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Server,
  Layout,
  Bot,
  Terminal,
  Code2,
  FolderTree,
  Check,
  Copy,
  Edit3,
  Save,
  Laptop,
  Play,
  FileCode,
  Zap,
} from 'lucide-react';

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TeamMember {
  id: string;
  role: string;
  roleTitle: string;
  defaultName: string;
  badgeColor: string;
  icon: React.ReactNode;
  summary: string;
  files: string[];
  responsibilities: string[];
}

export const TeamModal: React.FC<TeamModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'team' | 'vscode'>('team');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isEditingNames, setIsEditingNames] = useState(false);

  // Load custom member names from localStorage if edited
  const [memberNames, setMemberNames] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('ekt_team_names');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      backend: 'Участник 1 (Backend)',
      frontend: 'Участник 2 (Frontend)',
      ai: 'Участник 3 (AI Engineer)',
    };
  });

  const saveNames = () => {
    try {
      localStorage.setItem('ekt_team_names', JSON.stringify(memberNames));
    } catch {
      // ignore
    }
    setIsEditingNames(false);
  };

  const members: TeamMember[] = [
    {
      id: 'backend',
      role: 'Backend-разработчик',
      roleTitle: 'Сервер, API, Архитектура данных и Склады',
      defaultName: memberNames.backend,
      badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
      icon: <Server className="w-5 h-5 text-emerald-600" />,
      summary: 'Разработка серверного REST API на Express, организация структуры данных каталога ekt.kz, учет остатков по городам Казахстана и пагинация.',
      files: [
        'server.ts (REST API роуты, пагинация, фильтрация)',
        'src/data/mockProducts.ts (Датасет каталога, складские запасы по РК)',
        'src/services/api.ts (Сетевой клиентский слой)',
        'src/types/index.ts (TypeScript интерфейсы моделей)',
      ],
      responsibilities: [
        'Эндпоинты /api/products, /api/cities, /api/chat в server.ts',
        'Складской учет: Астана (ул. Бейсекбаева 24/1), Алматы, Шымкент',
        'Серверная пагинация (страницы 1, 2) и фильтрация по параметрам',
        'TypeScript типизация всех сущностей системы',
      ],
    },
    {
      id: 'frontend',
      role: 'Frontend-разработчик',
      roleTitle: 'Интерфейс, Дизайн, UX, Каталог и Корзина',
      defaultName: memberNames.frontend,
      badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
      icon: <Layout className="w-5 h-5 text-blue-600" />,
      summary: 'Создание современного адаптивного интерфейса в брендинге EKT, плиточный и табличный каталог, корзина со сметой по НДС 12% и печать КП.',
      files: [
        'src/App.tsx (Глобальный стейт, корзина, синхронизация)',
        'src/components/Header.tsx & Footer.tsx (Навигация, филиалы)',
        'src/components/CatalogSection.tsx & ProductCard.tsx (Каталог, фильтры)',
        'src/components/ProductDetailModal.tsx (Карточка товара и остатки)',
        'src/components/CartModal.tsx (Корзина, НДС 12%, печать КП)',
        'src/components/ElectricalCalculatorModal.tsx (Калькулятор кВт ↔ А)',
        'src/components/HeroBanner.tsx (Баннеры, быстрый поиск)',
      ],
      responsibilities: [
        'Редизайн главной страницы ekt.kz и адаптивная верстка',
        'Переключение видов каталога (сетка для B2C, таблица для B2B/снабженцев)',
        'Интерактивная корзина с расчетом НДС 12% и генерация коммерческого предложения',
        'Инженерный калькулятор перевода мощности (кВт) в ток (А) с автофильтром',
      ],
    },
    {
      id: 'ai',
      role: 'AI-инженер (ИИ-помощник)',
      roleTitle: 'ИИ-Консультант, Gemini AI, ПУЭ РК, Голос',
      defaultName: memberNames.ai,
      badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
      icon: <Bot className="w-5 h-5 text-purple-600" />,
      summary: 'Ядро интеллектуального консультанта "ЭКТ Инженер", база знаний по ПУЭ РК, интеграция Gemini API, подбор Legrand DRX и реле Schneider, голосовой диалог.',
      files: [
        'src/components/AIConsultantChat.tsx (UI диалога, виджет карточек)',
        'src/services/aiConsultant.ts (Экспертный движок расчетов по ПУЭ)',
        'server.ts (Google Gemini 3.8 Flash интеграция & системный промпт)',
      ],
      responsibilities: [
        'Промпт-инжиниринг: роль ведущего инженера-консультанта EKT',
        'Формулы расчета токов: 220В (I=P/220*cosφ) и 380В (I=P/√3*380*cosφ)',
        'База подбора: автоматы Legrand DRX (16-250А), реле Schneider RM35/RM17',
        'Интерактивные карточки товаров прямо в чате с добавлением в корзину',
        'Голосовой ввод вопросов (Speech Recognition) и синтез речи (Speech Synthesis)',
      ],
    },
  ];

  const vsCodeCommands = `# 1. Откройте встроенный терминал в VS Code:
# Нажмите комбинацию клавиш: Ctrl + ~ (или Terminal -> New Terminal)

# 2. Установите зависимости проекта:
npm install

# 3. Запустите сервер разработки:
npm run dev

# 4. Откройте сайт в браузере:
# Перейдите по адресу: http://localhost:3000`;

  const copyVSCodeCommands = () => {
    navigator.clipboard.writeText(`npm install\nnpm run dev`);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <Users className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Команда проекта (3 участника)</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-full">
                  Хакатон EKT.KZ
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Четкое разделение: Backend, Frontend, ИИ-помощник & Инструкция для VS Code
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('team')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition border-t-2 ${
              activeTab === 'team'
                ? 'bg-white text-blue-600 border-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Разделение на 3 разработчиков</span>
          </button>

          <button
            onClick={() => setActiveTab('vscode')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition border-t-2 ${
              activeTab === 'vscode'
                ? 'bg-white text-blue-600 border-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Как открыть и запустить в VS Code</span>
          </button>
        </div>

        {/* Tab 1: Team & Roles */}
        {activeTab === 'team' && (
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
            {/* Banner with edit names */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-blue-50/70 border border-blue-200 rounded-2xl">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-blue-950 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Проект разделен на 3 независимых модуля для защиты перед жюри</span>
                </h4>
                <p className="text-xs text-blue-900/80 mt-0.5">
                  Каждый участник отвечает за свою часть: сервер/данные, пользовательский интерфейс или ИИ-консультанта.
                </p>
              </div>

              <button
                onClick={() => {
                  if (isEditingNames) {
                    saveNames();
                  } else {
                    setIsEditingNames(true);
                  }
                }}
                className="self-start sm:self-auto px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
              >
                {isEditingNames ? (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Сохранить имена</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Вписать наши ФИО</span>
                  </>
                )}
              </button>
            </div>

            {/* Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Role Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="p-2 rounded-xl bg-slate-100 border border-slate-200">
                        {member.icon}
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${member.badgeColor}`}
                      >
                        {member.role}
                      </span>
                    </div>

                    {/* Member Name */}
                    <div>
                      {isEditingNames ? (
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500">
                            ФИО участника:
                          </label>
                          <input
                            type="text"
                            value={memberNames[member.id]}
                            onChange={(e) =>
                              setMemberNames({
                                ...memberNames,
                                [member.id]: e.target.value,
                              })
                            }
                            className="w-full text-xs font-bold px-2 py-1 border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Введите ФИО"
                          />
                        </div>
                      ) : (
                        <h4 className="text-sm font-bold text-slate-900">
                          {memberNames[member.id]}
                        </h4>
                      )}
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                        {member.roleTitle}
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2">
                      {member.summary}
                    </p>

                    {/* Files List */}
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                        <FileCode className="w-3 h-3 text-slate-500" />
                        <span>Файлы в проекте:</span>
                      </div>
                      <div className="space-y-1">
                        {member.files.map((file, idx) => (
                          <div
                            key={idx}
                            className="text-[11px] font-mono bg-slate-50 p-1.5 rounded-lg border border-slate-200 text-slate-700 leading-tight"
                          >
                            {file}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Responsibilities list */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
                    <div className="text-[10px] font-bold uppercase text-slate-400">
                      Что реализовал:
                    </div>
                    {member.responsibilities.map((resp, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>{resp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Note about TEAM.md */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>
                  Полная спецификация обязанностей также сохранена в файле{' '}
                  <code className="bg-slate-200 px-1 py-0.5 rounded font-mono font-bold text-slate-800">
                    /TEAM.md
                  </code>{' '}
                  для комиссии.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: VS Code Instructions */}
        {activeTab === 'vscode' && (
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
            {/* Quick terminal box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <Terminal className="w-4 h-4 text-slate-700" />
                  Команды для встроенного терминала VS Code:
                </span>
                <button
                  onClick={copyVSCodeCommands}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Скопировано!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Скопировать команды</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 bg-slate-950 text-emerald-400 rounded-2xl overflow-x-auto text-[11px] sm:text-xs font-mono leading-relaxed border border-slate-800">
                {vsCodeCommands}
              </pre>
            </div>

            {/* Step-by-step guide for VS Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h5 className="font-bold text-slate-900 text-xs">
                  Откройте папку проекта в VS Code:
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Запустите <strong>Visual Studio Code</strong>, нажмите в меню:{' '}
                  <code className="bg-slate-200 px-1 rounded">File</code> ➔{' '}
                  <code className="bg-slate-200 px-1 rounded">Open Folder...</code> и выберите папку проекта.
                  <br />
                  <em>Или в терминале:</em> <code className="bg-slate-200 px-1 rounded font-bold">code .</code>
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h5 className="font-bold text-slate-900 text-xs">
                  Откройте терминал в VS Code:
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Нажмите комбинацию клавиш:{' '}
                  <kbd className="bg-slate-200 px-1.5 py-0.5 rounded font-mono font-bold text-slate-800">
                    Ctrl + ~
                  </kbd>{' '}
                  (тильда / буква ё) или выберите в верхнем меню:{' '}
                  <code className="bg-slate-200 px-1 rounded">Terminal</code> ➔{' '}
                  <code className="bg-slate-200 px-1 rounded">New Terminal</code>.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <h5 className="font-bold text-slate-900 text-xs">
                  Установите библиотеки (npm install):
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  В терминале выполните команду:
                  <code className="block mt-1 p-2 bg-slate-900 text-white rounded-lg font-mono text-[11px]">
                    npm install
                  </code>
                  Это загрузит все необходимые зависимости (React, Vite, Express, TailwindCSS, Lucide).
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  4
                </div>
                <h5 className="font-bold text-slate-900 text-xs">
                  Запустите проект (npm run dev):
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed">
                  В терминале выполните:
                  <code className="block mt-1 p-2 bg-slate-900 text-white rounded-lg font-mono text-[11px]">
                    npm run dev
                  </code>
                  Сервер разработки поднимется на порту <strong>3000</strong>. Перейдите по адресу{' '}
                  <span className="text-blue-600 font-bold">http://localhost:3000</span>.
                </p>
              </div>
            </div>

            {/* Project files overview */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2 text-xs">
              <h5 className="font-bold text-blue-950 flex items-center gap-1.5">
                <FolderTree className="w-4 h-4 text-blue-600" />
                <span>Где что находится в проекте для редактирования в VS Code:</span>
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-700">
                <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                  <div className="font-bold text-emerald-700">/server.ts</div>
                  <div className="text-[11px] text-slate-500">Бэкенд сервер Express и API эндпоинты</div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                  <div className="font-bold text-blue-700">/src/components/</div>
                  <div className="text-[11px] text-slate-500">Компоненты интерфейса (Header, Catalog, Cart)</div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                  <div className="font-bold text-purple-700">/src/services/aiConsultant.ts</div>
                  <div className="text-[11px] text-slate-500">Логика расчетов ПУЭ и подбор оборудования</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 hidden sm:block">
            Команда из 3 человек: <strong>Backend</strong> • <strong>Frontend</strong> • <strong>AI Engineer</strong>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition ml-auto"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
