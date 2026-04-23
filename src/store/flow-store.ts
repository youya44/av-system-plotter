import { create } from "zustand";
import {
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  reconnectEdge,
  Connection,
  MarkerType,
} from "@xyflow/react";
import { Equipment, SIGNAL_COLORS, SignalType } from "@/data/types";

export interface EquipmentNodeData {
  equipment: Equipment;
  label: string;
  [key: string]: unknown;
}

interface FlowState {
  nodes: Node[];
  edges: Edge[];
  customEquipment: Equipment[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addEquipmentNode: (equipment: Equipment, position: { x: number; y: number }) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
  reconnectEdge: (oldEdge: Edge, newConnection: Connection) => void;
  addCustomEquipment: (equipment: Equipment) => void;
  projectTitle: string;
  setProjectTitle: (title: string) => void;
}

let nodeIdCounter = 0;

function getEdgeStyle(sourcePortType?: SignalType) {
  const color = sourcePortType ? SIGNAL_COLORS[sourcePortType] : "#888";
  const isDashed = sourcePortType === "wireless" || sourcePortType === "stream";
  return {
    stroke: color,
    strokeWidth: 2.5,
    strokeDasharray: isDashed ? "8 4" : undefined,
  };
}

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  customEquipment: [],
  projectTitle: "新規プロジェクト",

  setProjectTitle: (title: string) => set({ projectTitle: title }),

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection: Connection) => {
    // sourceHandle format: "portId" on the source node
    // Find the source node and port to determine signal type
    const sourceNode = get().nodes.find((n) => n.id === connection.source);
    if (!sourceNode) return;

    const nodeData = sourceNode.data as EquipmentNodeData;
    const sourcePort = nodeData.equipment.ports.find(
      (p) => p.id === connection.sourceHandle
    );

    const signalType = sourcePort?.type;
    const style = getEdgeStyle(signalType);

    const newEdge: Edge = {
      id: `e-${connection.source}-${connection.sourceHandle}-${connection.target}-${connection.targetHandle}`,
      source: connection.source!,
      target: connection.target!,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      type: "custom",
      style,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: style.stroke,
        width: 16,
        height: 16,
      },
      data: {
        signalType,
        label: sourcePort?.label || "",
      },
    };

    set({ edges: [...get().edges, newEdge] });
  },

  addEquipmentNode: (equipment: Equipment, position: { x: number; y: number }) => {
    nodeIdCounter++;
    const newNode: Node = {
      id: `node-${nodeIdCounter}-${Date.now()}`,
      type: "equipment",
      position,
      data: {
        equipment,
        label: equipment.name,
      } as EquipmentNodeData,
    };
    set({ nodes: [...get().nodes, newNode] });
  },

  addCustomEquipment: (equipment: Equipment) => {
    set({ customEquipment: [...get().customEquipment, equipment] });
  },

  deleteNode: (nodeId: string) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId
      ),
    });
  },

  deleteEdge: (edgeId: string) => {
    set({ edges: get().edges.filter((e) => e.id !== edgeId) });
  },

  reconnectEdge: (oldEdge: Edge, newConnection: Connection) => {
    // Re-derive style from the new source port so color/dash follow the new signal
    const sourceNode = get().nodes.find((n) => n.id === newConnection.source);
    const nodeData = sourceNode?.data as EquipmentNodeData | undefined;
    const sourcePort = nodeData?.equipment.ports.find(
      (p) => p.id === newConnection.sourceHandle
    );
    const signalType = sourcePort?.type;
    const style = getEdgeStyle(signalType);

    const rebuilt: Edge = {
      ...oldEdge,
      style,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: style.stroke,
        width: 16,
        height: 16,
      },
      data: {
        signalType,
        label: sourcePort?.label || "",
      },
    };

    set({ edges: reconnectEdge(rebuilt, newConnection, get().edges) });
  },
}));
