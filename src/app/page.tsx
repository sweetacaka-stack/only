"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

// 作品数据
const works = [
  {
    id: 1,
    title: "MONOGRAPH",
    category: "Brand Identity",
    gradient: "from-amber-900/40 to-stone-800/60",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "AURA",
    category: "Visual Design",
    gradient: "from-slate-800/50 to-zinc-900/60",
    image: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2670&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "VOID",
    category: "Art Direction",
    gradient: "from-neutral-800/40 to-stone-900/60",
    image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop",
  },
  {
    id: 4,
    title: "ETHEREAL",
    category: "Photography",
    gradient: "from-gray-800/50 to-slate-900/60",
    image: "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?q=80&w=2670&auto=format&fit=crop",
  },
  {
    id: 5,
    title: "METRIC",
    category: "Data Visualization",
    gradient: "from-stone-800/40 to-neutral-900/60",
    image: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=2574&auto=format&fit=crop",
  },
  {
    id: 6,
    title: "LUMEN",
    category: "Installation",
    gradient: "from-zinc-800/50 to-stone-900/60",
    image: "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=2574&auto=format&fit=crop",
  },
];

export default function HomePage() {
  const [currentSection, setCurrentSection] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // GSAP 相关 refs
  const worksContainerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const contentsRef = useRef<(HTMLDivElement | null)[]>([]);
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const detailsEvenRef = useRef<HTMLDivElement>(null);
  const detailsOddRef = useRef<HTMLDivElement>(null);
  const orderRef = useRef<number[]>([0, 1, 2, 3, 4, 5]);
  const detailsEvenState = useRef<boolean>(true);

  // 初始加载动画
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // GSAP 作品轮播动画
  useEffect(() => {
    if (currentSection !== 1) return;
    
    let isActive = true;
    const cardWidth = 200;
    const cardHeight = 300;
    const gap = 40;

    const ctx = gsap.context(() => {
      const { innerHeight: height, innerWidth: width } = window;
      const offsetTop = height - 430;
      const offsetLeft = width - 830;

      const initAnimation = () => {
        const [active, ...rest] = orderRef.current;
        const detailsActive = detailsEvenState.current ? detailsEvenRef.current : detailsOddRef.current;
        const detailsInactive = detailsEvenState.current ? detailsOddRef.current : detailsEvenRef.current;

        if (detailsActive) {
          const catText = detailsActive.querySelector('.category-text');
          const titleText = detailsActive.querySelector('.title-text');
          if (catText) catText.textContent = works[active].category;
          if (titleText) titleText.textContent = works[active].title;
        }

        gsap.set(cardsRef.current[active], { x: 0, y: 0, width: width, height: height, borderRadius: 0, zIndex: 20 });
        gsap.set(contentsRef.current[active], { x: 0, y: 0, opacity: 0 });

        if (detailsActive) gsap.set(detailsActive, { opacity: 0, zIndex: 22, x: -200 });
        if (detailsInactive) {
          gsap.set(detailsInactive, { opacity: 0, zIndex: 12 });
          gsap.set(detailsInactive.querySelector('.category-text'), { y: 100 });
          gsap.set(detailsInactive.querySelector('.title-text'), { y: 100 });
        }

        gsap.set(indicatorRef.current, { x: -width });

        dotsRef.current.forEach((dot, i) => {
          gsap.set(dot, { backgroundColor: i === active ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.2)' });
        });

        rest.forEach((i, index) => {
          gsap.set(cardsRef.current[i], {
            x: offsetLeft + 400 + index * (cardWidth + gap), y: offsetTop, width: cardWidth, height: cardHeight, zIndex: 30, borderRadius: 8, scale: 1
          });
          gsap.set(contentsRef.current[i], {
            x: offsetLeft + 400 + index * (cardWidth + gap), y: offsetTop + cardHeight - 60, zIndex: 40, opacity: 1
          });
        });

        const startDelay = 0.6;
        gsap.to(coverRef.current, {
          x: width + 400, delay: 0.5, ease: "sine.inOut", onComplete: () => {
            setTimeout(() => { if (isActive) runLoop(); }, 500);
          }
        });

        rest.forEach((i, index) => {
          gsap.to(cardsRef.current[i], {
            x: offsetLeft + index * (cardWidth + gap), zIndex: 30, delay: startDelay + 0.05 * index, ease: "sine.inOut"
          });
          gsap.to(contentsRef.current[i], {
            x: offsetLeft + index * (cardWidth + gap), zIndex: 40, delay: startDelay + 0.05 * index, ease: "sine.inOut"
          });
        });

        if (detailsActive) {
          gsap.to(detailsActive, { opacity: 1, x: 0, ease: "sine.inOut", delay: startDelay });
          gsap.to(detailsActive.querySelector('.category-text'), { y: 0, ease: "sine.inOut", duration: 0.7, delay: startDelay + 0.1 });
          gsap.to(detailsActive.querySelector('.title-text'), { y: 0, ease: "sine.inOut", duration: 0.7, delay: startDelay + 0.15 });
        }
      };

      const step = () => {
        return new Promise(resolve => {
          orderRef.current.push(orderRef.current.shift()!);
          detailsEvenState.current = !detailsEvenState.current;
          const ease = "sine.inOut";

          const detailsActive = detailsEvenState.current ? detailsEvenRef.current : detailsOddRef.current;
          const detailsInactive = detailsEvenState.current ? detailsOddRef.current : detailsEvenRef.current;
          const activeWork = works[orderRef.current[0]];

          if (detailsActive) {
            const catText = detailsActive.querySelector('.category-text');
            const titleText = detailsActive.querySelector('.title-text');
            if (catText) catText.textContent = activeWork.category;
            if (titleText) titleText.textContent = activeWork.title;

            gsap.set(detailsActive, { zIndex: 22 });
            gsap.to(detailsActive, { opacity: 1, delay: 0.4, ease });
            gsap.to(catText, { y: 0, delay: 0.1, duration: 0.7, ease });
            gsap.to(titleText, { y: 0, delay: 0.15, duration: 0.7, ease });
          }

          if (detailsInactive) gsap.set(detailsInactive, { zIndex: 12 });

          const [active, ...rest] = orderRef.current;
          const prv = rest[rest.length - 1];

          works.forEach((_, i) => {
            gsap.to(dotsRef.current[i], { backgroundColor: i === active ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.2)', duration: 0.3 });
          });

          gsap.set(cardsRef.current[prv], { zIndex: 10 });
          gsap.set(cardsRef.current[active], { zIndex: 20 });
          gsap.to(cardsRef.current[prv], { scale: 1.5, ease });

          gsap.to(contentsRef.current[active], { y: offsetTop + cardHeight - 10, opacity: 0, duration: 0.3, ease });

          gsap.to(cardsRef.current[active], {
            x: 0, y: 0, width: width, height: height, borderRadius: 0, ease,
            onComplete: () => {
              const xNew = offsetLeft + (rest.length - 1) * (cardWidth + gap);
              gsap.set(cardsRef.current[prv], { x: xNew, y: offsetTop, width: cardWidth, height: cardHeight, zIndex: 30, borderRadius: 8, scale: 1 });
              gsap.set(contentsRef.current[prv], { x: xNew, y: offsetTop + cardHeight - 60, opacity: 1, zIndex: 40 });

              if (detailsInactive) {
                gsap.set(detailsInactive, { opacity: 0 });
                gsap.set(detailsInactive.querySelector('.category-text'), { y: 100 });
                gsap.set(detailsInactive.querySelector('.title-text'), { y: 100 });
              }
              resolve(true);
            }
          });

          rest.forEach((i, index) => {
            if (i !== prv) {
              const xNew = offsetLeft + index * (cardWidth + gap);
              gsap.set(cardsRef.current[i], { zIndex: 30 });
              gsap.to(cardsRef.current[i], { x: xNew, y: offsetTop, width: cardWidth, height: cardHeight, ease, delay: 0.1 * (index + 1) });
              gsap.to(contentsRef.current[i], { x: xNew, y: offsetTop + cardHeight - 60, opacity: 1, zIndex: 40, ease, delay: 0.1 * (index + 1) });
            }
          });
        });
      };

      const runLoop = async () => {
        if (!isActive) return;
        await new Promise(resolve => gsap.to(indicatorRef.current, { x: 0, duration: 2, ease: "none", onComplete: resolve }));
        if (!isActive) return;
        await new Promise(resolve => gsap.to(indicatorRef.current, { x: width, duration: 0.8, delay: 0.3, ease: "power2.inOut", onComplete: resolve }));
        if (!isActive) return;
        gsap.set(indicatorRef.current, { x: -width });
        await step();
        if (isActive) runLoop();
      };

      initAnimation();
    }, worksContainerRef);

    return () => {
      isActive = false;
      ctx.revert();
    };
  }, [currentSection]);

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
    const handleKeyDown = (_e: KeyboardEvent) => {
      // ESC 键可取消
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

      {/* 第二屏：作品集 - GSAP卡片动画 */}
      <section className="snap-section relative h-screen w-full overflow-hidden" ref={worksContainerRef}>
        {/* 顶部读取条 */}
        <div
          ref={indicatorRef}
          className="pointer-events-none fixed left-0 top-0 z-[60] h-[3px] w-full bg-white"
          style={{ transform: 'translateX(-100%)' }}
        />

        {/* Title */}
        <div className="absolute left-8 top-8 z-[50] text-xs tracking-[0.3em] text-white/40">
          WORKS
        </div>

        {/* 当前指示器 */}
        <div className="absolute bottom-8 left-8 z-[50] flex gap-2">
          {works.map((_, i) => (
            <div
              key={i}
              ref={(el) => { dotsRef.current[i] = el; }}
              className="h-0.5 w-8 rounded-full bg-white/20"
            />
          ))}
        </div>

        {/* 卡片背景 */}
        {works.map((work, index) => (
          <div
            key={`card-${index}`}
            ref={(el) => { cardsRef.current[index] = el; }}
            className="absolute left-0 top-0 bg-cover bg-center shadow-[6px_6px_10px_2px_rgba(0,0,0,0.6)]"
            style={{ backgroundImage: `url(${work.image})` }}
          />
        ))}

        {/* 卡片内容 */}
        {works.map((work, index) => (
          <div
            key={`content-${index}`}
            ref={(el) => { contentsRef.current[index] = el; }}
            className="absolute left-0 top-0 pl-4 text-white"
          >
            <div className="mb-2 h-1 w-6 rounded-full bg-white/80" />
            <p className="text-xs font-medium tracking-wider text-white/80">
              {work.category}
            </p>
            <p className="text-lg font-bold tracking-wider text-white">
              {work.title}
            </p>
          </div>
        ))}

        {/* 双面板交替 */}
        <div ref={detailsEvenRef} className="absolute left-[60px] top-[240px] z-20 pointer-events-none opacity-0">
          <div className="h-[46px] overflow-hidden">
            <div className="category-text relative pt-4 text-sm tracking-wider text-white/60 before:absolute before:left-0 before:top-0 before:h-[3px] before:w-6 before:bg-white/60 translate-y-[100px]"></div>
          </div>
          <div className="h-[100px] overflow-hidden mt-2">
            <div className="title-text text-5xl font-bold tracking-wider text-white lg:text-7xl translate-y-[100px]"></div>
          </div>
        </div>

        <div ref={detailsOddRef} className="absolute left-[60px] top-[240px] z-20 pointer-events-none opacity-0">
          <div className="h-[46px] overflow-hidden">
            <div className="category-text relative pt-4 text-sm tracking-wider text-white/60 before:absolute before:left-0 before:top-0 before:h-[3px] before:w-6 before:bg-white/60 translate-y-[100px]"></div>
          </div>
          <div className="h-[100px] overflow-hidden mt-2">
            <div className="title-text text-5xl font-bold tracking-wider text-white lg:text-7xl translate-y-[100px]"></div>
          </div>
        </div>

        {/* 进场动画遮罩 */}
        <div ref={coverRef} className="absolute left-0 top-0 z-[100] h-screen w-[150vw] bg-[#1a1a1a]" />
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

    </div>
  );
}
