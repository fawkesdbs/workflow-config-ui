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

export const exportToExcel = (nodes: Node<NodeData>[], edges: Edge[]) => {
  // 1. Initialize data structures for the sheets
  const Stations: Station[] = [];
  const Flows: Flow[] = [];
  const Mat_Inflow: MatInflow[] = [];
  const Mat_Outflow: MatOutflow[] = [];

  // Create a map for efficient node lookup by ID
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  // 2. Process Nodes (Populate Stations)
  nodes.forEach((node) => {
    // We use node.type to identify the logical role
    const nodeType = node.type as NodeType;
    const data = node.data;

    if (nodeType === "Station") {
      Stations.push({
        Name: data.label,
        ClassType: data.ClassType || "DefaultClass",
        // Capture and round the coordinates
        X_Pos: Math.round(node.position.x),
        Y_Pos: Math.round(node.position.y),
        ProcTime: data.ProcTime || "00:01:00",
        WorkerPool: data.WorkerPool || "GeneralPool",
      });
    }
  });

  // 3. Process Edges (Determine Flow, Inflow, Outflow)
  edges.forEach((edge) => {
    const sourceNode = nodeMap.get(edge.source);
    const targetNode = nodeMap.get(edge.target);

    if (!sourceNode || !targetNode) return;

    const sourceType = sourceNode.type as NodeType;
    const targetType = targetNode.type as NodeType;
    const predecessorName = sourceNode.data.label;
    const successorName = targetNode.data.label;

    // A. Handle Mat_Inflow (Starts from a Source)
    if (sourceType === "Source") {
      Mat_Inflow.push({
        SourceName: predecessorName,
        Successor: successorName,
        MU_Type: sourceNode.data.MU_Type || "PartA",
        Amount: sourceNode.data.Amount || 1,
      });
    }
    // B. Handle Mat_Outflow (Ends at a Drain)
    else if (targetType === "Drain") {
      Mat_Outflow.push({
        Predecessor: predecessorName,
        DrainName: successorName,
      });
      // It is often useful to include Station->Drain in the general Flow table as well
      Flows.push({
        Predecessor: predecessorName,
        Successor: successorName,
      });
    }
    // C. Handle standard Flow (Station to Station)
    else if (sourceType === "Station" && targetType === "Station") {
      Flows.push({
        Predecessor: predecessorName,
        Successor: successorName,
      });
    }
  });

  // 4. Handle Workers (Placeholder data, as this requires a separate UI)
  const Workers: Worker[] = [
    {
      Worker: "TeamA",
      Amount: 5,
      Shift: "Day",
      Speed: 100,
      Efficiency: 95,
      Home_Language: "English",
      Scope: "Assembly",
      Additional_Services: "None",
    },
  ];

  // 5. Generate Workbook and Worksheets
  const wb = XLSX.utils.book_new();

  const wsStations = XLSX.utils.json_to_sheet(Stations);
  const wsFlow = XLSX.utils.json_to_sheet(Flows);
  const wsWorkers = XLSX.utils.json_to_sheet(Workers);
  const wsMatInflow = XLSX.utils.json_to_sheet(Mat_Inflow);
  const wsMatOutflow = XLSX.utils.json_to_sheet(Mat_Outflow);

  // 6. Append sheets and write file
  XLSX.utils.book_append_sheet(wb, wsStations, "Stations");
  XLSX.utils.book_append_sheet(wb, wsFlow, "Flow");
  XLSX.utils.book_append_sheet(wb, wsWorkers, "Workers");
  XLSX.utils.book_append_sheet(wb, wsMatInflow, "Mat_Inflow");
  XLSX.utils.book_append_sheet(wb, wsMatOutflow, "Mat_Outflow");

  // Triggers the download in the browser
  XLSX.writeFile(wb, "Config.xlsx");
};
