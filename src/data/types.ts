// 信号タイプ
export type SignalType =
  | "hdmi"
  | "sdi"
  | "usb"
  | "xlr"
  | "trs"
  | "mini35"
  | "ethernet"
  | "dmx"
  | "thunderbolt"
  | "wireless"
  | "stream"
  | "speaker";

// 端子の方向
export type PortDirection = "input" | "output";

// コネクタの物理形状
export type ConnectorType =
  | "hdmi-a"
  | "hdmi-c"
  | "hdmi-d"
  | "bnc"
  | "xlr-m"
  | "xlr-f"
  | "trs-635"
  | "trs-35"
  | "usb-c"
  | "usb-a"
  | "rj45"
  | "sfp"
  | "xlr5-m"
  | "xlr5-f"
  | "thunderbolt"
  | "speaker-terminal"
  | "speakon"
  | "rca"
  | "none"; // ワイヤレスや配信先など

// 機材カテゴリ
export type EquipmentCategory =
  | "switcher"
  | "mixer"
  | "camera"
  | "monitor"
  | "output"
  | "capture"
  | "streaming"
  | "microphone"
  | "speaker"
  | "recorder"
  | "converter"
  | "other";

// 端子定義
export interface Port {
  id: string;
  label: string;
  type: SignalType;
  direction: PortDirection;
  connector: ConnectorType;
  protocol?: string; // "uvc", "ndi", "dante", "artnet" etc.
}

// 機材定義
export interface Equipment {
  id: string;
  name: string;
  manufacturer: string;
  category: EquipmentCategory;
  subcategory?: string;
  ports: Port[];
  color?: string; // ノードのアクセントカラー
  description?: string;
}

// 信号タイプの色定義
export const SIGNAL_COLORS: Record<SignalType, string> = {
  hdmi: "#3B82F6",
  sdi: "#8B5CF6",
  usb: "#6B7280",
  xlr: "#10B981",
  trs: "#059669",
  mini35: "#34D399",
  ethernet: "#F59E0B",
  dmx: "#EF4444",
  thunderbolt: "#6366F1",
  wireless: "#EC4899",
  stream: "#06B6D4",
  speaker: "#F97316",
};

// 信号タイプの日本語ラベル
export const SIGNAL_LABELS: Record<SignalType, string> = {
  hdmi: "HDMI",
  sdi: "SDI",
  usb: "USB",
  xlr: "XLR",
  trs: "TRS",
  mini35: "3.5mm",
  ethernet: "Ethernet",
  dmx: "DMX",
  thunderbolt: "Thunderbolt",
  wireless: "ワイヤレス",
  stream: "配信",
  speaker: "スピーカー",
};

// カテゴリの日本語ラベル
export const CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  switcher: "スイッチャー",
  mixer: "ミキサー",
  camera: "カメラ",
  monitor: "モニター",
  output: "アウトプット",
  capture: "キャプチャー",
  streaming: "配信先",
  microphone: "マイク",
  speaker: "スピーカー",
  recorder: "レコーダー",
  converter: "変換器",
  other: "その他",
};

// カテゴリのアイコン(emoji)
export const CATEGORY_ICONS: Record<EquipmentCategory, string> = {
  switcher: "🎛️",
  mixer: "🎚️",
  camera: "📹",
  monitor: "🖥️",
  output: "📺",
  capture: "⬇️",
  streaming: "📡",
  microphone: "🎤",
  speaker: "🔊",
  recorder: "⏺️",
  converter: "🔄",
  other: "📦",
};
