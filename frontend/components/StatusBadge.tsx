type StatusType = 'Sent' | 'Pending' | 'Failed' | 'Active' | 'Inactive' | string;

interface StatusBadgeProps {
  status: StatusType;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  Sent: { label: 'Sent', className: 'badge badge-green' },
  Pending: { label: 'Pending', className: 'badge badge-yellow' },
  Failed: { label: 'Failed', className: 'badge badge-red' },
  Active: { label: 'Active', className: 'badge badge-green' },
  Inactive: { label: 'Inactive', className: 'badge badge-gray' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'badge badge-gray' };
  return (
    <span className={config.className}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1 inline-block"></span>
      {config.label}
    </span>
  );
}
