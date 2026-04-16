"use client";

import React, { useMemo, useState } from "react";
import { useFlowStore, EquipmentNodeData } from "@/store/flow-store";
import { SIGNAL_COLORS, SIGNAL_LABELS, SignalType } from "@/data/types";
import { Badge } from "@/components/ui/badge";

interface CableItem {
  signalType: SignalType;
  from: string;
  fromPort: string;
  to: string;
  toPort: string;
}

export function StatusBar() {
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const [showList, setShowList] = useState<"none" | "equipment" | "cable">("none");

  const equipmentList = useMemo(() => {
    const counts = new Map<string, { name: string; manufacturer: string; count: number }>();
    for (const node of nodes) {
      const data = node.data as EquipmentNodeData;
      const key = data.equipment.id;
      const existing = counts.get(key);
      if (existing) {
        existing.count++;
      } else {
        counts.set(key, {
          name: data.equipment.name,
          manufacturer: data.equipment.manufacturer,
          count: 1,
        });
      }
    }
    return Array.from(counts.values());
  }, [nodes]);

  const cableList = useMemo<CableItem[]>(() => {
    return edges.map((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);
      const sourceData = sourceNode?.data as EquipmentNodeData | undefined;
      const targetData = targetNode?.data as EquipmentNodeData | undefined;
      const sourcePort = sourceData?.equipment.ports.find((p) => p.id === edge.sourceHandle);
      const targetPort = targetData?.equipment.ports.find((p) => p.id === edge.targetHandle);

      return {
        signalType: (edge.data?.signalType as SignalType) || "hdmi",
        from: sourceData?.equipment.name || "?",
        fromPort: sourcePort?.label || "?",
        to: targetData?.equipment.name || "?",
        toPort: targetPort?.label || "?",
      };
    });
  }, [edges, nodes]);

  const handleExportCSV = () => {
    let csv = "種別,項目,メーカー/信号,FROM,TO,数量\n";
    for (const eq of equipmentList) {
      csv += `機材,${eq.name},${eq.manufacturer},,,${eq.count}\n`;
    }
    for (const cable of cableList) {
      csv += `ケーブル,${SIGNAL_LABELS[cable.signalType]},${cable.signalType},${cable.from}(${cable.fromPort}),${cable.to}(${cable.toPort}),1\n`;
    }
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "equipment-list.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="border-t border-gray-800 bg-gray-900">
      {/* Expandable lists */}
      {showList !== "none" && (
        <div className="max-h-48 overflow-auto border-b border-gray-800 p-3">
          {showList === "equipment" && (
            <div>
              <h3 className="text-xs font-bold text-gray-300 mb-2">機材リスト</h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-700">
                    <th className="text-left py-1">機材名</th>
                    <th className="text-left py-1">メーカー</th>
                    <th className="text-right py-1">数量</th>
                  </tr>
                </thead>
                <tbody>
                  {equipmentList.map((eq, i) => (
                    <tr key={i} className="border-b border-gray-800">
                      <td className="py-1 font-medium text-gray-200">{eq.name}</td>
                      <td className="py-1 text-gray-400">{eq.manufacturer}</td>
                      <td className="py-1 text-right text-gray-300">{eq.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {equipmentList.length === 0 && (
                <p className="text-gray-500 text-xs mt-2">機材がまだ配置されていません</p>
              )}
            </div>
          )}
          {showList === "cable" && (
            <div>
              <h3 className="text-xs font-bold text-gray-300 mb-2">ケーブルリスト</h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-700">
                    <th className="text-left py-1">種別</th>
                    <th className="text-left py-1">FROM</th>
                    <th className="text-left py-1">TO</th>
                  </tr>
                </thead>
                <tbody>
                  {cableList.map((cable, i) => (
                    <tr key={i} className="border-b border-gray-800">
                      <td className="py-1">
                        <Badge
                          variant="secondary"
                          className="text-[10px]"
                          style={{
                            backgroundColor: SIGNAL_COLORS[cable.signalType] + "30",
                            color: SIGNAL_COLORS[cable.signalType],
                          }}
                        >
                          {SIGNAL_LABELS[cable.signalType]}
                        </Badge>
                      </td>
                      <td className="py-1 text-gray-300">
                        {cable.from} ({cable.fromPort})
                      </td>
                      <td className="py-1 text-gray-300">
                        {cable.to} ({cable.toPort})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {cableList.length === 0 && (
                <p className="text-gray-500 text-xs mt-2">接続がまだありません</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-400">
        <div className="flex items-center gap-4">
          <button
            className={`hover:text-blue-400 transition-colors ${showList === "equipment" ? "text-blue-400 font-bold" : ""}`}
            onClick={() => setShowList(showList === "equipment" ? "none" : "equipment")}
          >
            機材: {nodes.length}台
          </button>
          <button
            className={`hover:text-blue-400 transition-colors ${showList === "cable" ? "text-blue-400 font-bold" : ""}`}
            onClick={() => setShowList(showList === "cable" ? "none" : "cable")}
          >
            ケーブル: {edges.length}本
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300 transition-colors"
            onClick={handleExportCSV}
          >
            CSV出力
          </button>
        </div>
      </div>
    </div>
  );
}
