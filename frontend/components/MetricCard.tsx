import { ComponentType } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: ComponentType<any>;
  color: 'rose' | 'blue' | 'green' | 'amber' | 'purple' | 'pink';
  change?: {
    value: number;
    label: string;
  };
  sparklineData?: number[];
}

const colorMap = {
  rose: { bg: 'bg-rose-100', text: 'text-rose-600', stroke: '#ec4899' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-600', stroke: '#2563eb' },
  green: { bg: 'bg-green-100', text: 'text-green-600', stroke: '#16a34a' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-600', stroke: '#ca8a04' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600', stroke: '#9333ea' },
  pink: { bg: 'bg-pink-100', text: 'text-pink-600', stroke: '#db2777' },
};

const generateSparklinePath = (data: number[]) => {
  if (data.length < 2) return '';
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - (v / Math.max(...data)) * 100;
    return `${x},${y}`;
  });
  const smoothPoints = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - (v / Math.max(...data)) * 100;
    return { x, y };
  });
  let path = `M ${smoothPoints[0].x} ${smoothPoints[0].y}`;
  for (let i = 1; i < smoothPoints.length - 1; i++) {
    const xc = (smoothPoints[i].x + smoothPoints[i + 1].x) / 2;
    const yc = (smoothPoints[i].y + smoothPoints[i + 1].y) / 2;
    path += ` Q ${smoothPoints[i].x} ${smoothPoints[i].y} ${xc} ${yc}`;
  }
  path += ` T ${smoothPoints[smoothPoints.length - 1].x} ${smoothPoints[smoothPoints.length - 1].y}`;
  return path;
};

export default function MetricCard({
  label,
  value,
  icon: Icon,
  color,
  change,
  sparklineData = [30, 50, 45, 60, 55, 75, 80],
}: MetricCardProps) {
  const colors = colorMap[color];
  const pathData = generateSparklinePath(sparklineData);

  return (
    <div className="metric-card group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl ${colors.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
        <div className={`w-20 h-14 ${colors.stroke === '#ec4899' ? 'stroke-rose-400' : ''}`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData.map((v, i) => ({ value: v }))} margin={{ top: 5, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.stroke} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={colors.stroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={colors.stroke}
                strokeWidth={2}
                fill={`url(#gradient-${color})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {change && (
          <div className="flex items-center gap-1 pt-1">
            <span className={`text-xs font-medium ${
              change.value >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change.value >= 0 ? '+' : ''}{change.value}%
            </span>
            <span className="text-xs text-slate-500">{change.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}