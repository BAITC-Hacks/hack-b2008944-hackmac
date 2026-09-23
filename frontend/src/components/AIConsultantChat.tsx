import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  Zap,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  ShoppingCart,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Minimize2,
  Paperclip,
  Calculator,
  Building2,
} from 'lucide-react';
import { Product, ChatMessage, CityInfo } from '../types';
import { sendChatMessage, formatKZT } from '../services/api';
import { ALL_PRODUCTS } from '../data/mockProducts';

interface AIConsultantChatProps {
  isOpen: boolean;
  onClose: () => void;
  currentCity: CityInfo;
  onAddToCart: (product: Product) => void;
  onOpenProductDetail: (product: Product) => void;
  initialPrompt?: string;
  onOpenCalculator: () => void;
}

export const AIConsultantChat: React.FC<AIConsultantChatProps> = ({
  isOpen,
  onClose,
  currentCity,
  onAddToCart,
  onOpenProductDetail,
  initialPrompt,
  onOpenCalculator,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Здравствуйте! Я — **ИИ-инженер консультант EKT.KZ**. 

Я помогаю быстро и без ожидания менеджера:
• ⚡ **Подобрать автоматические выключатели** по мощности (кВт) и току (Legrand DRX125/DRX250);
• 🛡️ **Подобрать реле контроля напряжения** Schneider Electric и защиту насосов (RM35BA10);
• 🔌 **Выбрать УЗО и диф. автоматы** для розеточных групп квартиры или цеха;
• 📦 **Проверить точное наличие на складе в ${currentCity.name}** (ул. Бейсекбаева 24/1).

Опишите вашу задачу или выберите готовый сценарий ниже:`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedProductIds: [515291, 35604, 25397],
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Quick preset queries
  const quickQueries = [
    '⚡ Автомат 160А для ВРУ в Астанае',
    '🛡️ Реле контроля сухого хода насоса',
    '🧮 Расчет: 30 кВт нагрузки на 380В',
    '🔌 Диф автомат 16А 30мА Legrand',
    '📦 Остатки товаров на складе в Астане',
  ];

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Handle initial prompt passed from outside
  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  // Speech Recognition setup (Voice input)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Ваш браузер не поддерживает распознавание речи. Используйте текстовый ввод.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ru-RU';
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSend(transcript);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  // Text to Speech
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    // Clean markdown symbols
    const clean = text.replace(/[*#_`]/g, '').replace(/\[.*?\]/g, '');
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'ru-RU';
    utterance.rate = 1.05;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (textToSend?: string) => {
    const promptText = (textToSend || input).trim();
    if (!promptText || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.slice(-4).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await sendChatMessage(promptText, historyPayload);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedProductIds: res.suggestedProductIds,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (speechEnabled) {
        speakText(res.reply);
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome_reset',
        role: 'assistant',
        content: `Диалог очищен. Задайте любой технический вопрос по каталогу электротехники EKT!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ${
        isExpanded
          ? 'inset-3 sm:inset-6 flex'
          : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[94vw] sm:w-[480px] h-[640px] max-h-[85vh] flex'
      }`}
    >
      <div className="w-full h-full bg-white rounded-3xl shadow-2xl border border-slate-300/80 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200">
        {/* Header */}
        <div className="px-4 sm:px-5 py-3.5 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-amber-500 flex items-center justify-center text-white shadow-md">
                <Bot className="w-5 h-5 text-amber-300" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900"></span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-extrabold text-white">ЭКТ Инженер-Консультант</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  AI 24/7
                </span>
              </div>
              <div className="text-[11px] text-slate-300 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-emerald-400" />
                <span>База склада: {currentCity.name}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Speech toggle */}
            <button
              onClick={() => {
                setSpeechEnabled(!speechEnabled);
                if (isSpeaking) window.speechSynthesis.cancel();
              }}
              title={speechEnabled ? 'Отключить голосовой ответ' : 'Включить озвучку ответов'}
              className={`p-1.5 rounded-lg transition ${
                speechEnabled
                  ? 'text-amber-300 bg-amber-400/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Clear conversation */}
            <button
              onClick={clearChat}
              title="Очистить историю"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Expand / Minimize */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Уменьшить окно' : 'Развернуть во весь экран'}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition hidden sm:inline-block"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Scroll Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/70 text-xs sm:text-sm">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            // Find recommended products from catalog
            const recommendedProducts = m.suggestedProductIds
              ? m.suggestedProductIds
                  .map((id) => ALL_PRODUCTS.find((p) => p.id === id))
                  .filter((p): p is Product => p !== undefined)
              : [];

            return (
              <div
                key={m.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2`}
              >
                <div
                  className={`flex gap-2 max-w-[92%] sm:max-w-[85%] ${
                    isUser ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                      <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                    </div>
                  )}

                  <div
                    className={`p-3.5 rounded-2xl leading-relaxed ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-sm shadow-md shadow-blue-500/10'
                        : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-sm shadow-sm'
                    }`}
                  >
                    {/* Message content with markdown-like bold and bullet styling */}
                    <div className="whitespace-pre-line space-y-1.5 font-normal">
                      {m.content.split('\n').map((line, idx) => {
                        // Highlight headers and bullets
                        if (line.startsWith('•') || line.startsWith('-')) {
                          return (
                            <div key={idx} className="flex items-start gap-1.5 pl-1 text-[13px]">
                              <span className="text-blue-500 font-bold">•</span>
                              <span>{line.replace(/^[•-]\s*/, '')}</span>
                            </div>
                          );
                        }
                        return (
                          <p key={idx} className="text-[13px]">
                            {line}
                          </p>
                        );
                      })}
                    </div>

                    <div
                      className={`text-[10px] mt-1.5 text-right font-mono ${
                        isUser ? 'text-blue-200' : 'text-slate-400'
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>
                </div>

                {/* Inline Product Recommendation Cards inside AI Response */}
                {!isUser && recommendedProducts.length > 0 && (
                  <div className="w-full max-w-[96%] pl-9 space-y-2 pt-1">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Рекомендованное оборудование EKT ({recommendedProducts.length}):</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {recommendedProducts.map((prod) => {
                        const cityStore = prod.stores?.find(
                          (s) => s.name === currentCity.storeName
                        );
                        const qtyInCity =
                          cityStore !== undefined ? cityStore.quantity : (prod.quantity || 0);

                        return (
                          <div
                            key={prod.id}
                            className="p-3 bg-white rounded-xl border border-blue-200/80 shadow-sm hover:border-blue-400 transition flex flex-col justify-between space-y-2"
                          >
                            <div className="flex gap-2.5">
                              <div className="w-12 h-12 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center p-1 flex-shrink-0">
                                {prod.image ? (
                                  <img
                                    src={prod.image}
                                    alt={prod.name}
                                    className="max-h-full max-w-full object-contain"
                                  />
                                ) : (
                                  <Zap className="w-5 h-5 text-blue-500" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-mono text-slate-400 truncate">
                                  Арт: {prod.article}
                                </div>
                                <h4
                                  onClick={() => onOpenProductDetail(prod)}
                                  className="text-xs font-bold text-slate-900 truncate hover:text-blue-600 cursor-pointer"
                                  title={prod.name}
                                >
                                  {prod.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs font-extrabold text-blue-700">
                                    {formatKZT(prod.price)}
                                  </span>
                                  {qtyInCity > 0 && (
                                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded">
                                      {qtyInCity} шт. в {currentCity.name}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                              <button
                                onClick={() => onOpenProductDetail(prod)}
                                className="text-[11px] text-slate-600 hover:text-blue-600 font-medium"
                              >
                                Характеристики
                              </button>
                              <button
                                onClick={() => onAddToCart(prod)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-[11px] font-bold rounded-lg shadow-sm transition"
                              >
                                <ShoppingCart className="w-3 h-3" />
                                <span>В корзину</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-center gap-2.5 text-xs text-slate-500">
              <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
                <Bot className="w-4 h-4 text-amber-300" />
              </div>
              <div className="bg-white p-3 rounded-2xl rounded-tl-sm border border-slate-200 flex items-center gap-2 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></span>
                <span
                  className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></span>
                <span
                  className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                ></span>
                <span className="text-[11px] font-medium text-slate-500 ml-1">
                  ЭКТ Инженер рассчитывает характеристики...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Query Pills bar */}
        <div className="px-3 py-2 bg-slate-100/90 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-shrink-0">
          <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap pl-1">
            Подсказки:
          </span>
          {quickQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[11px] font-medium whitespace-nowrap px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-full border border-slate-250 shadow-2xs transition hover:scale-102"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            {/* Engineer calculator quick launcher */}
            <button
              onClick={onOpenCalculator}
              title="Открыть калькулятор мощности"
              className="p-2.5 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl border border-amber-200 transition flex-shrink-0"
            >
              <Calculator className="w-4 h-4" />
            </button>

            {/* Voice input button */}
            <button
              onClick={toggleSpeechRecognition}
              title={isListening ? 'Идет запись речи...' : 'Голосовой ввод вопроса'}
              className={`p-2.5 rounded-xl border transition flex-shrink-0 ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse border-rose-600'
                  : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50 border-slate-250'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Text input */}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Спросите: 'Нужен автомат на 160А' или 'Как защитить насос?'..."
              disabled={loading}
              className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-slate-100/80 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 transition"
            />

            {/* Send button */}
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl shadow-md shadow-blue-500/20 active:scale-95 transition flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
