import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, FileBadge2, AlertTriangle, CircleX, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CertificateFileUpload from './CertificateFileUpload';
import { CERTIFICATE_TYPE_OPTIONS, formatDate } from '@/features/professional-profiles/utils';

export default function CertificateCard({
  certificate,
  index,
  profileRole,
  specialties = [],
  defaultOpen = true,
  onUpdate,
  onRemove,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const isDoctor = profileRole === 'bac_si';
  const certificateTypeOptions = CERTIFICATE_TYPE_OPTIONS[profileRole] || [];

  const expiryDate = certificate.expiry_date ? new Date(certificate.expiry_date) : null;
  const isExpired = certificate.is_expired || (expiryDate && !Number.isNaN(expiryDate.getTime()) && expiryDate < new Date());
  const isExpiringSoon =
    !isExpired && (certificate.is_expiring_soon ||
      (expiryDate && !Number.isNaN(expiryDate.getTime()) &&
        (expiryDate - new Date()) / (1000 * 60 * 60 * 24) <= 30));

  const summary = certificate.certificate_name || certificate.certificate_type || `Chứng chỉ #${index + 1}`;
  const subParts = [
    certificate.certificate_number,
    certificate.expiry_date ? `HSD: ${formatDate(certificate.expiry_date)}` : null,
  ].filter(Boolean);

  const dateInvalid =
    certificate.issued_date && certificate.expiry_date && new Date(certificate.expiry_date) < new Date(certificate.issued_date);

  return (
    <div
      className={`rounded-2xl border bg-white overflow-hidden ${
        isExpired ? 'border-red-200' : isExpiringSoon ? 'border-amber-200' : 'border-slate-200'
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <FileBadge2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="font-medium text-slate-800 truncate flex items-center gap-2">
              {summary}
              {certificate.is_primary && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                  <Star className="w-2.5 h-2.5" /> Chính
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 truncate">
              {subParts.join(' · ') || 'Chưa nhập thông tin'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isExpired && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
              <CircleX className="w-3 h-3" /> Hết hạn
            </span>
          )}
          {isExpiringSoon && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              <AlertTriangle className="w-3 h-3" /> Sắp hết hạn
            </span>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="rounded-lg text-red-600 hover:bg-red-50"
            title="Xoá chứng chỉ"
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
              <Label>Loại chứng chỉ</Label>
              <Select
                value={certificate.certificate_type || ''}
                onValueChange={(value) => onUpdate('certificate_type', value)}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {certificateTypeOptions.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tên chứng chỉ / bằng cấp</Label>
              <Input
                value={certificate.certificate_name || ''}
                onChange={(e) => onUpdate('certificate_name', e.target.value)}
                className="rounded-xl"
                placeholder="VD: Chứng chỉ hành nghề khám chữa bệnh"
              />
            </div>
            <div className="space-y-2">
              <Label>Số chứng chỉ</Label>
              <Input
                value={certificate.certificate_number || ''}
                onChange={(e) => onUpdate('certificate_number', e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Đơn vị cấp</Label>
              <Input
                value={certificate.issuer || ''}
                onChange={(e) => onUpdate('issuer', e.target.value)}
                className="rounded-xl"
                placeholder="VD: Sở Y tế Hà Nội"
              />
            </div>
            <div className="space-y-2">
              <Label>Ngày cấp</Label>
              <Input
                type="date"
                value={certificate.issued_date || ''}
                onChange={(e) => onUpdate('issued_date', e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Ngày hết hạn</Label>
              <Input
                type="date"
                value={certificate.expiry_date || ''}
                onChange={(e) => onUpdate('expiry_date', e.target.value)}
                className={`rounded-xl ${dateInvalid ? 'border-red-400 focus-visible:ring-red-300' : ''}`}
              />
              {dateInvalid && (
                <div className="text-xs text-red-600">Ngày hết hạn phải sau ngày cấp.</div>
              )}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{isDoctor ? 'Dịch vụ / phạm vi áp dụng' : 'Mảng phụ trách'}</Label>
              <Input
                value={certificate.scope_label || ''}
                onChange={(e) => onUpdate('scope_label', e.target.value)}
                className="rounded-xl"
              />
            </div>
            {isDoctor && (
              <div className="space-y-2 md:col-span-2">
                <Label>Gắn với chuyên môn</Label>
                <Select
                  value={certificate.specialty_client_key || 'general'}
                  onValueChange={(value) => onUpdate('specialty_client_key', value)}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Không gắn chuyên môn cụ thể" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="general">Không gắn chuyên môn cụ thể</SelectItem>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty.client_key} value={specialty.client_key}>
                        {specialty.specialty_name || 'Chuyên môn chưa đặt tên'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tệp đính kèm</Label>
            <CertificateFileUpload
              certificate={certificate}
              certificateId={certificate.id}
              onChange={(file) => onUpdate('file', file)}
            />
          </div>

          <div className="space-y-2">
            <Label>Ghi chú</Label>
            <textarea
              value={certificate.notes || ''}
              onChange={(e) => onUpdate('notes', e.target.value)}
              className="w-full min-h-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <Checkbox
              checked={Boolean(certificate.is_primary)}
              onCheckedChange={(checked) => onUpdate('is_primary', Boolean(checked))}
            />
            <span>Đánh dấu là chứng chỉ chính</span>
          </label>
        </div>
      )}
    </div>
  );
}
