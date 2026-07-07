"use client";

import { useState, useEffect } from "react";
import { getPayroll, createPayroll, deletePayroll } from "@/actions/payroll";
import { getEmployees } from "@/actions/employees";
import type { PayrollWithEmployee, Employee } from "@/types";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function PayrollPage() {
  const [records, setRecords] = useState<PayrollWithEmployee[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    employee_id: "",
    gaji_pokok: "",
    bonus: "0",
    tunjangan: "0",
    potongan: "0",
    bulan: new Date().toISOString().slice(0, 7),
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [payData, empData] = await Promise.all([
      getPayroll(),
      getEmployees(),
    ]);
    setRecords(payData);
    setEmployees(empData);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createPayroll({
        employee_id: form.employee_id,
        gaji_pokok: Number(form.gaji_pokok),
        bonus: Number(form.bonus),
        tunjangan: Number(form.tunjangan),
        potongan: Number(form.potongan),
        bulan: form.bulan,
      });
      setShowForm(false);
      setForm({
        employee_id: "",
        gaji_pokok: "",
        bonus: "0",
        tunjangan: "0",
        potongan: "0",
        bulan: new Date().toISOString().slice(0, 7),
      });
      loadData();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus?")) return;
    try {
      await deletePayroll(id);
      loadData();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Penggajian</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showForm ? "Tutup" : "+ Tambah Gaji"}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
              <input
                type="month"
                value={form.bulan}
                onChange={(e) => setForm({ ...form, bulan: e.target.value })}
                required
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gaji Pokok</label>
              <input
                type="number"
                value={form.gaji_pokok}
                onChange={(e) => setForm({ ...form, gaji_pokok: e.target.value })}
                required
                min="0"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bonus</label>
              <input
                type="number"
                value={form.bonus}
                onChange={(e) => setForm({ ...form, bonus: e.target.value })}
                min="0"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tunjangan</label>
              <input
                type="number"
                value={form.tunjangan}
                onChange={(e) => setForm({ ...form, tunjangan: e.target.value })}
                min="0"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Potongan</label>
              <input
                type="number"
                value={form.potongan}
                onChange={(e) => setForm({ ...form, potongan: e.target.value })}
                min="0"
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
          <div className="p-8 text-center text-gray-500">Belum ada data gaji</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">NIK</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Nama</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Bulan</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Gaji Pokok</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Bonus</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Potongan</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Total</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {records.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{row.employee?.nik}</td>
                    <td className="px-4 py-3 text-sm">{row.employee?.nama}</td>
                    <td className="px-4 py-3 text-sm">{row.bulan}</td>
                    <td className="px-4 py-3 text-sm text-right">{formatCurrency(Number(row.gaji_pokok))}</td>
                    <td className="px-4 py-3 text-sm text-right">{formatCurrency(Number(row.bonus))}</td>
                    <td className="px-4 py-3 text-sm text-right">{formatCurrency(Number(row.potongan))}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(Number(row.total))}</td>
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
