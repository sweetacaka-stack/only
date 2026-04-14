"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

// 作品数据 - 使用渐变色作为占位背景
const works = [
  {
    id: 1,
    title: "品牌重塑",
    category: "Brand Identity",
    gradient: "from-amber-900/40 to-stone-800/60",
    description: "为新兴科技公司打造全新视觉系统",
  },
  {
    id: 2,
    title: "包装设计",
    category: "Package Design",
    gradient: "from-slate-800/50 to-zinc-900/60",
    description: "极简主义香氛品牌包装方案",
  },
  {
    id: 3,
    title: "视觉系统",
    category: "Visual Identity",
    gradient: "from-neutral-800/40 to-stone-900/60",
    description: "创意工作室品牌形象设计",
  },
  {
    id: 4,
    title: "海报设计",
    category: "Poster Design",
    gradient: "from-gray-800/50 to-slate-900/60",
    description: "艺术展览视觉传达",
  },
  {
    id: 5,
    title: "Logo设计",
    category: "Logo Design",
    gradient: "from-stone-800/40 to-neutral-900/60",
    description: "精品咖啡品牌标识",
  },
  {
    id: 6,
    title: "画册设计",
    category: "Brochure Design",
    gradient: "from-zinc-800/50 to-stone-900/60",
    description: "建筑事务所品牌画册",
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
      if (e.key === "ArrowDown" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        scrollToSection(Math.min(currentSection + 1, 2));
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        scrollToSection(Math.max(currentSection - 1, 0));
      } else if (e.key === "Escape" && isLightboxOpen) {
        setIsLightboxOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSection, isLightboxOpen, scrollToSection]);

  return (
    <div className="snap-container" ref={containerRef}>
      {/* 第一屏：我是谁 */}
      <section className="snap-section relative h-screen w-full overflow-hidden">
        {/* 背景图片 */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F%E6%94%B6%E8%97%8F%E5%88%B0+Product+Visualisation+%281%29.png&nonce=9b7828dc-5771-43c3-ab60-6eb101f0026b&project_id=7628526330237288488&sign=10c5c58401877452b92310ea5c4f4b75bd303514260f42ee01af2d5c08aeac7c"
            alt="背景"
            className="w-full h-full object-cover opacity-60"
          />
          {/* 深色遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
        </div>

        {/* 右侧文字区域 - 磨砂玻璃 */}
        <div className="absolute right-0 top-0 h-full w-[45%] flex items-center z-10">
          <div
            className={cn(
              "glass h-full w-full flex flex-col justify-center px-16 lg:px-24",
              isLoaded ? "opacity-100" : "opacity-0"
            )}
          >
            {/* 名字 */}
            <h1
              className={cn(
                "text-5xl lg:text-7xl font-bold tracking-tight mb-6 opacity-0 animate-fade-in-up",
                isLoaded && "opacity-100"
              )}
            >
              陈默
            </h1>

            {/* 身份 */}
            <p
              className={cn(
                "text-lg lg:text-xl text-white/70 tracking-widest uppercase mb-8 opacity-0 animate-fade-in-up delay-200"
              )}
            >
              Brand Designer
            </p>

            {/* 分隔线 */}
            <div className="w-16 h-px bg-white/30 mb-8 opacity-0 animate-fade-in-up delay-300" />

            {/* 理念 */}
            <p
              className={cn(
                "text-base lg:text-lg text-white/60 leading-relaxed max-w-md opacity-0 animate-fade-in-up delay-400"
              )}
            >
              品牌不是装饰，是企业与用户之间的情感桥梁。
              <br />
              我用克制的手法，让品牌在嘈杂的信息中脱颖而出。
            </p>

            {/* 滚动提示 */}
            <div
              className={cn(
                "mt-auto pb-12 flex items-center gap-3 text-white/40 text-sm opacity-0 animate-fade-in-up delay-700"
              )}
            >
              <span>Scroll</span>
              <svg
                className="w-4 h-4 animate-bounce"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* 左侧装饰 - 简约线条 */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 z-10 opacity-0 animate-fade-in-up delay-500">
          <div className="flex flex-col items-center gap-4 text-white/30">
            <span className="text-xs tracking-widest" style={{ writingMode: "vertical-rl" }}>
              PORTFOLIO
            </span>
            <div className="w-px h-20 bg-white/30" />
          </div>
        </div>
      </section>

      {/* 第二屏：作品集 */}
      <section className="snap-section relative h-screen w-full bg-[#1a1a1a] overflow-hidden">
        <div className="absolute inset-0 flex flex-col justify-center px-16 lg:px-24">
          {/* 标题 */}
          <h2
            className={cn(
              "text-sm tracking-[0.3em] text-white/40 mb-12 opacity-0 animate-fade-in-up"
            )}
          >
            SELECTED WORKS
          </h2>

          {/* 轮播区域 */}
          <div className="relative flex-1 flex items-center">
            {/* 左右箭头 */}
            <button
              onClick={() =>
                setCurrentWork((prev) => (prev - 1 + works.length) % works.length)
              }
              className="absolute left-0 z-20 p-3 text-white/40 hover:text-white transition-colors"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={() => setCurrentWork((prev) => (prev + 1) % works.length)}
              className="absolute right-0 z-20 p-3 text-white/40 hover:text-white transition-colors"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* 作品展示 */}
            <div className="w-full px-16 overflow-hidden">
              <div
                className="flex transition-transform duration-700 ease-out"
                style={{ transform: `translateX(-${currentWork * 100}%)` }}
              >
                {works.map((work) => (
                  <div
                    key={work.id}
                    className="w-full flex-shrink-0 flex items-center gap-16"
                  >
                    {/* 作品图 - 使用渐变背景，点击打开灯箱 */}
                    <div
                      className="flex-1 aspect-[4/3] relative rounded-lg overflow-hidden cursor-pointer group"
                      onClick={() => setIsLightboxOpen(true)}
                    >
                      <div className={cn("absolute inset-0 bg-gradient-to-br transition-transform duration-500 group-hover:scale-105", work.gradient)} />
                      {/* 装饰元素 */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 border border-white/10 rounded-full" />
                        <div className="absolute w-16 h-16 border border-white/5 rounded-full" />
                      </div>
                      {/* 悬停指示 */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-12 h-12 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* 作品信息 */}
                    <div className="w-80 flex flex-col">
                      <span className="text-xs tracking-widest text-white/40 mb-3">
                        {work.category}
                      </span>
                      <h3 className="text-3xl font-medium text-white mb-4">
                        {work.title}
                      </h3>
                      <p className="text-white/50 leading-relaxed">
                        {work.description}
                      </p>
                      <button className="mt-auto pt-8 text-sm text-white/60 hover:text-white transition-colors flex items-center gap-2 group">
                        <span>View Project</span>
                        <svg
                          className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 指示器 */}
          <div className="flex items-center justify-center gap-3 mt-12">
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
                    ? "w-8 bg-white"
                    : "w-1 bg-white/20 hover:bg-white/40"
                )}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 第三屏：联系方式 */}
      <section className="snap-section relative h-screen w-full bg-[#1a1a1a] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {/* 背景装饰 */}
          <div className="absolute w-[600px] h-[600px] rounded-full bg-white/[0.02] blur-3xl" />
          <div className="absolute w-[400px] h-[400px] rounded-full bg-white/[0.02] blur-2xl" />

          {/* 内容 */}
          <div className="relative z-10 text-center max-w-xl px-8">
            <h2 className="text-sm tracking-[0.3em] text-white/40 mb-12">
              GET IN TOUCH
            </h2>

            <h3 className="text-4xl lg:text-5xl font-medium text-white mb-6">
              让我们合作
            </h3>

            <p className="text-white/50 mb-12 leading-relaxed">
              有项目需求或合作意向？
              <br />
              期待与您的沟通。
            </p>

            {/* 联系方式 */}
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
              {/* 邮箱 */}
              <a
                href="mailto:hello@chenmo.design"
                className="group flex items-center gap-4 text-white hover:text-white/80 transition-colors"
              >
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/40 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-sm tracking-wide">hello@chenmo.design</span>
              </a>

              {/* 微信 */}
              <div className="group flex items-center gap-4 text-white cursor-pointer">
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/40 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <span className="text-sm tracking-wide">chenmo_design</span>
              </div>
            </div>

            {/* 二维码 */}
            <div className="mt-16 flex flex-col items-center">
              <div className="w-32 h-32 bg-white/5 rounded-lg flex items-center justify-center border border-white/10">
                <span className="text-white/30 text-xs">QR Code</span>
              </div>
              <p className="mt-4 text-white/30 text-xs">扫描二维码添加微信</p>
            </div>

            {/* 底部版权 */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/20 text-xs">
              © 2024 Chen Mo. All rights reserved.
            </div>
          </div>
        </div>
      </section>

      {/* 侧边导航指示器 */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        {[0, 1, 2].map((index) => (
          <button
            key={index}
            onClick={() => scrollToSection(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              currentSection === index
                ? "bg-white w-4"
                : "bg-white/30 hover:bg-white/50"
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
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* 内容 */}
          <div
            className="max-w-5xl w-full mx-8 flex flex-col lg:flex-row gap-12 items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 作品大图 */}
            <div className="flex-1 aspect-[4/3] relative rounded-xl overflow-hidden">
              <div className={cn("absolute inset-0 bg-gradient-to-br", works[currentWork].gradient)} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 border border-white/10 rounded-full" />
                <div className="absolute w-24 h-24 border border-white/5 rounded-full" />
              </div>
            </div>

            {/* 作品信息 */}
            <div className="w-full lg:w-80 flex flex-col">
              <span className="text-xs tracking-widest text-white/40 mb-3">
                {works[currentWork].category}
              </span>
              <h3 className="text-4xl font-medium text-white mb-6">
                {works[currentWork].title}
              </h3>
              <p className="text-white/50 leading-relaxed mb-8">
                {works[currentWork].description}
              </p>

              {/* 项目详情 */}
              <div className="space-y-4 pt-6 border-t border-white/10">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">客户</span>
                  <span className="text-white/80">某科技公司</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">时间</span>
                  <span className="text-white/80">2024</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">服务</span>
                  <span className="text-white/80">品牌设计</span>
                </div>
              </div>
            </div>
          </div>

          {/* 左右切换 */}
          <button
            className="absolute left-6 p-3 text-white/40 hover:text-white transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentWork((prev) => (prev - 1 + works.length) % works.length);
            }}
          >
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* 指示器 */}
          <div className="absolute bottom-6 flex items-center gap-2">
            {works.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  index === currentWork ? "w-8 bg-white" : "w-1 bg-white/30"
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
