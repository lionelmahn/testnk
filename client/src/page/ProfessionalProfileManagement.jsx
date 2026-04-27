import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { BriefcaseMedical, CheckCircle2, CircleX, X } from 'lucide-react';
import ProfessionalProfileTable from '@/features/professional-profiles/components/ProfessionalProfileTable';
import ProfessionalProfileForm from '@/features/professional-profiles/components/ProfessionalProfileForm';
import ProfessionalProfileDetailModal from '@/features/professional-profiles/components/ProfessionalProfileDetailModal';
import StatsStrip from '@/features/professional-profiles/components/StatsStrip';
import RejectReasonDialog from '@/features/professional-profiles/components/RejectReasonDialog';
import HistoryDialog from '@/features/professional-profiles/components/HistoryDialog';
import ConfirmDialog from '@/features/professional-profiles/components/ConfirmDialog';
import professionalProfileApi from '@/api/professionalProfileApi';
import { useToast } from '@/hooks/use-toast';
import { useDebouncedValue } from '@/features/professional-profiles/hooks/useDebouncedValue';
import { Button } from '@/components/ui/button';
import {
  buildProfileFormData,
  createEmptyCertificate,
  createEmptyProfileForm,
  createEmptySpecialty,
  mapProfileToForm,
} from '@/features/professional-profiles/utils';

export default function ProfessionalProfileManagement() {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState([]);
  const [staffOptions, setStaffOptions] = useState([]);
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);

  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState(createEmptyProfileForm());
  const [openDetail, setOpenDetail] = useState(false);
  const [detailProfile, setDetailProfile] = useState(null);

  const [rejectDialog, setRejectDialog] = useState({ open: false, mode: 'single', target: null });
  const [historyDialog, setHistoryDialog] = useState({ open: false, loading: false, entries: [] });
  const [confirmAction, setConfirmAction] = useState(null);

  const debouncedSearch = useDebouncedValue(searchTerm, 350);
  const cancelTokenRef = useRef(null);

  const loadOptions = async () => {
    const response = await professionalProfileApi.getOptions();
    setStaffOptions(response.data.staff || []);
    setServices(response.data.services || []);
  };

  const loadStats = async () => {
    try {
      const response = await professionalProfileApi.getStats();
      setStats(response.data);
    } catch {
      // stats không bắt buộc — bỏ qua khi lỗi.
    }
  };

  const loadProfiles = async (page = currentPage) => {
    if (cancelTokenRef.current) cancelTokenRef.current.cancel('superseded');
    cancelTokenRef.current = axios.CancelToken.source();

    setLoading(true);
    try {
      const response = await professionalProfileApi.getAll(
        {
          page,
          per_page: perPage,
          search: debouncedSearch,
          profile_role: filterRole,
          status: filterStatus,
        },
        { cancelToken: cancelTokenRef.current.token }
      );
      setProfiles(response.data.data || []);
      setCurrentPage(response.data.current_page || 1);
      setTotalPages(response.data.last_page || 1);
      setTotalItems(response.data.total || 0);
    } catch (error) {
      if (axios.isCancel(error)) return;
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tải danh sách hồ sơ chuyên môn.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions().catch(() => {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tải danh mục hồ sơ chuyên môn.',
      });
    });
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadProfiles(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filterRole, filterStatus, perPage]);

  const filteredStaffOptions = useMemo(() => {
    if (!form.profile_role) return staffOptions;
    return staffOptions.filter((staff) => staff.role_slug === form.profile_role);
  }, [staffOptions, form.profile_role]);

  const openCreateForm = () => {
    setForm(createEmptyProfileForm());
    setOpenForm(true);
  };

  const openEditForm = async (profile) => {
    try {
      const response = await professionalProfileApi.getById(profile.id);
      setForm(mapProfileToForm(response.data));
      setOpenForm(true);
    } catch {
      toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể tải chi tiết hồ sơ.' });
    }
  };

  const openDetailModal = async (profile) => {
    try {
      const response = await professionalProfileApi.getById(profile.id);
      setDetailProfile(response.data);
      setOpenDetail(true);
    } catch {
      toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể tải chi tiết hồ sơ.' });
    }
  };

  const refreshAll = (page = currentPage) => {
    loadProfiles(page);
    loadStats();
  };

  const handleSubmit = async ({ statusOverride = null, closeOnSuccess = true } = {}) => {
    setSubmitting(true);
    try {
      const payload = buildProfileFormData(form, { statusOverride });
      if (form.id) {
        await professionalProfileApi.update(form.id, payload);
        toast({
          title: 'Đã lưu',
          description:
            statusOverride === 'pending'
              ? 'Đã cập nhật và gửi hồ sơ chờ duyệt.'
              : 'Đã cập nhật hồ sơ chuyên môn.',
        });
      } else {
        await professionalProfileApi.create(payload);
        toast({
          title: 'Đã tạo',
          description:
            statusOverride === 'pending'
              ? 'Đã tạo hồ sơ và gửi chờ duyệt.'
              : 'Đã tạo hồ sơ chuyên môn mới.',
        });
      }
      if (closeOnSuccess) setOpenForm(false);
      refreshAll(form.id ? currentPage : 1);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.response?.data?.message || 'Lưu hồ sơ thất bại.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const askApprove = (profile) => {
    setConfirmAction({
      title: 'Duyệt hồ sơ chuyên môn?',
      description: `Bạn sẽ phê duyệt hồ sơ của ${profile.staff?.full_name || 'nhân sự'}.`,
      confirmLabel: 'Duyệt',
      tone: 'teal',
      run: () => professionalProfileApi.approve(profile.id),
      success: 'Đã duyệt hồ sơ.',
    });
  };

  const askInvalidate = (profile) => {
    setConfirmAction({
      title: 'Vô hiệu hoá hồ sơ?',
      description: `Hồ sơ của ${profile.staff?.full_name || 'nhân sự'} sẽ bị đánh dấu vô hiệu. Bạn có thể tạo hồ sơ mới khi cần.`,
      confirmLabel: 'Vô hiệu hoá',
      tone: 'amber',
      run: () => professionalProfileApi.invalidate(profile.id),
      success: 'Đã vô hiệu hoá hồ sơ.',
    });
  };

  const askSubmit = (profile) => {
    setConfirmAction({
      title: 'Gửi hồ sơ này lên duyệt?',
      description: 'Hồ sơ sẽ chuyển sang trạng thái Chờ duyệt và admin sẽ được thông báo.',
      confirmLabel: 'Gửi duyệt',
      tone: 'teal',
      run: () => professionalProfileApi.submit(profile.id),
      success: 'Đã gửi hồ sơ chờ duyệt.',
    });
  };

  const runConfirmAction = async () => {
    if (!confirmAction) return;
    setSubmitting(true);
    try {
      await confirmAction.run();
      toast({ title: 'Thành công', description: confirmAction.success });
      refreshAll(currentPage);
      setConfirmAction(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.response?.data?.message || 'Thao tác thất bại.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openRejectSingle = (profile) => {
    setRejectDialog({ open: true, mode: 'single', target: profile });
  };

  const openRejectBulk = () => {
    if (selectedIds.length === 0) return;
    setRejectDialog({ open: true, mode: 'bulk', target: null });
  };

  const handleRejectSubmit = async (reason) => {
    setSubmitting(true);
    try {
      if (rejectDialog.mode === 'bulk') {
        const response = await professionalProfileApi.bulkReject(selectedIds, reason);
        toast({
          title: 'Thành công',
          description: response.data?.message || 'Đã từ chối các hồ sơ đã chọn.',
        });
        setSelectedIds([]);
      } else if (rejectDialog.target) {
        await professionalProfileApi.reject(rejectDialog.target.id, reason);
        toast({ title: 'Thành công', description: 'Đã từ chối hồ sơ.' });
      }
      setRejectDialog({ open: false, mode: 'single', target: null });
      refreshAll(currentPage);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.response?.data?.message || 'Từ chối thất bại.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    setSubmitting(true);
    try {
      const response = await professionalProfileApi.bulkApprove(selectedIds);
      toast({ title: 'Thành công', description: response.data?.message || 'Đã duyệt hàng loạt.' });
      setSelectedIds([]);
      refreshAll(currentPage);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error.response?.data?.message || 'Duyệt hàng loạt thất bại.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenHistory = async (profile) => {
    setHistoryDialog({ open: true, loading: true, entries: [] });
    try {
      const response = await professionalProfileApi.getHistory(profile.id);
      setHistoryDialog({ open: true, loading: false, entries: response.data || [] });
    } catch {
      setHistoryDialog({ open: false, loading: false, entries: [] });
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: 'Không thể tải lịch sử thay đổi.',
      });
    }
  };

  const handleStatsFilterClick = (filter) => {
    if (filter?.status && filter.status !== filterStatus) {
      setFilterStatus(filter.status);
    } else if (filter?.status === filterStatus) {
      setFilterStatus('all');
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center">
              <BriefcaseMedical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Quản lý hồ sơ chuyên môn</h3>
              <p className="text-sm text-slate-500">
                Quản lý chứng chỉ, chuyên môn, luồng duyệt và cảnh báo hết hạn của bác sĩ &amp; kế toán.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <StatsStrip
            stats={stats}
            activeFilter={filterStatus === 'all' ? null : filterStatus}
            onFilterClick={handleStatsFilterClick}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {selectedIds.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-3 border-b border-teal-100 bg-teal-50/60">
            <div className="text-sm text-teal-900">
              Đã chọn <span className="font-semibold">{selectedIds.length}</span> hồ sơ
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedIds([])}
                className="rounded-xl border-slate-200"
              >
                <X className="w-3.5 h-3.5 mr-1" /> Bỏ chọn
              </Button>
              <Button
                size="sm"
                onClick={handleBulkApprove}
                disabled={submitting}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Duyệt {selectedIds.length}
              </Button>
              <Button
                size="sm"
                onClick={openRejectBulk}
                disabled={submitting}
                className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
              >
                <CircleX className="w-3.5 h-3.5 mr-1" /> Từ chối {selectedIds.length}
              </Button>
            </div>
          </div>
        )}

        <ProfessionalProfileTable
          profiles={profiles}
          loading={loading}
          searchTerm={searchTerm}
          filterRole={filterRole}
          filterStatus={filterStatus}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          perPage={perPage}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onSearchChange={setSearchTerm}
          onRoleChange={setFilterRole}
          onStatusChange={setFilterStatus}
          onPerPageChange={(size) => {
            setPerPage(size);
            setCurrentPage(1);
          }}
          onRefresh={() => refreshAll(currentPage)}
          onCreate={openCreateForm}
          onView={openDetailModal}
          onEdit={openEditForm}
          onSubmit={askSubmit}
          onApprove={askApprove}
          onReject={openRejectSingle}
          onInvalidate={askInvalidate}
          onOpenHistory={handleOpenHistory}
          onPageChange={(page) => loadProfiles(page)}
        />
      </div>

      <ProfessionalProfileForm
        open={openForm}
        mode="admin"
        form={form}
        staffOptions={filteredStaffOptions}
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
        onSubmit={handleSubmit}
      />

      <ProfessionalProfileDetailModal
        open={openDetail}
        profile={detailProfile}
        onClose={() => {
          setOpenDetail(false);
          setDetailProfile(null);
        }}
      />

      <RejectReasonDialog
        open={rejectDialog.open}
        submitting={submitting}
        count={rejectDialog.mode === 'bulk' ? selectedIds.length : 1}
        title={rejectDialog.mode === 'bulk' ? `Từ chối ${selectedIds.length} hồ sơ` : 'Từ chối hồ sơ'}
        description={
          rejectDialog.mode === 'bulk'
            ? `Lý do dưới đây sẽ áp dụng cho ${selectedIds.length} hồ sơ đã chọn.`
            : rejectDialog.target?.staff?.full_name
              ? `Hồ sơ của ${rejectDialog.target.staff.full_name} sẽ bị từ chối.`
              : null
        }
        onClose={() => setRejectDialog({ open: false, mode: 'single', target: null })}
        onSubmit={handleRejectSubmit}
      />

      <HistoryDialog
        open={historyDialog.open}
        loading={historyDialog.loading}
        entries={historyDialog.entries}
        onClose={() => setHistoryDialog({ open: false, loading: false, entries: [] })}
      />

      <ConfirmDialog
        open={Boolean(confirmAction)}
        title={confirmAction?.title}
        description={confirmAction?.description}
        confirmLabel={confirmAction?.confirmLabel}
        tone={confirmAction?.tone}
        loading={submitting}
        onClose={() => setConfirmAction(null)}
        onConfirm={runConfirmAction}
      />
    </div>
  );
}
