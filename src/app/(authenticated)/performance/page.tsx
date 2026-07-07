"use client";

import { useState, useEffect } from "react";
import { getPerformance, createPerformance, deletePerformance } from "@/actions/performance";
import { getEmployees } from "@/actions/employees";
import type { PerformanceWithEmployee, Employee } from "@/types";

export default function PerformancePage() {
  const [records, setRecords] = useState<PerformanceWithEmployee[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const currentQuarter = `${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}`;
  const [form, setForm] = useState({
    employee_id: "",
    disiplin: "",
    kehadiran: "",
    teamwork: "",
    tanggung_jawab: "",
    periode: currentQuarter,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [perfData, empData] = await Promise.all([
      getPerformance(),
      getEmployees(),
    ]);
    setRecords(perfData);
    setEmployees(empData);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createPerformance({
        employee_id: form.employee_id,
        disiplin: Number(form.disiplin),
        kehadiran: Number(form.kehadiran),
        teamwork: Number(form.teamwork),
        tanggung_jawab: Number(form.tanggung_jawab),
        periode: form.periode,
      });
      setShowForm(false);
      setForm({
        employee_id: "",
        disiplin: "",
        kehadiran: "",
        teamwork: "",
        tanggung_jawab: "",
        periode: currentQuarter,
      });
      loadData();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus?")) return;
    try {
      await deletePerformance(id);
      loadData();
    } catch (error) {
      console.error(error);
    }
  }

  function getNilaiColor(nilai: number) {
    if (nilai >= 8) return "text-green-600";
    if (nilai >= 6) return "text-yellow-600";
    return "text-red-600";
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Penilaian Kinerja</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showForm ? "Tutup" : "+ Tambah Penilaian"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pegawai</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Periode</label>
              <select
                value={form.periode}
                onChange={(e) => setForm({ ...form, periode: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value={`${new Date().getFullYear()}-Q1`}>Q1 {new Date().getFullYear()}</option>
                <option value={`${new Date().getFullYear()}-Q2`}>Q2 {new Date().getFullYear()}</option>
                <option value={`${new Date().getFullYear()}-Q3`}>Q3 {new Date().getFullYear()}</option>
                <option value={`${new Date().getFullYear()}-Q4`}>Q4 {new Date().getFullYear()}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Disiplin (1-10)</label>
              <input
                type="number"
                value={form.disiplin}
                onChange={(e) => setForm({ ...form, disiplin: e.target.value })}
                required
                min="1"
                max="10"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kehadiran (1-10)</label>
              <input
                type="number"
                value={form.kehadiran}
                onChange={(e) => setForm({ ...form, kehadiran: e.target.value })}
                required
                min="1"
                max="10"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kerjasama (1-10)</label>
              <input
                type="number"
                value={form.teamwork}
                onChange={(e) => setForm({ ...form, teamwork: e.target.value })}
                required
                min="1"
                max="10"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggung Jawab (1-10)</label>
              <input
                type="number"
                value={form.tanggung_jawab}
                onChange={(e) => setForm({ ...form, tanggung_jawab: e.target.value })}
                required
                min="1"
                max="10"
                className="w-full px-3 py-2 border rounded-lg"
              />
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
        ) : records.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Belum ada data penilaian</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">NIK</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Nama</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Periode</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Disiplin</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Kehadiran</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Kerjasama</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Tanggung Jawab</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Nilai</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {records.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{row.employee?.nik}</td>
                    <td className="px-4 py-3 text-sm">{row.employee?.nama}</td>
                    <td className="px-4 py-3 text-sm">{row.periode}</td>
                    <td className="px-4 py-3 text-sm text-center">{row.disiplin}</td>
                    <td className="px-4 py-3 text-sm text-center">{row.kehadiran}</td>
                    <td className="px-4 py-3 text-sm text-center">{row.teamwork}</td>
                    <td className="px-4 py-3 text-sm text-center">{row.tanggung_jawab}</td>
                    <td className={`px-4 py-3 text-sm text-center font-bold ${getNilaiColor(Number(row.nilai))}`}>
                      {Number(row.nilai).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Hapus
                      </button>
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
