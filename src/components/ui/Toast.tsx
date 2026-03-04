import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  }[type];

  const icon = {
    success: 'check_circle',
    error: 'error',
    info: 'info'
  }[type];

  return (
    <div
      className={`fixed top-20 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${bgColor} ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
      }`}
    >
      <span className="material-symbols-outlined text-white">{icon}</span>
      <span className="text-white font-medium">{message}</span>
    </div>
  );
}
