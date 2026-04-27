import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  BriefcaseMedical,
  CalendarDays,
  CheckCircle2,
  Download,
  FileBadge2,
  FolderKanban,
  Pencil,
  Send,
  ShieldAlert,
  Stethoscope,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProfessionalProfileForm from '@/features/professional-profiles/components/ProfessionalProfileForm';
import ConfirmDialog from '@/features/professional-profiles/components/ConfirmDialog';
import professionalProfileApi, { triggerCertificateDownload } from '@/api/professionalProfileApi';
import { useToast } from '@/hooks/use-toast';
import {
  PROFILE_ROLE_LABELS,
  PROFILE_STATUS_META,
  buildProfileFormData,
  createEmptyCertificate,
  createEmptySpecialty,
  formatDate,
  isSelfSubmittable,
  mapProfileToForm,
} from '@/features/professional-profiles/utils';

export default function MyProfessionalProfile() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [services, setServices] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  const loadMyProfile = async () => {
    setLoading(true);
    try {
      const response = await professionalProfileApi.getMine();
      setProfile(response.data.profile || null);
      setForm(mapProfileToForm(response.data.profile || null));
      setServices(response.data.options?.services || []);
    } catch {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tải hồ sơ chuyên môn của bạn.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyProfile();
  }, []);

  const handleSave = async ({ closeOnSuccess = true } = {}) => {
    if (!form?.id) {
      toast({
        variant: 'destructive',
        title: 'Thiếu hồ sơ',
        description: 'Admin cần tạo hồ sơ chuyên môn ban đầu cho bạn.',
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = buildProfileFormData(form, { selfService: true });
      await professionalProfileApi.updateMine(form.id, payload);
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật hồ sơ và chuyển sang chờ duyệt.',
      });
      if (closeOnSuccess) setOpenForm(false);
      loadMyProfile();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể cập nhật hồ sơ.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitProfile = async () => {
    if (!profile?.id) return;
    setSubmitting(true);
    try {
      await professionalProfileApi.submitMine(profile.id);
      toast({ title: 'Thành công', description: 'Đã gửi hồ sơ cho admin duyệt.' });
      setConfirmSubmit(false);
      loadMyProfile();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể gửi duyệt hồ sơ.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 p-6 animate-pulse">
        <div className="h-6 w-72 rounded bg-slate-100 mb-3" />
        <div className="h-4 w-96 rounded bg-slate-100 mb-6" />
        <div className="grid md:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 p-8">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">Chưa có hồ sơ chuyên môn</h3>
            <p className="text-slate-500">
              Admin cần khởi tạo hồ sơ ban đầu cho bạn trước khi bạn có thể cập nhật chuyên môn và chứng chỉ.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const statusMeta = PROFILE_STATUS_META[profile.status] || PROFILE_STATUS_META.draft;
  const isDoctor = profile.profile_role === 'bac_si';
  const canSubmit = isSelfSubmittable(profile.status);
  const certCount = profile.certificates?.length || 0;
  const expiredCount = (profile.certificates || []).filter((c) => c.is_expired).length;
  const expiringCount = (profile.certificates || []).filter((c) => c.is_expiring_soon && !c.is_expired).length;

  const submitDisabledReason = !canSubmit
    ? profile.status === 'pending'
      ? 'Hồ sơ đang chờ admin duyệt — vui lòng đợi kết quả.'
      : profile.status === 'approved'
        ? 'Hồ sơ đã được duyệt và đang còn hiệu lực.'
        : profile.status === 'inactive'
          ? 'Hồ sơ đã bị vô hiệu hoá.'
          : null
    : null;

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-teal-50 to-white flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center">
              <BriefcaseMedical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-800">Hồ sơ chuyên môn của tôi</h3>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${statusMeta.className}`}>
                  {statusMeta.label}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                {profile.staff?.full_name} · {PROFILE_ROLE_LABELS[profile.profile_role] || profile.profile_role}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setOpenForm(true)}
              className="rounded-xl border-slate-200"
            >
              <Pencil className="w-4 h-4 mr-1.5" /> Cập nhật hồ sơ
            </Button>
            <Button
              onClick={() => setConfirmSubmit(true)}
              disabled={!canSubmit || submitting}
              title={submitDisabledReason || ''}
              className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50"
            >
              <Send className="w-4 h-4 mr-1.5" /> Gửi duyệt
            </Button>
          </div>
        </div>

        {profile.status === 'rejected' && profile.rejection_reason && (
          <div className="m-6 p-4 rounded-2xl border border-red-200 bg-red-50 text-sm text-red-800 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold mb-1">Hồ sơ vừa bị từ chối</div>
              <div className="whitespace-pre-line">{profile.rejection_reason}</div>
              <div className="mt-2 text-xs text-red-700">
                Vui lòng cập nhật lại hồ sơ theo yêu cầu rồi nhấn "Gửi duyệt" để xem xét lần nữa.
              </div>
            </div>
          </div>
        )}

        <div className="p-6 grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            icon={<FolderKanban className="w-4 h-4" />}
            tone="teal"
            label="Vai trò"
            value={PROFILE_ROLE_LABELS[profile.profile_role] || profile.profile_role}
          />
          <MetricCard
            icon={<CheckCircle2 className="w-4 h-4" />}
            tone="emerald"
            label="Ngày duyệt"
            value={formatDate(profile.approved_at) || 'Chưa duyệt'}
          />
          <MetricCard
            icon={<FileBadge2 className="w-4 h-4" />}
            tone="slate"
            label="Số chứng chỉ"
            value={String(certCount)}
            hint={
              expiredCount > 0
                ? `${expiredCount} hết hạn`
                : expiringCount > 0
                  ? `${expiringCount} sắp hết hạn`
                  : 'Còn hiệu lực'
            }
          />
          <MetricCard
            icon={<AlertTriangle className="w-4 h-4" />}
            tone={expiredCount > 0 ? 'red' : expiringCount > 0 ? 'amber' : 'emerald'}
            label="Cảnh báo"
            value={expiredCount > 0 ? 'Có chứng chỉ hết hạn' : expiringCount > 0 ? 'Sắp hết hạn 30 ngày' : 'Ổn định'}
          />
        </div>
      </div>

      {isDoctor && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="font-semibold text-slate-800 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              Chuyên môn ({profile.specialties?.length || 0})
            </h4>
          </div>

          {(profile.specialties || []).length === 0 ? (
            <EmptyBlock text="Bạn chưa khai báo chuyên môn nào." />
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {profile.specialties.map((specialty) => (
                <div key={specialty.id} className="rounded-2xl border border-slate-200 bg-slate-50/40 p-4">
                  <div className="font-medium text-slate-800">{specialty.specialty_name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {[specialty.degree, specialty.years_experience ? `${specialty.years_experience} năm KN` : null]
                      .filter(Boolean)
                      .join(' · ') || 'Chưa cập nhật'}
                  </div>
                  {specialty.branch_or_room && (
                    <div className="text-xs text-slate-500 mt-1">Phòng/CN: {specialty.branch_or_room}</div>
                  )}
                  {specialty.notes && (
                    <div className="text-xs text-slate-600 mt-2 italic line-clamp-3">{specialty.notes}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h4 className="font-semibold text-slate-800 flex items-center gap-2">
            <FileBadge2 className="w-4 h-4 text-teal-600" />
            Chứng chỉ &amp; tài liệu ({certCount})
          </h4>
        </div>

        {certCount === 0 ? (
          <EmptyBlock text="Bạn chưa tải lên chứng chỉ nào." />
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {profile.certificates.map((certificate) => (
              <CertificateReadOnlyCard key={certificate.id} certificate={certificate} />
            ))}
          </div>
        )}
      </div>

      {profile.notes && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <div className="text-sm text-slate-500 mb-2">Ghi chú từ admin</div>
          <div className="text-sm text-slate-800 whitespace-pre-line">{profile.notes}</div>
        </div>
      )}

      <ProfessionalProfileForm
        open={openForm}
        mode="self"
        form={form}
        staffOptions={profile?.staff ? [profile.staff] : []}
        services={services}
        submitting={submitting}
        onClose={() => setOpenForm(false)}
        onChange={(field, value) => setForm((prev) => ({ ...prev, [field]: value }))}
        onAddSpecialty={() =>
          setForm((prev) => ({ ...prev, specialties: [...prev.specialties, createEmptySpecialty()] }))
        }
        onRemoveSpecialty={(index) =>
          setForm((prev) => ({
            ...prev,
            specialties: prev.specialties.filter((_, itemIndex) => itemIndex !== index),
          }))
        }
        onUpdateSpecialty={(index, field, value) =>
          setForm((prev) => ({
            ...prev,
            specialties: prev.specialties.map((specialty, itemIndex) =>
              itemIndex === index
                ? { ...specialty, [field]: field === 'years_experience' ? Number(value) : value }
                : specialty
            ),
          }))
        }
        onAddCertificate={() =>
          setForm((prev) => ({ ...prev, certificates: [...prev.certificates, createEmptyCertificate()] }))
        }
        onRemoveCertificate={(index) =>
          setForm((prev) => ({
            ...prev,
            certificates: prev.certificates.filter((_, itemIndex) => itemIndex !== index),
          }))
        }
        onUpdateCertificate={(index, field, value) =>
          setForm((prev) => ({
            ...prev,
            certificates: prev.certificates.map((certificate, itemIndex) =>
              itemIndex === index ? { ...certificate, [field]: value } : certificate
            ),
          }))
        }
        onSubmit={handleSave}
      />

      <ConfirmDialog
        open={confirmSubmit}
        title="Gửi hồ sơ chờ duyệt?"
        description="Sau khi gửi, bạn sẽ không thể chỉnh sửa cho đến khi admin duyệt hoặc trả lại để bổ sung."
        confirmLabel="Gửi duyệt"
        tone="teal"
        loading={submitting}
        onConfirm={handleSubmitProfile}
        onClose={() => setConfirmSubmit(false)}
      />
    </div>
  );
}

function MetricCard({ icon, label, value, hint, tone = 'slate' }) {
  const toneClass =
    tone === 'red'
      ? 'bg-red-50 text-red-600'
      : tone === 'amber'
        ? 'bg-amber-50 text-amber-600'
        : tone === 'emerald'
          ? 'bg-emerald-50 text-emerald-600'
          : tone === 'teal'
            ? 'bg-teal-50 text-teal-600'
            : 'bg-slate-100 text-slate-600';
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${toneClass}`}>{icon}</div>
      </div>
      <div className="mt-3 text-lg font-semibold text-slate-800">{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
      {hint && <div className="text-[11px] text-slate-400 mt-1">{hint}</div>}
    </div>
  );
}

function EmptyBlock({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 text-center">
      {text}
    </div>
  );
}

function CertificateReadOnlyCard({ certificate }) {
  const isExpired = certificate.is_expired;
  const isExpiringSoon = certificate.is_expiring_soon && !isExpired;

  const handleDownload = () => {
    triggerCertificateDownload(certificate.id, certificate.file_name);
  };

  return (
    <div
      className={`rounded-2xl border p-4 space-y-2 bg-white ${
        isExpired ? 'border-red-200' : isExpiringSoon ? 'border-amber-200' : 'border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-medium text-slate-800 truncate">{certificate.certificate_name || certificate.certificate_type}</div>
          <div className="text-xs text-slate-500 truncate">
            {[certificate.certificate_type, certificate.certificate_number].filter(Boolean).join(' · ')}
          </div>
        </div>
        <div className="flex flex-wrap gap-1 shrink-0">
          {certificate.is_primary && (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
              Chính
            </span>
          )}
          {isExpired && (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
              Hết hạn
            </span>
          )}
          {isExpiringSoon && (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
              Sắp hết hạn
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <CalendarDays className="w-3 h-3" />
        Cấp: {formatDate(certificate.issued_date) || '—'}
        {certificate.expiry_date && <> · HSD: {formatDate(certificate.expiry_date)}</>}
      </div>

      {certificate.issuer && (
        <div className="text-xs text-slate-600">Đơn vị cấp: {certificate.issuer}</div>
      )}

      {certificate.file_name && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="rounded-lg border-slate-200 text-slate-700"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" /> Tải tệp đính kèm
        </Button>
      )}
    </div>
  );
}
