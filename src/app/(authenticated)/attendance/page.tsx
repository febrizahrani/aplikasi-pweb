"use client";

import { useState, useEffect, useRef } from "react";
import { getAttendance, createAttendance, deleteAttendance, updateAttendance, bulkCreateAttendance } from "@/actions/attendance";
import { getEmployees } from "@/actions/employees";
import type { AttendanceWithEmployee, Employee } from "@/types";

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceWithEmployee[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterDate, setFilterDate] = useState("");
  const [editRow, setEditRow] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ check_in: "", check_out: "", status: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    employee_id: "",
    tanggal: new Date().toISOString().split("T")[0],
    check_in: "09:00",
    check_out: "",
    status: "Hadir" as const,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [attData, empData] = await Promise.all([
      getAttendance(),
      getEmployees(),
    ]);
    setRecords(attData);
    setEmployees(empData);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createAttendance({
        employee_id: form.employee_id,
        tanggal: form.tanggal,
        check_in: form.check_in || null,
        check_out: form.check_out || null,
        status: form.status as "Hadir" | "Izin" | "Sakit" | "Alpha",
      });
      setShowForm(false);
      setForm({
        employee_id: "",
        tanggal: new Date().toISOString().split("T")[0],
        check_in: "09:00",
        check_out: "",
        status: "Hadir",
      });
      loadData();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleUpdate(id: string) {
    try {
      await updateAttendance(id, {
        check_in: editForm.check_in || null,
        check_out: editForm.check_out || null,
        status: editForm.status,
      });
      setEditRow(null);
      loadData();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus?")) return;
    try {
      await deleteAttendance(id);
      loadData();
    } catch (error) {
      console.error(error);
    }
  }

  function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim());

      if (lines.length < 2) {
        alert("File CSV kosong atau format salah");
        return;
      }

      const header = lines[0].toLowerCase();
      if (!header.includes("nik") || !header.includes("tanggal")) {
        alert("Format CSV harus memiliki kolom: nik, tanggal, check_in, check_out, status\nContoh:\nnik,tanggal,check_in,check_out,status\n001,2026-07-23,09:00,17:00,Hadir");
        return;
      }

      const empMap = new Map(employees.map((e) => [e.nik, e.id]));
      const records = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim());
        if (cols.length < 3) continue;

        const [nik, tanggal, check_in, check_out, status] = cols;
        const employee_id = empMap.get(nik);
        if (!employee_id) continue;

        records.push({
          employee_id,
          tanggal,
          check_in: check_in || null,
          check_out: check_out || null,
          status: status || "Hadir",
        });
      }

      if (records.length === 0) {
        alert("Tidak ada data valid yang bisa diimport. Pastikan NIK sudah terdaftar.");
        return;
      }

      try {
        await bulkCreateAttendance(records);
        alert(`Berhasil import ${records.length} data absensi`);
        loadData();
      } catch (err) {
        alert("Gagal import: " + (err instanceof Error ? err.message : "Unknown error"));
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const filteredRecords = filterDate
    ? records.filter((r) => r.tanggal === filterDate)
    : records;

  const statusColors: Record<string, string> = {
    Hadir: "bg-green-100 text-green-800",
    Izin: "bg-yellow-100 text-yellow-800",
    Sakit: "bg-blue-100 text-blue-800",
    Alpha: "bg-red-100 text-red-800",
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Absensi</h2>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleCsvUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
          >
            Import CSV
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {showForm ? "Tutup" : "+ Tambah"}
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filter Tanggal</label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
        </div>
        {filterDate && (
          <button
            onClick={() => setFilterDate("")}
            className="mt-5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Reset
          </button>
        )}
        <div className="ml-auto text-sm text-gray-500">
          {filteredRecords.length} data ditampilkan
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                required
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jam Masuk</label>
              <input
                type="time"
                value={form.check_in}
                onChange={(e) => setForm({ ...form, check_in: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jam Keluar</label>
              <input
                type="time"
                value={form.check_out}
                onChange={(e) => setForm({ ...form, check_out: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status <span className="text-red-500">*</span></label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="Hadir">Hadir</option>
                <option value="Izin">Izin</option>
                <option value="Sakit">Sakit</option>
                <option value="Alpha">Alpha</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Simpan
          </button>
        </form>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Memuat data...</div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {filterDate ? "Tidak ada data pada tanggal ini" : "Belum ada data absensi"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">NIK</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Nama</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tanggal</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Masuk</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Keluar</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredRecords.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{row.employee?.nik}</td>
                    <td className="px-4 py-3 text-sm">{row.employee?.nama}</td>
                    <td className="px-4 py-3 text-sm">{row.tanggal}</td>
                    <td className="px-4 py-3 text-sm">
                      {editRow === row.id ? (
                        <input
                          type="time"
                          value={editForm.check_in}
                          onChange={(e) => setEditForm({ ...editForm, check_in: e.target.value })}
                          className="px-2 py-1 border rounded w-28"
                        />
                      ) : (
                        row.check_in || "-"
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {editRow === row.id ? (
                        <input
                          type="time"
                          value={editForm.check_out}
                          onChange={(e) => setEditForm({ ...editForm, check_out: e.target.value })}
                          className="px-2 py-1 border rounded w-28"
                        />
                      ) : (
                        row.check_out || "-"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editRow === row.id ? (
                        <select
                          value={editForm.status}
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                          className="px-2 py-1 border rounded"
                        >
                          <option value="Hadir">Hadir</option>
                          <option value="Izin">Izin</option>
                          <option value="Sakit">Sakit</option>
                          <option value="Alpha">Alpha</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[row.status]}`}>
                          {row.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {editRow === row.id ? (
                          <>
                            <button
                              onClick={() => handleUpdate(row.id)}
                              className="text-green-600 hover:text-green-800 text-sm"
                            >
                              Simpan
                            </button>
                            <button
                              onClick={() => setEditRow(null)}
                              className="text-gray-600 hover:text-gray-800 text-sm"
                            >
                              Batal
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditRow(row.id);
                                setEditForm({
                                  check_in: row.check_in || "",
                                  check_out: row.check_out || "",
                                  status: row.status,
                                });
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Koreksi
                            </button>
                            <button
                              onClick={() => handleDelete(row.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Hapus
                            </button>
                          </>
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
    </div>
  );
}
