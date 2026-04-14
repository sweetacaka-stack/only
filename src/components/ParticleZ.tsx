"use client";

import { useEffect, useRef, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  size: number;
}

export function ParticleZ({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, isNear: false });
  const animationRef = useRef<number>(0);
  const lastAutoTimeRef = useRef<number>(Date.now());
  const isDispersedRef = useRef<boolean>(false);
  const initializedRef = useRef<boolean>(false);

  const getZPoints = useCallback((w: number, h: number): { x: number; y: number }[] => {
    const points: { x: number; y: number }[] = [];
    const scale = Math.min(w, h) * 0.45;
    const cx = w * 0.5;
    const cy = h * 0.5;

    // Z 的笔画路径 - 紧密排列
    const density = 4;
    
    // 上横线
    for (let i = 0; i < 20; i++) {
      const t = i / 19;
      for (let j = 0; j < 2; j++) {
        points.push({
          x: cx - scale * 0.5 + t * scale,
          y: cy - scale * 0.4 + j * 3
        });
      }
    }

    // 斜线
    for (let i = 0; i < 18; i++) {
      const t = i / 17;
      for (let j = 0; j < 2; j++) {
        points.push({
          x: cx - scale * 0.5 + t * scale,
          y: cy - scale * 0.4 + t * scale * 0.8 + j * 3
        });
      }
    }

    // 下横线
    for (let i = 0; i < 20; i++) {
      const t = i / 19;
      for (let j = 0; j < 2; j++) {
        points.push({
          x: cx - scale * 0.5 + t * scale,
          y: cy + scale * 0.4 + j * 3
        });
      }
    }

    return points;
  }, []);

  const disperse = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    
    particlesRef.current.forEach(p => {
      p.targetX = Math.random() * rect.width;
      p.targetY = Math.random() * rect.height;
    });
    isDispersedRef.current = true;
  }, []);

  const gather = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    const rect = container.getBoundingClientRect();
    const points = getZPoints(rect.width, rect.height);
    
    particlesRef.current.forEach((p, i) => {
      if (points[i]) {
        p.targetX = points[i].x;
        p.targetY = points[i].y;
      }
    });
    isDispersedRef.current = false;
    lastAutoTimeRef.current = Date.now();
  }, [getZPoints]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const init = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      const points = getZPoints(rect.width, rect.height);
      particlesRef.current = points.map(() => ({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        targetX: 0,
        targetY: 0,
        vx: 0,
        vy: 0,
        size: 1.5 + Math.random()
      }));

      // 初始聚集
      setTimeout(gather, 100);
      initializedRef.current = true;
    };

    if (!initializedRef.current) {
      init();
    }

    const handleResize = () => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      gather();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      
      // 检测是否靠近中心区域
      const cx = rect.width * 0.4;
      const cy = rect.height * 0.5;
      const dist = Math.sqrt(
        Math.pow(mouseRef.current.x - cx, 2) + 
        Math.pow(mouseRef.current.y - cy, 2)
      );
      mouseRef.current.isNear = dist < rect.width * 0.4;
    };

    const handleMouseEnter = () => {
      disperse();
    };

    const handleMouseLeave = () => {
      gather();
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    const animate = () => {
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;
      const isDispersed = isDispersedRef.current;
      const easing = isDispersed ? 0.03 : 0.06;

      particlesRef.current.forEach(p => {
        // 鼠标排斥
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 120 && mouse.isNear) {
          const force = (120 - dist) / 120 * 3;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // 回到目标
        p.vx += (p.targetX - p.x) * easing;
        p.vy += (p.targetY - p.y) * easing;

        // 阻尼
        p.vx *= 0.85;
        p.vy *= 0.85;

        p.x += p.vx;
        p.y += p.vy;

        // 绘制 - 聚集时实心，散开时透明
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        const alpha = isDispersed ? 0.4 : 1;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      });

      // 7秒自动循环
      const now = Date.now();
      if (!mouse.isNear && now - lastAutoTimeRef.current > 7000) {
        if (!isDispersedRef.current) {
          disperse();
          setTimeout(() => {
            if (!mouseRef.current.isNear) gather();
          }, 2000);
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [getZPoints, disperse, gather]);

  return (
    <div ref={containerRef} className={`absolute inset-0 ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
