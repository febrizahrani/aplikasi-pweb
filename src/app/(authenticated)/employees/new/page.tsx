import { getDepartments } from "@/actions/departments";
import { getPositions } from "@/actions/positions";
import EmployeeForm from "@/components/EmployeeForm";

export default async function NewEmployeePage() {
  const [departments, positions] = await Promise.all([
    getDepartments(),
    getPositions(),
  ]);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Tambah Pegawai Baru
      </h2>
      <EmployeeForm departments={departments} positions={positions} />
    </div>
  );
}
