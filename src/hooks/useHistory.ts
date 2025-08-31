import { useState, useCallback } from "react";
import type { Node, Edge } from "reactflow";

type HistoryState = {
  nodes: Node[];
  edges: Edge[];
};

export const useHistory = (
  initialState: HistoryState,
  setNodes: (nodes: Node[]) => void,
  setEdges: (edges: Edge[]) => void
) => {
  const [history, setHistory] = useState<HistoryState[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const addHistory = useCallback(
    (nodes: Node[], edges: Edge[]) => {
      const newHistory = history.slice(0, currentIndex + 1);
      newHistory.push({ nodes, edges });
      setHistory(newHistory);
      setCurrentIndex(newHistory.length - 1);
    },
    [history, currentIndex]
  );

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      const prevState = history[currentIndex - 1];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex, history, setNodes, setEdges]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const nextState = history[currentIndex + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, history, setNodes, setEdges]);

  return {
    addHistory,
    undo,
    redo,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
  };
};