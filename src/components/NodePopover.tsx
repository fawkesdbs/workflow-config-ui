import React, { useState, useEffect } from "react";
import type { Node } from "reactflow";
import type { NodeData } from "../types/models";

interface NodePopoverProps {
  node: Node<NodeData> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (nodeId: string, data: NodeData) => void;
}

const NodePopover: React.FC<NodePopoverProps> = ({
  node,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<NodeData | null>(null);

  useEffect(() => {
    if (node) {
      setFormData(node.data);
    }
  }, [node]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (formData) {
      const { name, value, type } = e.target;
      setFormData({
        ...formData,
        [name]: type === "number" ? parseInt(value, 10) : value,
      });
    }
  };

  const handleSave = () => {
    if (node && formData) {
      onSave(node.id, formData);
      onClose();
    }
  };

  if (!isOpen || !node) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h2 className="text-xl font-bold mb-4">Edit {node.type} Node</h2>

        {/* General Fields */}
        <div>
          <label
            htmlFor="label"
            className="block text-sm font-medium text-gray-700"
          >
            Name
          </label>
          <input
            type="text"
            name="label"
            id="label"
            value={formData?.label || ""}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {/* Station-Specific Fields */}
        {node.type === "Station" && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label
                htmlFor="ClassType"
                className="block text-sm font-medium text-gray-700"
              >
                Class Type
              </label>
              <input
                type="text"
                name="ClassType"
                id="ClassType"
                value={formData?.ClassType || ".UserObjects.WorkStation"}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="ProcTime"
                className="block text-sm font-medium text-gray-700"
              >
                Processing Time
              </label>
              <input
                type="text"
                name="ProcTime"
                id="ProcTime"
                value={formData?.ProcTime || "00:00:00"}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="WorkerPool"
                className="block text-sm font-medium text-gray-700"
              >
                Worker Pool
              </label>
              <input
                type="text"
                name="WorkerPool"
                id="WorkerPool"
                value={formData?.WorkerPool || "GeneralPool"}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        )}

        {/* Source-Specific Fields */}
        {node.type === "Source" && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label
                htmlFor="MU_Type"
                className="block text-sm font-medium text-gray-700"
              >
                MU Type
              </label>
              <input
                type="text"
                name="MU_Type"
                id="MU_Type"
                value={formData?.MU_Type || ".UserObjects.Part"}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="Amount"
                className="block text-sm font-medium text-gray-700"
              >
                Amount
              </label>
              <input
                type="number"
                name="Amount"
                id="Amount"
                value={formData?.Amount || 1}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded transition duration-150"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-150"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodePopover;
