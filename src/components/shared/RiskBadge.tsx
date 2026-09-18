import React from 'react';
import { ShieldCheck, AlertCircle, AlertTriangle, AlertOctagon } from 'lucide-react';

export type RiskTier = 'Standard' | 'Caution' | 'Unfavorable' | 'Critical';

interface RiskBadgeProps {
  level: RiskTier;
  showIcon?: boolean;
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, showIcon = true, className = '' }) => {
  const configs = {
    Standard: {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      dot: 'bg-emerald-400',
      icon: <ShieldCheck className="w-3 h-3" aria-hidden="true" />,
      label: 'Standard Fair Terms',
    },
    Caution: {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      dot: 'bg-amber-400',
      icon: <AlertCircle className="w-3 h-3" aria-hidden="true" />,
      label: 'Caution / Review',
    },
    Unfavorable: {
      bg: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      dot: 'bg-orange-400',
      icon: <AlertTriangle className="w-3 h-3" aria-hidden="true" />,
      label: 'Unfavorable Deviation',
    },
    Critical: {
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      dot: 'bg-rose-400',
      icon: <AlertOctagon className="w-3 h-3" aria-hidden="true" />,
      label: 'Critical Legal Trap',
    },
  };

  const current = configs[level] || configs.Standard;

  return (
    <span
      role="status"
      aria-label={`Risk Tier: ${current.label}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${current.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot} shrink-0`} />
      {showIcon && current.icon}
      <span>{current.label}</span>
    </span>
  );
};
