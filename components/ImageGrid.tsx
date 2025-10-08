import React from 'react';
import { ImageFile } from '../types';
import { Loader } from './Loader';
import { CheckCircleIcon, DownloadIcon, ErrorIcon, CheckIcon } from './Icon';

interface ImageCardProps {
    image: ImageFile;
    onToggleSelect: (id: string) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ image, onToggleSelect }) => {
    const finalImageUrl = image.processedUrl || image.originalUrl;

    return (
        <div className="relative group aspect-square bg-gray-800 rounded-lg overflow-hidden border-2 border-transparent transition-all duration-300 data-[selected=true]:border-purple-500 data-[selected=true]:ring-2 data-[selected=true]:ring-purple-500/50" data-selected={image.isSelected}>
            <img src={finalImageUrl} alt={image.file.name} className="w-full h-full object-cover" />
            
            {image.processedUrl && !image.isProcessing && !image.error && (
                <div className="absolute top-2 right-2 z-10 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                    <CheckIcon className="w-3 h-3" />
                    <span>تم التعديل</span>
                </div>
            )}

            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                 <div 
                    className="absolute top-2 left-2 w-6 h-6 rounded-full border-2 border-white bg-black/50 flex items-center justify-center cursor-pointer"
                    onClick={() => onToggleSelect(image.id)}
                 >
                    {image.isSelected && <CheckCircleIcon className="w-7 h-7 text-purple-400" />}
                 </div>

                <p className="text-xs text-white truncate bg-black/60 px-2 py-1 rounded self-start">{image.file.name}</p>

                {image.processedUrl && (
                    <a
                        href={image.processedUrl}
                        download={`processed_${image.file.name}`}
                        className="absolute bottom-3 right-3 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors"
                        title="تحميل الصورة"
                    >
                        <DownloadIcon className="w-5 h-5" />
                    </a>
                )}
            </div>

            {image.isProcessing && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2">
                    <Loader />
                    <span className="text-sm text-gray-300">جاري المعالجة...</span>
                </div>
            )}

            {image.error && (
                 <div className="absolute inset-0 bg-red-900/80 flex flex-col items-center justify-center text-center p-2">
                    <ErrorIcon className="w-8 h-8 text-red-300 mb-2"/>
                    <p className="text-xs text-red-200 font-semibold">فشلت المعالجة</p>
                    <p className="text-xs text-red-300 mt-1">{image.error}</p>
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
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <p className="mt-4 text-xl">لم يتم رفع أي صور بعد</p>
                <p>ابدأ برفع صورك من اللوحة على اليسار.</p>
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