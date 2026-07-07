"use client";

import { useRouter } from "next/navigation";
import type { EmployeeWithRelations } from "@/types";
import { deleteEmployee } from "@/actions/employees";
import { useState } from "react";
import ConfirmDialog from "./ConfirmDialog";

interface EmployeeDetailProps {
  employee: EmployeeWithRelations;
}

export default function EmployeeDetail({ employee }: EmployeeDetailProps) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteEmployee(employee.id);
      router.push("/employees");
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Detail Pegawai</h2>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/employees")}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Kembali
          </button>
          <button
            onClick={() => router.push(`/employees/${employee.id}/edit`)}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          >
            Edit
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Hapus
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <DetailItem label="NIK" value={employee.nik} />
          <DetailItem label="Nama Lengkap" value={employee.nama} />
          <DetailItem label="Email" value={employee.email || "-"} />
          <DetailItem label="No. HP" value={employee.phone || "-"} />
          <DetailItem label="Jenis Kelamin" value={employee.gender || "-"} />
          <DetailItem label="Departemen" value={employee.department?.nama_departemen || "-"} />
          <DetailItem label="Jabatan" value={employee.position?.nama_jabatan || "-"} />
          <DetailItem label="Status" value={employee.status} />
          <DetailItem label="Tanggal Masuk" value={employee.tanggal_masuk} />
        </div>
      </div>

      {showDelete && (
        <ConfirmDialog
          title="Hapus Pegawai"
          message={`Yakin ingin menghapus ${employee.nama}?`}
          confirmLabel="Hapus"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-gray-900 font-medium">{value}</p>
    </div>
  );
}
