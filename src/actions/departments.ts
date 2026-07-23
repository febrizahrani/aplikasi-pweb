"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any;

export async function getDepartments() {
  const supabase: SupabaseClient = await createClient();
  try {
    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .order("nama_departemen");

    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

export async function createDepartment(input: { nama_departemen: string }) {
  const supabase: SupabaseClient = await createClient();
  const { data, error } = await supabase
    .from("departments")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/employees");
  return data;
}

export async function deleteDepartment(id: string) {
  const supabase: SupabaseClient = await createClient();
  const { error } = await supabase.from("departments").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/employees");
}

interface OrgTreeNode {
  id: string;
  name: string;
  parentId: string | null;
  children: OrgTreeNode[];
  employees: { nama: string; jabatan: string | null }[];
}

export async function getDepartmentHierarchy() {
  const supabase: SupabaseClient = await createClient();
  try {
    const { data: departments, error } = await supabase
      .from("departments")
      .select("id, nama_departemen, parent_id")
      .order("nama_departemen");

    if (error) throw error;

    const { data: employees } = await supabase
      .from("employees")
      .select("department_id, nama, position:positions(nama_jabatan)")
      .eq("status", "Aktif");

    const deptMap = new Map<string, OrgTreeNode>();

    (departments || []).forEach((d: { id: string; nama_departemen: string; parent_id: string | null }) => {
      deptMap.set(d.id, {
        id: d.id,
        name: d.nama_departemen,
        parentId: d.parent_id,
        children: [],
        employees: [],
      });
    });

    (employees || []).forEach((e: { department_id: string; nama: string; position: unknown }) => {
      const dept = deptMap.get(e.department_id);
      if (dept) {
        const pos = Array.isArray(e.position) && e.position.length > 0
          ? (e.position[0] as { nama_jabatan: string }).nama_jabatan
          : null;
        dept.employees.push({ nama: e.nama, jabatan: pos });
      }
    });

    const roots: OrgTreeNode[] = [];
    deptMap.forEach((dept) => {
      if (dept.parentId && deptMap.has(dept.parentId)) {
        deptMap.get(dept.parentId)!.children.push(dept);
      } else {
        roots.push(dept);
      }
    });

    return roots;
  } catch {
    return [];
  }
}

export async function updateDepartment(id: string, input: { nama_departemen?: string; parent_id?: string | null }) {
  const supabase: SupabaseClient = await createClient();
  const { error } = await supabase.from("departments").update(input).eq("id", id);
  if (error) throw error;
  revalidatePath("/orgchart");
  revalidatePath("/employees");
}
