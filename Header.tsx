
import React from 'react';
import { Language } from '../types';
import { translations } from '../constants';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const Header: React.FC<HeaderProps> = ({ language, setLanguage }) => {
  const t = translations[language];

  return (
    <header className="bg-slate-800/50 backdrop-blur-sm p-4 border-b border-slate-700 flex justify-between items-center sticky top-0 z-10">
      <h1 className="text-xl md:text-2xl font-bold text-cyan-400">{t.title}</h1>
      <div className="relative">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="bg-slate-700 text-slate-200 border border-slate-600 rounded-md py-2 px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
          aria-label={t.language}
        >
          <option value={Language.EN}>{t.english}</option>
          <option value={Language.AR}>{t.arabic}</option>
        </select>
      </div>
    </header>
  );
};

export default Header;
