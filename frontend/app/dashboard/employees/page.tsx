'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit2, Trash2, Filter, Users, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import LoadingSpinner from '@/components/LoadingSpinner';
import api from '@/lib/api';

interface Employee {
  id: number;
  full_name: string;
  email: string;
  department: string;
  designation: string;
  status: 'Active' | 'Inactive';
  created_at: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/employees', {
        params: { search, department: deptFilter, status: statusFilter, page, limit: 10 },
      });
      setEmployees(res.data.employees);
      setDepartments(res.data.departments);
      setTotalPages(res.data.pagination.totalPages);
      setTotal(res.data.pagination.total);
    } catch (error) {
      toast.error('Failed to load employees.');
    } finally {
      setIsLoading(false);
    }
  }, [search, deptFilter, statusFilter, page]);

  useEffect(() => { loadEmployees(); }, [loadEmployees]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/employees/${deleteId}`);
      toast.success('Employee deleted successfully!');
      setDeleteId(null);
      loadEmployees();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Delete failed.');
    } finally {
      setIsDeleting(false);
    }
  };

  const exportCSV = () => {
    const headers = ['ID', 'Full Name', 'Email', 'Department', 'Designation', 'Status'];
    const rows = employees.map((e) => [e.id, e.full_name, e.email, e.department, e.designation, e.status]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employees.csv';
    a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Employee Management</h1>
          <p className="page-subtitle">{total} employees in the system</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="btn-secondary btn-sm">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <Link href="/dashboard/employees/add" className="btn-primary">
            <Plus className="w-4 h-4" /> Add Employee
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="input pl-10"
              placeholder="Search by name, email or designation..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                className="select pl-9 pr-8 w-44"
                value={deptFilter}
                onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Departments</option>
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <select
              className="select w-36"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {isLoading ? (
          <div className="py-16 flex justify-center"><LoadingSpinner text="Loading employees..." /></div>
        ) : employees.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No employees found.</p>
            <Link href="/dashboard/employees/add" className="text-brand-600 text-sm font-medium hover:underline mt-1 inline-block">
              Add your first employee →
            </Link>
          </div>
        ) : (
          <>
            <div className="table-wrapper rounded-none border-0">
              <table className="table">
                <thead>
                  <tr>
                    <th>#ID</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id}>
                      <td className="text-slate-400 font-mono text-xs">#{emp.id}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-brand-700 font-semibold text-xs">
                              {emp.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-slate-900">{emp.full_name}</span>
                        </div>
                      </td>
                      <td className="text-slate-500">{emp.email}</td>
                      <td>
                        <span className="badge badge-blue">{emp.department}</span>
                      </td>
                      <td className="text-slate-600">{emp.designation}</td>
                      <td><StatusBadge status={emp.status} /></td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/dashboard/employees/${emp.id}/edit`}
                            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteId(emp.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="btn-secondary btn-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="btn-secondary btn-sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Employee"
        message="Are you sure you want to delete this employee? This action cannot be undone."
        confirmText="Delete Employee"
        isLoading={isDeleting}
      />
    </div>
  );
}
