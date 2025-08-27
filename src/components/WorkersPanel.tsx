import React from "react";
import type { Worker } from "../types/models";

interface WorkersPanelProps {
  isOpen: boolean;
  onClose: () => void;
  workers: Worker[];
  setWorkers: React.Dispatch<React.SetStateAction<Worker[]>>;
}

const WorkersPanel: React.FC<WorkersPanelProps> = ({
  isOpen,
  onClose,
  workers,
  setWorkers,
}) => {
  const handleWorkerChange = (
    index: number,
    field: keyof Worker,
    value: string
  ) => {
    const updatedWorkers = [...workers];
    const worker = updatedWorkers[index];
    let processedValue: string | number = value;

    const numericFields: (keyof Worker)[] = ["Amount", "Speed", "Efficiency"];
    if (numericFields.includes(field)) {
      processedValue = parseInt(value, 10) || 0;
    }

    updatedWorkers[index] = { ...worker, [field]: processedValue };
    setWorkers(updatedWorkers);
  };

  const handleAddWorker = () => {
    setWorkers([
      ...workers,
      {
        Worker: "New Team",
        Amount: 1,
        Shift: "Day",
        Speed: 100,
        Efficiency: 95,
        Home_Language: "English",
        Scope: "General",
        Additional_Services: "None",
      },
    ]);
  };

  const handleDeleteWorker = (index: number) => {
    setWorkers(workers.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-60 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{ zIndex: 40 }}
    >
      <div
        className={`fixed inset-y-0 right-0 w-full max-w-4xl bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Workers Configuration
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 text-3xl font-light"
            >
              &times;
            </button>
          </div>
          <div className="flex-grow overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Worker",
                    "Amount",
                    "Shift",
                    "Speed",
                    "Efficiency",
                    "Scope",
                    "Additional Services",
                    "Actions",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workers.map((worker, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={worker.Worker}
                        onChange={(e) =>
                          handleWorkerChange(index, "Worker", e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded-md"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={worker.Amount}
                        onChange={(e) =>
                          handleWorkerChange(index, "Amount", e.target.value)
                        }
                        className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={worker.Shift}
                        onChange={(e) =>
                          handleWorkerChange(index, "Shift", e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded-md"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={worker.Speed}
                        onChange={(e) =>
                          handleWorkerChange(index, "Speed", e.target.value)
                        }
                        className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        value={worker.Efficiency}
                        onChange={(e) =>
                          handleWorkerChange(
                            index,
                            "Efficiency",
                            e.target.value
                          )
                        }
                        className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={worker.Scope}
                        onChange={(e) =>
                          handleWorkerChange(index, "Scope", e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded-md"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={worker.Additional_Services}
                        onChange={(e) =>
                          handleWorkerChange(
                            index,
                            "Additional_Services",
                            e.target.value
                          )
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded-md"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleDeleteWorker(index)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={handleAddWorker}
              className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-150"
            >
              Add Worker
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkersPanel;
