"use client";

import { useState, useEffect } from "react";
import { getDepartmentHierarchy, getDepartments, updateDepartment } from "@/actions/departments";

interface OrgNode {
  id: string;
  name: string;
  parentId: string | null;
  children: OrgNode[];
  employees: { nama: string; jabatan: string | null }[];
}

export default function OrgChartPage() {
  const [tree, setTree] = useState<OrgNode[]>([]);
  const [allDepts, setAllDepts] = useState<{ id: string; nama_departemen: string; parent_id: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDept, setEditDept] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editParent, setEditParent] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [hierarchy, depts] = await Promise.all([
      getDepartmentHierarchy(),
      getDepartments(),
    ]);
    setTree(hierarchy);
    setAllDepts(depts);
    setLoading(false);
  }

  async function handleSaveEdit(id: string) {
    try {
      await updateDepartment(id, {
        nama_departemen: editName,
        parent_id: editParent || null,
      });
      setEditDept(null);
      loadData();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Bagan Organisasi</h2>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">Memuat data...</div>
      ) : tree.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
          Belum ada data departemen. Buat departemen terlebih dahulu.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8 overflow-x-auto">
          <div className="flex justify-center">
            <OrgTreeNode
              nodes={tree}
              allDepts={allDepts}
              editDept={editDept}
              setEditDept={setEditDept}
              editName={editName}
              setEditName={setEditName}
              editParent={editParent}
              setEditParent={setEditParent}
              onSave={handleSaveEdit}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function OrgTreeNode({
  nodes,
  allDepts,
  editDept,
  setEditDept,
  editName,
  setEditName,
  editParent,
  setEditParent,
  onSave,
}: {
  nodes: OrgNode[];
  allDepts: { id: string; nama_departemen: string; parent_id: string | null }[];
  editDept: string | null;
  setEditDept: (id: string | null) => void;
  editName: string;
  setEditName: (name: string) => void;
  editParent: string;
  setEditParent: (id: string) => void;
  onSave: (id: string) => void;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-8">
        {nodes.map((node) => (
          <div key={node.id} className="flex flex-col items-center">
            {/* Node Card */}
            <div className="bg-white border-2 border-blue-500 rounded-lg p-4 min-w-[200px] text-center shadow-md hover:shadow-lg transition">
              {editDept === node.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                  <select
                    value={editParent}
                    onChange={(e) => setEditParent(e.target.value)}
                    className="w-full px-2 py-1 border rounded text-xs"
                  >
                    <option value="">Root (Level Atas)</option>
                    {allDepts
                      .filter((d) => d.id !== node.id)
                      .map((d) => (
                        <option key={d.id} value={d.id}>{d.nama_departemen}</option>
                      ))}
                  </select>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onSave(node.id)}
                      className="flex-1 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                    >
                      Simpan
                    </button>
                    <button
                      onClick={() => setEditDept(null)}
                      className="flex-1 px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h4
                    className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                    onClick={() => {
                      setEditDept(node.id);
                      setEditName(node.name);
                      setEditParent(node.parentId || "");
                    }}
                  >
                    {node.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {node.employees.length} karyawan
                  </p>
                  {node.employees.length > 0 && (
                    <div className="mt-2 text-left border-t pt-2">
                      {node.employees.slice(0, 5).map((emp, i) => (
                        <p key={i} className="text-xs text-gray-600">
                          {emp.nama} {emp.jabatan && <span className="text-gray-400">({emp.jabatan})</span>}
                        </p>
                      ))}
                      {node.employees.length > 5 && (
                        <p className="text-xs text-gray-400">+{node.employees.length - 5} lainnya</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Children */}
            {node.children.length > 0 && (
              <div className="flex flex-col items-center mt-4">
                <div className="w-0.5 h-6 bg-blue-300" />
                <OrgTreeNode
                  nodes={node.children}
                  allDepts={allDepts}
                  editDept={editDept}
                  setEditDept={setEditDept}
                  editName={editName}
                  setEditName={setEditName}
                  editParent={editParent}
                  setEditParent={setEditParent}
                  onSave={onSave}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
