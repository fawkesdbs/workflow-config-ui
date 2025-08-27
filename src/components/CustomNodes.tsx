import React, { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";

const commonNodeClass =
  "p-3 border-2 rounded-md w-40 text-center shadow-md transition-all duration-150";

const getSelectedClasses = (selected: boolean | undefined) =>
  selected ? "border-indigo-600 shadow-lg ring-2 ring-indigo-400" : "";

export const SourceNode: React.FC<NodeProps> = memo(({ data, selected }) => {
  return (
    <div
      className={`${commonNodeClass} bg-green-100 border-green-500 text-green-800 ${getSelectedClasses(
        selected
      )}`}
    >
      {data.label}
      <Handle type="source" position={Position.Right} />
    </div>
  );
});
SourceNode.displayName = "SourceNode";

export const DrainNode: React.FC<NodeProps> = memo(({ data, selected }) => {
  return (
    <div
      className={`${commonNodeClass} bg-red-100 border-red-500 text-red-800 ${getSelectedClasses(
        selected
      )}`}
    >
      {data.label}
      <Handle type="target" position={Position.Left} />
    </div>
  );
});
DrainNode.displayName = "DrainNode";

export const StationNode: React.FC<NodeProps> = memo(({ data, selected }) => {
  return (
    <div
      className={`${commonNodeClass} bg-blue-100 border-blue-500 text-blue-800 ${getSelectedClasses(
        selected
      )}`}
    >
      <Handle type="target" position={Position.Left} id="a" />
      {data.label}
      <Handle type="source" position={Position.Right} id="b" />
    </div>
  );
});
StationNode.displayName = "StationNode";