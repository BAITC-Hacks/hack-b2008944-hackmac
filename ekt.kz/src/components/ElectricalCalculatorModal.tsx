import React, { useState } from 'react';
import {
  X,
  Calculator,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sliders,
  ShieldAlert,
} from 'lucide-react';
import { CURRENT_RATINGS } from '../data/mockProducts';

interface ElectricalCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCurrentFilter: (currentRating: string) => void;
}

export const ElectricalCalculatorModal: React.FC<ElectricalCalculatorModalProps> = ({
  isOpen,
  onClose,
  onApplyCurrentFilter,
}) => {
  if (!isOpen) return null;

  const [phaseType, setPhaseType] = useState<'1' | '3'>('3'); // 1-phase or 3-phase
  const [powerKw, setPowerKw] = useState<number>(30); // Default 30 kW
  const [cosPhi, setCosPhi] = useState<number>(0.85); // 0.85 for motor, 0.95 for heaters
  const [cableLength, setCableLength] = useState<number>(25); // meters

  // Calculations
  // 1 Phase: I = (P * 1000) / (220 * cosPhi)
  // 3 Phase: I = (P * 1000) / (1.732 * 380 * cosPhi) = (P * 1000) / (658.18 * cosPhi)
  const voltage = phaseType === '1' ? 220 : 380;
  const currentAmps =
    phaseType === '1'
      ? (powerKw * 1000) / (220 * cosPhi)
      : (powerKw * 1000) / (Math.sqrt(3) * 380 * cosPhi);

  // Standard Breaker Ratings in Catalog: 16, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250
  const breakerRatingsNumbers = [16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250];

  // We choose breaker with 15-25% safety margin:
  const recommendedBreakerVal =
    breakerRatingsNumbers.find((r) => r >= currentAmps * 1.15) || 250;
  const recommendedBreakerStr = `${recommendedBreakerVal}А`;

  // Recommended copper cable cross section (mm²) according to PUE RK
  let recommendedCable = '3х2.5 мм²';
  if (phaseType === '1') {
    if (recommendedBreakerVal <= 16) recommendedCable = 'ВВГнг-LS 3х2.5 мм²';
    else if (recommendedBreakerVal <= 25) recommendedCable = 'ВВГнг-LS 3х4 мм²';
    else if (recommendedBreakerVal <= 32) recommendedCable = 'ВВГнг-LS 3х6 мм²';
    else if (recommendedBreakerVal <= 50) recommendedCable = 'ВВГнг-LS 3х10 мм²';
    else recommendedCable = 'ВВГнг-LS 3х16 мм²';
  } else {
    // 3 Phase (5 wires: 3L + N + PE)
    if (recommendedBreakerVal <= 16) recommendedCable = 'ВВГнг-LS 5х2.5 мм²';
    else if (recommendedBreakerVal <= 25) recommendedCable = 'ВВГнг-LS 5х4 мм²';
    else if (recommendedBreakerVal <= 32) recommendedCable = 'ВВГнг-LS 5х6 мм²';
    else if (recommendedBreakerVal <= 50) recommendedCable = 'ВВГнг-LS 5х10 мм²';
    else if (recommendedBreakerVal <= 63) recommendedCable = 'ВВГнг-LS 5х16 мм²';
    else if (recommendedBreakerVal <= 100) recommendedCable = 'ВВГнг-LS 5х25 мм²';
    else if (recommendedBreakerVal <= 125) recommendedCable = 'ВВГнг-LS 5х35 мм²';
    else if (recommendedBreakerVal <= 160) recommendedCable = 'ВВГнг-LS 5х70 мм² (или 4х70+35)';
    else recommendedCable = 'ВВГнг-LS 5х95 мм² или более';
  }

  const handleApplyFilter = () => {
    onApplyCurrentFilter(recommendedBreakerStr);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Инженерный электрокалькулятор</h3>
              <p className="text-[11px] text-slate-300">Расчет тока по мощности и нормам ПУЭ РК</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {/* Phase selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Тип питающей сети:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPhaseType('3')}
                className={`py-3 px-4 rounded-xl border text-left flex items-center justify-between transition ${
                  phaseType === '3'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold shadow-sm'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="text-sm font-bold">3 Фазы (380 В)</div>
                  <div className="text-[11px] text-slate-500 font-normal">
                    Производство, цеха, мощные насосы, ВРУ
                  </div>
                </div>
                {phaseType === '3' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
              </button>

              <button
                type="button"
                onClick={() => setPhaseType('1')}
                className={`py-3 px-4 rounded-xl border text-left flex items-center justify-between transition ${
                  phaseType === '1'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-bold shadow-sm'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="text-sm font-bold">1 Фаза (220 В)</div>
                  <div className="text-[11px] text-slate-500 font-normal">
                    Квартиры, частные дома, розеточные группы
                  </div>
                </div>
                {phaseType === '1' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
              </button>
            </div>
          </div>

          {/* Power Input with Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Мощность нагрузки (кВт):
              </label>
              <div className="flex items-center gap-1 font-mono font-bold text-blue-600 text-lg">
                <input
                  type="number"
                  min="0.5"
                  max="200"
                  step="0.5"
                  value={powerKw}
                  onChange={(e) => setPowerKw(Math.max(0.1, parseFloat(e.target.value) || 0))}
                  className="w-20 px-2 py-0.5 border border-slate-300 rounded-lg text-right font-bold text-slate-900"
                />
                <span>кВт</span>
              </div>
            </div>

            <input
              type="range"
              min="1"
              max="120"
              step="1"
              value={powerKw}
              onChange={(e) => setPowerKw(parseFloat(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>1 кВт</span>
              <span>15 кВт</span>
              <span>30 кВт</span>
              <span>60 кВт</span>
              <span>90 кВт</span>
              <span>120 кВт</span>
            </div>
          </div>

          {/* Cos Phi & Equipment type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Коэффициент мощности (cos φ):
              </label>
              <select
                value={cosPhi}
                onChange={(e) => setCosPhi(parseFloat(e.target.value))}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
              >
                <option value={0.85}>0.85 (Электродвигатели, станки, насосы)</option>
                <option value={0.95}>0.95 (Обогреватели, ТЭНы, освещение)</option>
                <option value={0.75}>0.75 (Трансформаторы, индуктивная нагрузка)</option>
                <option value={1.0}>1.00 (Идеальная активная нагрузка)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Длина кабельной линии (м):
              </label>
              <input
                type="number"
                min="1"
                max="300"
                value={cableLength}
                onChange={(e) => setCableLength(parseInt(e.target.value) || 1)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
              />
            </div>
          </div>

          {/* Results Box */}
          <div className="p-4 bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-2xl border border-blue-800 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-blue-800/80 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                Результат инженерного расчета:
              </span>
              <span className="text-[11px] font-mono bg-blue-800/60 px-2 py-0.5 rounded text-blue-200">
                U = {voltage} В
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-xs">
                <div className="text-[10px] text-blue-200">Расчетный ток (I):</div>
                <div className="text-xl font-black font-mono text-amber-300">
                  {currentAmps.toFixed(1)} А
                </div>
              </div>

              <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-xs border border-amber-400/30">
                <div className="text-[10px] text-amber-300 font-bold">Номинал автомата:</div>
                <div className="text-xl font-black font-mono text-white">
                  {recommendedBreakerStr}
                </div>
              </div>

              <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-xs">
                <div className="text-[10px] text-blue-200">Сечение кабеля:</div>
                <div className="text-xs font-bold font-mono text-emerald-300 truncate pt-1">
                  {recommendedCable}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-300 leading-snug flex items-start gap-1.5 pt-1">
              <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                Формула: {phaseType === '1' ? 'I = P / (220 × cos φ)' : 'I = P / (√3 × 380 × cos φ)'}.
                Рекомендован запас по пусковому току 15-20%.
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Отмена
          </button>

          <button
            onClick={handleApplyFilter}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/25 transition flex items-center gap-1.5"
          >
            <span>Показать автоматы на {recommendedBreakerStr} в каталоге</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
