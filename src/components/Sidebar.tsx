import React from "react";
import type { NodeType } from "../types/models";

const DraggableNode: React.FC<{
  type: NodeType;
  label: string;
  colorClass: string;
}> = ({ type, label, colorClass }) => {
  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: NodeType
  ) => {
    // Set data that the drop target (React Flow canvas) will recognize
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      className={`p-3 mb-3 text-sm font-medium border-2 rounded cursor-move shadow-md transition hover:shadow-lg ${colorClass}`}
      onDragStart={(event) => onDragStart(event, type)}
      draggable
    >
      {label}
    </div>
  );
};

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-gray-50 p-4 border-r border-gray-300">
      <div className="text-lg font-semibold mb-5 text-gray-700">
        Node Palette
      </div>

      <DraggableNode
        type="Source"
        label="Material Source (Inflow)"
        colorClass="bg-green-100 border-green-500 text-green-800"
      />
      <DraggableNode
        type="Station"
        label="Process Station"
        colorClass="bg-blue-100 border-blue-500 text-blue-800"
      />
      <DraggableNode
        type="Drain"
        label="Material Drain (Outflow)"
        colorClass="bg-red-100 border-red-500 text-red-800"
      />

      <div className="mt-8 pt-4 border-t text-xs text-gray-500">
        Drag items onto the canvas and connect them using the handles.
      </div>
    </aside>
  );
};

export default Sidebar;
