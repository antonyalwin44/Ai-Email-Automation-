'use client';

import { Settings, Database, Mail, Key, Globe, Info } from 'lucide-react';

const CONFIG_ITEMS = [
  {
    section: 'Backend API',
    icon: Globe,
    color: 'bg-blue-100 text-blue-600',
    items: [
      { label: 'API URL', value: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api', type: 'url' },
    ],
  },
  {
    section: 'Database',
    icon: Database,
    color: 'bg-purple-100 text-purple-600',
    items: [
      { label: 'Database Type', value: 'MySQL', type: 'text' },
      { label: 'Database Name', value: 'email_automation', type: 'text' },
    ],
  },
  {
    section: 'AI Service',
    icon: Key,
    color: 'bg-amber-100 text-amber-600',
    items: [
      { label: 'AI Provider', value: 'Google Gemini AI', type: 'text' },
      { label: 'Model', value: 'gemini-1.5-flash', type: 'text' },
    ],
  },
  {
    section: 'Email Service',
    icon: Mail,
    color: 'bg-emerald-100 text-emerald-600',
    items: [
      { label: 'SMTP Provider', value: 'Gmail SMTP', type: 'text' },
      { label: 'Transport', value: 'Nodemailer', type: 'text' },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Settings className="w-6 h-6" /> Settings
          </h1>
          <p className="page-subtitle">System configuration and environment information</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Environment Configuration</p>
          <p className="text-xs text-blue-600 mt-0.5">
            All sensitive credentials (API keys, SMTP passwords, DB passwords) are stored in the backend <code className="bg-blue-100 px-1 rounded">.env</code> file. 
            Never expose these in the frontend.
          </p>
        </div>
      </div>

      {/* Config sections */}
      {CONFIG_ITEMS.map((section) => {
        const Icon = section.icon;
        return (
          <div key={section.section} className="card">
            <div className="card-header flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${section.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h2 className="font-semibold text-slate-900">{section.section}</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {section.items.map((item) => (
                <div key={item.label} className="px-6 py-4 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-600">{item.label}</p>
                  <p className="text-sm font-mono text-slate-900 bg-slate-50 px-3 py-1 rounded-lg">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Project Info */}
      <div className="card">
        <div className="card-header flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-slate-100 text-slate-600">
            <Info className="w-5 h-5" />
          </div>
          <h2 className="font-semibold text-slate-900">Project Information</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            { label: 'Project Name', value: 'AI-Powered Employee Event Email Automation System' },
            { label: 'Version', value: '1.0.0' },
            { label: 'Application Type', value: 'Enterprise HR Automation Platform' },
            { label: 'Frontend', value: 'Next.js 14 + Tailwind CSS' },
            { label: 'Backend', value: 'Node.js + Express.js' },
            { label: 'Database', value: 'MySQL' },
          ].map((item) => (
            <div key={item.label} className="px-6 py-4 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-600">{item.label}</p>
              <p className="text-sm text-slate-900 bg-slate-50 px-3 py-1 rounded-lg">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
