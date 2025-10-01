import React from "react";
import { Language } from "./types";

interface Props {
  language: Language;
  setLanguage: (l: Language) => void;
}

const Header: React.FC<Props> = ({ language, setLanguage }) => {
  return (
    <header className="p-4 flex items-center justify-between border-b border-slate-800">
      <h1 className="text-cyan-400 font-semibold">تغيير وتعديل الصور</h1>
      <div className="flex gap-2">
        <button
          onClick={() => setLanguage(Language.AR)}
          className={`px-3 py-1 rounded-md text-sm border ${
            language === Language.AR
              ? "bg-cyan-600 border-cyan-500 text-white"
              : "bg-slate-800 border-slate-700 text-slate-300"
          }`}
        >
          العربية
        </button>
        <button
          onClick={() => setLanguage(Language.EN)}
          className={`px-3 py-1 rounded-md text-sm border ${
            language === Language.EN
              ? "bg-cyan-600 border-cyan-500 text-white"
              : "bg-slate-800 border-slate-700 text-slate-300"
          }`}
        >
          English
        </button>
      </div>
    </header>
  );
};

export default Header;
