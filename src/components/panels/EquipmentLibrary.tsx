"use client";

import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { equipmentDatabase } from "@/data/equipment";
import {
  EquipmentCategory,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  Equipment,
} from "@/data/types";
import { useFlowStore } from "@/store/flow-store";

const CATEGORY_ORDER: EquipmentCategory[] = [
  "camera",
  "switcher",
  "mixer",
  "microphone",
  "speaker",
  "monitor",
  "output",
  "capture",
  "converter",
  "streaming",
  "recorder",
  "other",
];

export function EquipmentLibrary() {
  const [search, setSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<EquipmentCategory>>(
    new Set(["switcher", "camera", "mixer"])
  );
  const addEquipmentNode = useFlowStore((s) => s.addEquipmentNode);

  const grouped = useMemo(() => {
    const map = new Map<EquipmentCategory, Equipment[]>();
    for (const eq of equipmentDatabase) {
      const lowerSearch = search.toLowerCase();
      if (
        search &&
        !eq.name.toLowerCase().includes(lowerSearch) &&
        !eq.manufacturer.toLowerCase().includes(lowerSearch) &&
        !CATEGORY_LABELS[eq.category].includes(search)
      ) {
        continue;
      }
      if (!map.has(eq.category)) map.set(eq.category, []);
      map.get(eq.category)!.push(eq);
    }
    return map;
  }, [search]);

  const toggleCategory = (cat: EquipmentCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const handleDragStart = (e: React.DragEvent, equipment: Equipment) => {
    e.dataTransfer.setData("application/equipment", JSON.stringify(equipment));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleClick = (equipment: Equipment) => {
    const x = 300 + Math.random() * 200;
    const y = 100 + Math.random() * 300;
    addEquipmentNode(equipment, { x, y });
  };

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
      <div className="p-3 border-b border-gray-800">
        <h2 className="text-sm font-bold text-gray-200 mb-2">機材ライブラリ</h2>
        <Input
          placeholder="機材を検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-sm bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-500"
        />
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {CATEGORY_ORDER.map((cat) => {
            const items = grouped.get(cat);
            if (!items || items.length === 0) return null;
            const isExpanded = expandedCategories.has(cat) || search.length > 0;

            return (
              <div key={cat} className="mb-1">
                <button
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-sm font-semibold text-gray-300 hover:bg-gray-800 rounded transition-colors"
                  onClick={() => toggleCategory(cat)}
                >
                  <span>{CATEGORY_ICONS[cat]}</span>
                  <span className="flex-1">{CATEGORY_LABELS[cat]}</span>
                  <Badge variant="secondary" className="text-[10px] h-5 bg-gray-800 text-gray-400">
                    {items.length}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {isExpanded ? "▼" : "▶"}
                  </span>
                </button>

                {isExpanded && (
                  <div className="ml-2 space-y-0.5">
                    {items.map((eq) => (
                      <div
                        key={eq.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, eq)}
                        onClick={() => handleClick(eq)}
                        className="flex items-center gap-2 px-2 py-1.5 text-xs rounded cursor-grab hover:bg-blue-950/50 active:cursor-grabbing transition-colors border border-transparent hover:border-blue-800"
                        title={`${eq.manufacturer} ${eq.name}\nクリックで配置 / ドラッグ&ドロップ`}
                      >
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: eq.color || "#888" }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-200 truncate">
                            {eq.name}
                          </div>
                          <div className="text-[10px] text-gray-500 truncate">
                            {eq.manufacturer}
                            {eq.subcategory ? ` / ${eq.subcategory}` : ""}
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-600">
                          {eq.ports.length}端子
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <Separator className="my-1 bg-gray-800" />
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="p-2 border-t border-gray-800 text-[10px] text-gray-500 text-center">
        {equipmentDatabase.length}機種収録
      </div>
    </div>
  );
}
