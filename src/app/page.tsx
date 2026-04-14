"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

const works = [
  { id: 1, title: "MONOGRAPH", category: "Brand Identity", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" },
  { id: 2, title: "AURA", category: "Visual Design", image: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2670&auto=format&fit=crop" },
  { id: 3, title: "VOID", category: "Art Direction", image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop" },
  { id: 4, title: "ETHEREAL", category: "Photography", image: "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?q=80&w=2670&auto=format&fit=crop" },
  { id: 5, title: "METRIC", category: "Data Visualization", image: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=2574&auto=format&fit=crop" },
  { id: 6, title: "LUMEN", category: "Installation", image: "https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=2574&auto=format&fit=crop" },
];

// 手表指针组件
function WatchHands() {
  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);
  const secondRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let lastTime = performance.now();
    
    const updateHands = (currentTime: number) => {
      const now = new Date();
      const hours = now.getHours() % 12;
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      const milliseconds = now.getMilliseconds();

      const secondDeg = (seconds + milliseconds / 1000) * 6;
      const minuteDeg = (minutes + seconds / 60) * 6;
      const hourDeg = (hours + minutes / 60) * 30;

      if (hourRef.current) hourRef.current.style.transform = `rotate(${hourDeg}deg)`;
      if (minuteRef.current) minuteRef.current.style.transform = `rotate(${minuteDeg}deg)`;
      if (secondRef.current) secondRef.current.style.transform = `rotate(${secondDeg}deg)`;
      
      lastTime = currentTime;
      requestAnimationFrame(updateHands);
    };

    const animationId = requestAnimationFrame(updateHands);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div ref={hourRef} className="absolute w-1 h-16 bg-white/80 origin-bottom" />
      <div ref={minuteRef} className="absolute w-0.5 h-20 bg-white/60 origin-bottom" />
      <div ref={secondRef} className="absolute w-px h-24 bg-white/40 origin-bottom" />
      <div className="absolute w-2 h-2 rounded-full bg-white/90" />
    </div>
  );
}

// 蚂蚁群粒子效果
function TurmiteCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const gridSize = 3;
    let grid: boolean[][] = [];
    let turmites: Turmite[] = [];
    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;

    class Turmite {
      x: number;
      y: number;
      dir: number;
      state: number;
      brightness: number;

      constructor() {
        this.x = Math.floor(Math.random() * cols);
        this.y = Math.floor(Math.random() * rows);
        this.dir = Math.floor(Math.random() * 4);
        this.state = Math.floor(Math.random() * 4);
        this.brightness = 0.2 + Math.random() * 0.5;
      }

      move() {
        const cellX = Math.floor(this.x / gridSize);
        const cellY = Math.floor(this.y / gridSize);
        
        if (cellX < 0 || cellX >= cols || cellY < 0 || cellY >= rows) {
          this.x = Math.floor(Math.random() * width);
          this.y = Math.floor(Math.random() * height);
          return;
        }

        const curr = grid[cellX]?.[cellY] ?? false;

        // Langton's Ant 规则变体
        const rules = [
          // [paint, turn, newState]
          [!curr, (this.dir + 1) % 4, 0],
          [curr, (this.dir + 3) % 4, 1],
          [!curr, this.dir, 2],
          [curr, (this.dir + 2) % 4, 3],
        ];

        const rule = rules[this.state % 4];
        grid[cellX][cellY] = rule[0];
        this.dir = rule[1];
        this.state = rule[2];

        // 移动
        if (this.dir === 0) this.y -= gridSize;
        else if (this.dir === 1) this.x += gridSize;
        else if (this.dir === 2) this.y += gridSize;
        else this.x -= gridSize;

        // 边界检测
        if (this.x < 0) this.x = width - gridSize;
        if (this.x >= width) this.x = 0;
        if (this.y < 0) this.y = height - gridSize;
        if (this.y >= height) this.y = 0;
      }

      draw() {
        const cellX = Math.floor(this.x / gridSize);
        const cellY = Math.floor(this.y / gridSize);
        
        if (grid[cellX]?.[cellY]) {
          ctx.fillStyle = `rgba(255, 255, 255, ${this.brightness})`;
          ctx.fillRect(this.x, this.y, gridSize, gridSize);
        }
      }
    }

    const init = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      cols = Math.ceil(width / gridSize);
      rows = Math.ceil(height / gridSize);
      
      grid = Array(cols).fill(null).map(() => Array(rows).fill(false));
      turmites = [];
      
      // 创建多个蚂蚁
      const numTurmites = Math.min(50, Math.floor((width * height) / 8000));
      for (let i = 0; i < numTurmites; i++) {
        turmites.push(new Turmite());
      }
      
      // 初始画布为黑色
      ctx.fillStyle = "rgba(0, 0, 0, 1)";
      ctx.fillRect(0, 0, width, height);
      isDrawingRef.current = false;
    };

    const animate = () => {
      if (!isDrawingRef.current) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.03)";
        ctx.fillRect(0, 0, width, height);
        
        turmites.forEach(t => {
          t.move();
          t.draw();
        });
      }
      
      animationId = requestAnimationFrame(animate);
    };

    init();
    animationId = requestAnimationFrame(animate);

    window.addEventListener("resize", init);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", init);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 5 }}
    />
  );
}

// 粒子背景
function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas!.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas!.height) this.vy *= -1;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.fill();
      }
    }

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      const numParticles = Math.floor((canvas.width * canvas.height) / 15000);
      for (let i = 0; i < Math.min(numParticles, 80); i++) {
        particles.push(new Particle());
      }
    };

    const drawLines = () => {
      if (!ctx) return;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.12 * (1 - distance / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    const init = () => {
      resize();
    };

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      drawLines();
      animationId = requestAnimationFrame(animate);
    };

    init();
    animate();

    window.addEventListener("resize", init);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", init);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: "#0d0d0d" }}
    />
  );
}

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
            gsap.set(dot, { backgroundColor: i === active ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.2)' });
          });

          setTimeout(() => { if (isActive) runLoop(); }, 800);
        };

        const step = () => {
          orderRef.current.push(orderRef.current.shift()!);
          const ease = "sine.inOut";

          const [active, ...rest] = orderRef.current;
          const prv = rest[rest.length - 1];

          dotsRef.current.forEach((dot, i) => {
            gsap.to(dot, { backgroundColor: i === active ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.2)', duration: 0.3 });
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
          await new Promise(resolve => gsap.to(indicatorRef.current, { x: 0, duration: 2, ease: "none", onComplete: resolve }));
          if (!isActive) return;
          await new Promise(resolve => gsap.to(indicatorRef.current, { x: width, duration: 0.6, delay: 0.3, ease: "power2.inOut", onComplete: resolve }));
          if (!isActive) return;
          step();
          if (isActive) runLoop();
        };

        initAnimation();
      }, worksContainerRef);

      return () => {
        ctx.revert();
      };
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
        }
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
        ease: "power2.inOut"
      });
    }
  }, []);

  return (
    <div className="smooth-container" ref={containerRef}>
      {/* 第一屏 */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* 背景图片 */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F%E6%89%8B%E8%A1%A81.png&nonce=d8dff12e-5078-4eb6-863a-b563f8011d9f&project_id=7628526330237288488&sign=47d78a5d328d8d584b3ad9dbb7e5fbf86972d7c7b46238287196814228f4e55d"
            alt="背景"
            className="w-full h-full object-cover brightness-110"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* 蚂蚁群粒子效果 - 在左侧形成 Z */}
        <TurmiteCanvas />

        {/* 巨型 Z 字母 */}
        <div className="absolute left-8 lg:left-16 top-1/2 -translate-y-1/2 z-10">
          <h1 className={cn(
            "text-[20vw] lg:text-[18vw] font-bold leading-none text-white/90 opacity-0 animate-fade-in-up",
            isLoaded && "opacity-100"
          )}>
            Z
          </h1>
        </div>

        {/* 手表指针 - 右侧 */}
        <div className="absolute right-[15%] top-1/2 -translate-y-1/2 w-48 h-48 z-10">
          <WatchHands />
        </div>

        {/* 右上角标注 */}
        <div className="absolute top-8 right-8 z-20">
          <span className={cn("text-xs tracking-[0.3em] text-white/50 opacity-0 animate-fade-in-up", isLoaded && "opacity-100")}>
            PORTFOLIO 2026
          </span>
        </div>

        {/* 右侧身份文字 */}
        <div className="absolute right-8 lg:right-16 top-1/2 -translate-y-1/2 z-20 text-right">
          <div className={cn("flex gap-4 justify-end mb-4 opacity-0 animate-fade-in-up delay-200", isLoaded && "opacity-100")}>
            <span className="text-lg lg:text-xl text-white/80" style={{ writingMode: "vertical-rl" }}>视觉</span>
            <span className="text-lg lg:text-xl text-white/80" style={{ writingMode: "vertical-rl" }}>设计师</span>
          </div>
          <p className={cn("text-sm tracking-[0.3em] text-white/60 opacity-0 animate-fade-in-up delay-300", isLoaded && "opacity-100")}>
            VISUAL DESIGNER
          </p>
        </div>

        {/* 右下角理念 */}
        <div className="absolute bottom-12 right-8 lg:right-16 z-20 text-right max-w-sm">
          <p className={cn("text-xs lg:text-sm text-white/40 leading-relaxed opacity-0 animate-fade-in-up delay-500", isLoaded && "opacity-100")}>
            用黑白灰秩序讲述视觉故事
          </p>
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

      {/* 第二屏：作品集 */}
      <section className="relative h-screen w-full overflow-hidden" ref={worksContainerRef}>
        <div ref={indicatorRef} className="fixed left-0 top-0 z-[60] h-[2px] w-full bg-white/80" style={{ transform: 'translateX(-100%)' }} />

        <div ref={titleRef} className="absolute left-8 top-8 z-[50] text-xs tracking-[0.3em] text-white/40">
          WORKS
        </div>

        <div className="absolute bottom-8 left-8 z-[50] flex gap-2">
          {works.map((_, i) => (
            <div key={i} ref={(el) => { dotsRef.current[i] = el; }} className="h-0.5 w-8 rounded-full bg-white/20" />
          ))}
        </div>

        {works.map((work, index) => (
          <div
            key={`card-${index}`}
            ref={(el) => { cardsRef.current[index] = el; }}
            className="absolute left-0 top-0 bg-cover bg-center shadow-[6px_6px_10px_2px_rgba(0,0,0,0.6)]"
            style={{ backgroundImage: `url(${work.image})` }}
          />
        ))}

        {works.map((work, index) => (
          <div
            key={`content-${index}`}
            ref={(el) => { contentsRef.current[index] = el; }}
            className="absolute left-0 top-0 text-white z-30"
          >
            <div className="h-[3px] w-8 bg-white/60 mb-3" />
            <p className="text-sm tracking-wider text-white/60">{work.category}</p>
            <p className="text-4xl lg:text-6xl font-bold tracking-wider mt-1">{work.title}</p>
          </div>
        ))}
      </section>

      {/* 第三屏：粒子背景 */}
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

      {/* 导航 */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
        {[0, 1, 2].map((index) => (
          <button
            key={index}
            onClick={() => handleNavClick(index)}
            className={cn("w-1.5 h-1.5 rounded-full transition-all duration-300", currentSection === index ? "bg-white/80" : "bg-white/20 hover:bg-white/40")}
          />
        ))}
      </div>
    </div>
  );
}
