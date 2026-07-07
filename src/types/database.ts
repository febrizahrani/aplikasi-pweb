export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: "admin" | "manager" | "karyawan";
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role?: "admin" | "manager" | "karyawan";
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: "admin" | "manager" | "karyawan";
          created_at?: string;
        };
        Relationships: [];
      };
      departments: {
        Row: {
          id: string;
          nama_departemen: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          nama_departemen: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          nama_departemen?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      positions: {
        Row: {
          id: string;
          nama_jabatan: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          nama_jabatan: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          nama_jabatan?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      employees: {
        Row: {
          id: string;
          nik: string;
          nama: string;
          email: string | null;
          phone: string | null;
          gender: "Laki-laki" | "Perempuan" | null;
          department_id: string | null;
          position_id: string | null;
          status: "Aktif" | "Non-aktif" | "Cuti";
          tanggal_masuk: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nik: string;
          nama: string;
          email?: string | null;
          phone?: string | null;
          gender?: "Laki-laki" | "Perempuan" | null;
          department_id?: string | null;
          position_id?: string | null;
          status?: "Aktif" | "Non-aktif" | "Cuti";
          tanggal_masuk: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nik?: string;
          nama?: string;
          email?: string | null;
          phone?: string | null;
          gender?: "Laki-laki" | "Perempuan" | null;
          department_id?: string | null;
          position_id?: string | null;
          status?: "Aktif" | "Non-aktif" | "Cuti";
          tanggal_masuk?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "employees_department_id_fkey";
            columns: ["department_id"];
            isOneToOne: false;
            referencedRelation: "departments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "employees_position_id_fkey";
            columns: ["position_id"];
            isOneToOne: false;
            referencedRelation: "positions";
            referencedColumns: ["id"];
          }
        ];
      };
      attendance: {
        Row: {
          id: string;
          employee_id: string;
          tanggal: string;
          check_in: string | null;
          check_out: string | null;
          status: "Hadir" | "Izin" | "Sakit" | "Alpha";
          created_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          tanggal?: string;
          check_in?: string | null;
          check_out?: string | null;
          status: "Hadir" | "Izin" | "Sakit" | "Alpha";
          created_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          tanggal?: string;
          check_in?: string | null;
          check_out?: string | null;
          status?: "Hadir" | "Izin" | "Sakit" | "Alpha";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "attendance_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          }
        ];
      };
      payroll: {
        Row: {
          id: string;
          employee_id: string;
          gaji_pokok: number;
          bonus: number;
          tunjangan: number;
          potongan: number;
          total: number;
          bulan: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          gaji_pokok: number;
          bonus?: number;
          tunjangan?: number;
          potongan?: number;
          total?: number;
          bulan: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          gaji_pokok?: number;
          bonus?: number;
          tunjangan?: number;
          potongan?: number;
          total?: number;
          bulan?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payroll_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          }
        ];
      };
      performance: {
        Row: {
          id: string;
          employee_id: string;
          disiplin: number;
          kehadiran: number;
          teamwork: number;
          tanggung_jawab: number;
          nilai: number;
          periode: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          disiplin: number;
          kehadiran: number;
          teamwork: number;
          tanggung_jawab: number;
          nilai?: number;
          periode: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          disiplin?: number;
          kehadiran?: number;
          teamwork?: number;
          tanggung_jawab?: number;
          nilai?: number;
          periode?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "performance_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      employee_list: {
        Row: {
          id: string;
          nik: string;
          nama: string;
          email: string | null;
          phone: string | null;
          gender: "Laki-laki" | "Perempuan" | null;
          department_id: string | null;
          position_id: string | null;
          status: "Aktif" | "Non-aktif" | "Cuti";
          tanggal_masuk: string;
          created_at: string;
          updated_at: string;
          nama_departemen: string | null;
          nama_jabatan: string | null;
        };
        Relationships: [];
      };
      dashboard_stats: {
        Row: {
          total_employees: number;
          total_departments: number;
          today_attendance: number;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      user_role: "admin" | "manager" | "karyawan";
      employee_status: "Aktif" | "Non-aktif" | "Cuti";
      gender: "Laki-laki" | "Perempuan";
      attendance_status: "Hadir" | "Izin" | "Sakit" | "Alpha";
    };
    CompositeTypes: Record<string, never>;
  };
}
