import type { Database } from "./database";
export type { Database } from "./database";

// Table row types
export type User = Database["public"]["Tables"]["users"]["Row"];
export type Department = Database["public"]["Tables"]["departments"]["Row"];
export type Position = Database["public"]["Tables"]["positions"]["Row"];
export type Employee = Database["public"]["Tables"]["employees"]["Row"];
export type Attendance = Database["public"]["Tables"]["attendance"]["Row"];
export type Payroll = Database["public"]["Tables"]["payroll"]["Row"];
export type Performance = Database["public"]["Tables"]["performance"]["Row"];

// Insert types
export type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
export type DepartmentInsert = Database["public"]["Tables"]["departments"]["Insert"];
export type PositionInsert = Database["public"]["Tables"]["positions"]["Insert"];
export type EmployeeInsert = Database["public"]["Tables"]["employees"]["Insert"];
export type AttendanceInsert = Database["public"]["Tables"]["attendance"]["Insert"];
export type PayrollInsert = Database["public"]["Tables"]["payroll"]["Insert"];
export type PerformanceInsert = Database["public"]["Tables"]["performance"]["Insert"];

// Update types
export type UserUpdate = Database["public"]["Tables"]["users"]["Update"];
export type DepartmentUpdate = Database["public"]["Tables"]["departments"]["Update"];
export type PositionUpdate = Database["public"]["Tables"]["positions"]["Update"];
export type EmployeeUpdate = Database["public"]["Tables"]["employees"]["Update"];
export type AttendanceUpdate = Database["public"]["Tables"]["attendance"]["Update"];
export type PayrollUpdate = Database["public"]["Tables"]["payroll"]["Update"];
export type PerformanceUpdate = Database["public"]["Tables"]["performance"]["Update"];

// View types
export type EmployeeList = Database["public"]["Views"]["employee_list"]["Row"];
export type DashboardStats = Database["public"]["Views"]["dashboard_stats"]["Row"];

// Enum types
export type UserRole = Database["public"]["Enums"]["user_role"];
export type EmployeeStatus = Database["public"]["Enums"]["employee_status"];
export type Gender = Database["public"]["Enums"]["gender"];
export type AttendanceStatus = Database["public"]["Enums"]["attendance_status"];

// Extended types with relations
export interface EmployeeWithRelations extends Employee {
  department?: Department | null;
  position?: Position | null;
}

export interface AttendanceWithEmployee extends Attendance {
  employee?: Employee | null;
}

export interface PayrollWithEmployee extends Payroll {
  employee?: Employee | null;
}

export interface PerformanceWithEmployee extends Performance {
  employee?: Employee | null;
}
