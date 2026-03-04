import { useState } from 'react';

interface Props {
  text: string;
  children?: React.ReactNode;
}

export function Tooltip({ text }: Props) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        className="w-5 h-5 rounded-full bg-slate-300 hover:bg-slate-400 text-slate-600 hover:text-slate-700 text-xs font-bold flex items-center justify-center transition-colors cursor-help flex-shrink-0"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={(e) => {
          e.preventDefault();
          setShow(!show);
        }}
        title={text}
      >
        ?
      </button>
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg shadow-lg whitespace-normal w-56 z-50 animate-in fade-in duration-150 normal-case tracking-normal font-normal leading-relaxed">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
}
