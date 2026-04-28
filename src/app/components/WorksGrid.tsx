"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Work {
  id: number;
  title: string;
  category: string;
  categoryType: string;
  image: string;
}

interface WorksGridProps {
  works: Work[];
}

const categories = [
  { id: "all", label: "全部" },
  { id: "brand", label: "品牌设计" },
  { id: "package", label: "包装设计" },
  { id: "logotype", label: "标志字体" },
  { id: "format", label: "版式视觉" },
];

export default function WorksGrid({ works }: WorksGridProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const filteredWorks =
    activeCategory === "all"
      ? works
      : works.filter((work) => work.categoryType === activeCategory);

  return (
    <div className="h-full flex flex-col">
      {/* 标题 */}
      <div className="px-8 pt-8 pb-4">
        <h2 className="text-xs tracking-[0.3em] text-white/40">作品展示 / WORKS</h2>
      </div>

      {/* 分类标签 */}
      <div className="px-8 pb-6 flex gap-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "text-xs tracking-wider transition-all duration-300 relative pb-1",
              activeCategory === cat.id
                ? "text-white"
                : "text-white/40 hover:text-white/70"
            )}
          >
            {cat.label}
            {activeCategory === cat.id && (
              <span className="absolute bottom-0 left-0 w-full h-px bg-white/60" />
            )}
          </button>
        ))}
      </div>

      {/* 作品网格 */}
      <div className="flex-1 px-8 pb-8 overflow-y-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredWorks.map((work) => (
            <div
              key={work.id}
              className={cn(
                "relative aspect-[4/3] overflow-hidden cursor-pointer transition-all duration-500",
                hoveredId === work.id ? "scale-[1.02]" : ""
              )}
              onMouseEnter={() => setHoveredId(work.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* 图片 */}
              <img
                src={work.image}
                alt={work.title}
                className="w-full h-full object-cover transition-all duration-500"
                style={{
                  filter:
                    hoveredId === work.id ? "brightness(1.1)" : "brightness(0.9)",
                }}
              />

              {/* 悬浮遮罩 */}
              <div
                className={cn(
                  "absolute inset-0 bg-black/40 transition-all duration-300 flex flex-col justify-end p-3",
                  hoveredId === work.id ? "opacity-100" : "opacity-0"
                )}
              >
                <div className="h-[2px] w-4 bg-white/60 mb-2" />
                <p className="text-[10px] text-white/60 tracking-wider">
                  {work.category}
                </p>
                <p className="text-sm text-white font-medium tracking-wider mt-0.5">
                  {work.title}
                </p>
              </div>

              {/* 边框 */}
              <div className="absolute inset-0 border border-white/10 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
