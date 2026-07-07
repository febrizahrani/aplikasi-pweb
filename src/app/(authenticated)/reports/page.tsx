"use client";

import { useState, useEffect } from "react";
import { getPayrollByMonth } from "@/actions/payroll";
import { getPerformanceByPeriod } from "@/actions/performance";
import { getAttendanceByDate } from "@/actions/attendance";
import { getDepartments } from "@/actions/departments";
import type { PayrollWithEmployee, PerformanceWithEmployee, Department } from "@/types";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"payroll" | "performance" | "attendance">("payroll");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [payrollData, setPayrollData] = useState<PayrollWithEmployee[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceWithEmployee[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    bulan: new Date().toISOString().slice(0, 7),
    periode: `${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}`,
    tanggal: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    getDepartments().then(setDepartments);
  }, []);

  async function loadPayroll() {
    setLoading(true);
    try {
      const data = await getPayrollByMonth(filters.bulan);
      setPayrollData(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  async function loadPerformance() {
    setLoading(true);
    try {
      const data = await getPerformanceByPeriod(filters.periode);
      setPerformanceData(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  async function loadAttendance() {
    setLoading(true);
    try {
      const data = await getAttendanceByDate(filters.tanggal);
      setAttendanceData(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }

  function handleLoad() {
    if (activeTab === "payroll") loadPayroll();
    else if (activeTab === "performance") loadPerformance();
    else loadAttendance();
  }

  function exportCSV() {
    let csv = "";
    let filename = "";

    if (activeTab === "payroll") {
      csv = "NIK,Nama,Gaji Pokok,Bonus,Tunjangan,Potongan,Total\n";
      payrollData.forEach((row) => {
        csv += `${row.employee?.nik || ""},${row.employee?.nama || ""},${row.gaji_pokok},${row.bonus},${row.tunjangan},${row.potongan},${row.total}\n`;
      });
      filename = `laporan-gaji-${filters.bulan}.csv`;
    } else if (activeTab === "performance") {
      csv = "NIK,Nama,Disiplin,Kehadiran,Kerjasama,Tanggung Jawab,Nilai\n";
      performanceData.forEach((row) => {
        csv += `${row.employee?.nik || ""},${row.employee?.nama || ""},${row.disiplin},${row.kehadiran},${row.teamwork},${row.tanggung_jawab},${row.nilai}\n`;
      });
      filename = `laporan-penilaian-${filters.periode}.csv`;
    } else {
      csv = "NIK,Nama,Status\n";
      attendanceData.forEach((row) => {
        csv += `${row.employee?.nik || ""},${row.employee?.nama || ""},${row.status}\n`;
      });
      filename = `laporan-absensi-${filters.tanggal}.csv`;
    }

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const title = activeTab === "payroll"
      ? `Laporan Gaji - ${filters.bulan}`
      : activeTab === "performance"
        ? `Laporan Penilaian - ${filters.periode}`
        : `Laporan Absensi - ${filters.tanggal}`;

    let tableHTML = "";

    if (activeTab === "payroll" && payrollData.length > 0) {
      tableHTML = `
        <table>
          <thead>
            <tr><th>NIK</th><th>Nama</th><th>Gaji Pokok</th><th>Bonus</th><th>Tunjangan</th><th>Potongan</th><th>Total</th></tr>
          </thead>
          <tbody>
            ${payrollData.map((row) => `
              <tr>
                <td>${row.employee?.nik || ""}</td>
                <td>${row.employee?.nama || ""}</td>
                <td style="text-align:right">${formatCurrency(Number(row.gaji_pokok))}</td>
                <td style="text-align:right">${formatCurrency(Number(row.bonus))}</td>
                <td style="text-align:right">${formatCurrency(Number(row.tunjangan))}</td>
                <td style="text-align:right">${formatCurrency(Number(row.potongan))}</td>
                <td style="text-align:right;font-weight:bold">${formatCurrency(Number(row.total))}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    } else if (activeTab === "performance" && performanceData.length > 0) {
      tableHTML = `
        <table>
          <thead>
            <tr><th>NIK</th><th>Nama</th><th>Disiplin</th><th>Kehadiran</th><th>Kerjasama</th><th>Tanggung Jawab</th><th>Nilai</th></tr>
          </thead>
          <tbody>
            ${performanceData.map((row) => `
              <tr>
                <td>${row.employee?.nik || ""}</td>
                <td>${row.employee?.nama || ""}</td>
                <td style="text-align:center">${row.disiplin}</td>
                <td style="text-align:center">${row.kehadiran}</td>
                <td style="text-align:center">${row.teamwork}</td>
                <td style="text-align:center">${row.tanggung_jawab}</td>
                <td style="text-align:center;font-weight:bold">${Number(row.nilai).toFixed(2)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    } else if (activeTab === "attendance" && attendanceData.length > 0) {
      tableHTML = `
        <table>
          <thead>
            <tr><th>NIK</th><th>Nama</th><th>Status</th></tr>
          </thead>
          <tbody>
            ${attendanceData.map((row) => `
              <tr>
                <td>${row.employee?.nik || ""}</td>
                <td>${row.employee?.nama || ""}</td>
                <td>${row.status}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    } else {
      tableHTML = "<p style='text-align:center;color:#666'>Tidak ada data untuk ditampilkan</p>";
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { font-size: 20px; margin-bottom: 5px; }
          p { color: #666; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; font-size: 12px; }
          th { background: #f3f4f6; font-weight: 600; }
          tr:nth-child(even) { background: #f9fafb; }
        </style>
      </head>
      <body>
        <h1>HRIS Lite - ${title}</h1>
        <p>Dicetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
        ${tableHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Laporan</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <TabButton
          active={activeTab === "payroll"}
          onClick={() => setActiveTab("payroll")}
        >
          Laporan Gaji
        </TabButton>
        <TabButton
          active={activeTab === "performance"}
          onClick={() => setActiveTab("performance")}
        >
          Laporan Penilaian
        </TabButton>
        <TabButton
          active={activeTab === "attendance"}
          onClick={() => setActiveTab("attendance")}
        >
          Laporan Absensi
        </TabButton>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          {activeTab === "payroll" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bulan
              </label>
              <input
                type="month"
                value={filters.bulan}
                onChange={(e) => setFilters({ ...filters, bulan: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          )}

          {activeTab === "performance" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Periode
              </label>
              <select
                value={filters.periode}
                onChange={(e) => setFilters({ ...filters, periode: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value={`${new Date().getFullYear()}-Q1`}>Q1 {new Date().getFullYear()}</option>
                <option value={`${new Date().getFullYear()}-Q2`}>Q2 {new Date().getFullYear()}</option>
                <option value={`${new Date().getFullYear()}-Q3`}>Q3 {new Date().getFullYear()}</option>
                <option value={`${new Date().getFullYear()}-Q4`}>Q4 {new Date().getFullYear()}</option>
              </select>
            </div>
          )}

          {activeTab === "attendance" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal
              </label>
              <input
                type="date"
                value={filters.tanggal}
                onChange={(e) => setFilters({ ...filters, tanggal: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          )}

          <button
            onClick={handleLoad}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Memuat..." : "Tampilkan"}
          </button>

          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Export CSV
          </button>

          <button
            onClick={exportPDF}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm">
        {activeTab === "payroll" && (
          <PayrollTable data={payrollData} formatCurrency={formatCurrency} />
        )}
        {activeTab === "performance" && <PerformanceTable data={performanceData} />}
        {activeTab === "attendance" && <AttendanceTable data={attendanceData} />}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg transition ${
        active
          ? "bg-blue-600 text-white"
          : "bg-white text-gray-600 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

function PayrollTable({
  data,
  formatCurrency,
}: {
  data: PayrollWithEmployee[];
  formatCurrency: (amount: number) => string;
}) {
  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        Klik &quot;Tampilkan&quot; untuk memuat data
      </div>
    );
  }

  const totalGaji = data.reduce((sum, row) => sum + Number(row.gaji_pokok), 0);
  const totalBonus = data.reduce((sum, row) => sum + Number(row.bonus), 0);
  const totalTunjangan = data.reduce((sum, row) => sum + Number(row.tunjangan), 0);
  const totalPotongan = data.reduce((sum, row) => sum + Number(row.potongan), 0);
  const totalAll = data.reduce((sum, row) => sum + Number(row.total), 0);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">NIK</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Nama</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Gaji Pokok</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Bonus</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Tunjangan</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Potongan</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm">{row.employee?.nik}</td>
              <td className="px-4 py-3 text-sm">{row.employee?.nama}</td>
              <td className="px-4 py-3 text-sm text-right">{formatCurrency(Number(row.gaji_pokok))}</td>
              <td className="px-4 py-3 text-sm text-right">{formatCurrency(Number(row.bonus))}</td>
              <td className="px-4 py-3 text-sm text-right">{formatCurrency(Number(row.tunjangan))}</td>
              <td className="px-4 py-3 text-sm text-right">{formatCurrency(Number(row.potongan))}</td>
              <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(Number(row.total))}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-50 font-medium">
          <tr>
            <td colSpan={2} className="px-4 py-3 text-sm">Total</td>
            <td className="px-4 py-3 text-sm text-right">{formatCurrency(totalGaji)}</td>
            <td className="px-4 py-3 text-sm text-right">{formatCurrency(totalBonus)}</td>
            <td className="px-4 py-3 text-sm text-right">{formatCurrency(totalTunjangan)}</td>
            <td className="px-4 py-3 text-sm text-right">{formatCurrency(totalPotongan)}</td>
            <td className="px-4 py-3 text-sm text-right">{formatCurrency(totalAll)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function PerformanceTable({ data }: { data: PerformanceWithEmployee[] }) {
  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        Klik &quot;Tampilkan&quot; untuk memuat data
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">NIK</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Nama</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Disiplin</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Kehadiran</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Kerjasama</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Tanggung Jawab</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Nilai</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm">{row.employee?.nik}</td>
              <td className="px-4 py-3 text-sm">{row.employee?.nama}</td>
              <td className="px-4 py-3 text-sm text-center">{row.disiplin}</td>
              <td className="px-4 py-3 text-sm text-center">{row.kehadiran}</td>
              <td className="px-4 py-3 text-sm text-center">{row.teamwork}</td>
              <td className="px-4 py-3 text-sm text-center">{row.tanggung_jawab}</td>
              <td className="px-4 py-3 text-sm text-center font-medium">{Number(row.nilai).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AttendanceTable({ data }: { data: { employee: { id: string; nik: string; nama: string } | null; status: string }[] }) {
  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        Klik &quot;Tampilkan&quot; untuk memuat data
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    Hadir: "bg-green-100 text-green-800",
    Izin: "bg-yellow-100 text-yellow-800",
    Sakit: "bg-blue-100 text-blue-800",
    Alpha: "bg-red-100 text-red-800",
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">NIK</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Nama</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm">{row.employee?.nik}</td>
              <td className="px-4 py-3 text-sm">{row.employee?.nama}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[row.status] || "bg-gray-100 text-gray-800"}`}>
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
