import React from 'react';
import { Download, FileBadge2, FolderKanban, ShieldCheck, Stethoscope, UserRound } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { triggerCertificateDownload } from '@/api/professionalProfileApi';
import {
  PROFILE_ROLE_LABELS,
  PROFILE_STATUS_META,
  formatDate,
} from '@/features/professional-profiles/utils';

export default function ProfessionalProfileDetailModal({ open, profile, services = [], onClose }) {
  if (!open || !profile) return null;

  const statusMeta = PROFILE_STATUS_META[profile.status] || PROFILE_STATUS_META.draft;
  const isDoctor = profile.profile_role === 'bac_si';
  const serviceMap = new Map((services || []).map((s) => [s.id, s.name]));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl bg-white rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <FolderKanban className="w-5 h-5" />
              </div>
              Chi tiết hồ sơ chuyên môn
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6 max-h-[78vh] overflow-y-auto space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <UserRound className="w-4 h-4 text-teal-600" />
                  {profile.staff?.full_name || 'Chưa gán nhân sự'}
                </div>
                <div className="text-sm text-slate-500">
                  {[profile.staff?.employee_code, profile.staff?.email].filter(Boolean).join(' · ')}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium bg-slate-100 text-slate-700 border-slate-200">
                  {PROFILE_ROLE_LABELS[profile.profile_role] || profile.profile_role}
                </span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium ${statusMeta.className}`}>
                  {statusMeta.label}
                </span>
                {profile.expiring_soon && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium bg-amber-50 text-amber-700 border-amber-200">
                    Sắp hết hạn
                  </span>
                )}
                {profile.has_expired_certificate && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium bg-red-50 text-red-700 border-red-200">
                    Có chứng chỉ quá hạn
                  </span>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-5 text-sm">
              <Metric label="Ngày gửi duyệt" value={formatDate(profile.submitted_at)} />
              <Metric label="Ngày duyệt" value={formatDate(profile.approved_at)} />
              <Metric label="Người duyệt" value={profile.approver?.name || 'Chưa duyệt'} />
            </div>

            <div className="mt-4 text-sm">
              <div className="text-slate-500 mb-1">Ghi chú</div>
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-slate-700 whitespace-pre-line">
                {profile.notes || 'Không có ghi chú'}
              </div>
            </div>

            {profile.rejection_reason && (
              <div className="mt-4 text-sm">
                <div className="text-red-600 mb-1">Lý do từ chối gần nhất</div>
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 whitespace-pre-line">
                  {profile.rejection_reason}
                </div>
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              {isDoctor ? 'Danh sách chuyên môn' : 'Thông tin nghiệp vụ'}
            </div>

            {isDoctor ? (
              (profile.specialties || []).length > 0 ? (
                <div className="grid gap-4">
                  {profile.specialties.map((specialty, index) => {
                    const scopeIds = specialty.service_scope || [];
                    const scopeNames = scopeIds.map((id) => serviceMap.get(id) || id).filter(Boolean);
                    return (
                      <div key={specialty.id || index} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="font-semibold text-slate-800">{specialty.specialty_name}</div>
                            <div className="text-sm text-slate-500">{specialty.degree || 'Chưa cập nhật học vị'}</div>
                          </div>
                          <div className="text-sm text-slate-600">{specialty.years_experience || 0} năm kinh nghiệm</div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <Metric label="Phòng / chi nhánh" value={specialty.branch_or_room || 'Chưa cập nhật'} />
                          <Metric
                            label="Dịch vụ được phép"
                            value={scopeNames.length > 0 ? scopeNames.join(', ') : 'Chưa gán dịch vụ'}
                          />
                        </div>

                        <div className="text-sm">
                          <div className="text-slate-500 mb-1">Ghi chú</div>
                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700 whitespace-pre-line">
                            {specialty.notes || 'Không có ghi chú'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyBlock text="Chưa có chuyên môn nào." />
              )
            ) : (
              <EmptyBlock text="Hồ sơ kế toán không có danh sách chuyên môn con." />
            )}
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-semibold">
              <FileBadge2 className="w-4 h-4 text-teal-600" />
              Chứng chỉ và tài liệu
            </div>

            {(profile.certificates || []).length > 0 ? (
              <div className="grid gap-4">
                {profile.certificates.map((certificate, index) => (
                  <div key={certificate.id || index} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-800">{certificate.certificate_name}</div>
                        <div className="text-sm text-slate-500">
                          {[certificate.certificate_type, certificate.certificate_number].filter(Boolean).join(' · ')}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {certificate.is_primary && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                            Chứng chỉ chính
                          </span>
                        )}
                        {certificate.is_expiring_soon && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium bg-amber-50 text-amber-700 border-amber-200">
                            Sắp hết hạn
                          </span>
                        )}
                        {certificate.is_expired && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium bg-red-50 text-red-700 border-red-200">
                            Hết hạn
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <Metric label="Đơn vị cấp" value={certificate.issuer || 'Chưa cập nhật'} />
                      <Metric label="Ngày cấp" value={formatDate(certificate.issued_date)} />
                      <Metric label="Ngày hết hạn" value={formatDate(certificate.expiry_date)} />
                      <Metric label="Phạm vi áp dụng" value={certificate.scope_label || 'Chưa cập nhật'} />
                      <Metric
                        label="Tệp đính kèm"
                        value={
                          certificate.file_name ? (
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => triggerCertificateDownload(certificate.id, certificate.file_name)}
                              className="px-0 h-auto text-teal-700 hover:text-teal-800"
                            >
                              <Download className="w-3.5 h-3.5 mr-1" />
                              {certificate.file_name}
                            </Button>
                          ) : (
                            'Chưa có tệp'
                          )
                        }
                      />
                      <Metric
                        label="Chuyên môn liên kết"
                        value={certificate.specialty?.specialty_name || 'Không gắn chuyên môn'}
                      />
                    </div>

                    {certificate.notes && (
                      <div className="text-sm">
                        <div className="text-slate-500 mb-1">Ghi chú</div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-700 whitespace-pre-line">
                          {certificate.notes}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyBlock text="Chưa có chứng chỉ nào." />
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
            <div className="flex items-center gap-2 text-slate-800 font-semibold mb-4">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              Tổng quan xử lý
            </div>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <Metric label="Tổng chứng chỉ" value={String(profile.certificates?.length || 0)} />
              <Metric label="Tổng chuyên môn" value={String(profile.specialties?.length || 0)} />
              <Metric label="Cảnh báo hết hạn" value={profile.has_expired_certificate ? 'Có' : 'Không'} />
              <Metric label="Sắp hết hạn 30 ngày" value={profile.expiring_soon ? 'Có' : 'Không'} />
            </div>
          </section>
        </div>

        <DialogFooter className="p-6 border-t border-slate-100 bg-slate-50">
          <Button variant="outline" onClick={onClose} className="rounded-xl border-slate-200">Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="text-slate-500 mb-1">{label}</div>
      <div className="font-medium text-slate-800 break-words">{value || 'Chưa cập nhật'}</div>
    </div>
  );
}

function EmptyBlock({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
      {text}
    </div>
  );
}
