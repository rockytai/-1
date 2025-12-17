import React from 'react';

export interface ProgressBarProps {
  current: number;
  max: number;
  color: string;
  label: string;
  reverse?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, max, color, label, reverse = false }) => {
  const percent = Math.max(0, Math.min(100, (current / max) * 100));
  return (
    <div className="w-full relative h-8 bg-gray-900 border-2 border-gray-600 shadow-md overflow-hidden rounded-md">
      {/* Glossy Effect */}
      <div className="absolute inset-0 z-20 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>
      
      <div 
        className={`h-full transition-all duration-300 ease-linear ${color} ${reverse ? 'float-right' : ''} shadow-[inset_0_-2px_4px_rgba(0,0,0,0.3)]`} 
        style={{ width: `${percent}%` }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-sm font-black text-white text-stroke drop-shadow-md uppercase z-10">
        {label}: {Math.ceil(current)}/{max}
      </div>
    </div>
  );
};

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`coc-panel border-4 border-gray-500 rounded-lg shadow-2xl overflow-hidden text-gray-800 ${className}`}>
    {children}
  </div>
);

export interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary'|'danger'|'success'|'secondary'|'info'|'warning';
  className?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export const Button: React.FC<ButtonProps> = ({ onClick, children, variant = "primary", className = "", disabled = false, style }) => {
  // CoC Button Style: Thick bottom border, vibrant colors, text stroke
  const baseStyle = "coc-button-shadow transform transition-transform font-black py-4 px-6 rounded-lg border-b-4 border-r-2 border-l-2 border-t text-white uppercase tracking-wide text-lg select-none touch-manipulation flex items-center justify-center gap-2 text-stroke relative overflow-hidden";
  
  const variants = {
    // Orange (Standard Train/Action)
    primary: "bg-[#ffb02e] border-[#b96a00] hover:bg-[#ffc14e]",
    // Red (Close/Cancel)
    danger: "bg-[#ff4444] border-[#990000] hover:bg-[#ff6666]",
    // Green (Attack/Confirm)
    success: "bg-[#83c226] border-[#4f8600] hover:bg-[#96d636]",
    // Stone (Secondary)
    secondary: "bg-[#b0b0b0] border-[#666666] text-gray-800 hover:bg-[#c0c0c0] !text-stroke-sm !text-white",
    // Blue (Info/Magic)
    info: "bg-[#3399ff] border-[#0055aa] hover:bg-[#55aaff]",
    // Gold (Shop/Premium) - FIXED: PURE BLACK TEXT, NO SHADOW, NO STROKE for Leaderboard readability
    warning: "bg-[#ffe160] border-[#cda200] text-black hover:bg-[#fff080] !text-shadow-none !text-stroke-0"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      style={style}
      className={`${baseStyle} ${variants[variant]} ${disabled ? 'grayscale cursor-not-allowed opacity-80' : ''} ${className}`}
    >
      {/* Gloss reflection */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none"></div>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
};

export interface PlayerAvatarProps {
  avatar: string;
  size?: 'sm'|'md'|'lg';
  className?: string;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ avatar, size = "md", className = "" }) => {
    const sizeClasses = {
        sm: "w-12 h-12 text-2xl",
        md: "w-24 h-24 text-5xl",
        lg: "w-36 h-36 text-7xl"
    };
    // CoC Unit Icon Style: Purple gradient background with gold border
    return (
        <div className={`${sizeClasses[size]} bg-gradient-to-br from-[#4f2a75] to-[#2a1342] border-4 border-[#ffd700] rounded-lg flex items-center justify-center shadow-lg relative ${className}`}>
             {/* Inner gloss */}
             <div className="absolute inset-0 rounded-md bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
             <div className="drop-shadow-lg z-10">{avatar}</div>
        </div>
    );
};