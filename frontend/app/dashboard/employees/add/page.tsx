'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const DEPARTMENTS = ['Engineering', 'HR', 'Marketing', 'Finance', 'Design', 'Sales', 'Operations', 'IT', 'Legal', 'Management'];

interface FormData {
  full_name: string;
  email: string;
  department: string;
  designation: string;
  status: string;
}

interface FormErrors {
  full_name?: string;
  email?: string;
  department?: string;
  designation?: string;
}

export default function AddEmployeePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    full_name: '', email: '', department: '', designation: '', status: 'Active',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
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
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await api.post('/employees', formData);
      toast.success('Employee added successfully!');
      router.push('/dashboard/employees');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add employee.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      {/* Header */}
      <div className="page-header">
        <div>
          <Link href="/dashboard/employees" className="text-sm text-brand-600 hover:underline flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3 h-3" /> Back to Employees
          </Link>
          <h1 className="page-title">Add New Employee</h1>
          <p className="page-subtitle">Fill in the details to register a new employee</p>
        </div>
      </div>

      {/* Form */}
      <div className="card">
        <div className="card-header flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-100 rounded-lg flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-brand-600" />
          </div>
          <h2 className="font-semibold text-slate-900">Employee Information</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="label">Full Name <span className="text-red-500">*</span></label>
              <input
                name="full_name"
                className={`input ${errors.full_name ? 'input-error' : ''}`}
                placeholder="e.g., Antony Joseph"
                value={formData.full_name}
                onChange={handleChange}
              />
              {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="label">Email Address <span className="text-red-500">*</span></label>
              <input
                name="email"
                type="email"
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="employee@company.com"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Department & Designation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Department <span className="text-red-500">*</span></label>
                <select
                  name="department"
                  className={`select ${errors.department ? 'input-error' : ''}`}
                  value={formData.department}
                  onChange={handleChange}
                >
                  <option value="">Select Department</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
              </div>

              <div>
                <label className="label">Designation <span className="text-red-500">*</span></label>
                <input
                  name="designation"
                  className={`input ${errors.designation ? 'input-error' : ''}`}
                  placeholder="e.g., Software Engineer"
                  value={formData.designation}
                  onChange={handleChange}
                />
                {errors.designation && <p className="text-red-500 text-xs mt-1">{errors.designation}</p>}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="label">Status</label>
              <select name="status" className="select" value={formData.status} onChange={handleChange}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={isLoading} className="btn-primary">
                {isLoading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-4 h-4" /> Save Employee</>
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
