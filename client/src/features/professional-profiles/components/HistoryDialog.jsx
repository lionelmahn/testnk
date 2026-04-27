import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { History, Clock } from 'lucide-react';
import { AUDIT_ACTION_META, AUDIT_TONE_CLASS, formatDateTime } from '@/features/professional-profiles/utils';

export default function HistoryDialog({ open, loading, entries = [], onClose }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white rounded-2xl border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg font-semibold text-slate-800">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            Lịch sử thay đổi hồ sơ
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 max-h-[60vh] overflow-y-auto pr-1">
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-4 animate-pulse h-16" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
              Chưa có hoạt động nào được ghi nhận.
            </div>
          ) : (
            <ol className="relative border-l border-slate-200 ml-3 space-y-4">
              {entries.map((entry) => {
                const meta = AUDIT_ACTION_META[entry.action] || { label: entry.action, tone: 'slate' };
                const toneClass = AUDIT_TONE_CLASS[meta.tone] || AUDIT_TONE_CLASS.slate;
                return (
                  <li key={entry.id} className="ml-4">
                    <div className="absolute -left-[6px] mt-1.5 w-3 h-3 rounded-full bg-white border-2 border-teal-400" />
                    <div className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-medium ${toneClass}`}>
                      {meta.label}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      {formatDateTime(entry.created_at) || '—'}
                    </div>
                    {entry.actor?.name && (
                      <div className="text-xs text-slate-500 mt-0.5">Bởi: <span className="font-medium text-slate-700">{entry.actor.name}</span></div>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} className="rounded-xl border-slate-200">Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
