"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { SIGNAL_COLORS, CATEGORY_ICONS } from "@/data/types";
import type { EquipmentNodeData } from "@/store/flow-store";
import { useFlowStore } from "@/store/flow-store";

function EquipmentNodeComponent({ id, data }: NodeProps) {
  const { equipment } = data as EquipmentNodeData;
  const deleteNode = useFlowStore((s) => s.deleteNode);

  const inputPorts = equipment.ports.filter((p) => p.direction === "input");
  const outputPorts = equipment.ports.filter((p) => p.direction === "output");
  const maxPorts = Math.max(inputPorts.length, outputPorts.length, 1);

  return (
    <div
      className="relative bg-gray-800 border-2 rounded-lg shadow-lg shadow-black/30 min-w-[180px] select-none"
      style={{ borderColor: equipment.color || "#555" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between gap-2 px-3 py-2 rounded-t-md text-white text-xs font-bold"
        style={{ backgroundColor: equipment.color || "#555" }}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm">{CATEGORY_ICONS[equipment.category]}</span>
          <div className="min-w-0">
            <div className="truncate text-[11px] font-bold leading-tight">{equipment.name}</div>
            <div className="truncate text-[9px] opacity-75 leading-tight">{equipment.manufacturer}</div>
          </div>
        </div>
        <button
          className="shrink-0 w-4 h-4 flex items-center justify-center rounded-full bg-white/20 hover:bg-red-500 text-[10px] leading-none transition-colors"
          onClick={() => deleteNode(id)}
          title="削除"
        >
          x
        </button>
      </div>

      {/* Ports */}
      <div className="px-1 py-1.5" style={{ minHeight: maxPorts * 24 + 8 }}>
        {/* Input ports (left) */}
        <div className="absolute left-0 top-[40px] flex flex-col gap-1">
          {inputPorts.map((port) => (
            <div key={port.id} className="relative flex items-center h-5">
              <Handle
                type="target"
                position={Position.Left}
                id={port.id}
                className="!w-3 !h-3 !border-2 !border-gray-800 !-left-1.5"
                style={{
                  backgroundColor: SIGNAL_COLORS[port.type],
                  top: "50%",
                  transform: "translateY(-50%)",
                  position: "relative",
                }}
              />
              <span className="ml-2 text-[10px] text-gray-400 whitespace-nowrap">
                {port.label}
              </span>
            </div>
          ))}
        </div>

        {/* Output ports (right) */}
        <div className="absolute right-0 top-[40px] flex flex-col gap-1">
          {outputPorts.map((port) => (
            <div key={port.id} className="relative flex items-center justify-end h-5">
              <span className="mr-2 text-[10px] text-gray-400 whitespace-nowrap">
                {port.label}
              </span>
              <Handle
                type="source"
                position={Position.Right}
                id={port.id}
                className="!w-3 !h-3 !border-2 !border-gray-800 !-right-1.5"
                style={{
                  backgroundColor: SIGNAL_COLORS[port.type],
                  top: "50%",
                  transform: "translateY(-50%)",
                  position: "relative",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const EquipmentNode = memo(EquipmentNodeComponent);
