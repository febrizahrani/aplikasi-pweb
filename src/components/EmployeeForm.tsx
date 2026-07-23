"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEmployee, updateEmployee } from "@/actions/employees";
import type {
  Department,
  Position,
  Employee,
  EmployeeInsert,
} from "@/types";

interface EmployeeFormProps {
  departments: Department[];
  positions: Position[];
  employee?: Employee;
}

export default function EmployeeForm({
  departments,
  positions,
  employee,
}: EmployeeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    nik: employee?.nik || "",
    nama: employee?.nama || "",
    email: employee?.email || "",
    phone: employee?.phone || "",
    gender: employee?.gender || ("Laki-laki" as const),
    department_id: employee?.department_id || "",
    position_id: employee?.position_id || "",
    status: employee?.status || ("Aktif" as const),
    tanggal_masuk: employee?.tanggal_masuk || new Date().toISOString().split("T")[0],
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const newErrors: Record<string, string> = {};
    if (!form.nik.trim()) newErrors.nik = "NIK wajib diisi";
    if (!form.nama.trim()) newErrors.nama = "Nama wajib diisi";
    if (!form.tanggal_masuk) newErrors.tanggal_masuk = "Tanggal masuk wajib diisi";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const payload = {
        nik: form.nik,
        nama: form.nama,
        email: form.email || null,
        phone: form.phone || null,
        gender: form.gender || undefined,
        department_id: form.department_id || null,
        position_id: form.position_id || null,
        status: form.status,
        tanggal_masuk: form.tanggal_masuk,
      };

      if (employee) {
        await updateEmployee(employee.id, payload);
      } else {
        await createEmployee(payload);
      }

      router.push("/employees");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(message);
    }
    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow-sm p-6"
    >
      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <p className="text-sm text-gray-500 mb-4">
        Field dengan tanda <span className="text-red-500">*</span> wajib diisi
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="NIK" required error={errors.nik}>
          <input
            type="text"
            name="nik"
            value={form.nik}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.nik ? "border-red-500 bg-red-50" : "border-gray-300"}`}
            placeholder="Masukkan NIK"
          />
        </FormField>

        <FormField label="Nama Lengkap" required error={errors.nama}>
          <input
            type="text"
            name="nama"
            value={form.nama}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.nama ? "border-red-500 bg-red-50" : "border-gray-300"}`}
            placeholder="Masukkan nama lengkap"
          />
        </FormField>

        <FormField label="Email">
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="email@perusahaan.com"
          />
        </FormField>

        <FormField label="No. HP">
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="08xxxxxxxxxx"
          />
        </FormField>

        <FormField label="Jenis Kelamin" required>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </FormField>

        <FormField label="Status" required>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="Aktif">Aktif</option>
            <option value="Non-aktif">Non-aktif</option>
            <option value="Cuti">Cuti</option>
          </select>
        </FormField>

        <FormField label="Departemen">
          <select
            name="department_id"
            value={form.department_id}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">Pilih Departemen</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.nama_departemen}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Jabatan">
          <select
            name="position_id"
            value={form.position_id}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">Pilih Jabatan</option>
            {positions.map((pos) => (
              <option key={pos.id} value={pos.id}>
                {pos.nama_jabatan}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Tanggal Masuk" required error={errors.tanggal_masuk}>
          <input
            type="date"
            name="tanggal_masuk"
            value={form.tanggal_masuk}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.tanggal_masuk ? "border-red-500 bg-red-50" : "border-gray-300"}`}
          />
        </FormField>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading
            ? "Menyimpan..."
            : employee
              ? "Simpan Perubahan"
              : "Tambah Pegawai"}
        </button>
      </div>
    </form>
  );
}

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}
