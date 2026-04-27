import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CircleX } from 'lucide-react';

const MIN_LENGTH = 10;
const MAX_LENGTH = 1000;

function RejectReasonDialogInner({ title, description, count = 1, submitting = false, onClose, onSubmit }) {
  const [reason, setReason] = useState('');

  const trimmed = reason.trim();
  const error =
    trimmed.length === 0
      ? null
      : trimmed.length < MIN_LENGTH
        ? `Lý do quá ngắn, cần ít nhất ${MIN_LENGTH} ký tự.`
        : trimmed.length > MAX_LENGTH
          ? `Lý do quá dài, tối đa ${MAX_LENGTH} ký tự.`
          : null;
  const canSubmit = !error && trimmed.length >= MIN_LENGTH && !submitting;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-white rounded-2xl border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg font-semibold text-slate-800">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <CircleX className="w-5 h-5" />
            </div>
            {title || 'Từ chối hồ sơ'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <p className="text-sm text-slate-600">
            {description || (count > 1
              ? `Đang từ chối ${count} hồ sơ. Người sở hữu sẽ thấy lý do bạn nhập dưới đây.`
              : 'Người sở hữu hồ sơ sẽ thấy lý do bạn nhập dưới đây để chỉnh sửa và gửi lại.')}
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={5}
            maxLength={MAX_LENGTH + 50}
            placeholder="Ví dụ: Cần bổ sung chứng chỉ hành nghề bản scan rõ nét và chuyên môn Implant..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />
          <div className="flex items-center justify-between text-xs">
            <span className={error ? 'text-red-600' : 'text-slate-500'}>
              {error || `Tối thiểu ${MIN_LENGTH} ký tự, tối đa ${MAX_LENGTH}.`}
            </span>
            <span className="text-slate-400">{trimmed.length}/{MAX_LENGTH}</span>
          </div>
        </div>

        <DialogFooter className="mt-4 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={submitting} className="rounded-xl border-slate-200">
            Huỷ
          </Button>
          <Button
            onClick={() => onSubmit(trimmed)}
            disabled={!canSubmit}
            className="rounded-xl bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
          >
            {submitting ? 'Đang xử lý...' : count > 1 ? `Từ chối ${count} hồ sơ` : 'Xác nhận từ chối'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function RejectReasonDialog({ open, ...props }) {
  if (!open) return null;
  return <RejectReasonDialogInner {...props} />;
}
