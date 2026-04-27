import React from 'react';
import { ClipboardList, Hourglass, AlertTriangle, CircleX } from 'lucide-react';

export default function StatsStrip({ stats, activeFilter, onFilterClick }) {
  const cards = [
    {
      key: 'total',
      label: 'Tổng hồ sơ',
      value: stats?.total ?? '—',
      icon: ClipboardList,
      iconClass: 'bg-teal-50 text-teal-600',
      filter: { status: 'all' },
      hint: 'Toàn bộ hồ sơ trong hệ thống',
    },
    {
      key: 'pending',
      label: 'Chờ duyệt',
      value: stats?.by_status?.pending ?? 0,
      icon: Hourglass,
      iconClass: 'bg-amber-50 text-amber-600',
      filter: { status: 'pending' },
      hint: 'Đang đợi admin xử lý',
    },
    {
      key: 'expiring',
      label: 'Sắp hết hạn (30 ngày)',
      value: stats?.expiring_soon ?? 0,
      icon: AlertTriangle,
      iconClass: 'bg-orange-50 text-orange-600',
      filter: null,
      hint: 'Có chứng chỉ sắp hết hạn',
    },
    {
      key: 'expired',
      label: 'Đã hết hạn',
      value: (stats?.has_expired_certificate ?? 0) + (stats?.by_status?.expired ?? 0),
      icon: CircleX,
      iconClass: 'bg-rose-50 text-rose-600',
      filter: { status: 'expired' },
      hint: 'Hồ sơ có chứng chỉ quá hạn',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        const clickable = Boolean(card.filter);
        const isActive = card.filter?.status && card.filter.status === activeFilter;
        return (
          <button
            type="button"
            key={card.key}
            disabled={!clickable}
            onClick={() => clickable && onFilterClick?.(card.filter)}
            className={`group rounded-2xl border bg-white p-4 text-left transition-shadow ${
              clickable ? 'hover:shadow-md cursor-pointer' : 'cursor-default'
            } ${isActive ? 'border-teal-400 ring-2 ring-teal-100' : 'border-slate-100'}`}
            title={card.hint}
          >
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.iconClass}`}>
                <Icon className="w-4 h-4" />
              </div>
              {clickable && (
                <span className="text-[10px] uppercase tracking-wider text-slate-400 group-hover:text-teal-600">
                  Lọc nhanh →
                </span>
              )}
            </div>
            <div className="mt-3 text-2xl font-semibold text-slate-800">{card.value}</div>
            <div className="text-xs text-slate-500 mt-1">{card.label}</div>
          </button>
        );
      })}
    </div>
  );
}
