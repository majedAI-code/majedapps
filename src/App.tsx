import React, { useState, useEffect } from 'react';
import { Language } from './types';
import Header from './components/Header';
import ImageResizer from './components/ImageResizer';
import CodeBlock from './components/CodeBlock'; // 💡 استيراد جديد
import { translations } from './constants'; // 💡 استيراد جديد

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>(Language.AR);
  const t = translations[language]; // 💡 تعريف متغير للترجمات

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === Language.AR ? 'rtl' : 'ltr';
  }, [language]);

  return (
    <div className="bg-slate-900 min-h-screen text-slate-200 font-sans">
      <Header language={language} setLanguage={setLanguage} />
      <main className="pb-20"> {/* 💡 تم التعديل لإضافة مسافة سفلية */}
        <ImageResizer language={language} />
        
        {/* 💡 استخدام مكون CodeBlock هنا لعرض معلومات التطبيق */}
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <CodeBlock 
                code={`# ${t.title}\n# ${t.description}\n\n# Features:\n# - Image Resizing\n# - Remove Background (via Gemini API)\n# - Enhance Quality (via Gemini API)`}
                copyText={language === Language.EN ? "Copy Info" : "نسخ المعلومات"}
                copiedText={language === Language.EN ? "Copied!" : "تم النسخ!"}
            />
        </div>

      </main>
      <footer className="fixed bottom-2 left-2 text-xs text-slate-400 opacity-30 pointer-events-none">
        By Majed almalki
      </footer>
    </div>
  );
};

export default App;