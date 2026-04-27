export const PROFILE_ROLE_OPTIONS = [
  { value: 'bac_si', label: 'Bác sĩ' },
  { value: 'ke_toan', label: 'Kế toán' },
];

export const PROFILE_ROLE_LABELS = {
  bac_si: 'Bác sĩ',
  ke_toan: 'Kế toán',
};

export const PROFILE_STATUS_META = {
  draft: { label: 'Chưa hoàn thiện', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  pending: { label: 'Chờ duyệt', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: 'Đã duyệt', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  expired: { label: 'Hết hạn', className: 'bg-rose-50 text-rose-700 border-rose-200' },
  rejected: { label: 'Bị từ chối', className: 'bg-red-50 text-red-700 border-red-200' },
  inactive: { label: 'Đã vô hiệu', className: 'bg-slate-200 text-slate-700 border-slate-300' },
};

export const STATUS_OPTIONS_FOR_FILTER = ['all', 'draft', 'pending', 'approved', 'expired', 'rejected', 'inactive'];

// Hành động hợp lệ cho từng trạng thái — dùng cho bảng admin và trang "Hồ sơ của tôi".
export const STATUS_ACTION_RULES = {
  draft: { canEdit: true, canSubmit: true, canApprove: false, canReject: false, canInvalidate: false },
  pending: { canEdit: true, canSubmit: false, canApprove: true, canReject: true, canInvalidate: false },
  approved: { canEdit: true, canSubmit: false, canApprove: false, canReject: false, canInvalidate: true },
  expired: { canEdit: true, canSubmit: true, canApprove: false, canReject: false, canInvalidate: false },
  rejected: { canEdit: true, canSubmit: true, canApprove: false, canReject: false, canInvalidate: false },
  inactive: { canEdit: false, canSubmit: false, canApprove: false, canReject: false, canInvalidate: false },
};

export const getStatusActions = (status) => STATUS_ACTION_RULES[status] || STATUS_ACTION_RULES.draft;

// Chỉ trạng thái draft hoặc rejected mới cho phép user tự gửi duyệt lại.
export const SELF_SUBMITTABLE_STATUSES = ['draft', 'rejected', 'expired'];
export const isSelfSubmittable = (status) => SELF_SUBMITTABLE_STATUSES.includes(status);

export const CERTIFICATE_TYPE_OPTIONS = {
  bac_si: ['Chứng chỉ hành nghề', 'Chứng chỉ chuyên khoa', 'Bằng cấp', 'Tài liệu khác'],
  ke_toan: ['Chứng chỉ kế toán', 'Bằng cấp', 'Tài liệu khác'],
};

export const createEmptySpecialty = () => ({
  id: undefined,
  client_key: `sp_${Date.now()}_${Math.random().toString(16).slice(2)}`,
  specialty_name: '',
  degree: '',
  years_experience: 0,
  service_scope: [],
  branch_or_room: '',
  notes: '',
});

export const createEmptyCertificate = () => ({
  id: undefined,
  certificate_type: '',
  certificate_name: '',
  certificate_number: '',
  issued_date: '',
  expiry_date: '',
  issuer: '',
  scope_label: '',
  notes: '',
  is_primary: false,
  professional_profile_specialty_id: null,
  specialty_client_key: '',
  file: null,
  existing_file_name: '',
  existing_file_url: '',
  is_expired: false,
  is_expiring_soon: false,
});

export const createEmptyProfileForm = () => ({
  id: undefined,
  staff_id: '',
  profile_role: '',
  status: 'draft',
  notes: '',
  specialties: [],
  certificates: [],
});

export const mapProfileToForm = (profile) => {
  if (!profile) {
    return createEmptyProfileForm();
  }

  const specialties = (profile.specialties || []).map((specialty) => ({
    id: specialty.id,
    client_key: `sp_${specialty.id}`,
    specialty_name: specialty.specialty_name || '',
    degree: specialty.degree || '',
    years_experience: specialty.years_experience || 0,
    service_scope: specialty.service_scope || [],
    branch_or_room: specialty.branch_or_room || '',
    notes: specialty.notes || '',
  }));

  return {
    id: profile.id,
    staff_id: String(profile.staff_id || profile.staff?.id || ''),
    profile_role: profile.profile_role || '',
    status: profile.status || 'draft',
    notes: profile.notes || '',
    specialties,
    certificates: (profile.certificates || []).map((certificate) => ({
      id: certificate.id,
      certificate_type: certificate.certificate_type || '',
      certificate_name: certificate.certificate_name || '',
      certificate_number: certificate.certificate_number || '',
      issued_date: certificate.issued_date ? String(certificate.issued_date).slice(0, 10) : '',
      expiry_date: certificate.expiry_date ? String(certificate.expiry_date).slice(0, 10) : '',
      issuer: certificate.issuer || '',
      scope_label: certificate.scope_label || '',
      notes: certificate.notes || '',
      is_primary: Boolean(certificate.is_primary),
      professional_profile_specialty_id: certificate.professional_profile_specialty_id || certificate.specialty?.id || null,
      specialty_client_key: certificate.specialty ? `sp_${certificate.specialty.id}` : '',
      file: null,
      existing_file_name: certificate.file_name || '',
      existing_file_url: certificate.file_url || '',
      is_expired: Boolean(certificate.is_expired),
      is_expiring_soon: Boolean(certificate.is_expiring_soon),
    })),
  };
};

export const buildProfileFormData = (form, { selfService = false, statusOverride = null } = {}) => {
  const data = new FormData();

  if (!selfService) {
    data.append('staff_id', form.staff_id);
    data.append('profile_role', form.profile_role);
    data.append('status', statusOverride || form.status || 'draft');
  }

  data.append('notes', form.notes || '');
  data.append('specialties_payload', JSON.stringify(form.specialties || []));
  data.append(
    'certificates_payload',
    JSON.stringify(
      (form.certificates || []).map((certificate) => ({
        id: certificate.id,
        certificate_type: certificate.certificate_type,
        certificate_name: certificate.certificate_name,
        certificate_number: certificate.certificate_number,
        issued_date: certificate.issued_date || null,
        expiry_date: certificate.expiry_date || null,
        issuer: certificate.issuer || null,
        scope_label: certificate.scope_label || null,
        notes: certificate.notes || null,
        is_primary: Boolean(certificate.is_primary),
        professional_profile_specialty_id: certificate.professional_profile_specialty_id || null,
        specialty_client_key: certificate.specialty_client_key || null,
      }))
    )
  );

  (form.certificates || []).forEach((certificate, index) => {
    if (certificate.file instanceof File) {
      data.append(`certificate_files[${index}]`, certificate.file);
    }
  });

  return data;
};

export const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('vi-VN').format(date);
};

export const formatDateTime = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(date);
};

export const formatBytes = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

// Map của các action audit log -> nhãn hiển thị + màu.
export const AUDIT_ACTION_META = {
  'professional_profile.created': { label: 'Đã tạo hồ sơ', tone: 'slate' },
  'professional_profile.updated': { label: 'Đã cập nhật hồ sơ', tone: 'slate' },
  'professional_profile.self_updated': { label: 'Người dùng cập nhật & gửi duyệt', tone: 'amber' },
  'professional_profile.submitted': { label: 'Đã gửi duyệt', tone: 'amber' },
  'professional_profile.approved': { label: 'Đã duyệt', tone: 'emerald' },
  'professional_profile.rejected': { label: 'Đã từ chối', tone: 'red' },
  'professional_profile.invalidated': { label: 'Đã vô hiệu hoá', tone: 'slate' },
  'professional_profile.expired': { label: 'Tự động đánh dấu hết hạn', tone: 'rose' },
};

export const AUDIT_TONE_CLASS = {
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
};
