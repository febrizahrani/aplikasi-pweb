"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { EmployeeWithRelations } from "@/types";
import { deleteEmployee } from "@/actions/employees";
import ConfirmDialog from "./ConfirmDialog";

interface EmployeeTableProps {
  employees: EmployeeWithRelations[];
}

export default function EmployeeTable({ employees }: EmployeeTableProps) {
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<EmployeeWithRelations | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.nama.toLowerCase().includes(search.toLowerCase()) ||
      emp.nik.toLowerCase().includes(search.toLowerCase()) ||
      emp.email?.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete() {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      await deleteEmployee(deleteTarget.id);
      setDeleteTarget(null);
      router.refresh();
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="Cari nama, NIK, atau email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">NIK</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Nama</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 hidden md:table-cell">Departemen</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 hidden md:table-cell">Jabatan</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Tidak ada data pegawai
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{emp.nik}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{emp.nama}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">
                    {emp.department?.nama_departemen || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">
                    {emp.position?.nama_jabatan || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={emp.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/employees/${emp.id}`)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Detail
                      </button>
                      <button
                        onClick={() => router.push(`/employees/${emp.id}/edit`)}
                        className="text-yellow-600 hover:text-yellow-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(emp)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Hapus Pegawai"
          message={`Yakin ingin menghapus ${deleteTarget.nama}? Data yang dihapus tidak dapat dikembalikan.`}
          confirmLabel="Hapus"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Aktif: "bg-green-100 text-green-800",
    "Non-aktif": "bg-red-100 text-red-800",
    Cuti: "bg-yellow-100 text-yellow-800",
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || "bg-gray-100 text-gray-800"}`}>
      {status}
    </span>
  );
}
