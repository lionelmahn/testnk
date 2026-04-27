import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Save, Send, Stethoscope, Calculator, AlertTriangle, FileBadge2, Info } from 'lucide-react';
import {
  PROFILE_ROLE_OPTIONS,
  PROFILE_ROLE_LABELS,
} from '@/features/professional-profiles/utils';
import SpecialtyCard from './SpecialtyCard';
import CertificateCard from './CertificateCard';
import ConfirmDialog from './ConfirmDialog';

function TabBadge({ count, tone = 'slate' }) {
  if (!count) return null;
  const toneClass =
    tone === 'red'
      ? 'bg-red-100 text-red-700'
      : tone === 'amber'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-slate-200 text-slate-700';
  return (
    <span className={`ml-2 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[10px] font-semibold ${toneClass}`}>
      {count}
    </span>
  );
}

export default function ProfessionalProfileForm({
  open,
  mode = 'admin',
  form,
  staffOptions,
  services,
  submitting = false,
  onClose,
  onChange,
  onAddSpecialty,
  onRemoveSpecialty,
  onUpdateSpecialty,
  onAddCertificate,
  onRemoveCertificate,
  onUpdateCertificate,
  onSubmit,
}) {
  const [activeTab, setActiveTab] = useState('general');
  const [confirmRemove, setConfirmRemove] = useState(null);

  if (!open) return null;

  const isDoctor = form.profile_role === 'bac_si';
  const isSelfService = mode === 'self';
  const roleOptions = isSelfService
    ? PROFILE_ROLE_OPTIONS.filter((option) => option.value === form.profile_role)
    : PROFILE_ROLE_OPTIONS;
  const selectedStaff = staffOptions.find((staff) => String(staff.id) === String(form.staff_id));

  const specialtiesCount = form.specialties.length;
  const certificatesCount = form.certificates.length;
  const expiredCertCount = form.certificates.filter((c) => c.is_expired).length;
  const expiringCertCount = form.certificates.filter((c) => c.is_expiring_soon && !c.is_expired).length;

  const handleConfirmRemove = () => {
    if (!confirmRemove) return;
    if (confirmRemove.kind === 'specialty') onRemoveSpecialty(confirmRemove.index);
    else onRemoveCertificate(confirmRemove.index);
    setConfirmRemove(null);
  };

  const askRemoveSpecialty = (index) => {
    const item = form.specialties[index];
    if (item?.id) {
      setConfirmRemove({ kind: 'specialty', index, label: item.specialty_name || `Chuyên môn #${index + 1}` });
    } else {
      onRemoveSpecialty(index);
    }
  };

  const askRemoveCertificate = (index) => {
    const item = form.certificates[index];
    if (item?.id) {
      setConfirmRemove({ kind: 'certificate', index, label: item.certificate_name || `Chứng chỉ #${index + 1}` });
    } else {
      onRemoveCertificate(index);
    }
  };

  const titleText = isSelfService
    ? 'Hồ sơ chuyên môn của tôi'
    : form.id
      ? 'Cập nhật hồ sơ chuyên môn'
      : 'Tạo hồ sơ chuyên môn';

  const handleSaveDraft = () => onSubmit({ statusOverride: 'draft', closeOnSuccess: true });
  const handleSaveAndSubmit = () => onSubmit({ statusOverride: 'pending', closeOnSuccess: true });
  const handleSelfSubmit = () => onSubmit({ closeOnSuccess: true });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl bg-white rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
        <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-teal-50 to-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                {isDoctor ? <Stethoscope className="w-5 h-5" /> : <Calculator className="w-5 h-5" />}
              </div>
              <div>
                <div>{titleText}</div>
                {selectedStaff && (
                  <div className="text-xs font-normal text-slate-500 mt-0.5">
                    {selectedStaff.full_name} · {selectedStaff.employee_code} · {selectedStaff.email}
                  </div>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-5 pt-4 pb-2 max-h-[72vh] overflow-y-auto">
          {(expiredCertCount > 0 || expiringCertCount > 0) && (
            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <AlertTriangle className="w-4 h-4" />
              {expiredCertCount > 0 && <span>{expiredCertCount} chứng chỉ đã hết hạn.</span>}
              {expiringCertCount > 0 && <span>{expiringCertCount} chứng chỉ sắp hết hạn trong 30 ngày.</span>}
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
            <TabsList
              className={`grid ${isDoctor || !isSelfService ? 'grid-cols-3' : 'grid-cols-2'} bg-slate-100 p-1 rounded-xl`}
            >
              <TabsTrigger value="general" className="rounded-lg">
                Thông tin chung
              </TabsTrigger>
              {isDoctor && (
                <TabsTrigger value="specialties" className="rounded-lg">
                  Chuyên môn
                  <TabBadge count={specialtiesCount} />
                </TabsTrigger>
              )}
              {!isDoctor && !isSelfService && (
                <TabsTrigger value="specialties" className="rounded-lg">
                  Chuyên môn
                  <TabBadge count={specialtiesCount} />
                </TabsTrigger>
              )}
              <TabsTrigger value="certificates" className="rounded-lg">
                Chứng chỉ
                <TabBadge
                  count={certificatesCount}
                  tone={expiredCertCount > 0 ? 'red' : expiringCertCount > 0 ? 'amber' : 'slate'}
                />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                {!isSelfService && (
                  <div className="space-y-2 md:col-span-2">
                    <Label>Nhân sự</Label>
                    <Select
                      value={String(form.staff_id || '')}
                      onValueChange={(value) => onChange('staff_id', value)}
                      disabled={Boolean(form.id)}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Chọn nhân sự" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {staffOptions.map((staff) => (
                          <SelectItem key={staff.id} value={String(staff.id)}>
                            {staff.employee_code} — {staff.full_name} ({PROFILE_ROLE_LABELS[staff.role_slug] || staff.role_slug})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Vai trò hồ sơ</Label>
                  <Select
                    value={form.profile_role || ''}
                    onValueChange={(value) => onChange('profile_role', value)}
                    disabled={isSelfService || Boolean(form.id)}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {roleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedStaff && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-slate-500">Họ tên</div>
                    <div className="font-medium text-slate-800">{selectedStaff.full_name}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Email</div>
                    <div className="font-medium text-slate-800">{selectedStaff.email}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Mã nhân sự</div>
                    <div className="font-medium text-slate-800">{selectedStaff.employee_code}</div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Ghi chú</Label>
                <textarea
                  value={form.notes || ''}
                  onChange={(e) => onChange('notes', e.target.value)}
                  className="w-full min-h-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500"
                  placeholder="Phạm vi công việc, cảnh báo, yêu cầu bổ sung..."
                />
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5 text-xs text-slate-500 flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  Mẹo: chuyển sang tab <strong>Chuyên môn</strong>{isDoctor ? '' : ' (chỉ admin)'} để khai báo các kỹ năng và{' '}
                  <strong>Chứng chỉ</strong> để tải lên giấy tờ. Hồ sơ phải có ít nhất 1 chứng chỉ trước khi gửi duyệt.
                </div>
              </div>
            </TabsContent>

            {(isDoctor || !isSelfService) && (
              <TabsContent value="specialties" className="space-y-3">
                {isDoctor ? (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-teal-600" />
                          Danh sách chuyên môn ({specialtiesCount})
                        </h4>
                        <p className="text-xs text-slate-500">Mỗi chuyên môn có thể gắn dịch vụ và chứng chỉ riêng.</p>
                      </div>
                      <Button
                        type="button"
                        onClick={onAddSpecialty}
                        className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-1.5" /> Thêm chuyên môn
                      </Button>
                    </div>

                    {form.specialties.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-4 text-sm text-amber-700 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" /> Bác sĩ cần ít nhất một chuyên môn để gửi duyệt.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {form.specialties.map((specialty, index) => (
                          <SpecialtyCard
                            key={specialty.client_key || specialty.id || index}
                            specialty={specialty}
                            index={index}
                            services={services}
                            defaultOpen={!specialty.id}
                            onUpdate={(field, value) =>
                              onUpdateSpecialty(index, field, field === 'years_experience' ? Number(value) : value)
                            }
                            onRemove={() => askRemoveSpecialty(index)}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                    <div className="font-medium text-slate-800 mb-1">Hồ sơ kế toán</div>
                    Kế toán không cần khai báo chuyên môn con. Hãy nhập phạm vi phụ trách trong tab{' '}
                    <strong>Chứng chỉ</strong> hoặc ô <strong>Ghi chú</strong>.
                  </div>
                )}
              </TabsContent>
            )}

            <TabsContent value="certificates" className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                    <FileBadge2 className="w-4 h-4 text-teal-600" />
                    Chứng chỉ & tài liệu ({certificatesCount})
                  </h4>
                  <p className="text-xs text-slate-500">PDF / JPG / PNG — tối đa 10MB mỗi tệp.</p>
                </div>
                <Button
                  type="button"
                  onClick={onAddCertificate}
                  className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-1.5" /> Thêm tài liệu
                </Button>
              </div>

              {form.certificates.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-4 text-sm text-amber-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Cần ít nhất một chứng chỉ hoặc bằng cấp.
                </div>
              ) : (
                <div className="space-y-3">
                  {form.certificates.map((certificate, index) => (
                    <CertificateCard
                      key={certificate.id || `cert_${index}`}
                      certificate={certificate}
                      index={index}
                      profileRole={form.profile_role}
                      specialties={form.specialties}
                      defaultOpen={!certificate.id}
                      onUpdate={(field, value) => {
                        if (field === 'specialty_client_key') {
                          onUpdateCertificate(index, 'specialty_client_key', value === 'general' ? '' : value);
                          if (value === 'general') {
                            onUpdateCertificate(index, 'professional_profile_specialty_id', null);
                          }
                          return;
                        }
                        onUpdateCertificate(index, field, value);
                      }}
                      onRemove={() => askRemoveCertificate(index)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs text-slate-500">
            {certificatesCount > 0 ? (
              <>
                {certificatesCount} chứng chỉ
                {specialtiesCount > 0 ? ` · ${specialtiesCount} chuyên môn` : ''}
                {expiredCertCount > 0 ? ` · ${expiredCertCount} hết hạn` : ''}
              </>
            ) : (
              'Hồ sơ trống — hãy thêm ít nhất 1 chứng chỉ.'
            )}
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border-slate-200"
            >
              Đóng
            </Button>
            {isSelfService ? (
              <Button
                onClick={handleSelfSubmit}
                disabled={submitting}
                className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white"
              >
                <Send className="w-4 h-4 mr-1.5" />
                {submitting ? 'Đang lưu...' : 'Lưu & gửi duyệt'}
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={submitting}
                  className="rounded-xl border-slate-200 text-slate-700"
                >
                  <Save className="w-4 h-4 mr-1.5" />
                  Lưu nháp
                </Button>
                <Button
                  onClick={handleSaveAndSubmit}
                  disabled={submitting}
                  className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Send className="w-4 h-4 mr-1.5" />
                  {submitting ? 'Đang lưu...' : 'Lưu & gửi duyệt'}
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>

      <ConfirmDialog
        open={Boolean(confirmRemove)}
        title={confirmRemove?.kind === 'specialty' ? 'Xoá chuyên môn?' : 'Xoá chứng chỉ?'}
        description={
          confirmRemove
            ? `Bạn sẽ xoá "${confirmRemove.label}". Thao tác này chỉ có hiệu lực sau khi bạn nhấn Lưu.`
            : ''
        }
        confirmLabel="Xoá"
        tone="red"
        onConfirm={handleConfirmRemove}
        onClose={() => setConfirmRemove(null)}
      />
    </Dialog>
  );
}
