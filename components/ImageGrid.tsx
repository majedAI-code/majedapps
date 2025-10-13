import React from 'react';
import { ImageFile } from '../types';
import { Loader } from './Loader';
import { CheckCircleIcon, DownloadIcon, ErrorIcon, CheckIcon, CircleIcon, PhotoIcon } from './Icon';

interface ImageCardProps {
    image: ImageFile;
    onToggleSelect: (id: string) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ image, onToggleSelect }) => {
    const finalImageUrl = image.processedUrl || image.originalUrl;

    return (
        <div 
            className="relative group aspect-square bg-slate-900/70 rounded-lg overflow-hidden cursor-pointer transition-all duration-300"
            onClick={() => onToggleSelect(image.id)}
            aria-label={`Select ${image.file.name}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggleSelect(image.id)}
        >
            <div 
                className={`absolute inset-0 border-2 rounded-lg transition-all duration-300 z-10 pointer-events-none ${image.isSelected ? 'border-purple-500 ring-2 ring-purple-500/30' : 'border-slate-800/80 group-hover:border-purple-400/60'}`}
            ></div>

            <img src={finalImageUrl} alt={image.file.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            
            <div className="absolute top-3 left-3 z-20">
                {image.isSelected ? (
                    <CheckCircleIcon className="w-6 h-6 text-purple-400 bg-slate-950/50 rounded-full" />
                ) : (
                    <CircleIcon className="w-6 h-6 text-slate-400/50 group-hover:text-white transition-colors" />
                )}
            </div>

            {image.processedUrl && !image.isProcessing && !image.error && (
                <div className="absolute top-2 right-2 z-20 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
                    <CheckIcon className="w-3 h-3" />
                    <span>تم التعديل</span>
                </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 z-10">
                 <p className="text-xs text-white truncate drop-shadow-md">{image.file.name}</p>
            </div>


            {image.processedUrl && !image.isProcessing && (
                <a
                    href={image.processedUrl}
                    download={`processed_${image.file.name}`}
                    className="absolute bottom-3 right-3 bg-purple-600 text-white p-2.5 rounded-full hover:bg-purple-700 transition-all duration-300 z-20 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100"
                    title="تحميل الصورة"
                    onClick={(e) => e.stopPropagation()}
                >
                    <DownloadIcon className="w-5 h-5" />
                </a>
            )}

            {image.isProcessing && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-2 z-30">
                    <Loader />
                    <span className="text-sm text-slate-300">جاري المعالجة...</span>
                </div>
            )}

            {image.error && (
                 <div className="absolute inset-0 bg-red-900/90 flex flex-col items-center justify-center text-center p-2 z-30">
                    <ErrorIcon className="w-8 h-8 text-red-300 mb-2"/>
                    <p className="text-sm text-red-200 font-semibold">فشلت المعالجة</p>
                    <p className="text-xs text-red-300 mt-1 max-w-full truncate">{image.error}</p>
                </div>
            )}
        </div>
    );
};

interface ImageGridProps {
    images: ImageFile[];
    onToggleSelect: (id: string) => void;
}

export const ImageGrid: React.FC<ImageGridProps> = ({ images, onToggleSelect }) => {
    if (images.length === 0) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-center text-slate-500 p-8">
                <PhotoIcon className="h-28 w-28 text-slate-800" />
                <h3 className="mt-6 text-2xl font-semibold text-slate-300">منطقة عملك فارغة</h3>
                <p className="mt-2 max-w-sm text-slate-400">
                    ابدأ بسحب وإفلات بعض الصور في لوحة الرفع، أو انقر لاختيارها من جهازك. صورك ستظهر هنا جاهزة للتعديل.
                </p>
            </div>
        );
    }
    
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 h-full overflow-y-auto pr-2">
            {images.map(image => (
                <ImageCard key={image.id} image={image} onToggleSelect={onToggleSelect} />
            ))}
        </div>
    );
};