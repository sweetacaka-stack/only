"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import CozeChat from "./components/CozeChat";
import ZLetterCanvas from "./components/ZLetterCanvas";
import ParticleBackground from "./components/ParticleBackground";
import WatchHands from "./components/WatchHands";
import { personalInfo, works } from "./config";

export default function HomePage() {
  const [currentSection, setCurrentSection] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedWorkIndex, setSelectedWorkIndex] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const worksContainerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const contentsRef = useRef<(HTMLDivElement | null)[]>([]);
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const orderRef = useRef<number[]>([0, 1, 2, 3, 4, 5]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // 自动轮播（每5秒切换下一张）
  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedWorkIndex((prev) => (prev + 1) % works.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [works.length]);

  // 平滑滚动
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isScrolling = false;
    let wheelTimeout: NodeJS.Timeout;

    const scrollToSection = (index: number) => {
      if (isScrolling || index < 0 || index > 2) return;
      isScrolling = true;
      gsap.to(container, {
        scrollTop: index * window.innerHeight,
        duration: 0.6,
        ease: "power2.inOut",
        onComplete: () => {
          setCurrentSection(index);
          isScrolling = false;
        },
      });
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      clearTimeout(wheelTimeout);
      wheelTimeout = setTimeout(() => {
        if (e.deltaY > 30) scrollToSection(currentSection + 1);
        else if (e.deltaY < -30) scrollToSection(currentSection - 1);
      }, 10);
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; };
    const handleTouchEnd = (e: TouchEvent) => {
      const diff = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 50) {
        if (diff > 0) scrollToSection(currentSection + 1);
        else scrollToSection(currentSection - 1);
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
      clearTimeout(wheelTimeout);
    };
  }, [currentSection]);

  // 处理卡片悬停/点击 - 放大显示

  const handleNavClick = useCallback((index: number) => {
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        scrollTop: index * window.innerHeight,
        duration: 0.6,
        ease: "power2.inOut",
      });
    }
  }, []);

  return (
    <div className="smooth-container" ref={containerRef}>
      {/* 第一屏 */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* 手表背景图片 */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F%E6%89%8B%E8%A1%A81.png&nonce=afabf5e0-2696-490a-9a79-6719fdf7089c&project_id=7628526330237288488&sign=ac6637b0dce6aa62ecbd7e53986b5d72c772bd7b4f6b9764023547763eb0f030"
            alt="背景"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* 背景装饰 */}
        <div className="absolute inset-0 pointer-events-none z-[1] overflow-hidden">
          <div className="absolute -top-28 -right-28 w-[460px] h-[460px] border border-white/10 rounded-full"></div>
          <div className="absolute top-1/3 -left-36 w-[580px] h-[580px] border border-white/10 rounded-full"></div>
          <div className="absolute bottom-0 right-20 w-[320px] h-[320px] border border-white/10 rounded-full"></div>
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="96" height="96" patternUnits="userSpaceOnUse">
                <path d="M96 0 L0 0 0 96" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* 左侧菜单导航 */}
        <nav className={cn("absolute left-0 top-0 h-full w-44 z-20 flex flex-col px-4 py-6 border-r border-white/10 bg-black/30 backdrop-blur-sm opacity-0 animate-fade-in-up", isLoaded && "opacity-100")}>
          <div className="space-y-0 mt-16">
            {personalInfo.menuItems.map((item) => (
              <button key={item.id} className="w-full text-left py-3 border-t border-white/10 first:border-t-0 hover:bg-white/5 transition-colors group">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white/40 text-xs mr-3.5">{item.id}</span>
                    <span className="text-base text-white/80">{item.label}</span>
                  </div>
                </div>
                <p className="text-[11px] text-white/30 mt-1 ml-8">{item.sublabel}</p>
              </button>
            ))}
          </div>
          <div className="mt-auto">
            <div className="border border-white/10 w-full aspect-square flex items-center justify-center">
              <div className="w-1/2 h-1/2 border border-white/10 rounded-full"></div>
            </div>
          </div>
        </nav>

        {/* 主内容区域 */}
        <div className="relative z-10 h-full">
          {/* 电子流 Z 字母 */}
          <div className="absolute left-44 lg:left-56 top-1/2 -translate-y-1/2">
            <div className="w-[18vw] lg:w-[14vw] aspect-[1/1.5]">
              <ZLetterCanvas />
            </div>
          </div>

          {/* 中间年份大标题 */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <h1
              className={cn("text-[80px] sm:text-[100px] lg:text-[140px] font-bold tracking-tighter leading-none opacity-0 animate-fade-in-up delay-200", isLoaded && "opacity-100")}
              style={{
                fontFamily: 'serif',
                fontStyle: 'italic',
                textShadow: '0 0 30px rgba(255,255,255,0.25), 2px 2px 0 rgba(255,255,255,0.4)',
                background: 'linear-gradient(180deg, #ffffff 0%, #888888 50%, #aaaaaa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.05em'
              }}
            >
              2026
            </h1>
            <span className="absolute top-8 right-0 text-white/60 text-2xl">*</span>
          </div>

          {/* 右侧个人信息 */}
          <div className={cn("absolute right-8 lg:right-16 top-1/2 -translate-y-1/2 z-20 text-right opacity-0 animate-fade-in-up delay-300", isLoaded && "opacity-100")}>
            <div>
              <p className="text-2xl lg:text-3xl font-light tracking-wide text-white/90" style={{ fontFamily: 'serif', fontStyle: 'italic' }}>{personalInfo.firstName}</p>
              <p className="text-lg lg:text-xl text-white/60" style={{ fontFamily: 'serif', fontStyle: 'italic' }}>{personalInfo.lastName}</p>
              <div className="mt-3 text-[10px] lg:text-[11px] text-white/40 space-y-1">
                <p>contact number:</p><p>{personalInfo.phone}</p>
                <p>e-mail:</p><p>{personalInfo.email}</p>
                <div className="flex flex-col items-end">
                  <p>wechat:</p>
                  <img 
                    src={personalInfo.wechatQRCode} 
                    alt="微信二维码" 
                    className="w-12 lg:w-14 rounded border border-white/20 mt-1 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setIsQRModalOpen(true)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 手表指针 */}
          <div className="absolute right-[20%] lg:right-[25%] top-1/2 -translate-y-1/2 w-32 lg:w-48 z-10">
            <WatchHands />
          </div>
        </div>

        {/* 底部 PORTFOLIO */}
        <div className={cn("absolute bottom-0 left-0 right-0 z-20 border-t border-white/10 px-6 lg:px-8 py-4 opacity-0 animate-fade-in-up delay-500", isLoaded && "opacity-100")}>
          <div className="flex items-end justify-between">
            <div className="relative">
              <h2
                className="text-[36px] sm:text-[48px] lg:text-[64px] font-bold leading-none tracking-tighter"
                style={{
                  fontFamily: 'serif',
                  fontStyle: 'italic',
                  background: 'linear-gradient(180deg, #ffffff 0%, #666666 40%, #888888 70%, #555555 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 30px rgba(255,255,255,0.2)',
                  letterSpacing: '-0.08em'
                }}
              >
                PORTFOLIO
              </h2>
              <span className="absolute top-4 left-[140px] sm:left-[180px] lg:left-[240px] text-white/60 text-xl">*</span>
            </div>
            <div className="text-right mb-1">
              <p className="text-xs lg:text-sm text-white/60">{personalInfo.title}</p>
              <p className="text-[11px] text-white/40">{personalInfo.titleEn}</p>
            </div>
          </div>
        </div>

        {/* 右下角装饰 */}
        <div className="absolute bottom-0 right-0 pointer-events-none z-[1]">
          <svg width="200" height="200" viewBox="0 0 200 200" className="opacity-10">
            <path d="M0 200 Q100 100 200 0" fill="none" stroke="white" strokeWidth="1"/>
          </svg>
        </div>

        {/* 滚动提示 */}
        <div className={cn("absolute bottom-8 left-1/2 -translate-x-1/2 z-20 opacity-0 animate-fade-in-up delay-700", isLoaded && "opacity-100")}>
          <div className="flex flex-col items-center gap-2 text-white/30 text-xs">
            <span>SCROLL</span>
            <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* 第二屏 - 动态背景幻灯片 */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* 动态背景层 */}
        <div 
          className={cn(
            "absolute inset-0 bg-cover bg-center",
            isZooming ? "animate-instant-zoom" : ""
          )}
          style={{ backgroundImage: `url(${works[selectedWorkIndex].image})` }}
        />
        {/* 黑色遮罩渐变 */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/0 to-black/60" />
        
        {/* 左侧大标题 */}
        <div className="absolute left-8 lg:left-16 top-1/2 -translate-y-1/2 z-20">
          <h2 className="text-5xl lg:text-7xl font-bold text-white tracking-wider animate-title-fade">
            {works[selectedWorkIndex].title}
          </h2>
          <div className="mt-4 h-[2px] w-16 bg-white/60" />
          <p className="mt-3 text-sm text-white/60 tracking-wider">
            {works[selectedWorkIndex].category}
          </p>
        </div>
        
        {/* 右下角缩略图容器 */}
        <div className="absolute bottom-8 right-8 lg:right-16 flex gap-4 z-20">
          {works.map((work, index) => (
            <div
              key={index}
              onClick={() => {
                setSelectedWorkIndex(index);
                setIsZooming(true);
                setTimeout(() => setIsZooming(false), 800);
              }}
              className={cn(
                "w-24 lg:w-32 h-36 lg:h-44 rounded-lg bg-cover bg-center cursor-pointer transition-all duration-300",
                "border-2",
                selectedWorkIndex === index 
                  ? "border-white scale-105 brightness-100 shadow-lg shadow-white/20" 
                  : "border-transparent brightness-50 hover:brightness-75 hover:scale-105",
                "hover:-translate-y-2"
              )}
              style={{ backgroundImage: `url(${work.image})` }}
            />
          ))}
        </div>
        
        {/* 右上角 WORKS 标识 */}
        <div className="absolute right-8 top-8 z-20 text-xs tracking-[0.3em] text-white/40">WORKS</div>
      </section>

      {/* 第三屏 */}
      <section className="relative h-screen w-full overflow-hidden">
        <ParticleBackground />
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="flex items-center gap-16">
            <a href={`mailto:${personalInfo.email}`} className="flex items-center gap-3 text-white/70 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm tracking-wide">{personalInfo.email}</span>
            </a>
            <div className="w-px h-8 bg-white/20" />
            <div className="flex items-center gap-3 text-white/70">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm tracking-wide">15098039595</span>
            </div>
          </div>
        </div>
      </section>

      {/* 导航点 */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
        {[0, 1, 2].map((index) => (
          <button key={index} onClick={() => handleNavClick(index)} className={cn("w-1.5 h-1.5 rounded-full transition-all duration-300", currentSection === index ? "bg-white/80" : "bg-white/20 hover:bg-white/40")} />
        ))}
      </div>

      {/* Coze 智能体对话 */}
      <CozeChat
        botId={personalInfo.cozeBotId}
        apiKey={personalInfo.cozeApiKey}
      />

      {/* 微信二维码放大模态框 */}
      {isQRModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsQRModalOpen(false)}
        >
          <div 
            className="relative max-w-[85vw] max-h-[85vh] animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={personalInfo.wechatQRCode} 
              alt="微信二维码" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            <p className="text-white/80 text-center mt-4 text-sm">扫码添加我的微信</p>
            <button 
              onClick={() => setIsQRModalOpen(false)}
              className="absolute -top-2 -right-2 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
