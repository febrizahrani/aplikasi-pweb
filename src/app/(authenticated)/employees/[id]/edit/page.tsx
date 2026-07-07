import { getEmployeeById } from "@/actions/employees";
import { getDepartments } from "@/actions/departments";
import { getPositions } from "@/actions/positions";
import EmployeeForm from "@/components/EmployeeForm";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEmployeePage({ params }: PageProps) {
  const { id } = await params;
  const [employee, departments, positions] = await Promise.all([
    getEmployeeById(id),
    getDepartments(),
    getPositions(),
  ]);

  if (!employee) {
    notFound();
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Edit Pegawai
      </h2>
      <EmployeeForm
        departments={departments}
        positions={positions}
        employee={employee}
      />
    </div>
  );
}
