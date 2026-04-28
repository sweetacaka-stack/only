"use client";

import { useState, useRef, useEffect } from "react";
import React from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import CozeChat from "./components/CozeChat";

// 数据配置
const works = [
  { id: 1, title: "MONOGRAPH", category: "Brand Identity", image: "https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2Fb2c17deea19eb100c6291198bb9c92c69235b8092dbe59ccf23c693987dc3e85.png&nonce=e6cdf224-c486-40f0-91c9-bbc87cb4feee&project_id=7628526330237288488&sign=5765c39e540e757ad689716ee1e01a67ed3f8a437cbd3c774a2d18d79734a1b8" },
  { id: 2, title: "AURA", category: "Visual Design", image: "https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F0a582b534cae1df4174469b487e2c56667967c20fafeea97abc00a586baee02a.png&nonce=0111348a-bb7a-47bf-a5b4-e8e722f19205&project_id=7628526330237288488&sign=514041380476eab1bb10da905f415fa3a349bf0e55b78766c05badd8534d2b04" },
  { id: 3, title: "VOID", category: "Art Direction", image: "https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F0fc3ec76c63e9c9019bbbafd74fe55acf75d5fa1428fd911391a856c9a707f4b.png&nonce=b289ae8d-88ed-4cc0-8ca9-eb6feeabfe2e&project_id=7628526330237288488&sign=2e8ee79250d9c94eb1d1286469cf68f076a8e89fbd169a89b9befe326e6b8af6" },
  { id: 4, title: "ETHEREAL", category: "Photography", image: "https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F3f3bea175ebb1d23a37de7c4805d9d998f5659cd1a272e4601e2ec740b78a904.png&nonce=d6769453-a409-4ba4-bfe0-7d0f65e4ad01&project_id=7628526330237288488&sign=1a2b34db9d831af35a99a7c95ff5602259fa5d394646eed6794a218f46d5cbc0" },
  { id: 5, title: "METRIC", category: "Data Visualization", image: "https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F4cbf9d2d2d36c6f2c2c702885afd68f8ecd66b61884f1c935083d05334cf8b62.png&nonce=ac78c54c-8d7a-4924-9f24-2d6af074ea4d&project_id=7628526330237288488&sign=733958909a9dbe6b6f1d243684c2389bd6bb6337e15da5c768f88055b363e8e7" },
  { id: 6, title: "LUMEN", category: "Installation", image: "https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2Fsp260415_151645.png&nonce=2b8adfc5-c944-4174-9e22-a1c97de1000e&project_id=7628526330237288488&sign=615824e13095af5cf418d8c43e4961888e0c0467f81453775e97b815dec6bd20" },
];

// 优点数据
const advantages = [
  { icon: "palette", title: "独特美学设计", desc: "融合电子流与艺术装饰风格", color: "#22c55e" },
  { icon: "layers", title: "沉浸式体验", desc: "三屏平滑滚动与GSAP动画", color: "#a855f7" },
  { icon: "sparkles", title: "交互丰富", desc: "悬停、点击、对话多维交互", color: "#3b82f6" },
  { icon: "zap", title: "性能优化", desc: "Canvas渲染与懒加载策略", color: "#f59e0b" },
  { icon: "bot", title: "AI智能助手", desc: "Coze实时对话增强沟通", color: "#06b6d4" },
];

// 不足与建议数据
const issues = [
  { category: "用户体验", problem: "移动端适配不完善", suggestion: "使用响应式布局重构各组件", color: "#22c55e" },
  { category: "性能优化", problem: "首屏加载较慢", suggestion: "实施图片预加载与骨架屏", color: "#3b82f6" },
  { category: "内容呈现", problem: "作品描述信息不足", suggestion: "为每件作品添加详细案例", color: "#f59e0b" },
  { category: "可访问性", problem: "缺少无障碍支持", suggestion: "添加ARIA标签与键盘导航", color: "#f97316" },
  { category: "SEO优化", problem: "缺乏元信息优化", suggestion: "完善Meta标签与结构化数据", color: "#06b6d4" },
];

// 快速优化清单
const quickFixes = [
  { title: "添加作品详情弹窗", priority: 5 },
  { title: "优化移动端导航", priority: 4 },
  { title: "增加加载动画", priority: 4 },
  { title: "添加页面过渡效果", priority: 3 },
  { title: "优化深色模式对比度", priority: 3 },
  { title: "添加滚动指示器", priority: 2 },
];

// 设计建议
const designTips = [
  { icon: "image", title: "视觉升级", desc: "采用报告风格卡片设计，增强专业感与可读性" },
  { icon: "layout", title: "布局优化", desc: "模块化信息展示，提升用户体验与交互效率" },
  { icon: "code", title: "技术迭代", desc: "引入Next.js 16新特性，优化性能与SEO" },
  { icon: "accessibility", title: "无障碍支持", desc: "完善ARIA标签，支持键盘导航与屏幕阅读" },
];

// 图标组件
const Icon = ({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) => {
  const icons: Record<string, React.ReactElement> = {
    palette: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8z" /><circle cx="6.5" cy="11.5" r="1.5" /><circle cx="9.5" cy="7.5" r="1.5" /><circle cx="14.5" cy="7.5" r="1.5" /><circle cx="17.5" cy="11.5" r="1.5" /></svg>,
    layers: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>,
    sparkles: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" /><path d="M5 19l1 3 3-1-1-3-3 1z" /><path d="M19 13l1 3 3-1-1-3-3 1z" /></svg>,
    zap: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>,
    bot: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><circle cx="8" cy="16" r="1" /><circle cx="16" cy="16" r="1" /></svg>,
    image: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>,
    layout: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>,
    code: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="16,18 22,12 16,6" /><polyline points="8,6 2,12 8,18" /></svg>,
    accessibility: <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="4" r="2" /><path d="M12 6v6m0 6v6" /><path d="M8 14l4-2 4 2" /></svg>,
    star: <svg className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
    mail: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
    phone: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,
  };
  return icons[name] || null;
};

// 星级组件
const Stars = ({ count }: { count: number }) => (
  <div className="flex gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Icon key={i} name="star" className={i < count ? "opacity-100" : "opacity-20"} />
    ))}
  </div>
);

export default function HomePage() {
  const [currentSection, setCurrentSection] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredWork, setHoveredWork] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const contentRef = useRef<(HTMLDivElement | null)[]>([]);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const orderRef = useRef<number[]>([0, 1, 2, 3, 4, 5]);
  const isHoveringRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // GSAP 轮播动画
  useEffect(() => {
    if (currentSection !== 1) return;
    let isActive = true;

    const initDelay = setTimeout(() => {
      const ctx = gsap.context(() => {
        const { innerHeight: h, innerWidth: w } = window;
        const offsetTop = h - 450;
        const offsetLeft = w - 880;
        const cardW = 180;
        const cardH = 260;
        const gap = 32;

        const initAnimation = () => {
          const [active, ...rest] = orderRef.current;
          gsap.set(cardsRef.current[active], { x: 0, y: 0, width: w, height: h, zIndex: 20, borderRadius: 0 });
          gsap.set(contentRef.current[active], { x: 80, y: h / 2 - 40, opacity: 0 });
          gsap.to(contentRef.current[active], { opacity: 1, duration: 0.5, delay: 0.3 });

          rest.forEach((i, idx) => {
            gsap.set(cardsRef.current[i], { x: offsetLeft + 420 + idx * (cardW + gap), y: offsetTop, width: cardW, height: cardH, zIndex: 30, borderRadius: 12 });
            gsap.set(contentRef.current[i], { x: offsetLeft + 420 + idx * (cardW + gap) + 16, y: offsetTop + cardH - 48, zIndex: 40, opacity: 1 });
          });

          setTimeout(() => { if (isActive) runLoop(); }, 1000);
        };

        const step = () => {
          orderRef.current.push(orderRef.current.shift()!);
          const ease = "power2.inOut";
          const [active, ...rest] = orderRef.current;
          const prv = rest[rest.length - 1];

          gsap.to(contentRef.current[prv], { opacity: 0, y: 180, duration: 0.3, ease });
          gsap.set(cardsRef.current[prv], { zIndex: 10 });
          gsap.to(cardsRef.current[prv], { scale: 0.85, ease, duration: 0.4 });
          gsap.set(cardsRef.current[active], { zIndex: 20 });
          gsap.to(cardsRef.current[active], { x: 0, y: 0, width: w, height: h, borderRadius: 0, ease, duration: 0.5 });
          gsap.set(contentRef.current[active], { x: 80, y: h / 2 - 40 });
          gsap.to(contentRef.current[active], { opacity: 1, y: h / 2 - 40, duration: 0.4, delay: 0.3, ease });

          rest.forEach((i, idx) => {
            if (i !== prv) {
              const xNew = offsetLeft + idx * (cardW + gap);
              gsap.to(cardsRef.current[i], { x: xNew, y: offsetTop, width: cardW, height: cardH, ease, duration: 0.5, delay: 0.1 });
              gsap.to(contentRef.current[i], { x: xNew + 16, y: offsetTop + cardH - 48, opacity: 1, ease, duration: 0.5, delay: 0.1 });
            }
          });

          setTimeout(() => {
            const xNew = offsetLeft + (rest.length - 1) * (cardW + gap);
            gsap.set(cardsRef.current[prv], { x: xNew, y: offsetTop, width: cardW, height: cardH, zIndex: 30, borderRadius: 12, scale: 1 });
            gsap.set(contentRef.current[prv], { x: xNew + 16, y: offsetTop + cardH - 48, opacity: 1, zIndex: 40 });
          }, 600);
        };

        const runLoop = async () => {
          if (!isActive || isHoveringRef.current) { await new Promise(r => setTimeout(r, 500)); if (isActive) runLoop(); return; }
          gsap.set(indicatorRef.current, { x: -w });
          await new Promise(r => gsap.to(indicatorRef.current, { x: 0, duration: 2, ease: "none", onComplete: r }));
          if (!isActive || isHoveringRef.current) { if (isActive) runLoop(); return; }
          await new Promise(r => gsap.to(indicatorRef.current, { x: w, duration: 0.6, delay: 0.3, ease: "power2.inOut", onComplete: r }));
          if (!isActive || isHoveringRef.current) { if (isActive) runLoop(); return; }
          step();
          if (isActive) runLoop();
        };

        initAnimation();
      }, containerRef);
      return () => ctx.revert();
    }, 100);

    return () => { isActive = false; clearTimeout(initDelay); };
  }, [currentSection]);

  // 滚动处理
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let isScrolling = false;
    let wheelTimeout: NodeJS.Timeout;

    const scrollToSection = (idx: number) => {
      if (isScrolling || idx < 0 || idx > 2) return;
      isScrolling = true;
      gsap.to(container, { scrollTop: idx * window.innerHeight, duration: 0.7, ease: "power2.inOut", onComplete: () => { setCurrentSection(idx); isScrolling = false; } });
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      clearTimeout(wheelTimeout);
      wheelTimeout = setTimeout(() => { if (e.deltaY > 30) scrollToSection(currentSection + 1); else if (e.deltaY < -30) scrollToSection(currentSection - 1); }, 10);
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; };
    const handleTouchEnd = (e: TouchEvent) => {
      const diff = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 50) { if (diff > 0) scrollToSection(currentSection + 1); else scrollToSection(currentSection - 1); }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => { container.removeEventListener("wheel", handleWheel); container.removeEventListener("touchstart", handleTouchStart); container.removeEventListener("touchend", handleTouchEnd); clearTimeout(wheelTimeout); };
  }, [currentSection]);

  const handleNavClick = (idx: number) => {
    if (containerRef.current) gsap.to(containerRef.current, { scrollTop: idx * window.innerHeight, duration: 0.7, ease: "power2.inOut" });
  };

  return (
    <div ref={containerRef} className="h-[300vh] overflow-y-auto snap-y snap-mandatory scroll-smooth">
      {/* 第一屏 - 个人介绍报告风格 */}
      <section className="h-screen w-full overflow-hidden" style={{ background: "#121212" }}>
        <div className={cn("h-full max-w-6xl mx-auto px-8 py-16 flex flex-col transition-all duration-700", isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
          {/* 标题区 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">个人数字名片</h1>
            <p className="text-base text-gray-400 max-w-2xl mx-auto">品牌&视觉设计师 | 专注于创新设计与用户体验优化</p>
          </div>

          {/* 01 优点总结 */}
          <div className="mb-12">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
              <span className="text-gray-500">01</span>
              <span className="w-8 h-px bg-gray-700"></span>
              <span>优点总结</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {advantages.map((item, idx) => (
                <div key={idx} className="group bg-[#1E1E1E] rounded-xl p-5 hover:bg-[#262626] transition-all duration-300 cursor-default">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${item.color}20` }}>
                    <Icon name={item.icon} className="w-6 h-6" style={{ color: item.color }} />
                  </div>
                  <h3 className="text-white font-medium text-sm mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 02 主要不足与优化建议 */}
          <div className="mb-12 flex-1">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
              <span className="text-gray-500">02</span>
              <span className="w-8 h-px bg-gray-700"></span>
              <span>主要不足与优化建议</span>
            </h2>
            <div className="bg-[#1E1E1E] rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[#161616] border-b border-gray-800 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="col-span-3">维度分类</div>
                <div className="col-span-4">现存问题</div>
                <div className="col-span-5">优化建议</div>
              </div>
              {issues.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-gray-800/50 hover:bg-[#242424]/50 transition-colors">
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-1 h-8 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-white text-sm font-medium">{item.category}</span>
                  </div>
                  <div className="col-span-4 flex items-center">
                    <span className="text-gray-400 text-sm">{item.problem}</span>
                  </div>
                  <div className="col-span-5 flex items-center">
                    <span className="text-gray-300 text-sm">{item.suggestion}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 底部信息区 */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500/80"></div>
              <span className="text-gray-500 text-sm">在线状态</span>
            </div>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 text-gray-400">
                <Icon name="mail" />
                <span className="text-sm">2922717190@qq.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Icon name="phone" />
                <span className="text-sm">15697697001</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 第二屏 - 作品集轮播 */}
      <section className="relative h-screen w-full overflow-hidden" ref={containerRef} style={{ background: "#121212" }}>
        <div ref={indicatorRef} className="fixed left-0 top-0 z-[60] h-[2px] bg-white/60" style={{ width: "100%", transform: "translateX(-100%)" }} />

        {/* 标题 */}
        <div className="absolute left-8 top-8 z-50">
          <h2 className="text-lg font-semibold text-white flex items-center gap-3">
            <span className="text-gray-500">03</span>
            <span className="w-8 h-px bg-gray-700"></span>
            <span>作品集</span>
          </h2>
        </div>

        {/* 关闭按钮 */}
        {hoveredWork !== null && (
          <button onClick={() => setHoveredWork(null)} className="absolute top-8 right-8 z-[200] w-12 h-12 flex items-center justify-center bg-[#1E1E1E] backdrop-blur-sm rounded-full border border-gray-700 hover:bg-[#262626] transition-all">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}

        {/* 底部指示器 */}
        <div className="absolute bottom-8 left-8 z-50 flex gap-2">
          {works.map((_, i) => (
            <div key={i} className={cn("h-0.5 rounded-full transition-all duration-300", i === 0 ? "w-8 bg-white" : "w-4 bg-white/30")} />
          ))}
        </div>

        {/* 提示文字 */}
        <div className="absolute bottom-8 right-8 z-50 text-xs text-gray-500">悬停或点击查看大图</div>

        {/* 作品卡片 */}
        {works.map((work, idx) => (
          <div key={`card-${idx}`} ref={el => { cardsRef.current[idx] = el; }}
            className="absolute left-0 top-0 bg-cover bg-center shadow-2xl cursor-pointer transition-shadow hover:shadow-3xl"
            style={{ backgroundImage: `url(${work.image})` }}
            onMouseEnter={() => { setHoveredWork(idx); isHoveringRef.current = true; }}
            onMouseLeave={() => { setHoveredWork(null); isHoveringRef.current = false; }}
            onClick={() => setHoveredWork(idx)}
          />
        ))}

        {/* 作品内容 */}
        {works.map((work, idx) => (
          <div key={`content-${idx}`} ref={el => { contentRef.current[idx] = el; }} className="absolute left-0 top-0 text-white z-30 pointer-events-none">
            <div className="h-[3px] w-10 bg-white/60 mb-4"></div>
            <p className="text-sm tracking-wider text-white/60 mb-2">{work.category}</p>
            <p className="text-4xl md:text-5xl font-bold tracking-wider">{work.title}</p>
          </div>
        ))}
      </section>

      {/* 第三屏 - 快速优化清单 & 设计建议 */}
      <section className="h-screen w-full overflow-hidden" style={{ background: "#121212" }}>
        <div className="h-full max-w-6xl mx-auto px-8 py-16 flex flex-col">
          {/* 03 快速优化清单 */}
          <div className="mb-12">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
              <span className="text-gray-500">03</span>
              <span className="w-8 h-px bg-gray-700"></span>
              <span>快速优化清单</span>
            </h2>
            <div className="bg-[#1E1E1E] rounded-xl p-6">
              {quickFixes.map((item, idx) => (
                <div key={idx} className={cn("flex items-center justify-between py-4", idx < quickFixes.length - 1 && "border-b border-gray-800/50")}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#262626] flex items-center justify-center">
                      <span className="text-white/60 text-sm font-medium">{String(idx + 1).padStart(2, '0')}</span>
                    </div>
                    <span className="text-white text-sm">{item.title}</span>
                  </div>
                  <Stars count={item.priority} />
                </div>
              ))}
            </div>
          </div>

          {/* 04 设计与内容建议 */}
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-3">
              <span className="text-gray-500">04</span>
              <span className="w-8 h-px bg-gray-700"></span>
              <span>设计与内容建议</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {designTips.map((item, idx) => (
                <div key={idx} className="group bg-[#1E1E1E] rounded-xl p-6 hover:bg-[#262626] transition-all duration-300 cursor-default">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#262626] flex items-center justify-center group-hover:bg-[#303030] transition-colors">
                      <Icon name={item.icon} className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium mb-2">{item.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 底部总结 */}
          <div className="mt-auto pt-8 border-t border-gray-800">
            <div className="bg-gradient-to-r from-[#1E1E1E] to-[#161616] rounded-xl p-6 flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium mb-1">持续迭代优化中</h3>
                <p className="text-gray-500 text-sm">定期更新设计与功能，欢迎提出宝贵建议</p>
              </div>
              <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm font-medium transition-colors">
                联系我们
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 导航点 */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        {[0, 1, 2].map(idx => (
          <button key={idx} onClick={() => handleNavClick(idx)}
            className={cn("w-2 h-2 rounded-full transition-all duration-300", currentSection === idx ? "bg-white h-6" : "bg-white/30 hover:bg-white/50")} />
        ))}
      </div>

      {/* Coze 智能体 */}
      <CozeChat botId="7628802117205606446" apiKey="pat_ikmYxImr7JjuXoXoSogAYIVVs4ImVvzRTJHCMu0ggEGZasPpsWhEKKN1YGPHmFvS" />
    </div>
  );
}
