"use client";

import { useEffect, useRef, useState } from "react";

interface GearProps {
  size: number;
  teeth: number;
  rotationSpeed: number;
  direction?: "cw" | "ccw";
}

function Gear({ size, teeth, rotationSpeed, direction = "cw" }: GearProps) {
  const gearRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const gear = gearRef.current;
    if (!gear) return;

    let rotation = 0;
    let animationId: number;

    const animate = () => {
      rotation += rotationSpeed * (direction === "cw" ? 1 : -1);
      gear.style.transform = `rotate(${rotation}deg)`;
      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [rotationSpeed, direction]);

  return (
    <div
      ref={gearRef}
      className="absolute rounded-full border border-white/20"
      style={{
        width: size,
        height: size,
        boxShadow: "inset 0 0 20px rgba(255,255,255,0.05)",
      }}
    >
      {/* 齿轮齿 */}
      {Array.from({ length: teeth }).map((_, i) => (
        <div
          key={i}
          className="absolute bg-white/10"
          style={{
            width: 4,
            height: size * 0.12,
            left: "50%",
            top: -size * 0.06,
            marginLeft: -2,
            transformOrigin: `50% ${size / 2 + size * 0.06}px`,
            transform: `rotate(${(360 / teeth) * i}deg)`,
          }}
        />
      ))}
      {/* 内圈 */}
      <div
        className="absolute rounded-full border border-white/10"
        style={{
          width: size * 0.3,
          height: size * 0.3,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
    </div>
  );
}

export default function MechanicalDevice() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-80 h-80 lg:w-[500px] lg:h-[500px] flex items-center justify-center">
      {/* 外圈装饰 */}
      <div
        className="absolute inset-0 rounded-full border border-white/10"
        style={{
          animation: isLoaded ? "pulse 4s ease-in-out infinite" : "none",
        }}
      />

      {/* 齿轮组 */}
      <Gear size={420} teeth={24} rotationSpeed={0.1} direction="cw" />
      <Gear size={320} teeth={18} rotationSpeed={0.15} direction="ccw" />
      <Gear size={220} teeth={12} rotationSpeed={0.2} direction="cw" />

      {/* 中心圆 */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* 年份 */}
        <div
          className={`text-[64px] lg:text-[100px] font-bold tracking-tighter transition-all duration-1000 ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{
            fontFamily: "serif",
            fontStyle: "italic",
            textShadow: "0 0 40px rgba(255,255,255,0.3), 3px 3px 0 rgba(255,255,255,0.2)",
            background: "linear-gradient(180deg, #ffffff 0%, #999999 50%, #cccccc 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.05em",
          }}
        >
          2025
        </div>

        {/* 名字 */}
        <div
          className={`mt-2 text-sm lg:text-base tracking-[0.3em] text-white/50 transition-all duration-1000 delay-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          QIN.TIAN YANG
        </div>

        {/* 装饰线 */}
        <div
          className={`w-16 h-[1px] bg-white/20 mt-4 transition-all duration-1000 delay-500 ${
            isLoaded ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
          }`}
        />
      </div>

      {/* 装饰圆点 */}
      <div className="absolute w-2 h-2 rounded-full bg-white/40" style={{ top: "10%", left: "50%", transform: "translateX(-50%)" }} />
      <div className="absolute w-2 h-2 rounded-full bg-white/40" style={{ bottom: "10%", left: "50%", transform: "translateX(-50%)" }} />
      <div className="absolute w-2 h-2 rounded-full bg-white/40" style={{ left: "10%", top: "50%", transform: "translateY(-50%)" }} />
      <div className="absolute w-2 h-2 rounded-full bg-white/40" style={{ right: "10%", top: "50%", transform: "translateY(-50%)" }} />
    </div>
  );
}
