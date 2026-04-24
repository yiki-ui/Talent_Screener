import { ComponentType } from 'react';
import { ChevronRight } from 'lucide-react';

interface QuickActionCardProps {
  label: string;
  description: string;
  icon: ComponentType<any>;
  color: 'rose' | 'blue' | 'green' | 'purple' | 'amber';
  onClick?: () => void;
}

const colorMap = {
  rose:   { bg: 'bg-gradient-to-r from-rose-50 to-rose-100/60',   icon: 'bg-rose-100 text-rose-600',   border: 'border-rose-200/60', arrow: 'text-rose-400' },
  blue:   { bg: 'bg-gradient-to-r from-blue-50 to-blue-100/60',   icon: 'bg-blue-100 text-blue-600',   border: 'border-blue-200/60', arrow: 'text-blue-400' },
  green:  { bg: 'bg-gradient-to-r from-green-50 to-green-100/60', icon: 'bg-green-100 text-green-600', border: 'border-green-200/60', arrow: 'text-green-400' },
  purple: { bg: 'bg-gradient-to-r from-purple-50 to-purple-100/60', icon: 'bg-purple-100 text-purple-600', border: 'border-purple-200/60', arrow: 'text-purple-400' },
  amber:  { bg: 'bg-gradient-to-r from-amber-50 to-amber-100/60', icon: 'bg-amber-100 text-amber-600', border: 'border-amber-200/60', arrow: 'text-amber-400' },
};

export default function QuickActionCard({
  label,
  description,
  icon: Icon,
  color,
  onClick,
}: QuickActionCardProps) {
  const colors = colorMap[color];

  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-4 p-5 rounded-2xl border
        ${colors.bg} ${colors.border}
        shadow-sm transition-all duration-300 text-left
        hover:shadow-md hover:-translate-y-0.5
      `}
    >
      <div className={`w-12 h-12 rounded-xl ${colors.icon} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900">{label}</p>
        <p className="text-sm text-slate-500 mt-0.5">{description}</p>
      </div>
      <ChevronRight className={`w-5 h-5 ${colors.arrow} flex-shrink-0`} />
    </button>
  );
}