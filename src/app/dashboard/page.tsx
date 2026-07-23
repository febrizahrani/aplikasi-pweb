import DashboardCharts from "@/components/DashboardCharts";

async function safeGetStats() {
  try {
    const { getDashboardStats } = await import("@/actions/dashboard");
    return await getDashboardStats();
  } catch {
    return { total_employees: 0, active_employees: 0, total_departments: 0, today_attendance: 0 };
  }
}

async function safeGetRecentEmployees() {
  try {
    const { getRecentEmployees } = await import("@/actions/dashboard");
    return await getRecentEmployees(5);
  } catch {
    return [];
  }
}

async function safeGetChartData() {
  try {
    const { getAttendanceChartData } = await import("@/actions/dashboard");
    return await getAttendanceChartData();
  } catch {
    return [];
  }
}

async function safeGetDepartmentData() {
  try {
    const { getDepartmentDistribution } = await import("@/actions/dashboard");
    return await getDepartmentDistribution();
  } catch {
    return [];
  }
}

async function safeGetAttendance() {
  try {
    const { getAttendanceByDate } = await import("@/actions/attendance");
    const today = new Date().toISOString().split("T")[0];
    return await getAttendanceByDate(today);
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  const [stats, recentEmployees, chartData, departmentData, todayAttendance] =
    await Promise.all([
      safeGetStats(),
      safeGetRecentEmployees(),
      safeGetChartData(),
      safeGetDepartmentData(),
      safeGetAttendance(),
    ]);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Pegawai"
          value={stats.total_employees.toString()}
          icon="👥"
          color="blue"
        />
        <StatCard
          title="Departemen"
          value={stats.total_departments.toString()}
          icon="🏢"
          color="purple"
        />
        <StatCard
          title="Pegawai Aktif"
          value={stats.active_employees.toString()}
          icon="✅"
          color="green"
        />
        <StatCard
          title="Kehadiran Hari Ini"
          value={todayAttendance.length.toString()}
          icon="📅"
          color="orange"
        />
      </div>

      {/* Charts */}
      <DashboardCharts
        chartData={chartData}
        departmentData={departmentData}
      />

      {/* Recent Employees */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Pegawai Terbaru
          </h3>
          <a href="/employees" className="text-blue-600 hover:text-blue-800 text-sm">
            Lihat Semua
          </a>
        </div>

        {recentEmployees.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Belum ada data pegawai</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left text-sm font-medium text-gray-500 pb-3">NIK</th>
                  <th className="text-left text-sm font-medium text-gray-500 pb-3">Nama</th>
                  <th className="text-left text-sm font-medium text-gray-500 pb-3 hidden md:table-cell">Departemen</th>
                  <th className="text-left text-sm font-medium text-gray-500 pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentEmployees.map((emp: { id: string; nik: string; nama: string; status: string; department: { nama_departemen?: string } | null }) => (
                  <tr key={emp.id}>
                    <td className="py-3 text-sm text-gray-900">{emp.nik}</td>
                    <td className="py-3 text-sm text-gray-900">{emp.nama}</td>
                    <td className="py-3 text-sm text-gray-600 hidden md:table-cell">
                      {emp.department?.nama_departemen || "-"}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={emp.status} />
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

function StatCard({ title, value, icon, color }: { title: string; value: string; icon: string; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colors[color]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
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
