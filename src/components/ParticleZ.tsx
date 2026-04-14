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
  opacity: number;
}

interface ParticleZProps {
  className?: string;
}

export function ParticleZ({ className = "" }: ParticleZProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, isHovering: false });
  const animationRef = useRef<number>(0);
  const lastAutoTimeRef = useRef<number>(Date.now());
  const isDispersingRef = useRef<boolean>(false);

  const getTextPoints = useCallback((width: number, height: number): { x: number; y: number }[] => {
    const points: { x: number; y: number }[] = [];
    const scale = Math.min(width / 400, height / 500) * 0.8;
    const offsetX = width * 0.15;
    const offsetY = height * 0.2;

    // 创建 Z 的路径
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = width;
    canvas.height = height;

    ctx.font = `bold ${Math.min(width, height) * 0.6}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Z", width / 2, height / 2);

    const imageData = ctx.getImageData(0, 0, width, height);
    const gap = 12;

    for (let x = 0; x < width; x += gap) {
      for (let y = 0; y < height; y += gap) {
        const alpha = imageData.data[(y * width + x) * 4 + 3];
        if (alpha > 128) {
          points.push({ x: x - offsetX, y: y - offsetY });
        }
      }
    }

    return points;
  }, []);

  const initParticles = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const points = getTextPoints(rect.width, rect.height);
    particlesRef.current = points.map((point, i) => ({
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      targetX: point.x,
      targetY: point.y,
      vx: 0,
      vy: 0,
      size: 2 + Math.random() * 2,
      opacity: 0.6 + Math.random() * 0.4,
    }));
  }, [getTextPoints]);

  const disperseParticles = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    particlesRef.current.forEach(p => {
      p.targetX = Math.random() * rect.width;
      p.targetY = Math.random() * rect.height;
    });
    isDispersingRef.current = true;
  }, []);

  const gatherParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const points = getTextPoints(rect.width, rect.height);

    particlesRef.current.forEach((p, i) => {
      if (points[i]) {
        p.targetX = points[i].x;
        p.targetY = points[i].y;
      }
    });
    isDispersingRef.current = false;
    lastAutoTimeRef.current = Date.now();
  }, [getTextPoints]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    initParticles();

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      gatherParticles();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const handleMouseEnter = () => {
      mouseRef.current.isHovering = true;
      disperseParticles();
    };

    const handleMouseLeave = () => {
      mouseRef.current.isHovering = false;
      gatherParticles();
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    const animate = () => {
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;
      const easing = isDispersingRef.current ? 0.02 : 0.08;

      particlesRef.current.forEach(p => {
        // 鼠标排斥力
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 150;

        if (dist < maxDist && mouse.isHovering) {
          const force = (maxDist - dist) / maxDist * 2;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // 向目标移动
        const targetDx = p.targetX - p.x;
        const targetDy = p.targetY - p.y;
        p.vx += targetDx * easing;
        p.vy += targetDy * targetDy * 0.001 + targetDy * easing;

        // 阻尼
        p.vx *= 0.9;
        p.vy *= 0.9;

        p.x += p.vx;
        p.y += p.vy;

        // 绘制粒子
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();
      });

      // 自动分散/聚集 - 每7秒
      const now = Date.now();
      if (!mouse.isHovering && now - lastAutoTimeRef.current > 7000) {
        if (!isDispersingRef.current) {
          disperseParticles();
          // 分散2秒后聚集
          setTimeout(() => {
            if (!mouseRef.current.isHovering) {
              gatherParticles();
            }
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
  }, [initParticles, disperseParticles, gatherParticles]);

  return (
    <div ref={containerRef} className={`absolute inset-0 z-10 ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
