import { useState, useCallback } from "react";
import type { Node, Edge } from "reactflow";

let id = 1;
const getId = () => `node_${Date.now()}_${id++}`;

export const useClipboard = () => {
  const [clipboard, setClipboard] = useState<{
    nodes: Node[];
    edges: Edge[];
  } | null>(null);

  const copy = useCallback((nodes: Node[], edges: Edge[]) => {
    // Deep copy the nodes to ensure data is preserved
    const copiedNodes = nodes.map((node) => ({
      ...node,
      data: { ...node.data },
    }));
    setClipboard({ nodes: copiedNodes, edges });
  }, []);

  const cut = useCallback(
    (
      nodes: Node[],
      edges: Edge[],
      setNodes: (updater: (nds: Node[]) => Node[]) => void,
      setEdges: (updater: (eds: Edge[]) => Edge[]) => void
    ) => {
      copy(nodes, edges);
      const nodeIds = nodes.map((n) => n.id);
      const edgeIds = edges.map((e) => e.id);
      setNodes((nds) => nds.filter((n) => !nodeIds.includes(n.id)));
      setEdges((eds) => eds.filter((e) => !edgeIds.includes(e.id)));
    },
    [copy]
  );

  const paste = useCallback(
    (
      setNodes: (updater: (nds: Node[]) => Node[]) => void,
      setEdges: (updater: (eds: Edge[]) => Edge[]) => void
    ) => {
      if (!clipboard) return;

      const idMapping = new Map<string, string>();
      const newNodes = clipboard.nodes.map((node) => {
        const newNodeId = getId();
        idMapping.set(node.id, newNodeId);
        return {
          ...node,
          id: newNodeId,
          data: { ...node.data }, // Ensure data is a new object
          position: {
            x: node.position.x + 20,
            y: node.position.y + 20,
          },
        };
      });

      const newEdges = clipboard.edges
        .map((edge) => ({
          ...edge,
          source: idMapping.get(edge.source) || edge.source,
          target: idMapping.get(edge.target) || edge.target,
          id: `reactflow__edge-${idMapping.get(edge.source)}-${idMapping.get(
            edge.target
          )}`,
        }))
        .filter(
          (edge) => idMapping.has(edge.source) && idMapping.has(edge.target)
        );

      setNodes((nds) => [...nds, ...newNodes]);
      setEdges((eds) => [...eds, ...newEdges]);
    },
    [clipboard]
  );

  const duplicate = useCallback(
    (
      nodesToDuplicate: Node[],
      setNodes: (updater: (nds: Node[]) => Node[]) => void
    ) => {
      const newNodes = nodesToDuplicate.map((node) => ({
        ...node,
        id: getId(),
        data: { ...node.data }, // Ensure data is a new object
        position: {
          x: node.position.x + 20,
          y: node.position.y + 20,
        },
        selected: true,
      }));

      setNodes((nds) =>
        nds.map((n) => ({ ...n, selected: false })).concat(newNodes)
      );
    },
    []
  );

  return { copy, cut, paste, duplicate };
};