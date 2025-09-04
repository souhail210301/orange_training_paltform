import React, { useState, useMemo } from 'react';

/**
 * CalendarMain
 * Implements the provided design spec (312x333) with:
 * - Month navigation
 * - Monday week start
 * - Range selection (start = solid orange, in-range = light orange)
 * - Days outside current month shown in gray (#A1A1AA)
 * Colors per spec:
 *  #F16E00  -> selected day (start/end)
 *  #FFBC80  -> days inside selected range (between start & end)
 *  #A1A1AA  -> disabled / out-of-month text
 *  #050505  -> default text
 * The component is self‑contained; parent can receive range via onChange.
 */
const CalendarMain = ({
  initialMonth = new Date(),
  value,                // { start: Date|null, end: Date|null }
  onChange,             // function(range)
  className = ''
}) => {
  const [month, setMonth] = useState(new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1));

  const range = value || { start: null, end: null };

  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const monthDays = endOfMonth.getDate();
  const startWeekday = (startOfMonth.getDay() + 6) % 7; // Monday = 0

  // Build a 6 week grid (42 cells) for stability
  const days = useMemo(() => {
    const arr = [];
    // days from previous month to fill first week
    for (let i = 0; i < startWeekday; i++) {
      const d = new Date(startOfMonth);
      d.setDate(d.getDate() - (startWeekday - i));
      arr.push({ date: d, out: true });
    }
    // current month
    for (let d = 1; d <= monthDays; d++) {
      arr.push({ date: new Date(month.getFullYear(), month.getMonth(), d), out: false });
    }
    // fill remaining cells to reach multiple of 7 (up to 42)
    let nextDay = 1;
    while (arr.length % 7 !== 0 || arr.length < 42) {
      arr.push({ date: new Date(month.getFullYear(), month.getMonth() + 1, nextDay++), out: true });
    }
    return arr;
  }, [month, monthDays, startWeekday]);

  const isSameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const inRange = (d) => {
    if (!range.start) return false;
    if (range.start && !range.end) return isSameDay(d, range.start);
    return d >= range.start && d <= range.end;
  };
  const isStart = (d) => range.start && isSameDay(d, range.start);
  const isEnd = (d) => range.end && isSameDay(d, range.end);

  const handleSelect = (day) => {
    if (!onChange) return;
    if (!range.start || (range.start && range.end)) {
      onChange({ start: day, end: null });
    } else if (range.start && !range.end) {
      if (day < range.start) {
        onChange({ start: day, end: range.start });
      } else if (isSameDay(day, range.start)) {
        onChange({ start: day, end: null });
      } else {
        onChange({ start: range.start, end: day });
      }
    }
  };

  const monthLabel = month.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const weekDays = ['lu','ma','me','je','ve','sa','di'];

  return (
    <div className={`relative w-[312px] h-[333px] bg-white border border-[#E4E4E7] rounded-lg p-4 flex flex-col ${className}`}> {/* outer container */}
      {/* Header */}
      <div className="flex items-center justify-between mb-2 h-8" style={{ gap: '38.45px' }}>
        <button aria-label="Mois précédent" onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth()-1, 1))} className="relative w-8 h-8 flex items-center justify-center rounded-full border-0 focus:outline-none">
          <span className="block w-2 h-2 border-t-2 border-l-2 border-[#71717A] rotate-[-45deg]"></span>
        </button>
        <div className="text-[16px] font-medium capitalize text-[#050505] w-[94px] text-center select-none">{monthLabel}</div>
        <button aria-label="Mois suivant" onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth()+1, 1))} className="relative w-8 h-8 flex items-center justify-center rounded-full border-0 focus:outline-none">
          <span className="block w-2 h-2 border-t-2 border-r-2 border-[#71717A] rotate-[45deg]"></span>
        </button>
      </div>
      <div className="w-full border-t border-[#71717A] opacity-20 mb-3" />
      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-[14px] mb-2" style={{height:'28px'}}>
        {weekDays.map((d,i)=>(
          <div key={d} className="flex items-center justify-center w-[28px] h-[28px] text-[16px] font-medium capitalize" style={{color: i===1? '#F16E00':'#050505'}}>{d}</div>
        ))}
      </div>
      {/* Days grid */}
      <div className="flex-1 flex flex-col gap-2 overflow-hidden" style={{height:'208px'}}>
        {Array.from({length: days.length/7}).map((_,rowIdx)=>{
          const row = days.slice(rowIdx*7, rowIdx*7+7);
          return (
            <div key={rowIdx} className="flex flex-row items-center gap-[14px]" style={{height:'28px'}}>
              {row.map((cell, i)=>{
                const d = cell.date;
                const selected = isStart(d) || isEnd(d);
                const inside = inRange(d) && !selected;
                const baseClasses = 'flex items-center justify-center w-[28px] h-[28px] rounded-full text-[12px] font-normal cursor-pointer transition-colors';
                let style = {};
                let textColor = '#050505';
                if (cell.out) textColor = '#A1A1AA';
                if (inside) {
                  style = { background: '#FFBC80' };
                }
                if (selected) {
                  style = { background: '#F16E00', color: '#FFFFFF' };
                  textColor = '#FFFFFF';
                } else if (!inside && cell.out) {
                  textColor = '#A1A1AA';
                }
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={()=> handleSelect(d)}
                    className={baseClasses}
                    style={{...style, color: textColor}}
                    title={d.toLocaleDateString('fr-FR')}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarMain;
