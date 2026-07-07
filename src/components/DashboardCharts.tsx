"use client";

interface ChartData {
  date: string;
  label: string;
  hadir: number;
}

interface DepartmentData {
  department: string;
  count: number;
}

interface DashboardChartsProps {
  chartData: ChartData[];
  departmentData: DepartmentData[];
}

export default function DashboardCharts({
  chartData,
  departmentData,
}: DashboardChartsProps) {
  const maxHadir = Math.max(...chartData.map((d) => d.hadir), 1);
  const totalEmployees = departmentData.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Attendance Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Kehadiran 7 Hari Terakhir
        </h3>
        <div className="flex items-end justify-between h-48 gap-2">
          {chartData.map((item) => (
            <div key={item.date} className="flex flex-col items-center flex-1">
              <span className="text-xs text-gray-500 mb-2">{item.hadir}</span>
              <div
                className="w-full bg-blue-500 rounded-t"
                style={{
                  height: `${(item.hadir / maxHadir) * 120}px`,
                  minHeight: item.hadir > 0 ? "8px" : "2px",
                }}
              />
              <span className="text-xs text-gray-500 mt-2">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Department Distribution */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Distribusi Departemen
        </h3>
        {departmentData.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Tidak ada data</p>
        ) : (
          <div className="space-y-4">
            {departmentData.map((dept) => {
              const percentage =
                totalEmployees > 0
                  ? Math.round((dept.count / totalEmployees) * 100)
                  : 0;

              return (
                <div key={dept.department}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{dept.department}</span>
                    <span className="text-gray-500">
                      {dept.count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 rounded-full h-2"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
