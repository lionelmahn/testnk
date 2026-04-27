import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export default function SpecialtyCard({
  specialty,
  index,
  services = [],
  defaultOpen = true,
  onUpdate,
  onRemove,
}) {
  const [open, setOpen] = useState(defaultOpen);

  const summary = [
    specialty.specialty_name || `Chuyên môn #${index + 1}`,
    specialty.degree,
    specialty.years_experience ? `${specialty.years_experience} năm KN` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const scopeCount = (specialty.service_scope || []).length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-slate-800 truncate">{summary}</div>
            <div className="text-xs text-slate-500">
              {scopeCount > 0 ? `${scopeCount} dịch vụ được phép` : 'Chưa gán dịch vụ'}
              {specialty.branch_or_room ? ` · ${specialty.branch_or_room}` : ''}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="rounded-lg text-red-600 hover:bg-red-50"
            title="Xoá chuyên môn"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-100 bg-slate-50/40 p-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Chuyên khoa / chuyên môn</Label>
              <Input
                value={specialty.specialty_name}
                onChange={(e) => onUpdate('specialty_name', e.target.value)}
                placeholder="VD: Niềng răng, Implant..."
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Học vị</Label>
              <Input
                value={specialty.degree || ''}
                onChange={(e) => onUpdate('degree', e.target.value)}
                placeholder="VD: Thạc sĩ, Tiến sĩ..."
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Kinh nghiệm (năm)</Label>
              <Input
                type="number"
                min="0"
                value={specialty.years_experience || 0}
                onChange={(e) => onUpdate('years_experience', e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Phòng / chi nhánh</Label>
              <Input
                value={specialty.branch_or_room || ''}
                onChange={(e) => onUpdate('branch_or_room', e.target.value)}
                placeholder="VD: Phòng 201, Chi nhánh Cầu Giấy..."
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Dịch vụ được phép thực hiện</Label>
            <div className="rounded-xl border border-slate-200 bg-white p-3 max-h-56 overflow-y-auto">
              {services.length === 0 ? (
                <div className="text-xs text-slate-500">Chưa có dịch vụ trong hệ thống.</div>
              ) : (
                <div className="grid md:grid-cols-2 gap-2">
                  {services.map((service) => {
                    const checked = (specialty.service_scope || []).includes(service.id);
                    return (
                      <label
                        key={service.id}
                        className="flex items-start gap-2 text-sm text-slate-700 px-2 py-1.5 rounded-lg hover:bg-slate-50"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(next) => {
                            const current = specialty.service_scope || [];
                            const nextValue = next
                              ? [...current, service.id]
                              : current.filter((id) => id !== service.id);
                            onUpdate('service_scope', nextValue);
                          }}
                        />
                        <span className="leading-snug">{service.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ghi chú</Label>
            <textarea
              value={specialty.notes || ''}
              onChange={(e) => onUpdate('notes', e.target.value)}
              className="w-full min-h-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
