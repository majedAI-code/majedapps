import React, { useState, useEffect } from 'react';
import { EditMode } from '../types';
import { ResizeIcon, WandIcon, EnhanceIcon, TrashIcon } from './Icon';

interface ControlPanelProps {
    onProcess: (settings: { width?: number; height?: number; keepAspectRatio?: boolean; apiKey: string; }) => void;
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
    disabled?: boolean;
    title?: string;
}> = ({ icon, label, isActive, onClick, disabled, title }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={title}
        aria-disabled={disabled}
        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-purple-500 ${
            isActive ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
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
    const [apiKey, setApiKey] = useState('');
    const [showApiKeyInput, setShowApiKeyInput] = useState(false);

    const isAiAvailable = !!apiKey.trim();

    useEffect(() => {
        // If AI is not available, and an AI mode is somehow selected, default to resize mode.
        if (!isAiAvailable && (editMode === EditMode.REMOVE_BG || editMode === EditMode.ENHANCE)) {
            setEditMode(EditMode.RESIZE);
        }
    }, [isAiAvailable, editMode, setEditMode]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onProcess({ width, height, keepAspectRatio, apiKey });
    };

    const getActionText = () => {
        switch (editMode) {
            case EditMode.RESIZE: return 'تغيير حجم';
            case EditMode.REMOVE_BG: return 'إزالة خلفية';
            case EditMode.ENHANCE: return 'تحسين جودة';
            default: return 'تطبيق';
        }
    };

    const areAllSelected = selectedImageCount === imageCount && imageCount > 0;
    const aiUnavailableTooltip = !isAiAvailable ? "أدخل مفتاح API لتفعيل هذه الميزة." : undefined;

    return (
        <div className="bg-black/20 backdrop-blur-lg rounded-xl p-5 flex flex-col gap-6 border border-slate-800/50 shadow-2xl shadow-black/20">
            <h2 className="text-xl font-bold text-slate-100">لوحة التحكم</h2>
            
            <div className="flex gap-2 bg-slate-900/50 p-1.5 rounded-lg">
                <TabButton label="تغيير الحجم" icon={<ResizeIcon />} isActive={editMode === EditMode.RESIZE} onClick={() => setEditMode(EditMode.RESIZE)} />
                <TabButton 
                    label="إزالة الخلفية" 
                    icon={<WandIcon />} 
                    isActive={editMode === EditMode.REMOVE_BG} 
                    onClick={() => setEditMode(EditMode.REMOVE_BG)}
                    disabled={!isAiAvailable}
                    title={aiUnavailableTooltip}
                />
                <TabButton 
                    label="تحسين الجودة" 
                    icon={<EnhanceIcon />} 
                    isActive={editMode === EditMode.ENHANCE} 
                    onClick={() => setEditMode(EditMode.ENHANCE)} 
                    disabled={!isAiAvailable}
                    title={aiUnavailableTooltip}
                />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="min-h-[110px]">
                    {editMode === EditMode.RESIZE && (
                        <div className="flex flex-col gap-4 animate-fade-in">
                            <div className="flex gap-4">
                                <div>
                                    <label htmlFor="width" className="block text-sm font-medium text-slate-300 mb-2">العرض (px)</label>
                                    <input type="number" id="width" value={width} onChange={e => setWidth(Math.max(1, Number(e.target.value)))} className="w-full bg-slate-800/50 border border-slate-700 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500 ring-offset-slate-900" />
                                </div>
                                <div>
                                    <label htmlFor="height" className="block text-sm font-medium text-slate-300 mb-2">الارتفاع (px)</label>
                                    <input type="number" id="height" value={height} onChange={e => setHeight(Math.max(1, Number(e.target.value)))} className="w-full bg-slate-800/50 border border-slate-700 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500 ring-offset-slate-900" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="aspect-ratio" checked={keepAspectRatio} onChange={e => setKeepAspectRatio(e.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-slate-800" />
                                <label htmlFor="aspect-ratio" className="text-sm text-slate-300">المحافظة على أبعاد الصورة</label>
                            </div>
                        </div>
                    )}
                    {editMode === EditMode.REMOVE_BG && <p className="text-sm text-center text-slate-400 p-4 bg-slate-800/30 rounded-md animate-fade-in">سيقوم الذكاء الاصطناعي بإزالة خلفية الصور المحددة بدقة عالية.</p>}
                    {editMode === EditMode.ENHANCE && <p className="text-sm text-center text-slate-400 p-4 bg-slate-800/30 rounded-md animate-fade-in">سيقوم الذكاء الاصطناعي بتحسين جودة وتفاصيل الصور المحددة.</p>}
                </div>
                
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <label htmlFor="api-key-input" className="text-sm font-medium text-slate-300">
                            Gemini API Key
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowApiKeyInput(prev => !prev)}
                            className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                            title="Toggle API Key Input For Debugging"
                        >
                            {showApiKeyInput ? 'إخفاء' : 'إظهار'}
                        </button>
                    </div>
                    {showApiKeyInput && (
                         <input
                            type="password"
                            id="api-key-input"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-md p-2 focus:ring-purple-500 focus:border-purple-500 ring-offset-slate-900 animate-fade-in"
                            placeholder="أدخل مفتاح API الخاص بك هنا"
                            aria-label="Gemini API Key Input"
                        />
                    )}
                </div>

                <div className="border-t border-slate-700 pt-5 flex flex-col gap-4">
                     <div className="flex justify-between items-center text-sm">
                        <div className="text-slate-400">
                             <span className="font-bold text-slate-100">{selectedImageCount}</span> / {imageCount} صور محددة
                        </div>
                         <button type="button" onClick={onToggleSelectAll} className="font-semibold text-purple-400 hover:text-purple-300 transition-colors">
                            {areAllSelected ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                         </button>
                     </div>
                    <button type="submit" disabled={selectedImageCount === 0} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-purple-500">
                        {selectedImageCount > 0 ? `${getActionText()} لـ ${selectedImageCount} صورة` : 'حدد صورًا للمعالجة'}
                    </button>
                    <button 
                        type="button"
                        onClick={onDelete} 
                        className="w-full flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400 border border-transparent text-slate-300 font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200"
                        title={selectedImageCount > 0 ? `حذف الصور المحددة (${selectedImageCount})` : 'مسح كل الصور'}
                    >
                        <TrashIcon className="w-5 h-5" />
                        <span>{selectedImageCount > 0 ? `حذف المحدد (${selectedImageCount})` : 'مسح كل الصور'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};