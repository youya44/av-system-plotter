"use client";

import React, { useCallback, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ReactFlowInstance,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useFlowStore, EquipmentNodeData } from "@/store/flow-store";
import { EquipmentNode } from "@/components/nodes/EquipmentNode";
import { CustomEdge } from "@/components/edges/CustomEdge";
import { EquipmentLibrary } from "@/components/panels/EquipmentLibrary";
import { StatusBar } from "@/components/panels/StatusBar";
import { Equipment } from "@/data/types";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

const nodeTypes = {
  equipment: EquipmentNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

export function FlowEditor() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addEquipmentNode,
    projectTitle,
    setProjectTitle,
  } = useFlowStore();

  const reactFlowRef = useRef<HTMLDivElement>(null);
  const rfInstance = useRef<ReactFlowInstance | null>(null);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const data = event.dataTransfer.getData("application/equipment");
      if (!data || !rfInstance.current) return;

      const equipment: Equipment = JSON.parse(data);
      const position = rfInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addEquipmentNode(equipment, position);
    },
    [addEquipmentNode]
  );

  const handleExportPNG = async () => {
    const viewport = document.querySelector(".react-flow__viewport") as HTMLElement;
    if (!viewport) return;
    try {
      const dataUrl = await toPng(viewport, {
        backgroundColor: "#111827",
        quality: 1,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${projectTitle}.png`;
      a.click();
    } catch (err) {
      console.error("PNG export failed:", err);
    }
  };

  const handleExportPDF = async () => {
    const viewport = document.querySelector(".react-flow__viewport") as HTMLElement;
    if (!viewport) return;
    try {
      const dataUrl = await toPng(viewport, {
        backgroundColor: "#111827",
        quality: 1,
      });
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      const pdf = new jsPDF({
        orientation: img.width > img.height ? "landscape" : "portrait",
        unit: "px",
        format: [img.width, img.height],
      });
      pdf.addImage(dataUrl, "PNG", 0, 0, img.width, img.height);
      pdf.save(`${projectTitle}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900 z-10">
        <div className="flex items-center gap-3">
          <div className="text-lg font-bold text-gray-100">
            <span className="text-blue-400">AV</span> System Plotter
          </div>
          <input
            type="text"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            className="px-2 py-1 text-sm text-gray-200 border border-transparent hover:border-gray-600 focus:border-blue-500 rounded outline-none transition-colors bg-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPNG}
            className="px-3 py-1.5 text-xs text-gray-300 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
          >
            PNG
          </button>
          <button
            onClick={handleExportPDF}
            className="px-3 py-1.5 text-xs text-gray-300 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
          >
            PDF
          </button>
        </div>
      </header>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        <EquipmentLibrary />

        <div className="flex-1" ref={reactFlowRef}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={(instance) => {
              rfInstance.current = instance;
            }}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            deleteKeyCode={["Backspace", "Delete"]}
            colorMode="dark"
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#374151" />
            <Controls position="bottom-right" />
            <MiniMap
              position="bottom-right"
              style={{ marginBottom: 60 }}
              nodeColor={(node) => {
                const data = node.data as EquipmentNodeData;
                return data?.equipment?.color || "#888";
              }}
              maskColor="rgba(0,0,0,0.4)"
            />
          </ReactFlow>
        </div>
      </div>

      <StatusBar />
    </div>
  );
}
