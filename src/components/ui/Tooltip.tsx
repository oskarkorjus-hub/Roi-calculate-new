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
        className="w-5 h-5 rounded-full bg-zinc-700 hover:bg-zinc-600 text-zinc-400 hover:text-zinc-300 text-xs font-bold flex items-center justify-center transition-colors cursor-help flex-shrink-0"
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
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-zinc-700 text-zinc-100 text-xs rounded-lg shadow-lg whitespace-normal w-56 z-50 animate-in fade-in duration-150 normal-case tracking-normal font-normal leading-relaxed border border-zinc-600">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-700" />
        </div>
      )}
    </div>
  );
}
