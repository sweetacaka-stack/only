"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

// 作品数据
const works = [
  {
    id: 1,
    title: "品牌重塑",
    category: "Brand Identity",
    gradient: "from-amber-900/40 to-stone-800/60",
  },
  {
    id: 2,
    title: "包装设计",
    category: "Package Design",
    gradient: "from-slate-800/50 to-zinc-900/60",
  },
  {
    id: 3,
    title: "视觉系统",
    category: "Visual Identity",
    gradient: "from-neutral-800/40 to-stone-900/60",
  },
  {
    id: 4,
    title: "海报设计",
    category: "Poster Design",
    gradient: "from-gray-800/50 to-slate-900/60",
  },
  {
    id: 5,
    title: "Logo设计",
    category: "Logo Design",
    gradient: "from-stone-800/40 to-neutral-900/60",
  },
  {
    id: 6,
    title: "画册设计",
    category: "Brochure Design",
    gradient: "from-zinc-800/50 to-stone-900/60",
  },
];

export default function HomePage() {
  const [currentSection, setCurrentSection] = useState(0);
  const [currentWork, setCurrentWork] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const workTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 初始加载动画
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // 作品轮播
  const startWorkTimer = useCallback(() => {
    if (workTimerRef.current) clearInterval(workTimerRef.current);
    workTimerRef.current = setInterval(() => {
      setCurrentWork((prev) => (prev + 1) % works.length);
    }, 5000);
  }, []);

  useEffect(() => {
    if (currentSection === 1) {
      startWorkTimer();
    } else {
      if (workTimerRef.current) clearInterval(workTimerRef.current);
    }
    return () => {
      if (workTimerRef.current) clearInterval(workTimerRef.current);
    };
  }, [currentSection, startWorkTimer]);

  // 滚动吸附
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const sectionHeight = window.innerHeight;
      const newSection = Math.round(scrollTop / sectionHeight);

      if (newSection !== currentSection) {
        setCurrentSection(newSection);
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [currentSection]);

  // 滚动到指定屏
  const scrollToSection = useCallback((index: number) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: index * window.innerHeight,
        behavior: "smooth",
      });
    }
  }, []);

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isLightboxOpen) {
        setIsLightboxOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen]);

  return (
    <div className="snap-container" ref={containerRef}>
      {/* 第一屏：我是谁 - 参考图布局 */}
      <section className="snap-section relative h-screen w-full overflow-hidden">
        {/* 背景图片 */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F%E6%89%8B%E8%A1%A81.png&nonce=d8dff12e-5078-4eb6-863a-b563f8011d9f&project_id=7628526330237288488&sign=47d78a5d328d8d584b3ad9dbb7e5fbf86972d7c7b46238287196814228f4e55d"
            alt="背景"
            className="w-full h-full object-cover"
          />
          {/* 纯色遮罩 - 无磨砂 */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* 右上角标注 */}
        <div className="absolute top-8 right-8 z-10">
          <span className={cn(
            "text-xs tracking-[0.3em] text-white/50 opacity-0 animate-fade-in-up",
            isLoaded && "opacity-100"
          )}>
            PORTFOLIO 2026
          </span>
        </div>

        {/* 左侧巨型字母 */}
        <div className="absolute left-8 lg:left-16 top-1/2 -translate-y-1/2 z-10">
          <h1 className={cn(
            "text-[20vw] lg:text-[18vw] font-bold leading-none text-white/90 opacity-0 animate-fade-in-up",
            isLoaded && "opacity-100"
          )}>
            Z
          </h1>
        </div>

        {/* 右侧身份文字 */}
        <div className="absolute right-8 lg:right-16 top-1/2 -translate-y-1/2 z-10 text-right">
          {/* 竖排中文 */}
          <div className={cn(
            "flex gap-4 justify-end mb-4 opacity-0 animate-fade-in-up delay-200",
            isLoaded && "opacity-100"
          )}>
            <span className="text-lg lg:text-xl text-white/80" style={{ writingMode: "vertical-rl" }}>
              视觉
            </span>
            <span className="text-lg lg:text-xl text-white/80" style={{ writingMode: "vertical-rl" }}>
              设计师
            </span>
          </div>
          {/* 英文身份 */}
          <p className={cn(
            "text-sm tracking-[0.3em] text-white/60 opacity-0 animate-fade-in-up delay-300",
            isLoaded && "opacity-100"
          )}>
            VISUAL DESIGNER
          </p>
        </div>

        {/* 右下角理念 */}
        <div className="absolute bottom-12 right-8 lg:right-16 z-10 text-right max-w-sm">
          <p className={cn(
            "text-xs lg:text-sm text-white/40 leading-relaxed opacity-0 animate-fade-in-up delay-500",
            isLoaded && "opacity-100"
          )}>
            用黑白灰秩序讲述视觉故事
          </p>
        </div>

        {/* 滚动提示 */}
        <div className={cn(
          "absolute bottom-8 left-1/2 -translate-x-1/2 z-10 opacity-0 animate-fade-in-up delay-700",
          isLoaded && "opacity-100"
        )}>
          <div className="flex flex-col items-center gap-2 text-white/30 text-xs">
            <span>SCROLL</span>
            <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* 第二屏：作品集 - 纯作品展示 */}
      <section className="snap-section relative h-screen w-full bg-[#0d0d0d] overflow-hidden">
        {/* 轮播区域 */}
        <div className="relative h-full flex items-center">
          {/* 左右箭头 */}
          <button
            onClick={() =>
              setCurrentWork((prev) => (prev - 1 + works.length) % works.length)
            }
            className="absolute left-4 lg:left-8 z-20 p-2 text-white/30 hover:text-white/60 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={() => setCurrentWork((prev) => (prev + 1) % works.length)}
            className="absolute right-4 lg:right-8 z-20 p-2 text-white/30 hover:text-white/60 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* 作品展示 */}
          <div className="w-full px-12 lg:px-24 overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentWork * 100}%)` }}
            >
              {works.map((work) => (
                <div
                  key={work.id}
                  className="w-full flex-shrink-0 flex items-center justify-center"
                >
                  {/* 作品大图 */}
                  <div
                    className="w-full max-w-4xl aspect-[16/10] relative rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => setIsLightboxOpen(true)}
                  >
                    <div className={cn("absolute inset-0 bg-gradient-to-br transition-transform duration-500 group-hover:scale-[1.02]", work.gradient)} />
                    {/* 装饰元素 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 border border-white/10 rounded-full" />
                    </div>
                    {/* 悬停效果 */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <svg className="w-12 h-12 text-white/60 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 作品名称 */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
            <span className="text-xs text-white/40 tracking-widest">
              {works[currentWork].title}
            </span>
          </div>

          {/* 指示器 */}
          <div className="absolute bottom-8 right-1/2 translate-x-16 flex items-center gap-2">
            {works.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentWork(index);
                  startWorkTimer();
                }}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  index === currentWork
                    ? "w-6 bg-white/60"
                    : "w-1 bg-white/20 hover:bg-white/30"
                )}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 第三屏：联系方式 - 邮箱微信并排 */}
      <section className="snap-section relative h-screen w-full bg-[#0d0d0d] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {/* 背景装饰 */}
          <div className="absolute w-[500px] h-[500px] rounded-full bg-white/[0.02] blur-3xl" />

          {/* 联系方式 - 并排居中 */}
          <div className="relative z-10 flex items-center gap-16">
            {/* 邮箱 */}
            <a
              href="mailto:2922717190@qq.com"
              className="group flex items-center gap-3 text-white/70 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm tracking-wide">2922717190@qq.com</span>
            </a>

            {/* 分隔 */}
            <div className="w-px h-8 bg-white/20" />

            {/* 微信 */}
            <div className="flex items-center gap-3 text-white/70">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm tracking-wide">15098039595</span>
            </div>
          </div>
        </div>
      </section>

      {/* 侧边导航指示器 */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
        {[0, 1, 2].map((index) => (
          <button
            key={index}
            onClick={() => scrollToSection(index)}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-all duration-300",
              currentSection === index
                ? "bg-white/80"
                : "bg-white/20 hover:bg-white/40"
            )}
          />
        ))}
      </div>

      {/* 灯箱弹窗 */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* 关闭按钮 */}
          <button
            className="absolute top-6 right-6 p-2 text-white/60 hover:text-white transition-colors z-10"
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(false);
            }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* 作品大图 */}
          <div
            className="max-w-5xl w-full mx-8 aspect-[16/10] relative rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={cn("absolute inset-0 bg-gradient-to-br", works[currentWork].gradient)} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 border border-white/10 rounded-full" />
            </div>
          </div>

          {/* 作品信息 */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
            <span className="text-xs text-white/60 tracking-widest">{works[currentWork].title}</span>
          </div>

          {/* 左右切换 */}
          <button
            className="absolute left-6 p-3 text-white/40 hover:text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentWork((prev) => (prev - 1 + works.length) % works.length);
            }}
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            className="absolute right-6 p-3 text-white/40 hover:text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentWork((prev) => (prev + 1) % works.length);
            }}
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
