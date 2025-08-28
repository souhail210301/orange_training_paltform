import React, { useState, useEffect } from 'react';
import { phoneCountries, findCountry } from '../../utils/phoneCountries';

const PhoneInput = ({ value, onChange, defaultCountry = 'TN', disabled = false, inputClassName = '' }) => {
  const detectCountryFromValue = () => {
    if (!value || value[0] !== '+') return defaultCountry;
    const digits = value.replace(/[^0-9+]/g, '');
    // Try match dial codes (longest first)
    const sorted = [...phoneCountries].sort((a,b)=>b.dialCode.length - a.dialCode.length);
    for (const c of sorted) {
      if (digits.startsWith('+' + c.dialCode)) return c.code;
    }
    return defaultCountry;
  };

  const initialCountry = detectCountryFromValue();
  const [country, setCountry] = useState(initialCountry);
  const [showList, setShowList] = useState(false);
  const [localNumber, setLocalNumber] = useState(() => {
    if (!value) return '';
    const c = findCountry(initialCountry);
    if (!c) return value.replace(/[^0-9]/g,'');
    return value.replace(/^\+?"?/, '').replace(new RegExp('^' + c.dialCode), '').replace(/[^0-9]/g,'');
  });
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest || !e.target.closest('.phone-country-select')) setShowList(false);
    };
    if (showList) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showList]);

  useEffect(() => {
    const c = findCountry(country);
    if (c && onChange) {
      const full = '+' + c.dialCode + localNumber;
      onChange(full);
    }
  }, [country, localNumber, onChange]);

  const countriesFiltered = filter
    ? phoneCountries.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()) || c.dialCode.startsWith(filter) || c.code.toLowerCase().includes(filter.toLowerCase()))
    : phoneCountries;

  const current = findCountry(country);

  return (
    <div className="flex gap-2 phone-country-select relative w-full">
      <button type="button" disabled={disabled} onClick={() => setShowList(s=>!s)} className="flex items-center gap-1 px-3 py-2 border rounded bg-white hover:bg-gray-50 disabled:opacity-60">
        {current && <img src={`/Flags/${current.code}.png`} alt={current.code} className="w-5 h-5 rounded" />}
        <span className="text-sm">+{current?.dialCode}</span>
        <svg className="w-3 h-3" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <input
        disabled={disabled}
        className={`flex-1 px-4 py-2 border rounded bg-gray-50 ${inputClassName}`}
        value={localNumber}
        onChange={e => setLocalNumber(e.target.value.replace(/[^0-9]/g,''))}
        maxLength={15}
        placeholder="123456789"
      />
      {showList && (
        <div className="absolute top-full left-0 mt-1 w-72 max-h-72 overflow-y-auto bg-white border rounded shadow text-sm z-20">
          <div className="p-2 border-b">
            <input
              autoFocus
              className="w-full px-2 py-1 border rounded text-sm"
              placeholder="Recherche (nom / code)"
              value={filter}
              onChange={e=>setFilter(e.target.value)}
            />
          </div>
          <div>
            {countriesFiltered.map(c => (
              <button key={c.code} type="button" onClick={() => { setCountry(c.code); setShowList(false); setFilter(''); }} className="flex w-full items-center gap-2 px-3 py-2 hover:bg-gray-100 text-left">
                <img src={`/Flags/${c.code}.png`} alt={c.code} className="w-5 h-5 rounded" />
                <span className="flex-1 truncate">{c.name}</span>
                <span className="text-gray-500">+{c.dialCode}</span>
              </button>
            ))}
            {!countriesFiltered.length && <div className="px-3 py-2 text-gray-500">Aucun résultat</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneInput;