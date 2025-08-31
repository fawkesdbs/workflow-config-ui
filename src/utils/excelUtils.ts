import * as XLSX from "xlsx";
import type { Node, Edge } from "reactflow";
import type {
  NodeData,
  Station,
  Flow,
  MatInflow,
  MatOutflow,
  Worker,
  NodeType,
} from "../types/models";

const toSnakeCase = (str: string) => {
  // Replace spaces or multiple underscores with a single underscore
  return str.replace(/[\s_]+/g, "_");
};

export const exportToExcel = (
  nodes: Node<NodeData>[],
  edges: Edge[],
  workers: Worker[]
) => {
  const Stations: Station[] = [];
  const Flows: Flow[] = [];
  const Mat_Inflow: MatInflow[] = [];
  const Mat_Outflow: MatOutflow[] = [];

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  nodes.forEach((node) => {
    const nodeType = node.type as NodeType;
    const data = node.data;
    const name = toSnakeCase(data.label);

    Stations.push({
      Name: name,
      // Use the ClassType from the node's data, with the node's type as a fallback
      ClassType: data.ClassType || `.UserObjects.${nodeType}`,
      X_Pos: Math.round(node.position.x / 25),
      Y_Pos: Math.round(node.position.y / 10),
      ProcTime: data.ProcTime || "00:00:00",
      WorkerPool: data.WorkerPool || "N/A",
    });
  });

  edges.forEach((edge) => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);

    if (!sourceNode || !targetNode) return;

    const sourceType = sourceNode.type as NodeType;
    const targetType = targetNode.type as NodeType;
    const predecessorName = toSnakeCase(sourceNode.data.label);
    const successorName = toSnakeCase(targetNode.data.label);

    if (sourceType === "Source") {
      Mat_Inflow.push({
        SourceName: predecessorName,
        Successor: successorName,
        MU_Type: sourceNode.data.MU_Type || ".UserObjects.Part",
        Amount: sourceNode.data.Amount || 1,
      });
    } else if (targetType === "Drain") {
      Mat_Outflow.push({
        Predecessor: predecessorName,
        DrainName: successorName,
      });
      Flows.push({
        Predecessor: predecessorName,
        Successor: successorName,
      });
    } else if (sourceType === "Station" && targetType === "Station") {
      Flows.push({
        Predecessor: predecessorName,
        Successor: successorName,
      });
    }
  });

  const wb = XLSX.utils.book_new();
  const wsStations = XLSX.utils.json_to_sheet(Stations);
  const wsFlow = XLSX.utils.json_to_sheet(Flows);
  const wsWorkers = XLSX.utils.json_to_sheet(workers);
  const wsMatInflow = XLSX.utils.json_to_sheet(Mat_Inflow);
  const wsMatOutflow = XLSX.utils.json_to_sheet(Mat_Outflow);

  XLSX.utils.book_append_sheet(wb, wsStations, "Stations");
  XLSX.utils.book_append_sheet(wb, wsFlow, "Flow");
  XLSX.utils.book_append_sheet(wb, wsWorkers, "Workers");
  XLSX.utils.book_append_sheet(wb, wsMatInflow, "Mat_Inflow");
  XLSX.utils.book_append_sheet(wb, wsMatOutflow, "Mat_Outflow");

  XLSX.writeFile(wb, "Config.xlsx");
};