import { useState, useRef } from 'react';
import { X, ImagePlus, Trash2 } from 'lucide-react';
import { CATEGORIES, formatCurrencyInput, extractNumber } from '../utils/formatUtils';

interface ManualExpenseModalProps {
    isOpen: boolean;
    onSave: (data: {
        date: string;
        time: string | null;
        store_name: string;
        address: string | null;
        amount: number;
        category: string;
        reason: string | null;
        imageFile: File | null;
    }) => void;
    onClose: () => void;
}

export function ManualExpenseModal({
    isOpen,
    onSave,
    onClose,
}: ManualExpenseModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        time: '',
        store_name: '',
        address: '',
        amount: '',
        category: '기타',
        reason: '',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const resetForm = () => {
        setFormData({
            date: new Date().toISOString().split('T')[0],
            time: '',
            store_name: '',
            address: '',
            amount: '',
            category: '기타',
            reason: '',
        });
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setImageFile(null);
        setPreviewUrl(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
        e.target.value = '';
    };

    const handleRemoveImage = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setImageFile(null);
        setPreviewUrl(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        onSave({
            date: formData.date,
            time: formData.time || null,
            store_name: formData.store_name,
            address: formData.address || null,
            amount: extractNumber(formData.amount),
            category: formData.category,
            reason: formData.reason || null,
            imageFile,
        });

        resetForm();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center modal-backdrop animate-fade-in"
            onClick={handleClose}
        >
            <div
                className="
          w-full md:w-full md:max-w-md
          bg-white
          rounded-t-3xl md:rounded-3xl
          shadow-modal
          animate-slide-up md:animate-scale-in
          max-h-[90vh] overflow-y-auto
        "
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-border rounded-t-3xl z-10">
                    <h2 className="text-subtitle text-text-primary">수동 지출 입력</h2>
                    <button
                        onClick={handleClose}
                        className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="닫기"
                    >
                        <X className="w-5 h-5 text-text-secondary" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">
                            날짜 *
                        </label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                            className="
                w-full h-12 px-4 rounded-xl border border-border
                focus:border-primary focus:ring-2 focus:ring-primary/20
                transition-all
              "
                        />
                    </div>

                    {/* Time */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">
                            시간
                        </label>
                        <input
                            type="time"
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            className="
                w-full h-12 px-4 rounded-xl border border-border
                focus:border-primary focus:ring-2 focus:ring-primary/20
                transition-all
              "
                        />
                    </div>

                    {/* Store Name */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">
                            가게명 *
                        </label>
                        <input
                            type="text"
                            value={formData.store_name}
                            onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                            required
                            placeholder="예: 스타벅스 강남점"
                            className="
                w-full h-12 px-4 rounded-xl border border-border
                focus:border-primary focus:ring-2 focus:ring-primary/20
                transition-all
              "
                        />
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">
                            주소
                        </label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="예: 서울시 강남구 테헤란로 123"
                            className="
                w-full h-12 px-4 rounded-xl border border-border
                focus:border-primary focus:ring-2 focus:ring-primary/20
                transition-all
              "
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">
                            카테고리
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="
                w-full h-12 px-4 rounded-xl border border-border
                focus:border-primary focus:ring-2 focus:ring-primary/20
                transition-all bg-white
              "
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">
                            지출 사유
                        </label>
                        <input
                            type="text"
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            placeholder="예: 팀 회식 비용, 교통비 등"
                            className="
                w-full h-12 px-4 rounded-xl border border-border
                focus:border-primary focus:ring-2 focus:ring-primary/20
                transition-all
              "
                        />
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">
                            금액 *
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">₩</span>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: formatCurrencyInput(e.target.value) })}
                                required
                                placeholder="0"
                                className="
                  w-full h-12 pl-8 pr-4 rounded-xl border border-border
                  focus:border-primary focus:ring-2 focus:ring-primary/20
                  transition-all tabular-nums
                "
                            />
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1.5">
                            영수증 이미지 (선택)
                        </label>

                        {previewUrl ? (
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                    <img
                                        src={previewUrl}
                                        alt="영수증 미리보기"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-text-primary truncate">
                                        {imageFile?.name}
                                    </p>
                                    <p className="text-xs text-text-secondary">
                                        {imageFile && (imageFile.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="p-2 rounded-full hover:bg-red-100 text-red-500 transition-colors"
                                    aria-label="이미지 삭제"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="
                                    w-full h-20 flex flex-col items-center justify-center
                                    border-2 border-dashed border-gray-300 rounded-xl
                                    text-text-secondary hover:border-primary hover:text-primary
                                    transition-colors
                                "
                            >
                                <ImagePlus className="w-6 h-6 mb-1" />
                                <span className="text-sm">이미지 추가 (선택)</span>
                            </button>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            aria-label="영수증 이미지 선택"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4 safe-bottom">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 h-12 border-2 border-gray-200 text-text-secondary font-semibold rounded-xl hover:bg-gray-50 active:scale-95 transition-all btn-press"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="flex-1 h-12 bg-primary text-white font-semibold rounded-xl hover:bg-primary-700 active:scale-95 transition-all btn-press"
                        >
                            저장
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
