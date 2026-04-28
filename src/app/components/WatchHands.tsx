"use client";

import { useEffect, useRef } from "react";

export default function WatchHands() {
  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);
  const secondRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateHands = () => {
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
