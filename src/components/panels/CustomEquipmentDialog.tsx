"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Equipment,
  EquipmentCategory,
  Port,
  SignalType,
  PortDirection,
  ConnectorType,
  CATEGORY_LABELS,
  SIGNAL_LABELS,
  SIGNAL_COLORS,
} from "@/data/types";

interface Props {
  onAdd: (equipment: Equipment) => void;
}

const SIGNAL_OPTIONS: SignalType[] = [
  "hdmi", "sdi", "usb", "xlr", "trs", "mini35", "ethernet", "dmx", "thunderbolt", "speaker",
];

const CONNECTOR_OPTIONS: { value: ConnectorType; label: string; signalTypes: SignalType[] }[] = [
  { value: "hdmi-a", label: "HDMI Type-A", signalTypes: ["hdmi"] },
  { value: "hdmi-c", label: "HDMI Mini (Type-C)", signalTypes: ["hdmi"] },
  { value: "hdmi-d", label: "HDMI Micro (Type-D)", signalTypes: ["hdmi"] },
  { value: "bnc", label: "BNC", signalTypes: ["sdi"] },
  { value: "xlr-f", label: "XLR (メス)", signalTypes: ["xlr", "dmx"] },
  { value: "xlr-m", label: "XLR (オス)", signalTypes: ["xlr", "dmx"] },
  { value: "trs-635", label: "6.3mm TRS", signalTypes: ["trs"] },
  { value: "trs-35", label: "3.5mm ミニ", signalTypes: ["mini35", "trs"] },
  { value: "usb-c", label: "USB-C", signalTypes: ["usb", "thunderbolt"] },
  { value: "usb-a", label: "USB-A", signalTypes: ["usb"] },
  { value: "rj45", label: "RJ45", signalTypes: ["ethernet"] },
  { value: "speakon", label: "Speakon", signalTypes: ["speaker"] },
  { value: "speaker-terminal", label: "スピーカー端子", signalTypes: ["speaker"] },
  { value: "rca", label: "RCA", signalTypes: ["trs"] },
  { value: "none", label: "なし (ソフトウェア等)", signalTypes: ["hdmi", "sdi", "usb", "xlr", "trs", "mini35", "ethernet", "dmx", "thunderbolt", "speaker"] },
];

const CATEGORY_OPTIONS: EquipmentCategory[] = [
  "switcher", "mixer", "camera", "monitor", "output", "capture",
  "streaming", "microphone", "speaker", "recorder", "converter", "cable", "other",
];

function getDefaultConnector(signalType: SignalType, direction: PortDirection): ConnectorType {
  const map: Record<string, ConnectorType> = {
    hdmi: "hdmi-a",
    sdi: "bnc",
    usb: "usb-c",
    xlr: direction === "input" ? "xlr-f" : "xlr-m",
    trs: "trs-635",
    mini35: "trs-35",
    ethernet: "rj45",
    dmx: direction === "input" ? "xlr-f" : "xlr-m",
    thunderbolt: "usb-c",
    speaker: "speakon",
    wireless: "none",
    stream: "none",
  };
  return map[signalType] || "none";
}

export function CustomEquipmentDialog({ onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [category, setCategory] = useState<EquipmentCategory>("other");
  const [ports, setPorts] = useState<Port[]>([]);

  // New port form
  const [newPortLabel, setNewPortLabel] = useState("");
  const [newPortType, setNewPortType] = useState<SignalType>("xlr");
  const [newPortDirection, setNewPortDirection] = useState<PortDirection>("input");
  const [newPortConnector, setNewPortConnector] = useState<ConnectorType>("xlr-f");

  const addPort = () => {
    if (!newPortLabel.trim()) return;
    const port: Port = {
      id: `custom_${ports.length}_${Date.now()}`,
      label: newPortLabel.trim(),
      type: newPortType,
      direction: newPortDirection,
      connector: newPortConnector,
    };
    setPorts([...ports, port]);
    setNewPortLabel("");
  };

  const removePort = (index: number) => {
    setPorts(ports.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!name.trim() || ports.length === 0) return;
    const equipment: Equipment = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      manufacturer: manufacturer.trim() || "カスタム",
      category,
      color: "#6B7280",
      ports,
    };
    onAdd(equipment);
    // Reset
    setName("");
    setManufacturer("");
    setCategory("other");
    setPorts([]);
    setOpen(false);
  };

  const handleSignalTypeChange = (value: SignalType) => {
    setNewPortType(value);
    setNewPortConnector(getDefaultConnector(value, newPortDirection));
  };

  const handleDirectionChange = (value: PortDirection) => {
    setNewPortDirection(value);
    setNewPortConnector(getDefaultConnector(newPortType, value));
  };

  // Quick-add presets
  const quickAddPorts = (presetPorts: Port[]) => {
    setPorts([...ports, ...presetPorts]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<button className="w-full px-3 py-2 text-xs text-blue-400 hover:bg-blue-950/30 border border-dashed border-blue-800 rounded transition-colors" />}
      >
        + カスタム機材を作成
      </DialogTrigger>
      <DialogContent className="max-w-lg bg-gray-900 border-gray-700 text-gray-100 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gray-100">カスタム機材を作成</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-400">機材名 *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: 会場ミキサー"
                className="bg-gray-800 border-gray-700 text-gray-200 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-400">メーカー</Label>
              <Input
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="例: 会場設備"
                className="bg-gray-800 border-gray-700 text-gray-200 text-sm"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs text-gray-400">カテゴリ</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as EquipmentCategory)}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-200 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {CATEGORY_OPTIONS.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-gray-200 text-sm">
                    {CATEGORY_LABELS[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quick-add presets */}
          <div>
            <Label className="text-xs text-gray-400 mb-1 block">クイック追加</Label>
            <div className="flex flex-wrap gap-1">
              <button
                className="px-2 py-1 text-[10px] bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-colors"
                onClick={() => quickAddPorts([
                  { id: `q_xlr_in_${Date.now()}`, label: "XLR IN", type: "xlr", direction: "input", connector: "xlr-f" },
                ])}
              >
                +XLR IN
              </button>
              <button
                className="px-2 py-1 text-[10px] bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-colors"
                onClick={() => quickAddPorts([
                  { id: `q_xlr_out_${Date.now()}`, label: "XLR OUT", type: "xlr", direction: "output", connector: "xlr-m" },
                ])}
              >
                +XLR OUT
              </button>
              <button
                className="px-2 py-1 text-[10px] bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-colors"
                onClick={() => quickAddPorts([
                  { id: `q_hdmi_in_${Date.now()}`, label: "HDMI IN", type: "hdmi", direction: "input", connector: "hdmi-a" },
                ])}
              >
                +HDMI IN
              </button>
              <button
                className="px-2 py-1 text-[10px] bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-colors"
                onClick={() => quickAddPorts([
                  { id: `q_hdmi_out_${Date.now()}`, label: "HDMI OUT", type: "hdmi", direction: "output", connector: "hdmi-a" },
                ])}
              >
                +HDMI OUT
              </button>
              <button
                className="px-2 py-1 text-[10px] bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-colors"
                onClick={() => quickAddPorts([
                  { id: `q_usb_out_${Date.now()}`, label: "USB-C", type: "usb", direction: "output", connector: "usb-c" },
                ])}
              >
                +USB-C OUT
              </button>
              <button
                className="px-2 py-1 text-[10px] bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-colors"
                onClick={() => quickAddPorts([
                  { id: `q_trs_in_${Date.now()}`, label: "6.3mm IN", type: "trs", direction: "input", connector: "trs-635" },
                ])}
              >
                +TRS IN
              </button>
              <button
                className="px-2 py-1 text-[10px] bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-colors"
                onClick={() => quickAddPorts([
                  { id: `q_35_in_${Date.now()}`, label: "3.5mm IN", type: "mini35", direction: "input", connector: "trs-35" },
                ])}
              >
                +3.5mm IN
              </button>
              <button
                className="px-2 py-1 text-[10px] bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-colors"
                onClick={() => quickAddPorts([
                  { id: `q_sdi_in_${Date.now()}`, label: "SDI IN", type: "sdi", direction: "input", connector: "bnc" },
                ])}
              >
                +SDI IN
              </button>
              <button
                className="px-2 py-1 text-[10px] bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-colors"
                onClick={() => quickAddPorts([
                  { id: `q_sdi_out_${Date.now()}`, label: "SDI OUT", type: "sdi", direction: "output", connector: "bnc" },
                ])}
              >
                +SDI OUT
              </button>
            </div>
          </div>

          {/* Port list */}
          <div>
            <Label className="text-xs text-gray-400 mb-1 block">
              端子一覧 ({ports.length})
            </Label>
            {ports.length > 0 && (
              <div className="space-y-1 mb-3 max-h-32 overflow-y-auto">
                {ports.map((port, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-2 py-1 bg-gray-800 rounded text-xs"
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: SIGNAL_COLORS[port.type] }}
                    />
                    <span className="text-gray-300 flex-1">{port.label}</span>
                    <Badge
                      variant="secondary"
                      className="text-[9px] h-4"
                      style={{
                        backgroundColor: SIGNAL_COLORS[port.type] + "25",
                        color: SIGNAL_COLORS[port.type],
                      }}
                    >
                      {SIGNAL_LABELS[port.type]}
                    </Badge>
                    <span className="text-[10px] text-gray-500">
                      {port.direction === "input" ? "IN" : "OUT"}
                    </span>
                    <button
                      className="text-gray-500 hover:text-red-400 text-[10px] transition-colors"
                      onClick={() => removePort(i)}
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add port form */}
          <div className="p-3 bg-gray-800/50 rounded border border-gray-700 space-y-2">
            <div className="text-[10px] text-gray-500 font-bold uppercase">端子を追加</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Input
                  value={newPortLabel}
                  onChange={(e) => setNewPortLabel(e.target.value)}
                  placeholder="ラベル (例: CH 1)"
                  className="bg-gray-800 border-gray-600 text-gray-200 text-xs h-8"
                  onKeyDown={(e) => e.key === "Enter" && addPort()}
                />
              </div>
              <div>
                <Select value={newPortDirection} onValueChange={(v) => handleDirectionChange(v as PortDirection)}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-gray-200 text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="input" className="text-gray-200 text-xs">入力 (IN)</SelectItem>
                    <SelectItem value="output" className="text-gray-200 text-xs">出力 (OUT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={newPortType} onValueChange={(v) => handleSignalTypeChange(v as SignalType)}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-gray-200 text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {SIGNAL_OPTIONS.map((sig) => (
                      <SelectItem key={sig} value={sig} className="text-gray-200 text-xs">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: SIGNAL_COLORS[sig] }} />
                          {SIGNAL_LABELS[sig]}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={newPortConnector} onValueChange={(v) => setNewPortConnector(v as ConnectorType)}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-gray-200 text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {CONNECTOR_OPTIONS.filter(
                      (c) => c.signalTypes.includes(newPortType) || c.value === "none"
                    ).map((c) => (
                      <SelectItem key={c.value} value={c.value} className="text-gray-200 text-xs">
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="w-full text-xs bg-gray-700 hover:bg-gray-600 text-gray-200"
              onClick={addPort}
              disabled={!newPortLabel.trim()}
            >
              端子を追加
            </Button>
          </div>

          {/* Submit */}
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleSubmit}
            disabled={!name.trim() || ports.length === 0}
          >
            機材を作成してライブラリに追加
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
