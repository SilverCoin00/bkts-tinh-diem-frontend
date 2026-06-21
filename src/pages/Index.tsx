import { useState, useEffect, useRef } from "react";
import { ScoreInputForm } from "@/components/ScoreInputForm";
import { ScoreResults } from "@/components/ScoreResults";
import ZaloFloatingButton from "@/components/ZaloFloatingButton";
import { calculateAdmissionScores } from "@/utils/admissionCalculator";
import { AdmissionScores, ScoreResult } from "@/types/admission";
import { MessageCircle, ExternalLink, GraduationCap, Globe, ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";

const brochureImages = [
  {
    src: "/lovable-uploads/flyer-seee-side-1a4x_2.png",
    alt: "Flyer Thông tin Tuyển sinh Trường Điện - Điện tử - Mặt 1"
  },
  {
    src: "/lovable-uploads/flyer-seee-side-2a4x_1.png",
    alt: "Flyer Thông tin Tuyển sinh Trường Điện - Điện tử - Mặt 2"
  },
  {
    src: "/lovable-uploads/flyer_page_0.png",
    alt: "Flyer Thông tin Tuyển sinh ĐH Bách khoa Hà Nội 2026 - Trang 1"
  },
  {
    src: "/lovable-uploads/flyer_page_1.png",
    alt: "Flyer Thông tin Tuyển sinh ĐH Bách khoa Hà Nội 2026 - Trang 2"
  }
];

const Index = () => {
  const [results, setResults] = useState<ScoreResult | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isOpenLightbox, setIsOpenLightbox] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [lastTap, setLastTap] = useState(0);

  // Drag to pan references and states for zoomed flyer
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);

  const limitPosition = (x: number, y: number, currentScale: number) => {
    if (currentScale <= 1) return { x: 0, y: 0 };
    if (!containerRef.current) return { x, y };
    const container = containerRef.current;
    const img = container.querySelector("img");
    if (!img) return { x, y };

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const w = img.offsetWidth;
    const h = img.offsetHeight;

    const scaledWidth = w * currentScale;
    const scaledHeight = h * currentScale;

    const maxX = scaledWidth > containerWidth ? (scaledWidth - containerWidth) / 2 : 0;
    const maxY = scaledHeight > containerHeight ? (scaledHeight - containerHeight) / 2 : 0;

    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y))
    };
  };

  // Re-bound position when zoomScale changes
  useEffect(() => {
    if (zoomScale <= 1) {
      setPosition({ x: 0, y: 0 });
    } else {
      setPosition(prev => limitPosition(prev.x, prev.y, zoomScale));
    }
  }, [zoomScale]);

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();
    const delay = 300;
    if (now - lastTap < delay) {
      if (zoomScale > 1) {
        setZoomScale(1);
      } else {
        setZoomScale(2);
      }
    }
    setLastTap(now);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (zoomScale <= 1) return;
    setIsDragging(true);
    setStartX(e.clientX - position.x);
    setStartY(e.clientY - position.y);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomScale <= 1) return;
    e.preventDefault();
    e.stopPropagation();
    const newX = e.clientX - startX;
    const newY = e.clientY - startY;
    setPosition(limitPosition(newX, newY, zoomScale));
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    const now = Date.now();
    const delay = 300;
    if (now - lastTap < delay) {
      e.preventDefault();
      if (zoomScale > 1) {
        setZoomScale(1);
      } else {
        setZoomScale(2);
      }
    } else {
      if (zoomScale > 1 && e.touches.length === 1) {
        setIsDragging(true);
        const touch = e.touches[0];
        setStartX(touch.clientX - position.x);
        setStartY(touch.clientY - position.y);
      }
    }
    setLastTap(now);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || zoomScale <= 1 || e.touches.length !== 1) return;
    e.stopPropagation();
    const touch = e.touches[0];
    const newX = touch.clientX - startX;
    const newY = touch.clientY - startY;
    setPosition(limitPosition(newX, newY, zoomScale));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (!isAutoPlay) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % brochureImages.length);
    }, 9000); // Chuyển ảnh chậm hơn (9 giây)
    return () => clearInterval(timer);
  }, [isAutoPlay]);

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isTransitioning) return;
    setIsTransitioning(true);
    setIsAutoPlay(false); // Ngưng chuyển ảnh khi bấm chuyển manually
    setCurrentSlide((prev) => (prev + brochureImages.length - 1) % brochureImages.length);
    setTimeout(() => setIsTransitioning(false), 500); // Cool down ngắn cho click
  };

  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isTransitioning) return;
    setIsTransitioning(true);
    setIsAutoPlay(false); // Ngưng chuyển ảnh khi bấm chuyển manually
    setCurrentSlide((prev) => (prev + 1) % brochureImages.length);
    setTimeout(() => setIsTransitioning(false), 500); // Cool down ngắn cho click
  };

  const handleCalculate = async (scores: AdmissionScores) => {
    const calculatedResults = await calculateAdmissionScores(scores);
    setResults(calculatedResults);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#252525] font-sans antialiased">
      {/* Main Header */}
      <header className="shadow-md sticky top-0 z-50 bg-white">
        {/* Red Bar with Logo */}
        <div className="bg-[#c02135]">
          <div className="container mx-auto px-4 md:px-8 max-w-[1380px] py-3">
            <div className="flex justify-between items-center">
              {/* Logo and Titles */}
              <div className="flex items-center">
                <a href="https://seee.hust.edu.vn/vi/" className="flex items-center shrink-0">
                  <img 
                    src="/seee-logo.png" 
                    alt="Trường Điện - Điện tử" 
                    className="h-[75px] w-auto bg-transparent object-contain shrink-0"
                  />
                  <ul className="ml-3 flex flex-col justify-center text-white text-left list-none m-0 p-0">
                    <li className="text-[14px] md:text-[16px] font-normal leading-tight opacity-90">
                      Đại học Bách khoa Hà Nội
                    </li>
                    <li className="text-[20px] md:text-[26px] font-bold uppercase leading-tight mt-1">
                      Trường Điện - Điện tử
                    </li>
                  </ul>
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content (Wider Container: max-w-6xl) */}
      <main className="container mx-auto px-4 py-8 max-w-[1380px]">
        {/* Page Title Section (Indicator removed, text sized up) */}
        <div className="border-b border-slate-200 pb-3 mb-6">
          <h2 className="text-xl md:text-[22px] font-extrabold text-slate-800 tracking-tight">
            CÔNG CỤ TÍNH ĐIỂM XÉT TUYỂN ĐẠI HỌC BÁCH KHOA HÀ NỘI 2026
          </h2>
        </div>

        {/* 2-Column Responsive Layout for PC / Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Calculation form & results (Main block with standard HUST round-md corners) */}
          <div className="lg:col-span-9 bg-white border border-slate-200 rounded-md shadow-sm p-6 md:p-8">
            {/* Input Form */}
            <ScoreInputForm onCalculate={handleCalculate} />
            
            {/* Results */}
            {results && (
              <div className="pt-8 border-t border-slate-100 mt-8 animate-fade-in-up">
                <ScoreResults results={results} />
              </div>
            )}
          </div>

          {/* Right Column: Advisor block & Quick link widgets (Prevents empty sides on PC) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Advisor Chat Card: Simplified, clean, and positioned outside the calculation block */}
            <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img 
                    src="/lovable-uploads/avatar-teacher.jpg" 
                    alt="PGS. TS. Nguyễn Đức Minh" 
                    className="h-10 w-10 rounded-full object-cover shadow-sm border border-slate-200"
                  />
                  <span className="absolute bottom-0 right-0 flex h-2.5 w-2.5">
                    <span className="animate-ripple absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 border border-white"></span>
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">PGS. TS. Nguyễn Đức Minh</h4>
                  <p className="text-[11px] text-slate-500 font-medium">Phó Hiệu trưởng Trường Điện - Điện tử</p>
                </div>
              </div>
              <a
                href="https://zalo.me/nguyenduc389"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded font-bold text-white bg-[#0068FF] hover:bg-[#005ce6] transition-all duration-200 text-xs tracking-wider uppercase shadow-sm"
              >
                <MessageCircle className="h-4 w-4" />
                Liên hệ ngay
              </a>
            </div>

            {/* Quick Links Card (Renamed to 'Liên kết') */}
            <div className="bg-white border border-slate-200 rounded-md p-5 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100">Liên kết</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a 
                    href="https://hust.edu.vn/uploads/sys/tuyen-sinh/2026_05/qd_thong-tin-tuyen-sinh-dhbk-ha-noi-2026_final_1.pdf" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 text-slate-600 hover:text-[#c02135] font-semibold"
                  >
                    <GraduationCap className="h-4 w-4 text-[#c02135]" />
                    Đề án tuyển sinh HUST
                  </a>
                </li>
                <li>
                  <a 
                    href="https://seee.hust.edu.vn/vi/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 text-slate-600 hover:text-[#c02135] font-semibold"
                  >
                    <Globe className="h-4 w-4 text-[#c02135]" />
                    Website Trường Điện - Điện tử
                  </a>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Admission Brochures Auto-Slider (Always open) */}
        <div className="mt-8">
          <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <h4 className="font-extrabold text-slate-800 text-sm tracking-tight">
                THÔNG TIN CHƯƠNG TRÌNH ĐÀO TẠO ĐIỆN - ĐIỆN TỬ 2026
              </h4>
            </div>
            
            <div className="relative group w-full max-w-5xl mx-auto bg-white p-0">
              <div className="relative w-full flex items-center justify-center">
                {/* Left Arrow Button */}
                <button
                  onClick={handlePrevSlide}
                  className="absolute left-4 z-20 p-2.5 rounded-full bg-white/85 hover:bg-white text-slate-800 hover:text-[#c02135] shadow-md border border-slate-200 transition-all focus:outline-none hover:scale-105 active:scale-95"
                  type="button"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {/* Slider Container (Using relative active slide to push auto-height, preventing any cropping) */}
                <div className="relative w-full overflow-hidden bg-white">
                  {brochureImages.map((img, index) => {
                    const isActive = index === currentSlide;
                    return (
                      <div
                        key={index}
                        className={`transition-opacity duration-1000 ease-in-out ${
                          isActive 
                            ? "relative opacity-100 z-10" 
                            : "absolute inset-0 opacity-0 z-0 pointer-events-none"
                        }`}
                      >
                        <img 
                          src={img.src} 
                          alt={img.alt} 
                          className="w-full h-auto object-contain cursor-zoom-in hover:brightness-95 transition-all duration-200 bg-white"
                          onClick={() => {
                            setSelectedImage(img.src);
                            setIsOpenLightbox(true);
                            setZoomScale(1);
                          }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Right Arrow Button */}
                <button
                  onClick={handleNextSlide}
                  className="absolute right-4 z-20 p-2.5 rounded-full bg-white/85 hover:bg-white text-slate-800 hover:text-[#c02135] shadow-md border border-slate-200 transition-all focus:outline-none hover:scale-105 active:scale-95"
                  type="button"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* Navigation Indicator Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20 bg-black/45 px-3 py-1.5 rounded-full">
                  {brochureImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentSlide(index);
                        setIsAutoPlay(false); // Ngưng chuyển ảnh khi click vào chấm
                      }}
                      className={`h-2 w-2 rounded-full transition-all duration-300 ${
                        index === currentSlide 
                          ? "bg-white w-5" 
                          : "bg-white/50 hover:bg-white/80"
                      }`}
                      type="button"
                      aria-label={`Slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer built 1-to-1 with seee.hust.edu.vn/vi/tuyen-sinh/ */}
      <footer className="mt-20">
        
        {/* Bottom Copyright */}
        <div className="bg-[#b41d24] text-white py-4 mt-4">
          <div className="container mx-auto px-4 lg:px-8 max-w-[1380px] text-[13px] leading-relaxed">
            <p>Bản quyền thuộc về Đại học Bách khoa Hà Nội</p>
            <p>Địa chỉ: Số 1 Đại Cồ Việt, phường Bạch Mai, Thành phố Hà Nội</p>
            <p>Điện thoại: 024 3869 4242</p>
          </div>
        </div>
      </footer>

      {/* Zalo Floating Button */}
      <ZaloFloatingButton />

      {/* Lightbox / Image Popup Modal */}
      {isOpenLightbox && selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-all duration-300 animate-in fade-in"
          onClick={() => {
            setIsOpenLightbox(false);
            setSelectedImage(null);
            setZoomScale(1);
          }}
        >
          {/* Close button/icon */}
          <button 
            className="absolute top-4 right-4 text-white hover:text-red-400 p-2.5 rounded-full bg-black/45 hover:bg-black/70 transition-all focus:outline-none z-50 hover:scale-105 active:scale-95"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpenLightbox(false);
              setSelectedImage(null);
              setZoomScale(1);
            }}
            type="button"
            aria-label="Close image"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Fullscreen Left Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const prevIndex = (currentSlide + brochureImages.length - 1) % brochureImages.length;
              setCurrentSlide(prevIndex);
              setSelectedImage(brochureImages[prevIndex].src);
              setZoomScale(1);
            }}
            className="absolute left-4 md:left-8 z-50 p-3 rounded-full bg-black/60 hover:bg-black/85 text-white transition-all hover:scale-105 active:scale-95 border border-white/10"
            type="button"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Fullscreen Right Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const nextIndex = (currentSlide + 1) % brochureImages.length;
              setCurrentSlide(nextIndex);
              setSelectedImage(brochureImages[nextIndex].src);
              setZoomScale(1);
            }}
            className="absolute right-4 md:right-8 z-50 p-3 rounded-full bg-black/60 hover:bg-black/85 text-white transition-all hover:scale-105 active:scale-95 border border-white/10"
            type="button"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          
          {/* Image Container that fills the screen and has no borders to prevent clipping */}
          <div 
            ref={containerRef}
            className="w-full h-full flex items-center justify-center overflow-hidden touch-none"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img 
              src={selectedImage} 
              alt="Brochure Fullscreen" 
              className="object-contain rounded bg-white p-2 select-none"
              style={{ 
                maxHeight: '90vh',
                maxWidth: '95%',
                width: 'auto',
                height: 'auto',
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoomScale})`,
                transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                cursor: zoomScale === 1 ? 'pointer' : isDragging ? 'grabbing' : 'grab'
              }}
              onDragStart={(e) => e.preventDefault()}
              onClick={handleImageClick}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            />
          </div>

          {/* Zoom Controls floating overlay */}
          <div 
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/75 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 z-50 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setZoomScale(prev => Math.max(1, prev - 0.25))}
              className="text-white hover:text-[#c02135] disabled:text-slate-650 p-1.5 transition-colors focus:outline-none"
              disabled={zoomScale <= 1}
              type="button"
              title="Thu nhỏ"
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <span className="text-white text-xs font-bold w-12 text-center select-none">{Math.round(zoomScale * 100)}%</span>
            <button 
              onClick={() => setZoomScale(prev => Math.min(3, prev + 0.25))}
              className="text-white hover:text-[#c02135] disabled:text-slate-650 p-1.5 transition-colors focus:outline-none"
              disabled={zoomScale >= 3}
              type="button"
              title="Phóng to"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setZoomScale(1)}
              className="text-slate-450 hover:text-white text-[10px] font-bold border-l border-white/20 pl-2.5 transition-colors focus:outline-none"
              type="button"
            >
              RESET
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
