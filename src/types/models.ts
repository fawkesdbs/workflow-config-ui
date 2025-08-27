// Excel Sheet Models
export interface Station {
  Name: string;
  ClassType: string;
  X_Pos: number;
  Y_Pos: number;
  ProcTime: string; // Time format, e.g., "00:05:00"
  WorkerPool: string;
}

export interface Flow {
  Predecessor: string;
  Successor: string;
}

export interface Worker {
  Worker: string;
  Amount: number;
  Shift: string;
  Speed: number;
  Efficiency: number;
  Home_Language: string;
  Scope: string;
  Additional_Services: string;
}

export interface MatInflow {
  SourceName: string;
  Successor: string;
  MU_Type: string;
  Amount: number;
}

export interface MatOutflow {
  Predecessor: string;
  DrainName: string;
}

// Visual Node Types
export type NodeType = 'Station' | 'Source' | 'Drain';

// Data stored within a React Flow node
export interface NodeData {
  label: string;
  // Optional properties (would be configured via UI in a full app)
  ClassType?: string;
  ProcTime?: string;
  WorkerPool?: string;
  MU_Type?: string;
  Amount?: number;
}
