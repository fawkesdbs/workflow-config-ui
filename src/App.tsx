import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  type Connection,
  type Node,
  type Edge,
  type ReactFlowInstance,
  type OnSelectionChangeParams,
  type NodeChange,
  type EdgeChange,
} from "reactflow";
import "reactflow/dist/style.css";

import Sidebar from "./components/Sidebar";
import NodePopover from "./components/NodePopover";
import WorkersPanel from "./components/WorkersPanel";
import { exportToExcel } from "./utils/excelUtils";
import type { NodeData, NodeType, Worker } from "./types/models";
import { SourceNode, DrainNode, StationNode } from "./components/CustomNodes";
import { useHistory } from "./hooks/useHistory";
import { useClipboard } from "./hooks/useClipboard";

const toSnakeCase = (str: string) => {
  return str.replace(/[\s_]+/g, "_");
};

const LOCAL_STORAGE_KEY = "workflow-app-state";

const loadState = () => {
  try {
    const serializedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (serializedState === null) {
      return { nodes: [], edges: [], workers: [] };
    }
    const parsed = JSON.parse(serializedState);
    return {
      nodes: parsed.nodes || [],
      edges: parsed.edges || [],
      workers: parsed.workers || [],
    };
  } catch (error) {
    console.error("Could not load state from local storage", error);
    return { nodes: [], edges: [], workers: [] };
  }
};

const App: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [savedState] = useState(loadState);

  // Initialize the ID counter based on the highest existing node ID
  const latestId = useRef(
    savedState.nodes.reduce((maxId: number, node: Node) => {
      const nodeIdNum = parseInt(node.id.split("_")[1], 10);
      return nodeIdNum > maxId ? nodeIdNum : maxId;
    }, 0)
  );

  const getId = () => `node_${++latestId.current}`;

  const [nodes, setNodes, onNodesChangeHandler] = useNodesState(
    savedState.nodes
  );
  const [edges, setEdges, onEdgesChangeHandler] = useEdgesState(
    savedState.edges
  );
  const [workers, setWorkers] = useState<Worker[]>(savedState.workers);

  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const [selectedElements, setSelectedElements] = useState<{
    nodes: Node[];
    edges: Edge[];
  } | null>(null);
  const [workersPanelOpen, setWorkersPanelOpen] = useState(false);

  const { addHistory, undo, redo, canUndo, canRedo } = useHistory(
    { nodes: savedState.nodes, edges: savedState.edges },
    setNodes,
    setEdges
  );
  const { copy, cut, paste, duplicate } = useClipboard();

  useEffect(() => {
    const stateToSave = { nodes, edges, workers };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
  }, [nodes, edges, workers]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const nextNodes = applyNodeChanges(changes, nodes);
      const isSignificantChange = changes.some(
        (change) =>
          change.type !== "position" ||
          (change.type === "position" && !change.dragging)
      );
      if (isSignificantChange) {
        addHistory(nextNodes, edges);
      }
      onNodesChangeHandler(changes);
    },
    [nodes, edges, addHistory, onNodesChangeHandler]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const nextEdges = applyEdgeChanges(changes, edges);
      addHistory(nodes, nextEdges);
      onEdgesChangeHandler(changes);
    },
    [nodes, edges, addHistory, onEdgesChangeHandler]
  );

  const nodeTypes = useMemo(
    () => ({
      Source: SourceNode,
      Drain: DrainNode,
      Station: StationNode,
    }),
    []
  );

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) => {
        const newEdges = addEdge(params, eds);
        addHistory(nodes, newEdges);
        return newEdges;
      }),
    [setEdges, addHistory, nodes]
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!reactFlowInstance) return;
      const type = event.dataTransfer.getData(
        "application/reactflow"
      ) as NodeType;
      if (typeof type === "undefined" || !type) return;
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode: Node<NodeData> = {
        id: getId(),
        type,
        position,
        data: { label: `${type}_${latestId.current}` },
      };
      setNodes((nds) => {
        const newNodes = nds.concat(newNode);
        addHistory(newNodes, edges);
        return newNodes;
      });
    },
    [reactFlowInstance, setNodes, addHistory, edges]
  );

  const handleSaveNode = (nodeId: string, data: NodeData) => {
    data.label = toSnakeCase(data.label);
    setNodes((nds) => {
      const newNodes = nds.map((node) => {
        if (node.id === nodeId) {
          node.data = { ...node.data, ...data };
        }
        return node;
      });
      addHistory(newNodes, edges);
      return newNodes;
    });
  };

  const onSelectionChange = useCallback(
    ({ nodes, edges }: OnSelectionChangeParams) => {
      setSelectedElements({ nodes, edges });
    },
    []
  );

  const handleDelete = useCallback(() => {
    if (selectedElements) {
      const nodeIds = selectedElements.nodes.map((n) => n.id);
      const edgeIds = selectedElements.edges.map((e) => e.id);
      setNodes((nds) => {
        const newNodes = nds.filter((n) => !nodeIds.includes(n.id));
        setEdges((eds) => {
          const newEdges = eds.filter((e) => !edgeIds.includes(e.id));
          addHistory(newNodes, newEdges);
          return newEdges;
        });
        return newNodes;
      });
    }
  }, [selectedElements, setNodes, setEdges, addHistory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete") {
        handleDelete();
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "z":
            undo();
            break;
          case "y":
            redo();
            break;
          case "c":
            if (selectedElements)
              copy(selectedElements.nodes, selectedElements.edges);
            break;
          case "x":
            if (selectedElements)
              cut(
                selectedElements.nodes,
                selectedElements.edges,
                setNodes,
                setEdges
              );
            break;
          case "v":
            paste(setNodes, setEdges);
            break;
          case "d":
            e.preventDefault();
            if (selectedElements?.nodes)
              duplicate(selectedElements.nodes, setNodes);
            break;
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedElements,
    undo,
    redo,
    copy,
    cut,
    paste,
    duplicate,
    setNodes,
    setEdges,
    handleDelete,
  ]);

  return (
    <div className="flex h-full flex-col bg-gray-800">
      <header className="p-4 bg-gray-800 text-white shadow-md flex justify-between items-center z-20">
        <h1 className="text-xl font-bold">Visual Workflow Config Generator</h1>
        <div>
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-2 disabled:opacity-50"
          >
            Undo
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-2 disabled:opacity-50"
          >
            Redo
          </button>
          <button
            onClick={() =>
              selectedElements &&
              copy(selectedElements.nodes, selectedElements.edges)
            }
            className="p-2"
          >
            Copy
          </button>
          <button
            onClick={() =>
              selectedElements &&
              cut(
                selectedElements.nodes,
                selectedElements.edges,
                setNodes,
                setEdges
              )
            }
            className="p-2"
          >
            Cut
          </button>
          <button onClick={() => paste(setNodes, setEdges)} className="p-2">
            Paste
          </button>
          <button
            onClick={() =>
              selectedElements?.nodes &&
              duplicate(selectedElements.nodes, setNodes)
            }
            className="p-2"
          >
            Duplicate
          </button>
          <button
            onClick={() => setWorkersPanelOpen(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-5 rounded transition duration-150 mx-4"
          >
            Edit Workers
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded"
          >
            Delete
          </button>
          <button
            onClick={() => exportToExcel(nodes, edges, workers)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded ml-4"
          >
            Export
          </button>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
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
              onDrop={(e) => onDrop(e)}
              onDragOver={(e) => e.preventDefault()}
              onNodeDoubleClick={(_, node) => {
                setSelectedNode(node);
                setPopoverOpen(true);
              }}
              onSelectionChange={onSelectionChange}
              nodeTypes={nodeTypes}
              fitView
              multiSelectionKeyCode="Shift"
              selectNodesOnDrag={false}
            >
              <Controls />
              <MiniMap />
              <Background gap={16} size={1} />
            </ReactFlow>
          </div>
        </ReactFlowProvider>
      </div>
      <NodePopover
        node={selectedNode}
        isOpen={popoverOpen}
        onClose={() => setPopoverOpen(false)}
        onSave={handleSaveNode}
      />
      <WorkersPanel
        isOpen={workersPanelOpen}
        onClose={() => setWorkersPanelOpen(false)}
        workers={workers}
        setWorkers={setWorkers}
      />
    </div>
  );
};

export default App;