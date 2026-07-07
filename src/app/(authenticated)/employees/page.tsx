import { getEmployees } from "@/actions/employees";
import EmployeeTable from "@/components/EmployeeTable";

export default async function EmployeesPage() {
  const employees = await getEmployees();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Data Pegawai</h2>
        <a
          href="/employees/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Tambah Pegawai
        </a>
      </div>

      <EmployeeTable employees={employees} />
    </div>
  );
}
