import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import ImageResizer from "./components/ImageResizer";

// اللغات
enum Language {
  AR = "ar",
  EN = "en",
}

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>(Language.AR);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === Language.AR ? "rtl" : "ltr";
  }, [language]);

  // البيانات المشتركة بين المكونات
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [modifiedImage, setModifiedImage] = useState<string | null>(null);
  const [width, setWidth] = useState<number>(800);
  const [height, setHeight] = useState<number>(600);

  return (
    <div className="bg-slate-900 min-h-screen text-slate-200 font-sans">
      {/* الهيدر */}
      <Header language={language} setLanguage={setLanguage} />

      {/* منطقة المحتوى */}
      <main className="container mx-auto px-4 py-6">
        <ImageResizer
          language={language}
          originalImage={originalImage}
          setOriginalImage={setOriginalImage}
          modifiedImage={modifiedImage}
          setModifiedImage={setModifiedImage}
          width={width}
          setWidth={setWidth}
          height={height}
          setHeight={setHeight}
        />
      </main>

      {/* الفوتر */}
      <footer className="fixed bottom-2 left-2 text-xs text-slate-400 opacity-30 pointer-events-none">
        By Majed Almalki
      </footer>
    </div>
  );
};

export default App;
