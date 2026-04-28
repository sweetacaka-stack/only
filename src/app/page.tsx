"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import CozeChat from "./components/CozeChat";
import ParticleBackground from "./components/ParticleBackground";
import MechanicalDevice from "./components/MechanicalDevice";

const works = [
  { id: 1, title: "MONOGRAPH", category: "品牌设计", categoryType: "brand", image: "https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2Fb2c17deea19eb100c6291198bb9c92c69235b8092dbe59ccf23c693987dc3e85.png&nonce=e6cdf224-c486-40f0-91c9-bbc87cb4feee&project_id=7628526330237288488&sign=5765c39e540e757ad689716ee1e01a67ed3f8a437cbd3c774a2d18d79734a1b8" },
  { id: 2, title: "AURA", category: "视觉设计", categoryType: "brand", image: "https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F0a582b534cae1df4174469b487e2c56667967c20fafeea97abc00a586baee02a.png&nonce=0111348a-bb7a-47bf-a5b4-e8e722f19205&project_id=7628526330237288488&sign=514041380476eab1bb10da905f415fa3a349bf0e55b78766c05badd8534d2b04" },
  { id: 3, title: "VOID", category: "包装设计", categoryType: "package", image: "https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F0fc3ec76c63e9c9019bbbafd74fe55acf75d5fa1428fd911391a856c9a707f4b.png&nonce=b289ae8d-88ed-4cc0-8ca9-eb6feeabfe2e&project_id=7628526330237288488&sign=2e8ee79250d9c94eb1d1286469cf68f076a8e89fbd169a89b9befe326e6b8af6" },
  { id: 4, title: "ETHEREAL", category: "视觉设计", categoryType: "logotype", image: "https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F3f3bea175ebb1d23a37de7c4805d9d998f5659cd1a272e4601e2ec740b78a904.png&nonce=d6769453-a409-4ba4-bfe0-7d0f65e4ad01&project_id=7628526330237288488&sign=1a2b34db9d831af35a99a7c95ff5602259fa5d394646eed6794a218f46d5cbc0" },
  { id: 5, title: "METRIC", category: "版式视觉", categoryType: "format", image: "https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F4cbf9d2d2d36c6f2c2c702885afd68f8ecd66b61884f1c935083d05334cf8b62.png&nonce=ac78c54c-8d7a-4924-9f24-2d6af074ea4d&project_id=7628526330237288488&sign=733958909a9dbe6b6f1d243684c2389bd6bb6337e15da5c768f88055b363e8e7" },
  { id: 6, title: "LUMEN", category: "品牌设计", categoryType: "brand", image: "https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2Fsp260415_151645.png&nonce=2b8adfc5-c944-4174-9e22-a1c97de1000e&project_id=7628526330237288488&sign=615824e13095af5cf418d8c43e4961888e0c0467f81453775e97b815dec6bd20" },
  { id: 7, title: "NOVA", category: "包装设计", categoryType: "package", image: "https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2Fb2c17deea19eb100c6291198bb9c92c69235b8092dbe59ccf23c693987dc3e85.png&nonce=e6cdf224-c486-40f0-91c9-bbc87cb4feee&project_id=7628526330237288488&sign=5765c39e540e757ad689716ee1e01a67ed3f8a437cbd3c774a2d18d79734a1b8" },
  { id: 8, title: "PRISM", category: "标志字体", categoryType: "logotype", image: "https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F0a582b534cae1df4174469b487e2c56667967c20fafeea97abc00a586baee02a.png&nonce=0111348a-bb7a-47bf-a5b4-e8e722f19205&project_id=7628526330237288488&sign=514041380476eab1bb10da905f415fa3a349bf0e55b78766c05badd8534d2b04" },
];

export default function HomePage() {
  const [currentSection, setCurrentSection] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeNav, setActiveNav] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

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
    setActiveNav(index);
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
      <section className="relative h-screen w-full overflow-hidden bg-black">
        {/* 背景装饰 */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-black via-neutral-950 to-black" />
          <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 border border-white/5 rounded-full" />
          <div className="absolute bottom-1/4 -left-1/4 w-1/3 h-1/3 border border-white/5 rounded-full" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
                <path d="M64 0 L0 0 0 64" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* 左侧导航栏 */}
        <nav className={cn(
          "absolute left-0 top-0 h-full w-48 z-30 flex flex-col py-6 border-r border-white/10 bg-black/50 backdrop-blur-md transition-all duration-700",
          isLoaded ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
        )}>
          {/* Logo */}
          <div className="px-6 mb-8">
            <span className="text-2xl font-bold text-white tracking-wider">Q.</span>
          </div>

          {/* 导航项 */}
          <div className="flex-1 space-y-1 px-3">
            {[
              { id: '01', label: '品牌', sublabel: 'BRAND' },
              { id: '02', label: '包装', sublabel: 'PACKING' },
              { id: '03', label: '标志字体', sublabel: 'LOGOTYPE' },
              { id: '04', label: '版式概念', sublabel: 'FORMAT' },
            ].map((item, index) => (
              <button
                key={item.id}
                onClick={() => { setActiveNav(index); handleNavClick(1); }}
                className={cn(
                  "w-full text-left px-3 py-3 transition-all duration-300 relative group",
                  activeNav === index ? "bg-white/10" : "hover:bg-white/5"
                )}
              >
                <div className="flex items-center">
                  <span className={cn(
                    "text-xs mr-3 transition-colors",
                    activeNav === index ? "text-white" : "text-white/40"
                  )}>
                    {item.id}
                  </span>
                  <span className={cn(
                    "text-sm transition-colors",
                    activeNav === index ? "text-white" : "text-white/70"
                  )}>
                    {item.label}
                  </span>
                </div>
                <p className={cn(
                  "text-[10px] mt-0.5 ml-7 tracking-wider transition-colors",
                  activeNav === index ? "text-white/60" : "text-white/30"
                )}>
                  {item.sublabel}
                </p>
                {activeNav === index && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white/60" />
                )}
              </button>
            ))}
          </div>

          {/* 底部信息 */}
          <div className="px-6 pt-6 border-t border-white/10">
            <p className="text-[9px] text-white/30 tracking-wider mb-4">PORTFOLIO 2025 DESIGN WORKS</p>
            <div className="flex gap-3">
              {/* 社交图标 */}
              <button className="w-8 h-8 border border-white/20 rounded flex items-center justify-center hover:bg-white/10 transition-colors">
                <svg className="w-3.5 h-3.5 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </button>
              <button className="w-8 h-8 border border-white/20 rounded flex items-center justify-center hover:bg-white/10 transition-colors">
                <svg className="w-3.5 h-3.5 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </button>
              <button className="w-8 h-8 border border-white/20 rounded flex items-center justify-center hover:bg-white/10 transition-colors">
                <svg className="w-3.5 h-3.5 text-white/50" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </button>
            </div>
          </div>
        </nav>

        {/* 右上角ABOUT按钮 */}
        <div className={cn(
          "absolute top-6 right-6 z-30 transition-all duration-700 delay-300",
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        )}>
          <button className="group flex items-center gap-2 px-4 py-2 border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all duration-300">
            <span className="text-xs tracking-wider text-white/70 group-hover:text-white">关于集</span>
            <span className="text-xs text-white/40">/</span>
            <span className="text-xs tracking-wider text-white/70 group-hover:text-white">ABOUT</span>
            <svg className="w-3 h-3 text-white/50 group-hover:text-white/80 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>

        {/* 中央机械装置 */}
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <MechanicalDevice />
        </div>

        {/* 右下角联系信息 */}
        <div className={cn(
          "absolute right-6 lg:right-10 z-30 text-right transition-all duration-700 delay-500",
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <div className="mb-4">
            <p className="text-base lg:text-lg text-white/90 tracking-wide" style={{ fontFamily: "serif", fontStyle: "italic" }}>
              Qin.Tian Yang
            </p>
          </div>
          <div className="space-y-1 text-[10px] lg:text-[11px] text-white/40 mb-4">
            <p>contact number:</p>
            <p className="text-white/60">15697697001</p>
            <p className="mt-1">e-mail:</p>
            <p className="text-white/60">2922717190@qq.com</p>
            <p className="mt-1">wechat:</p>
            <p className="text-white/60">2922717190</p>
          </div>
          {/* 二维码 */}
          <div className="flex items-center justify-end gap-2">
            <span className="text-[9px] text-white/30">扫一扫联系我</span>
            <div className="w-16 h-16 border border-white/20 bg-white/5 flex items-center justify-center">
              {/* 二维码占位 */}
              <div className="grid grid-cols-4 gap-0.5 p-1">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className={cn(
                    "w-2.5 h-2.5",
                    Math.random() > 0.5 ? "bg-white/70" : "bg-transparent"
                  )} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 底部SCROLL指引 */}
        <div className={cn(
          "absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 transition-all duration-700 delay-700",
          isLoaded ? "opacity-100" : "opacity-0"
        )}>
          <span className="text-[10px] tracking-[0.3em] text-white/30">SCROLL</span>
          <svg className="w-4 h-4 text-white/30 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>

        {/* 底部装饰线 */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </section>

      {/* 第二屏 - 作品展示 */}
      <section className="relative h-screen w-full overflow-hidden bg-neutral-950">
        {/* 顶部渐变 */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/50 to-transparent z-10 pointer-events-none" />

        {/* 左侧装饰 */}
        <div className="absolute left-0 top-0 bottom-0 w-48 border-r border-white/5 z-10 pointer-events-none" />

        {/* 作品网格 */}
        <div className="h-full pl-48">
          <WorksGridDisplay works={works} />
        </div>

        {/* 导航指示器 */}
        <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              onClick={() => handleNavClick(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                currentSection === index
                  ? "bg-white/80 scale-125"
                  : "bg-white/20 hover:bg-white/40"
              )}
            />
          ))}
        </div>
      </section>

      {/* 第三屏 - 联系方式 */}
      <section className="relative h-screen w-full overflow-hidden">
        <ParticleBackground />
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="flex items-center gap-16">
            <a href="mailto:2922717190@qq.com" className="flex items-center gap-3 text-white/70 hover:text-white transition-colors group">
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
              <span className="text-sm tracking-wide">15697697001</span>
            </div>
          </div>
        </div>
      </section>

      {/* Coze 智能体对话 */}
      <CozeChat
        botId="7628802117205606446"
        apiKey="pat_ikmYxImr7JjuXoXoSogAYIVVs4ImVvzRTJHCMu0ggEGZasPpsWhEKKN1YGPHmFvS"
      />
    </div>
  );
}

// 作品网格展示组件
function WorksGridDisplay({ works }: { works: typeof works }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const categories = [
    { id: "all", label: "全部" },
    { id: "brand", label: "品牌设计" },
    { id: "package", label: "包装设计" },
    { id: "logotype", label: "标志字体" },
    { id: "format", label: "版式视觉" },
  ];

  const filteredWorks =
    activeCategory === "all"
      ? works
      : works.filter((work) => work.categoryType === activeCategory);

  return (
    <div className="h-full flex flex-col">
      {/* 标题 */}
      <div className="px-8 pt-10 pb-6">
        <h2 className="text-xs tracking-[0.3em] text-white/40">作品展示 / WORKS</h2>
      </div>

      {/* 分类标签 */}
      <div className="px-8 pb-6 flex gap-8">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "text-xs tracking-wider transition-all duration-300 relative pb-1",
              activeCategory === cat.id
                ? "text-white"
                : "text-white/40 hover:text-white/70"
            )}
          >
            {cat.label}
            {activeCategory === cat.id && (
              <span className="absolute bottom-0 left-0 w-full h-px bg-white/60" />
            )}
          </button>
        ))}
      </div>

      {/* 作品网格 */}
      <div className="flex-1 px-8 pb-8 overflow-y-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredWorks.map((work) => (
            <div
              key={work.id}
              className={cn(
                "relative aspect-[4/3] overflow-hidden cursor-pointer transition-all duration-500 group",
                hoveredId === work.id ? "scale-[1.02]" : ""
              )}
              onMouseEnter={() => setHoveredId(work.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <img
                src={work.image}
                alt={work.title}
                className="w-full h-full object-cover transition-all duration-500"
                style={{
                  filter: hoveredId === work.id ? "brightness(1.1)" : "brightness(0.85)",
                }}
              />
              <div
                className={cn(
                  "absolute inset-0 transition-all duration-300 flex flex-col justify-end p-3",
                  hoveredId === work.id ? "bg-black/50 opacity-100" : "opacity-0"
                )}
              >
                <div className="h-[2px] w-4 bg-white/60 mb-2" />
                <p className="text-[10px] text-white/60 tracking-wider">
                  {work.category}
                </p>
                <p className="text-sm text-white font-medium tracking-wider mt-0.5">
                  {work.title}
                </p>
              </div>
              <div className="absolute inset-0 border border-white/10 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
