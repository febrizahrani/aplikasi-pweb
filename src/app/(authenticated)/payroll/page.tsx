"use client";

import { useState, useEffect } from "react";
import { getPayroll, createPayroll, deletePayroll, generatePayroll } from "@/actions/payroll";
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
  const [generating, setGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [genMonth, setGenMonth] = useState(new Date().toISOString().slice(0, 7));
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

  async function handleGenerate() {
    if (!confirm(`Generate payroll untuk bulan ${genMonth}? Karyawan yang sudah ada akan dilewati.`)) return;
    setGenerating(true);
    try {
      const result = await generatePayroll(genMonth);
      if ("error" in result) {
        alert(result.error);
      } else {
        alert(result.success);
        loadData();
      }
    } catch (err) {
      alert("Gagal generate: " + (err instanceof Error ? err.message : "Unknown error"));
    }
    setGenerating(false);
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

  function downloadSlip(row: PayrollWithEmployee) {
    const empName = row.employee?.nama || "Tidak Diketahui";
    const empNik = row.employee?.nik || "-";
    const bulanStr = row.bulan;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Slip Gaji - ${empName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; }
          .header h1 { color: #2563eb; margin: 0; font-size: 22px; }
          .header p { color: #666; margin: 5px 0 0; }
          .info { margin-bottom: 20px; }
          .info p { margin: 4px 0; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          td { padding: 8px 12px; font-size: 14px; }
          .label { color: #666; width: 40%; }
          .value { font-weight: bold; text-align: right; }
          .total-row { border-top: 2px solid #2563eb; font-size: 18px; }
          .total-row td { padding-top: 12px; color: #2563eb; }
          .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 60px; color: rgba(37,99,235,0.06); font-weight: bold; pointer-events: none; z-index: -1; }
          .footer { margin-top: 30px; font-size: 11px; color: #999; text-align: center; }
        </style>
      </head>
      <body>
        <div class="watermark">${empName} - ${bulanStr}</div>
        <div class="header">
          <h1>SLIP GAJI</h1>
          <p>HRIS Lite - Human Resource Information System</p>
        </div>
        <div class="info">
          <p><strong>Nama:</strong> ${empName}</p>
          <p><strong>NIK:</strong> ${empNik}</p>
          <p><strong>Periode:</strong> ${bulanStr}</p>
        </div>
        <table>
          <tr><td class="label">Gaji Pokok</td><td class="value">${formatCurrency(Number(row.gaji_pokok))}</td></tr>
          <tr><td class="label">Tunjangan</td><td class="value">${formatCurrency(Number(row.tunjangan))}</td></tr>
          <tr><td class="label">Bonus</td><td class="value">${formatCurrency(Number(row.bonus))}</td></tr>
          <tr><td class="label">Potongan</td><td class="value" style="color:red">-${formatCurrency(Number(row.potongan))}</td></tr>
          <tr class="total-row"><td class="label"><strong>Total Gaji</strong></td><td class="value">${formatCurrency(Number(row.total))}</td></tr>
        </table>
        <div class="footer">Dicetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.print();
    }
  }

  const monthRecords = records.filter((r) => r.bulan === genMonth);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Penggajian</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {showForm ? "Tutup" : "+ Tambah Manual"}
          </button>
        </div>
      </div>

      {/* Auto Generate */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Generate Payroll Otomatis</h3>
        <p className="text-sm text-gray-500 mb-4">
          Otomatis hitung gaji semua karyawan aktif berdasarkan data absensi. Potongan dikenakan untuk hari Alpha (1/22 gaji pokok per hari). Bonus diberikan jika hadir &ge; 15 hari.
        </p>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
            <input
              type="month"
              value={genMonth}
              onChange={(e) => setGenMonth(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
          >
            {generating ? "Generating..." : "Generate Payroll"}
          </button>
          <span className="text-sm text-gray-500">
            {monthRecords.length} data payroll untuk bulan ini
          </span>
        </div>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Bulan <span className="text-red-500">*</span></label>
              <input
                type="month"
                value={form.bulan}
                onChange={(e) => setForm({ ...form, bulan: e.target.value })}
                required
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gaji Pokok <span className="text-red-500">*</span></label>
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
          <div className="p-8 text-center text-gray-500">Belum ada data gaji. Klik "Generate Payroll" untuk memulai.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">NIK</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Nama</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Bulan</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Gaji Pokok</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Tunjangan</th>
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
                    <td className="px-4 py-3 text-sm text-right">{formatCurrency(Number(row.tunjangan))}</td>
                    <td className="px-4 py-3 text-sm text-right">{formatCurrency(Number(row.bonus))}</td>
                    <td className="px-4 py-3 text-sm text-right text-red-600">{formatCurrency(Number(row.potongan))}</td>
                    <td className="px-4 py-3 text-sm text-right font-bold">{formatCurrency(Number(row.total))}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => downloadSlip(row)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Slip
                        </button>
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Hapus
                        </button>
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
