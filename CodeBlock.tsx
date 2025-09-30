
import React, { useState } from 'react';

interface CodeBlockProps {
  code: string;
  copyText: string;
  copiedText: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, copyText, copiedText }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="relative bg-slate-950 rounded-lg overflow-hidden border border-slate-700">
      <button
        onClick={handleCopy}
        className={`absolute top-2 right-2 rtl:right-auto rtl:left-2 px-3 py-1 text-sm rounded-md transition-colors ${
          isCopied
            ? 'bg-green-600 text-white'
            : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
        }`}
      >
        {isCopied ? copiedText : copyText}
      </button>
      <pre className="p-4 pt-12 text-sm text-slate-300 overflow-x-auto">
        <code className="language-python">{code}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
