import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertTriangle,
  CheckCircle2,
  CircleX,
  Eye,
  History,
  Plus,
  RefreshCcw,
  Search,
  Send,
  ShieldOff,
  SquarePen,
} from 'lucide-react';
import {
  PROFILE_ROLE_OPTIONS,
  PROFILE_ROLE_LABELS,
  PROFILE_STATUS_META,
  STATUS_OPTIONS_FOR_FILTER,
  getStatusActions,
} from '@/features/professional-profiles/utils';

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export default function ProfessionalProfileTable({
  profiles,
  loading,
  searchTerm,
  filterRole,
  filterStatus,
  currentPage,
  totalPages,
  totalItems,
  perPage = 10,
  selectedIds = [],
  onSelectionChange,
  onSearchChange,
  onRoleChange,
  onStatusChange,
  onPerPageChange,
  onRefresh,
  onCreate,
  onView,
  onEdit,
  onApprove,
  onReject,
  onInvalidate,
  onSubmit,
  onOpenHistory,
  onPageChange,
}) {
  const allOnPageSelected = profiles.length > 0 && profiles.every((p) => selectedIds.includes(p.id));
  const someOnPageSelected = profiles.some((p) => selectedIds.includes(p.id));

  const handleToggleAll = (checked) => {
    if (!onSelectionChange) return;
    if (checked) {
      const set = new Set([...selectedIds, ...profiles.map((p) => p.id)]);
      onSelectionChange(Array.from(set));
    } else {
      const ids = new Set(profiles.map((p) => p.id));
      onSelectionChange(selectedIds.filter((id) => !ids.has(id)));
    }
  };

  const handleToggleOne = (profileId, checked) => {
    if (!onSelectionChange) return;
    if (checked) onSelectionChange([...selectedIds, profileId]);
    else onSelectionChange(selectedIds.filter((id) => id !== profileId));
  };

  return (
    <div className="p-5 space-y-5">
      <div className="flex flex-col xl:flex-row xl:items-center gap-3">
        <div className="relative flex-1 min-w-[14rem] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên nhân sự, mã hoặc số chứng chỉ..."
            className="pl-10 rounded-xl"
          />
        </div>

        <Select value={filterRole} onValueChange={onRoleChange}>
          <SelectTrigger className="w-[170px] rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">Tất cả vai trò</SelectItem>
            {PROFILE_ROLE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[170px] rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {STATUS_OPTIONS_FOR_FILTER.map((status) => (
              <SelectItem key={status} value={status}>
                {status === 'all' ? 'Tất cả trạng thái' : PROFILE_STATUS_META[status]?.label || status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            className="rounded-xl border-slate-200"
            title="Làm mới"
          >
            <RefreshCcw className="w-4 h-4" />
          </Button>
          <Button
            onClick={onCreate}
            className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Tạo hồ sơ
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/60 hover:bg-slate-50/60">
              {onSelectionChange && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={allOnPageSelected ? true : someOnPageSelected ? 'indeterminate' : false}
                    onCheckedChange={(checked) => handleToggleAll(checked === true)}
                    aria-label="Chọn tất cả hồ sơ trong trang"
                  />
                </TableHead>
              )}
              <TableHead>Nhân sự</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Chứng chỉ</TableHead>
              <TableHead className="text-right pr-6">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={`skeleton-${idx}`}>
                  {onSelectionChange && <TableCell className="w-12"><div className="h-4 w-4 rounded bg-slate-100 animate-pulse" /></TableCell>}
                  <TableCell><div className="space-y-2"><div className="h-4 bg-slate-100 rounded w-40 animate-pulse" /><div className="h-3 bg-slate-100 rounded w-56 animate-pulse" /></div></TableCell>
                  <TableCell><div className="h-4 bg-slate-100 rounded w-16 animate-pulse" /></TableCell>
                  <TableCell><div className="h-5 bg-slate-100 rounded-full w-24 animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 bg-slate-100 rounded w-8 animate-pulse" /></TableCell>
                  <TableCell><div className="h-7 bg-slate-100 rounded w-32 ml-auto animate-pulse" /></TableCell>
                </TableRow>
              ))
            ) : profiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={onSelectionChange ? 6 : 5} className="h-32 text-center text-slate-500">
                  Không có hồ sơ nào khớp với bộ lọc.
                </TableCell>
              </TableRow>
            ) : profiles.map((profile) => {
              const meta = PROFILE_STATUS_META[profile.status] || PROFILE_STATUS_META.draft;
              const actions = getStatusActions(profile.status);
              const isSelected = selectedIds.includes(profile.id);
              const certCount = profile.certificates_count || profile.certificates?.length || 0;

              return (
                <TableRow key={profile.id} className={`group hover:bg-slate-50/50 ${isSelected ? 'bg-teal-50/40' : ''}`}>
                  {onSelectionChange && (
                    <TableCell className="w-12">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleToggleOne(profile.id, checked === true)}
                        aria-label={`Chọn hồ sơ của ${profile.staff?.full_name || ''}`}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="font-medium text-slate-800">{profile.staff?.full_name || '—'}</div>
                    <div className="text-xs text-slate-500">
                      {[profile.staff?.employee_code, profile.staff?.email].filter(Boolean).join(' · ')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-700">
                      {PROFILE_ROLE_LABELS[profile.profile_role] || profile.profile_role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${meta.className}`}>
                        {meta.label}
                      </span>
                      {profile.has_expired_certificate && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium bg-red-50 text-red-700 border-red-200">
                          <CircleX className="w-3 h-3" /> Chứng chỉ hết hạn
                        </span>
                      )}
                      {!profile.has_expired_certificate && profile.expiring_soon && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium bg-amber-50 text-amber-700 border-amber-200">
                          <AlertTriangle className="w-3 h-3" /> Sắp hết hạn
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium text-slate-700">{certCount}</span>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="inline-flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView(profile)}
                        className="rounded-lg text-slate-700 hover:bg-slate-100"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {actions.canEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(profile)}
                          className="rounded-lg text-slate-700 hover:bg-slate-100"
                          title="Chỉnh sửa"
                        >
                          <SquarePen className="w-4 h-4" />
                        </Button>
                      )}
                      {actions.canSubmit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onSubmit(profile)}
                          className="rounded-lg text-amber-700 hover:bg-amber-50"
                          title="Gửi duyệt"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      )}
                      {actions.canApprove && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onApprove(profile)}
                          className="rounded-lg text-emerald-700 hover:bg-emerald-50"
                          title="Duyệt"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                      )}
                      {actions.canReject && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onReject(profile)}
                          className="rounded-lg text-red-700 hover:bg-red-50"
                          title="Từ chối"
                        >
                          <CircleX className="w-4 h-4" />
                        </Button>
                      )}
                      {actions.canInvalidate && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onInvalidate(profile)}
                          className="rounded-lg text-slate-700 hover:bg-slate-100"
                          title="Vô hiệu hoá"
                        >
                          <ShieldOff className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onOpenHistory(profile)}
                        className="rounded-lg text-slate-500 hover:bg-slate-100"
                        title="Lịch sử"
                      >
                        <History className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          {typeof totalItems === 'number' && (
            <span>
              Tổng <span className="font-medium text-slate-700">{totalItems}</span> hồ sơ
            </span>
          )}
          {onPerPageChange && (
            <div className="flex items-center gap-2">
              <span>Hiển thị</span>
              <Select value={String(perPage)} onValueChange={(value) => onPerPageChange(Number(value))}>
                <SelectTrigger className="w-[80px] rounded-lg h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span>/ trang</span>
            </div>
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <div className="text-sm text-slate-500">
              Trang <span className="font-medium text-slate-700">{currentPage}</span> / {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Sau
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
