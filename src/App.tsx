import React, { useState, useEffect } from "react";
import { Language } from "./types";
import Header from "./Header";
import ImageResizer from "./ImageResizer";

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>(Language.AR);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === Language.AR ? "rtl" : "ltr";
  }, [language]);

  return (
    <div className="bg-slate-900 min-h-screen text-slate-200 font-sans">
      <Header language={language} setLanguage={setLanguage} />
      <main>
        <ImageResizer language={language} />
      </main>
      <footer className="fixed bottom-2 left-2 text-xs text-slate-400 opacity-30 pointer-events-none">
        By Majed Almalki
      </footer>
    </div>
  );
};

export default App;
