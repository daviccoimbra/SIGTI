import { useState, useCallback, useMemo } from 'react';

export interface DateRange {
  startDate: string | null;
  endDate: string | null;
}

export interface DateRangeOption {
  label: string;
  value: string;
  getDates: () => DateRange;
}

export const dateRangePresets: DateRangeOption[] = [
  {
    label: 'Hoje',
    value: 'today',
    getDates: () => {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      return { startDate: dateStr, endDate: dateStr };
    }
  },
  {
    label: 'Ontem',
    value: 'yesterday',
    getDates: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split('T')[0];
      return { startDate: dateStr, endDate: dateStr };
    }
  },
  {
    label: 'Últimos 7 dias',
    value: '7days',
    getDates: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
      };
    }
  },
  {
    label: 'Últimos 30 dias',
    value: '30days',
    getDates: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
      };
    }
  },
  {
    label: 'Este mês',
    value: 'thisMonth',
    getDates: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0]
      };
    }
  },
  {
    label: 'Mês passado',
    value: 'lastMonth',
    getDates: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0]
      };
    }
  },
  {
    label: 'Personalizado',
    value: 'custom',
    getDates: () => ({ startDate: null, endDate: null })
  }
];

export function useDateRange(initialPreset: string = '30days') {
  const [selectedPreset, setSelectedPreset] = useState(initialPreset);
  const [customRange, setCustomRange] = useState<DateRange>({ startDate: null, endDate: null });

  const dateRange = useMemo((): DateRange => {
    if (selectedPreset === 'custom') {
      return customRange;
    }
    const preset = dateRangePresets.find(p => p.value === selectedPreset);
    return preset ? preset.getDates() : { startDate: null, endDate: null };
  }, [selectedPreset, customRange]);

  const setPreset = useCallback((preset: string) => {
    setSelectedPreset(preset);
    if (preset !== 'custom') {
      setCustomRange({ startDate: null, endDate: null });
    }
  }, []);

  const setCustomDates = useCallback((start: string | null, end: string | null) => {
    setCustomRange({ startDate: start, endDate: end });
    setSelectedPreset('custom');
  }, []);

  const clearRange = useCallback(() => {
    setSelectedPreset('30days');
    setCustomRange({ startDate: null, endDate: null });
  }, []);

  const queryParams = useMemo((): Record<string, string> => {
    const params: Record<string, string> = {};
    if (dateRange.startDate) {
      params.startDate = dateRange.startDate;
    }
    if (dateRange.endDate) {
      params.endDate = dateRange.endDate;
    }
    return params;
  }, [dateRange]);

  return {
    dateRange,
    selectedPreset,
    setPreset,
    setCustomDates,
    clearRange,
    queryParams,
    isCustom: selectedPreset === 'custom'
  };
}