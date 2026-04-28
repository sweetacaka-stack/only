"use client";

import { useEffect, useRef } from "react";

export default function Number2026Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 800;
    const H = 600;
    canvas.width = W;
    canvas.height = H;

    // 2026 数字遮罩
    const mC = document.createElement("canvas");
    mC.width = W;
    mC.height = H;
    const mctx = mC.getContext("2d");
    if (!mctx) return;

    mctx.fillStyle = "black";
    mctx.fillRect(0, 0, W, H);
    mctx.strokeStyle = "white";
    mctx.lineWidth = 50;
    mctx.lineCap = "square";
    mctx.lineJoin = "miter";

    // 绘制 2
    mctx.beginPath();
    mctx.moveTo(80, 150);
    mctx.lineTo(180, 150);
    mctx.arc(130, 190, 40, -Math.PI * 0.5, Math.PI, false);
    mctx.lineTo(80, 450);
    mctx.stroke();

    // 绘制 0
    mctx.beginPath();
    mctx.moveTo(260, 150);
    mctx.lineTo(260, 450);
    mctx.moveTo(320, 150);
    mctx.lineTo(320, 450);
    mctx.moveTo(260, 150);
    mctx.arc(290, 300, 150, -Math.PI * 0.5, Math.PI * 0.5, false);
    mctx.stroke();

    // 绘制 2
    mctx.beginPath();
    mctx.moveTo(400, 150);
    mctx.lineTo(500, 150);
    mctx.arc(450, 190, 40, -Math.PI * 0.5, Math.PI, false);
    mctx.lineTo(400, 450);
    mctx.stroke();

    // 绘制 6
    mctx.beginPath();
    mctx.moveTo(620, 150);
    mctx.lineTo(620, 300);
    mctx.arc(560, 300, 80, 0, Math.PI * 1.2, false);
    mctx.lineTo(560, 450);
    mctx.lineTo(620, 450);
    mctx.stroke();

    const maskData = mctx.getImageData(0, 0, W, H).data;
    const grid = new Uint8Array(W * H);
    const DIRS = [[0, -2], [2, 0], [0, 2], [-2, 0]];

    function isInside(x: number, y: number): boolean {
      const ix = Math.floor(x);
      const iy = Math.floor(y);
      if (ix < 0 || ix >= W || iy < 0 || iy >= H) return false;
      return maskData[(iy * W + ix) * 4] > 200;
    }

    // 电子流系统 - 350条蚂蚁
    const ants = Array.from({ length: 350 }, () => {
      let rx: number, ry: number;
      do {
        rx = 50 + Math.random() * 700;
        ry = 100 + Math.random() * 400;
      } while (!isInside(rx, ry));

      return {
        x: rx,
        y: ry,
        oldX: rx,
        oldY: ry,
        dir: Math.floor(Math.random() * 4),
        hue: 180 + Math.random() * 40,
      };
    });

    let animationFrameId: number;

    function step(time: number) {
      if (!ctx) return;
      const cycle = 4000;
      const progress = (time % cycle) / cycle;
      const intensity = Math.max(0, Math.pow(Math.sin(progress * Math.PI), 1.5) * 1.2 - 0.2);

      // 透明背景下的拖尾实现
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = `rgba(255, 255, 255, ${0.08 + (1 - intensity) * 0.15})`;
      ctx.fillRect(0, 0, W, H);

      // 切回正常绘制模式
      ctx.globalCompositeOperation = "source-over";

      // 增加迭代次数让线条更密集
      const iterations = 3;
      ctx.lineWidth = 1.5;

      for (let n = 0; n < iterations; n++) {
        for (const a of ants) {
          const ix = Math.floor(a.x);
          const iy = Math.floor(a.y);
          const idx = iy * W + ix;

          const state = grid[idx];
          a.dir = (a.dir + (state === 0 ? 1 : 3)) % 4;
          grid[idx] = 1 - state;

          a.oldX = a.x;
          a.oldY = a.y;

          const nx = a.x + DIRS[a.dir][0];
          const ny = a.y + DIRS[a.dir][1];

          if (isInside(nx, ny)) {
            a.x = nx;
            a.y = ny;
          } else {
            a.dir = (a.dir + 2) % 4;
          }

          if (intensity > 0.01) {
            ctx.beginPath();
            ctx.strokeStyle = `hsla(${a.hue}, 100%, 70%, ${intensity})`;
            ctx.moveTo(a.oldX, a.oldY);
            ctx.lineTo(a.x, a.y);
            ctx.stroke();

            // 偶尔绘制焊点
            if (Math.random() > 0.998) {
              ctx.fillStyle = `rgba(255, 255, 255, ${intensity})`;
              ctx.fillRect(a.x - 1, a.y - 1, 2, 2);
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(step);
    }

    animationFrameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: "block", backgroundColor: "transparent" }}
    />
  );
}
