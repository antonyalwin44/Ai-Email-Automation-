'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import api from '@/lib/api';

const DEPARTMENTS = ['Engineering', 'HR', 'Marketing', 'Finance', 'Design', 'Sales', 'Operations', 'IT', 'Legal', 'Management'];

interface FormData {
  full_name: string;
  email: string;
  department: string;
  designation: string;
  status: string;
}

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [formData, setFormData] = useState<FormData>({
    full_name: '', email: '', department: '', designation: '', status: 'Active',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await api.get(`/employees/${id}`);
        const { full_name, email, department, designation, status } = res.data.employee;
        setFormData({ full_name, email, department, designation, status });
      } catch {
        toast.error('Employee not found.');
        router.push('/dashboard/employees');
      } finally {
        setIsFetching(false);
      }
    };
    fetchEmployee();
  }, [id]);

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.designation.trim()) newErrors.designation = 'Designation is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await api.put(`/employees/${id}`, formData);
      toast.success('Employee updated successfully!');
      router.push('/dashboard/employees');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update employee.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <LoadingSpinner fullPage text="Loading employee..." />;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="page-header">
        <div>
          <Link href="/dashboard/employees" className="text-sm text-brand-600 hover:underline flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3 h-3" /> Back to Employees
          </Link>
          <h1 className="page-title">Edit Employee</h1>
          <p className="page-subtitle">Update employee information</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
            <Edit2 className="w-5 h-5 text-amber-600" />
          </div>
          <h2 className="font-semibold text-slate-900">Edit Information</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Full Name <span className="text-red-500">*</span></label>
              <input name="full_name" className={`input ${errors.full_name ? 'input-error' : ''}`} value={formData.full_name} onChange={handleChange} />
              {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
            </div>
            <div>
              <label className="label">Email Address <span className="text-red-500">*</span></label>
              <input name="email" type="email" className={`input ${errors.email ? 'input-error' : ''}`} value={formData.email} onChange={handleChange} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Department <span className="text-red-500">*</span></label>
                <select name="department" className={`select ${errors.department ? 'input-error' : ''}`} value={formData.department} onChange={handleChange}>
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
              </div>
              <div>
                <label className="label">Designation <span className="text-red-500">*</span></label>
                <input name="designation" className={`input ${errors.designation ? 'input-error' : ''}`} value={formData.designation} onChange={handleChange} />
                {errors.designation && <p className="text-red-500 text-xs mt-1">{errors.designation}</p>}
              </div>
            </div>
            <div>
              <label className="label">Status</label>
              <select name="status" className="select" value={formData.status} onChange={handleChange}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={isLoading} className="btn-primary">
                {isLoading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-4 h-4" /> Update Employee</>
                )}
              </button>
              <Link href="/dashboard/employees" className="btn-secondary">Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
