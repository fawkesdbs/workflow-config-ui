import React, { useState, useRef, useCallback } from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  type Connection,
  type Node,
  type ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css"; // Essential styles for React Flow

import Sidebar from "./components/Sidebar";
import { exportToExcel } from "./utils/excelUtils";
import type { NodeData, NodeType } from "./types/models";

// Simple ID generator
let id = 1;
const getId = () => `node_${id++}`;

const App: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Enable dropping onto the canvas
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (!reactFlowInstance) return;

      // Retrieve the node type set in the Sidebar
      const type = event.dataTransfer.getData(
        "application/reactflow"
      ) as NodeType;

      if (typeof type === "undefined" || !type) {
        return;
      }

      // Calculate position relative to the canvas
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Define visualization styles (optional, but helpful)
      const getStyle = (type: NodeType) => {
        switch (type) {
          case "Source":
            return { background: "#f0fdf4", border: "2px solid #4ade80" };
          case "Drain":
            return { background: "#fef2f2", border: "2px solid #f87171" };
          case "Station":
          default:
            return { background: "#eff6ff", border: "2px solid #60a5fa" };
        }
      };

      const newNode: Node<NodeData> = {
        id: getId(),
        type, // Important: Store the logical type (Station, Source, Drain)
        position,
        data: { label: `${type} ${id - 1}` },
        style: getStyle(type),
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const handleExport = () => {
    exportToExcel(nodes, edges);
  };

  return (
    <div className="flex h-full flex-col bg-gray-800">
      <header className="p-4 bg-gray-800 text-white shadow-md flex justify-between items-center z-10">
        <h1 className="text-xl font-bold">Visual Workflow Config Generator</h1>
        <button
          onClick={handleExport}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded transition duration-150"
        >
          Export Config.xlsx
        </button>
      </header>
      <div className="flex flex-1 overflow-hidden">
        {/* ReactFlowProvider is necessary for the DnD setup and context */}
        <ReactFlowProvider>
          <Sidebar />
          <div className="flex-1 relative" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              // nodeTypes={nodeTypes}
              fitView
            >
              <Controls />
              <MiniMap />
              <Background gap={16} size={1} />
            </ReactFlow>
          </div>
        </ReactFlowProvider>
      </div>
    </div>
  );
};

export default App;
