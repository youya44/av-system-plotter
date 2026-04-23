"use client";

import React from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  EdgeProps,
} from "@xyflow/react";
import { useFlowStore } from "@/store/flow-store";

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
}: EdgeProps) {
  const deleteEdge = useFlowStore((s) => s.deleteEdge);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 12,
  });

  const mergedStyle = selected
    ? { ...style, strokeWidth: (Number(style.strokeWidth) || 2.5) + 1.5 }
    : style;

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={mergedStyle} markerEnd={markerEnd} />
      {selected && (
        <EdgeLabelRenderer>
          <button
            type="button"
            className="nodrag nopan absolute flex items-center justify-center w-5 h-5 rounded-full bg-gray-900 text-gray-100 border border-gray-600 hover:bg-red-600 hover:border-red-500 text-[11px] leading-none shadow"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "all",
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              deleteEdge(id);
            }}
            title="配線を削除"
          >
            x
          </button>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
