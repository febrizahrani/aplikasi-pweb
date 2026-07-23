"use client";

import { useState, useEffect } from "react";
import { getLeaveRequests, createLeaveRequest, updateLeaveStatus, deleteLeaveRequest } from "@/actions/leave";
import { getEmployees } from "@/actions/employees";
import { getUserRole } from "@/actions/auth";

interface LeaveRequest {
  id: string;
  employee_id: string;
  jenis_cuti: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  keterangan: string | null;
  status: string;
  catatanApproval: string | null;
  created_at: string;
  employee?: { id: string; nik: string; nama: string; department?: { nama_departemen?: string } } | null;
}

export default function LeavePage() {
  const [role, setRole] = useState("karyawan");
  const [records, setRecords] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<{ id: string; nama: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    employee_id: "",
    jenis_cuti: "Cuti Tahunan",
    tanggal_mulai: new Date().toISOString().split("T")[0],
    tanggal_selesai: new Date().toISOString().split("T")[0],
    keterangan: "",
  });
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [leaveData, empData, userRole] = await Promise.all([
      getLeaveRequests(),
      getEmployees(),
      getUserRole(),
    ]);
    setRecords(leaveData);
    setEmployees(empData);
    setRole(userRole);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createLeaveRequest({
        employee_id: form.employee_id,
        jenis_cuti: form.jenis_cuti,
        tanggal_mulai: form.tanggal_mulai,
        tanggal_selesai: form.tanggal_selesai,
        keterangan: form.keterangan || undefined,
      });
      setShowForm(false);
      setForm({
        employee_id: "",
        jenis_cuti: "Cuti Tahunan",
        tanggal_mulai: new Date().toISOString().split("T")[0],
        tanggal_selesai: new Date().toISOString().split("T")[0],
        keterangan: "",
      });
      loadData();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleApprove(id: string) {
    try {
      await updateLeaveStatus(id, "Approved");
      loadData();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleReject(id: string) {
    try {
      await updateLeaveStatus(id, "Rejected", rejectNote || undefined);
      setRejectId(null);
      setRejectNote("");
      loadData();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus pengajuan ini?")) return;
    try {
      await deleteLeaveRequest(id);
      loadData();
    } catch (error) {
      console.error(error);
    }
  }

  function countDays(start: string, end: string) {
    const s = new Date(start);
    const e = new Date(end);
    return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  const statusColors: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-800",
    Approved: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Pengajuan Cuti</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showForm ? "Tutup" : "+ Ajukan Cuti"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pegawai <span className="text-red-500">*</span></label>
              <select
                value={form.employee_id}
                onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
                required
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Pilih Pegawai</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.nama}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Cuti <span className="text-red-500">*</span></label>
              <select
                value={form.jenis_cuti}
                onChange={(e) => setForm({ ...form, jenis_cuti: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="Cuti Tahunan">Cuti Tahunan</option>
                <option value="Cuti Sakit">Cuti Sakit</option>
                <option value="Cuti Izin">Cuti Izin</option>
                <option value="Cuti Lainnya">Cuti Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={form.tanggal_mulai}
                onChange={(e) => setForm({ ...form, tanggal_mulai: e.target.value })}
                required
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={form.tanggal_selesai}
                onChange={(e) => setForm({ ...form, tanggal_selesai: e.target.value })}
                required
                min={form.tanggal_mulai}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan</label>
              <input
                type="text"
                value={form.keterangan}
                onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Alasan cuti (opsional)"
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Kirim Pengajuan
          </button>
        </form>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Memuat data...</div>
        ) : records.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Belum ada pengajuan cuti</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">NIK</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Nama</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Jenis</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Dari</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Sampai</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Hari</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {records.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{row.employee?.nik || "-"}</td>
                    <td className="px-4 py-3 text-sm">{row.employee?.nama || "-"}</td>
                    <td className="px-4 py-3 text-sm">{row.jenis_cuti}</td>
                    <td className="px-4 py-3 text-sm">{row.tanggal_mulai}</td>
                    <td className="px-4 py-3 text-sm">{row.tanggal_selesai}</td>
                    <td className="px-4 py-3 text-sm text-center">{countDays(row.tanggal_mulai, row.tanggal_selesai)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[row.status] || "bg-gray-100 text-gray-800"}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {row.status === "Pending" && (role === "admin" || role === "manager") && (
                          <>
                            <button
                              onClick={() => handleApprove(row.id)}
                              className="text-green-600 hover:text-green-800 text-sm"
                            >
                              Setujui
                            </button>
                            <button
                              onClick={() => setRejectId(row.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Tolak
                            </button>
                          </>
                        )}
                        {role === "admin" && (
                          <button
                            onClick={() => handleDelete(row.id)}
                            className="text-gray-500 hover:text-gray-700 text-sm"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {rejectId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tolak Pengajuan</h3>
              <p className="text-gray-600 mb-4">Masukkan alasan penolakan:</p>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
                placeholder="Alasan penolakan..."
              />
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button
                onClick={() => { setRejectId(null); setRejectNote(""); }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => handleReject(rejectId)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Tolak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
