import React, { useState } from 'react';
import { EditMode } from '../types';
import { ResizeIcon, WandIcon, EnhanceIcon, TrashIcon } from './Icon';

interface ControlPanelProps {
    onProcess: (settings: { width?: number; height?: number; keepAspectRatio?: boolean }) => void;
    editMode: EditMode;
    setEditMode: (mode: EditMode) => void;
    imageCount: number;
    selectedImageCount: number;
    onDelete: () => void;
    onToggleSelectAll: () => void;
}

const TabButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 ${
            isActive ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

export const ControlPanel: React.FC<ControlPanelProps> = ({
    onProcess,
    editMode,
    setEditMode,
    imageCount,
    selectedImageCount,
    onDelete,
    onToggleSelectAll
}) => {
    const [width, setWidth] = useState(1080);
    const [height, setHeight] = useState(1080);
    const [keepAspectRatio, setKeepAspectRatio] = useState(true);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onProcess({ width, height, keepAspectRatio });
    };

    return (
        <div className="bg-gray-800 rounded-xl p-5 flex flex-col gap-6 border border-gray-700/50">
            <div className="flex justify-between items-center">
                 <h2 className="text-xl font-bold text-white">لوحة التحكم</h2>
                 <button 
                    onClick={onDelete} 
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    title={selectedImageCount > 0 ? `حذف الصور المحددة (${selectedImageCount})` : 'مسح كل الصور'}
                 >
                     <TrashIcon className="w-5 h-5" />
                 </button>
            </div>
            <div className="flex gap-2 bg-gray-900/50 p-1.5 rounded-lg">
                <TabButton label="تغيير الحجم" icon={<ResizeIcon />} isActive={editMode === EditMode.RESIZE} onClick={() => setEditMode(EditMode.RESIZE)} />
                <TabButton label="إزالة الخلفية" icon={<WandIcon />} isActive={editMode === EditMode.REMOVE_BG} onClick={() => setEditMode(EditMode.REMOVE_BG)} />
                <TabButton label="تحسين الجودة" icon={<EnhanceIcon />} isActive={editMode === EditMode.ENHANCE} onClick={() => setEditMode(EditMode.ENHANCE)} />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {editMode === EditMode.RESIZE && (
                    <>
                        <div className="flex gap-4">
                            <div>
                                <label htmlFor="width" className="block text-sm font-medium text-gray-300 mb-1">العرض (px)</label>
                                <input type="number" id="width" value={width} onChange={e => setWidth(Number(e.target.value))} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500" />
                            </div>
                            <div>
                                <label htmlFor="height" className="block text-sm font-medium text-gray-300 mb-1">الارتفاع (px)</label>
                                <input type="number" id="height" value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="aspect-ratio" checked={keepAspectRatio} onChange={e => setKeepAspectRatio(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                            <label htmlFor="aspect-ratio" className="text-sm text-gray-300">المحافظة على أبعاد الصورة</label>
                        </div>
                    </>
                )}
                {editMode === EditMode.REMOVE_BG && <p className="text-sm text-center text-gray-400 p-4 bg-gray-700/50 rounded-md">سيقوم الذكاء الاصطناعي بإزالة خلفية الصور المحددة.</p>}
                {editMode === EditMode.ENHANCE && <p className="text-sm text-center text-gray-400 p-4 bg-gray-700/50 rounded-md">سيقوم الذكاء الاصطناعي بتحسين جودة الصور المحددة.</p>}

                <div className="border-t border-gray-700 pt-4 flex flex-col gap-3">
                     <div className="flex justify-between text-sm text-gray-400">
                         <span>{imageCount} صور مرفوعة</span>
                         <button type="button" onClick={onToggleSelectAll} className="font-semibold text-purple-400 hover:underline">
                            {selectedImageCount === imageCount ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                         </button>
                     </div>
                    <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                        {`تطبيق على ${selectedImageCount} صورة`}
                    </button>
                </div>
            </form>
        </div>
    );
};