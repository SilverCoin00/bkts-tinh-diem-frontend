import React from 'react';

const ZaloFloatingButton = () => {
  const handleZaloClick = () => {
    window.open('https://zalo.me/nguyenduc389', '_blank');
  };

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 cursor-pointer group flex items-center justify-center"
      onClick={handleZaloClick}
    >
      {/* Outer pulsing ring for interactive micro-animation */}
      <span className="absolute inline-flex h-14 w-14 rounded-full bg-[#0068FF]/30 animate-ping pointer-events-none"></span>
      
      {/* Main Zalo Icon */}
      <div className="relative w-14 h-14 hover:-translate-y-1 transition-all duration-300 ease-out flex items-center justify-center">
        <img 
          src="/lovable-uploads/iconZalo.svg" 
          alt="Zalo" 
          className="w-14 h-14 drop-shadow-[0_8px_16px_rgba(0,104,255,0.35)]"
        />
      </div>
      
      {/* Clean Zalo Hover Label */}
      <div className="absolute bottom-full right-0 mb-3 px-3.5 py-1.5 bg-slate-800 text-white text-[11px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-md pointer-events-none">
        Liên hệ hỗ trợ tuyển sinh 2026
        <span className="absolute top-full right-5 w-2 h-2 bg-slate-800 transform rotate-45 -translate-y-1"></span>
      </div>
    </div>
  );
};

export default ZaloFloatingButton;
