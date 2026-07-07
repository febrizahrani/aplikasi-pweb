import { getEmployeeById } from "@/actions/employees";
import { notFound } from "next/navigation";
import EmployeeDetail from "@/components/EmployeeDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EmployeeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const employee = await getEmployeeById(id);

  if (!employee) {
    notFound();
  }

  return <EmployeeDetail employee={employee} />;
}
