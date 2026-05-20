import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  HiOutlineCalendar, 
  HiOutlineChevronDown,
  HiOutlineCheck
} from 'react-icons/hi2';
import { dateRangePresets, type DateRange, type DateRangeOption } from '../../hooks/useDateRange';

interface DateRangePickerProps {
  dateRange: DateRange;
  selectedPreset: string;
  onPresetChange: (preset: string) => void;
  onCustomDateChange: (start: string | null, end: string | null) => void;
}

export function DateRangePicker({
  dateRange,
  selectedPreset,
  onPresetChange,
  onCustomDateChange
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStart, setTempStart] = useState(dateRange.startDate || '');
  const [tempEnd, setTempEnd] = useState(dateRange.endDate || '');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    setTempStart(dateRange.startDate || '');
    setTempEnd(dateRange.endDate || '');
  }, [dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.right - 288
      });
    }
  }, [isOpen]);

  const handlePresetClick = (preset: DateRangeOption) => {
    onPresetChange(preset.value);
    setIsOpen(false);
  };

  const handleCustomApply = () => {
    onCustomDateChange(tempStart || null, tempEnd || null);
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (selectedPreset === 'custom') {
      if (dateRange.startDate && dateRange.endDate) {
        const start = new Date(dateRange.startDate).toLocaleDateString('pt-BR');
        const end = new Date(dateRange.endDate).toLocaleDateString('pt-BR');
        return `${start} - ${end}`;
      }
      if (dateRange.startDate) return `De ${new Date(dateRange.startDate).toLocaleDateString('pt-BR')}`;
      if (dateRange.endDate) return `Até ${new Date(dateRange.endDate).toLocaleDateString('pt-BR')}`;
      return 'Personalizado';
    }
    const preset = dateRangePresets.find(p => p.value === selectedPreset);
    return preset?.label || 'Selecionar';
  };

  const dropdown = isOpen && (
    <>
      <div className="fixed inset-0 z-[90]" onClick={() => setIsOpen(false)} />
      <div 
        className="fixed w-72 bg-white rounded-2xl shadow-xl border border-slate-200 z-[100] overflow-hidden"
        style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
      >
        <div className="p-3 border-b border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Período
          </p>
          <div className="flex flex-wrap gap-2">
            {dateRangePresets.slice(0, -1).map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePresetClick(preset)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  selectedPreset === preset.value
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-b border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Período Personalizado
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Data inicial</label>
              <input
                type="date"
                value={tempStart}
                onChange={(e) => setTempStart(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Data final</label>
              <input
                type="date"
                value={tempEnd}
                onChange={(e) => setTempEnd(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-300"
              />
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-50 flex justify-end">
          <button
            onClick={handleCustomApply}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
          >
            <HiOutlineCheck className="w-4 h-4" />
            Aplicar
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-slate-300 hover:shadow-sm transition-all duration-200"
        aria-label={`Selecionar período de data. Currently: ${getDisplayText()}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <HiOutlineCalendar className="w-5 h-5 text-slate-500" aria-hidden="true" />
        <span>{getDisplayText()}</span>
        <HiOutlineChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      {typeof document !== 'undefined' && createPortal(dropdown, document.body)}
    </div>
  );
}