import React, { useRef, useState } from 'react';
import { FileUp, FileText, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { triggerCertificateDownload } from '@/api/professionalProfileApi';
import { formatBytes } from '@/features/professional-profiles/utils';

const MAX_SIZE = 10 * 1024 * 1024;
const ACCEPT = '.pdf,.jpg,.jpeg,.png';

export default function CertificateFileUpload({ certificate, onChange, disabled = false, certificateId }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  const accept = ACCEPT.split(',').map((s) => s.trim().toLowerCase());

  const handleSelect = (file) => {
    setError('');
    if (!file) return;
    const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
    if (!accept.includes(ext)) {
      setError('Chỉ chấp nhận PDF/JPG/PNG.');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('Tệp quá lớn, tối đa 10MB.');
      return;
    }
    onChange(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    handleSelect(file);
  };

  const clearFile = () => {
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDownloadExisting = async () => {
    if (!certificateId) return;
    setDownloading(true);
    try {
      await triggerCertificateDownload(certificateId, certificate.existing_file_name || 'certificate');
    } catch {
      setError('Không thể tải tệp đã lưu.');
    } finally {
      setDownloading(false);
    }
  };

  const hasNewFile = certificate.file instanceof File;
  const hasExistingFile = !hasNewFile && Boolean(certificate.existing_file_name);

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`rounded-xl border-2 border-dashed p-4 text-sm cursor-pointer transition-colors ${
          isDragging
            ? 'border-teal-400 bg-teal-50'
            : 'border-slate-200 bg-white hover:border-teal-300 hover:bg-slate-50'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          disabled={disabled}
          className="hidden"
          onChange={(e) => handleSelect(e.target.files?.[0])}
        />

        {hasNewFile ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-slate-800 truncate">{certificate.file.name}</div>
              <div className="text-xs text-slate-500">
                {formatBytes(certificate.file.size)} · sẽ tải lên khi lưu
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : hasExistingFile ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-slate-800 truncate">{certificate.existing_file_name}</div>
              <div className="text-xs text-slate-500">Đã lưu trước đó · click để chọn tệp khác thay thế</div>
            </div>
            {certificateId && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={downloading}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadExisting();
                }}
                className="rounded-lg border-slate-200 text-slate-700"
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                {downloading ? 'Đang tải...' : 'Tải về'}
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-3 text-center">
            <FileUp className="w-6 h-6 text-slate-400 mb-2" />
            <div className="text-slate-700 font-medium">Kéo thả tệp vào đây hoặc click để chọn</div>
            <div className="text-xs text-slate-500 mt-1">PDF / JPG / PNG · tối đa 10MB</div>
          </div>
        )}
      </div>

      {error && <div className="text-xs text-red-600">{error}</div>}
    </div>
  );
}
