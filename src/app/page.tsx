"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import CozeChat from "./components/CozeChat";
import ZLetterCanvas from "./components/ZLetterCanvas";
import ParticleBackground from "./components/ParticleBackground";
import WatchHands from "./components/WatchHands";

const works = [
  { id: 1, title: "MONOGRAPH", category: "Brand Identity", image: "https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2Fb2c17deea19eb100c6291198bb9c92c69235b8092dbe59ccf23c693987dc3e85.png&nonce=e6cdf224-c486-40f0-91c9-bbc87cb4feee&project_id=7628526330237288488&sign=5765c39e540e757ad689716ee1e01a67ed3f8a437cbd3c774a2d18d79734a1b8" },
  { id: 2, title: "AURA", category: "Visual Design", image: "https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F0a582b534cae1df4174469b487e2c56667967c20fafeea97abc00a586baee02a.png&nonce=0111348a-bb7a-47bf-a5b4-e8e722f19205&project_id=7628526330237288488&sign=514041380476eab1bb10da905f415fa3a349bf0e55b78766c05badd8534d2b04" },
  { id: 3, title: "VOID", category: "Art Direction", image: "https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F0fc3ec76c63e9c9019bbbafd74fe55acf75d5fa1428fd911391a856c9a707f4b.png&nonce=b289ae8d-88ed-4cc0-8ca9-eb6feeabfe2e&project_id=7628526330237288488&sign=2e8ee79250d9c94eb1d1286469cf68f076a8e89fbd169a89b9befe326e6b8af6" },
  { id: 4, title: "ETHEREAL", category: "Photography", image: "https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F3f3bea175ebb1d23a37de7c4805d9d998f5659cd1a272e4601e2ec740b78a904.png&nonce=d6769453-a409-4ba4-bfe0-7d0f65e4ad01&project_id=7628526330237288488&sign=1a2b34db9d831af35a99a7c95ff5602259fa5d394646eed6794a218f46d5cbc0" },
  { id: 5, title: "METRIC", category: "Data Visualization", image: "https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F4cbf9d2d2d36c6f2c2c702885afd68f8ecd66b61884f1c935083d05334cf8b62.png&nonce=ac78c54c-8d7a-4924-9f24-2d6af074ea4d&project_id=7628526330237288488&sign=733958909a9dbe6b6f1d243684c2389bd6bb6337e15da5c768f88055b363e8e7" },
  { id: 6, title: "LUMEN", category: "Installation", image: "https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2Fsp260415_151645.png&nonce=2b8adfc5-c944-4174-9e22-a1c97de1000e&project_id=7628526330237288488&sign=615824e13095af5cf418d8c43e4961888e0c0467f81453775e97b815dec6bd20" },
];

export default function HomePage() {
  const [currentSection, setCurrentSection] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
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

  // GSAP 卡片轮播
  useEffect(() => {
    if (currentSection !== 1) return;

    let isActive = true;
    const cardWidth = 200;
    const cardHeight = 300;
    const gap = 40;

    const initDelay = setTimeout(() => {
      const ctx = gsap.context(() => {
        const { innerHeight: height, innerWidth: width } = window;
        const offsetTop = height - 430;
        const offsetLeft = width - 830;

        const initAnimation = () => {
          const [active, ...rest] = orderRef.current;

          gsap.set(cardsRef.current[active], { x: 0, y: 0, width, height, borderRadius: 0, zIndex: 20 });
          gsap.set(contentsRef.current[active], { x: 60, y: 240, opacity: 0 });
          gsap.to(contentsRef.current[active], { opacity: 1, duration: 0.5, delay: 0.3 });

          rest.forEach((i, index) => {
            gsap.set(cardsRef.current[i], {
              x: offsetLeft + 400 + index * (cardWidth + gap),
              y: offsetTop,
              width: cardWidth,
              height: cardHeight,
              zIndex: 30,
              borderRadius: 8,
            });
            gsap.set(contentsRef.current[i], {
              x: offsetLeft + 400 + index * (cardWidth + gap) + 20,
              y: offsetTop + cardHeight - 50,
              zIndex: 40,
              opacity: 1,
            });
          });

          gsap.from(titleRef.current, { opacity: 0, y: -20, duration: 0.6, delay: 0.2 });

          dotsRef.current.forEach((dot, i) => {
            gsap.set(dot, { backgroundColor: i === active ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.2)" });
          });

          setTimeout(() => { if (isActive) runLoop(); }, 800);
        };

        const step = () => {
          orderRef.current.push(orderRef.current.shift()!);
          const ease = "sine.inOut";

          const [active, ...rest] = orderRef.current;
          const prv = rest[rest.length - 1];

          dotsRef.current.forEach((dot, i) => {
            gsap.to(dot, { backgroundColor: i === active ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.2)", duration: 0.3 });
          });

          gsap.to(contentsRef.current[prv], { opacity: 0, y: 200, duration: 0.4, ease });

          gsap.set(cardsRef.current[prv], { zIndex: 10 });
          gsap.to(cardsRef.current[prv], { scale: 0.8, ease, duration: 0.4 });

          gsap.set(cardsRef.current[active], { zIndex: 20 });
          gsap.to(cardsRef.current[active], { x: 0, y: 0, width, height, borderRadius: 0, ease, duration: 0.5 });

          gsap.set(contentsRef.current[active], { x: 60, y: 240 });
          gsap.to(contentsRef.current[active], { opacity: 1, y: 240, duration: 0.4, delay: 0.3, ease });

          rest.forEach((i, index) => {
            if (i !== prv) {
              const xNew = offsetLeft + index * (cardWidth + gap);
              gsap.to(cardsRef.current[i], { x: xNew, y: offsetTop, width: cardWidth, height: cardHeight, ease, duration: 0.5, delay: 0.1 });
              gsap.to(contentsRef.current[i], { x: xNew + 20, y: offsetTop + cardHeight - 50, opacity: 1, ease, duration: 0.5, delay: 0.1 });
            }
          });

          setTimeout(() => {
            const xNew = offsetLeft + (rest.length - 1) * (cardWidth + gap);
            gsap.set(cardsRef.current[prv], { x: xNew, y: offsetTop, width: cardWidth, height: cardHeight, zIndex: 30, borderRadius: 8, scale: 1 });
            gsap.set(contentsRef.current[prv], { x: xNew + 20, y: offsetTop + cardHeight - 50, opacity: 1, zIndex: 40 });
          }, 600);
        };

        const runLoop = async () => {
          if (!isActive) return;
          gsap.set(indicatorRef.current, { x: -width });
          await new Promise((resolve) => gsap.to(indicatorRef.current, { x: 0, duration: 2, ease: "none", onComplete: resolve }));
          if (!isActive) return;
          await new Promise((resolve) => gsap.to(indicatorRef.current, { x: width, duration: 0.6, delay: 0.3, ease: "power2.inOut", onComplete: resolve }));
          if (!isActive) return;
          step();
          if (isActive) runLoop();
        };

        initAnimation();
      }, worksContainerRef);

      return () => { ctx.revert(); };
    }, 100);

    return () => {
      isActive = false;
      clearTimeout(initDelay);
    };
  }, [currentSection]);

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
          <div className="absolute inset-0 bg-black/60" />
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

        {/* 左侧菜单导航 - 占据左侧1/6 */}
        <nav className={cn("absolute left-0 top-0 bottom-0 w-[16.666%] z-20 flex flex-col px-6 py-8 border-r border-white/10 bg-black/20 backdrop-blur-sm opacity-0 animate-fade-in-up", isLoaded && "opacity-100")}>
          {/* 顶部标题 */}
          <div className="mb-8">
            <div className="h-[2px] w-8 bg-white/40 mb-3"></div>
            <span className="text-xs tracking-[0.2em] text-white/30">MENU</span>
          </div>

          {/* 导航项 */}
          <div className="flex-1">
            {[
              { id: '01', label: '品牌', sublabel: 'BRAND' },
              { id: '02', label: '包装', sublabel: 'PACKING' },
              { id: '03', label: '标志字体', sublabel: 'LOGO&FONT' },
              { id: '04', label: '版式视觉', sublabel: 'FORMAT' },
            ].map((item) => (
              <button key={item.id} className="w-full text-left py-4 border-t border-white/10 first:border-t-0 hover:bg-white/5 transition-colors group">
                <span className="text-white/40 text-xs mr-3">{item.id}</span>
                <span className="text-base text-white/80">{item.label}</span>
                <p className="text-[10px] text-white/30 mt-1 ml-8">{item.sublabel}</p>
              </button>
            ))}
          </div>

          {/* 底部装饰 */}
          <div className="mt-auto pt-4">
            <div className="border border-white/10 rounded-full aspect-square flex items-center justify-center">
              <span className="text-white/30 text-xs">N</span>
            </div>
          </div>
        </nav>

        {/* 中央主体区域 - 等分对称布局 */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          {/* 左侧 - 电子流Z字母 */}
          <div className="w-1/3 flex items-center justify-end pr-8">
            <div className="w-[12vw] aspect-[1/1.5]">
              <ZLetterCanvas />
            </div>
          </div>

          {/* 中间 - 年份标题 */}
          <div className="flex flex-col items-center justify-center relative">
            <h1
              className={cn("text-[100px] sm:text-[140px] lg:text-[180px] font-bold tracking-tighter leading-none opacity-0 animate-fade-in-up delay-200", isLoaded && "opacity-100")}
              style={{
                fontFamily: 'serif',
                fontStyle: 'italic',
                textShadow: '0 0 40px rgba(255,255,255,0.3), 3px 3px 0 rgba(255,255,255,0.5)',
                background: 'linear-gradient(180deg, #ffffff 0%, #999999 50%, #ffffff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.05em'
              }}
            >
              2026
            </h1>
            <span className="absolute right-0 top-8 text-white/60 text-2xl">*</span>
          </div>

          {/* 右侧 - 手表指针 */}
          <div className="w-1/3 flex items-center justify-start pl-8">
            <div className="w-32 lg:w-48 aspect-square">
              <WatchHands />
            </div>
          </div>
        </div>

        {/* 底部区域 - 居中对齐 */}
        <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-white/10 py-6">
          {/* 底部PORTFOLIO - 居中 */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <h2
                className="text-[48px] sm:text-[64px] lg:text-[80px] font-bold leading-none tracking-tighter"
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
              <span className="absolute top-4 left-[160px] sm:left-[220px] lg:left-[280px] text-white/60 text-xl">*</span>
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

      {/* 第二屏 - 作品展示 */}
      <section className="relative h-screen w-full overflow-hidden" ref={worksContainerRef}>
        {/* 背景 - 使用手表背景 */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F%E6%89%8B%E8%A1%A81.png&nonce=afabf5e0-2696-490a-9a79-6719fdf7089c&project_id=7628526330237288488&sign=ac6637b0dce6aa62ecbd7e53986b5d72c772bd7b4f6b9764023547763eb0f030"
            alt="背景"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>

        {/* 背景装饰 */}
        <div className="absolute inset-0 pointer-events-none z-[1] overflow-hidden">
          <div className="absolute -top-28 -right-28 w-[460px] h-[460px] border border-white/10 rounded-full"></div>
          <div className="absolute top-1/3 -left-36 w-[580px] h-[580px] border border-white/10 rounded-full"></div>
          <div className="absolute bottom-0 right-20 w-[320px] h-[320px] border border-white/10 rounded-full"></div>
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid2" width="96" height="96" patternUnits="userSpaceOnUse">
                <path d="M96 0 L0 0 0 96" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid2)" />
          </svg>
        </div>

        {/* 左侧菜单导航 */}
        <nav className={cn("absolute left-0 top-0 h-full w-44 z-20 flex flex-col px-4 py-6 border-r border-white/10 bg-black/30 backdrop-blur-sm opacity-0 animate-fade-in-up", isLoaded && "opacity-100")}>
          <div className="space-y-0 mt-16">
            {[
              { id: '01', label: '品牌', sublabel: 'BRAND' },
              { id: '02', label: '包装', sublabel: 'PACKING' },
              { id: '03', label: '标志字体', sublabel: 'LOGO&FONT' },
              { id: '04', label: '版式视觉', sublabel: 'FORMAT' },
            ].map((item) => (
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

        {/* 进度条 */}
        <div ref={indicatorRef} className="fixed left-0 top-0 z-[60] h-[2px] w-full bg-white/80" style={{ transform: "translateX(-100%)" }} />

        {/* 主内容区域 */}
        <div className="relative z-10 h-full flex items-center">
          {/* 作品标题 */}
          <div ref={titleRef} className="absolute left-44 lg:left-56 top-12">
            <div className="flex items-center gap-4">
              <div className="h-[2px] w-12 bg-white/40"></div>
              <span className="text-xs tracking-[0.3em] text-white/40">WORKS</span>
            </div>
          </div>

          {/* GSAP卡片区域 */}
          <div className="absolute inset-0">
            {works.map((work, index) => (
              <div key={`card-${index}`} ref={(el) => { cardsRef.current[index] = el; }} className="absolute left-0 top-0 bg-cover bg-center shadow-[6px_6px_10px_2px_rgba(0,0,0,0.6)]" style={{ backgroundImage: `url(${work.image})` }} />
            ))}
            {works.map((work, index) => (
              <div key={`content-${index}`} ref={(el) => { contentsRef.current[index] = el; }} className="absolute left-0 top-0 text-white z-30">
                <div className="h-[3px] w-8 bg-white/60 mb-3" />
                <p className="text-sm tracking-wider text-white/60">{work.category}</p>
                <p className="text-4xl lg:text-6xl font-bold tracking-wider mt-1" style={{ fontFamily: 'serif', fontStyle: 'italic' }}>{work.title}</p>
              </div>
            ))}
          </div>

          {/* 底部指示器 */}
          <div className="absolute bottom-8 left-44 lg:left-56 z-[50] flex gap-2">
            {works.map((_, i) => (
              <div key={i} ref={(el) => { dotsRef.current[i] = el; }} className="h-0.5 w-8 rounded-full bg-white/20" />
            ))}
          </div>
        </div>

        {/* 底部PORTFOLIO */}
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
              <p className="text-xs lg:text-sm text-white/60">品牌&视觉设计师</p>
              <p className="text-[11px] text-white/40">BRAND VISION</p>
            </div>
          </div>
        </div>

        {/* 右下角装饰 */}
        <div className="absolute bottom-0 right-0 pointer-events-none z-[1]">
          <svg width="200" height="200" viewBox="0 0 200 200" className="opacity-10">
            <path d="M0 200 Q100 100 200 0" fill="none" stroke="white" strokeWidth="1"/>
          </svg>
        </div>
      </section>

      {/* 第三屏 */}
      <section className="relative h-screen w-full overflow-hidden">
        <ParticleBackground />
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="flex items-center gap-16">
            <a href="mailto:2922717190@qq.com" className="flex items-center gap-3 text-white/70 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm tracking-wide">2922717190@qq.com</span>
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
        botId="7628802117205606446"
        apiKey="pat_ikmYxImr7JjuXoXoSogAYIVVs4ImVvzRTJHCMu0ggEGZasPpsWhEKKN1YGPHmFvS"
      />
    </div>
  );
}
