import React from 'react';

export const ProgressBar = ({ current, max, color, label, reverse = false }: { current: number, max: number, color: string, label: string, reverse?: boolean }) => {
  const percent = Math.max(0, Math.min(100, (current / max) * 100));
  return (
    <div className="w-full relative h-6 bg-gray-900 rounded-full border-2 border-gray-700 overflow-hidden shadow-lg">
      <div 
        className={`h-full transition-all duration-500 ease-out ${color} ${reverse ? 'float-right' : ''}`} 
        style={{ width: `${percent}%` }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white shadow-black drop-shadow-md tracking-wider select-none z-10">
        {label}: {Math.ceil(current)}/{max}
      </div>
    </div>
  );
};

export const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-amber-50 border-b-8 border-r-4 border-amber-800 rounded-xl shadow-xl overflow-hidden ${className}`}>
    {children}
  </div>
);

export const Button = ({ onClick, children, variant = "primary", className = "", disabled = false }: { onClick?: () => void, children: React.ReactNode, variant?: 'primary'|'danger'|'success'|'secondary'|'info', className?: string, disabled?: boolean }) => {
  const baseStyle = "transform active:scale-95 transition-transform font-bold py-3 px-6 rounded-xl border-b-4 uppercase tracking-wider text-sm md:text-base select-none touch-manipulation flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-yellow-400 hover:bg-yellow-300 text-yellow-900 border-yellow-700",
    danger: "bg-red-500 hover:bg-red-400 text-white border-red-800",
    success: "bg-green-500 hover:bg-green-400 text-white border-green-800",
    secondary: "bg-gray-200 hover:bg-gray-100 text-gray-700 border-gray-400",
    info: "bg-sky-400 hover:bg-sky-300 text-white border-sky-700"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

export const PlayerAvatar = ({ avatar, size = "md", className = "" }: { avatar: string, size?: 'sm'|'md'|'lg', className?: string }) => {
    const sizeClasses = {
        sm: "w-10 h-10 text-xl",
        md: "w-20 h-20 text-4xl",
        lg: "w-32 h-32 text-6xl"
    };
    return (
        <div className={`${sizeClasses[size]} bg-white border-2 border-gray-300 rounded-full flex items-center justify-center shadow-sm ${className}`}>
            {avatar}
        </div>
    );
};
