import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Huỷ',
  tone = 'red',
  loading = false,
  onConfirm,
  onClose,
}) {
  const toneStyles = {
    red: { btn: 'bg-red-600 hover:bg-red-700 text-white', icon: 'bg-red-50 text-red-600' },
    amber: { btn: 'bg-amber-600 hover:bg-amber-700 text-white', icon: 'bg-amber-50 text-amber-600' },
    teal: { btn: 'bg-teal-600 hover:bg-teal-700 text-white', icon: 'bg-teal-50 text-teal-600' },
  };
  const style = toneStyles[tone] || toneStyles.red;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white rounded-2xl border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-base font-semibold text-slate-800">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${style.icon}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            {title || 'Xác nhận thao tác'}
          </DialogTitle>
        </DialogHeader>

        <p className="mt-2 text-sm text-slate-600 leading-relaxed">{description}</p>

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading} className="rounded-xl border-slate-200">
            {cancelLabel}
          </Button>
          <Button onClick={onConfirm} disabled={loading} className={`rounded-xl ${style.btn} disabled:opacity-50`}>
            {loading ? 'Đang xử lý...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
