import React, { useState, useCallback } from 'react';
import { ImageFile, EditMode } from './types';
import { ImageUpload } from './components/ImageUpload';
import { ControlPanel } from './components/ControlPanel';
import { ImageGrid } from './components/ImageGrid';
import { resizeImageOnCanvas } from './utils/fileUtils';
import { enhanceImage, removeBackground } from './services/geminiService';

const App: React.FC = () => {
    const [images, setImages] = useState<ImageFile[]>([]);
    const [editMode, setEditMode] = useState<EditMode>(EditMode.RESIZE);

    const handleFilesChange = (files: FileList) => {
        const newImages: ImageFile[] = Array.from(files).map(file => ({
            id: `${file.name}-${file.lastModified}`,
            file,
            originalUrl: URL.createObjectURL(file),
            isSelected: true,
            isProcessing: false,
        }));
        setImages(prev => [...prev, ...newImages]);
    };

    const toggleImageSelection = (id: string) => {
        setImages(prev =>
            prev.map(img =>
                img.id === id ? { ...img, isSelected: !img.isSelected } : img
            )
        );
    };
    
    const toggleSelectAll = () => {
        const areAllSelected = images.every(img => img.isSelected);
        setImages(prev => prev.map(img => ({ ...img, isSelected: !areAllSelected })));
    };


    const handleProcessing = useCallback(async (settings: { width?: number; height?: number; keepAspectRatio?: boolean }) => {
        const selectedImages = images.filter(img => img.isSelected);
        if (selectedImages.length === 0) {
            alert("الرجاء تحديد صورة واحدة على الأقل.");
            return;
        }

        setImages(prev =>
            prev.map(img =>
                img.isSelected ? { ...img, isProcessing: true, error: undefined } : img
            )
        );

        const processingPromises = selectedImages.map(async (image) => {
            try {
                let processedUrl: string;
                switch (editMode) {
                    case EditMode.RESIZE:
                        if (!settings.width || !settings.height) throw new Error("الأبعاد مطلوبة للتكبير والتصغير");
                        processedUrl = await resizeImageOnCanvas(image.file, settings.width, settings.height, settings.keepAspectRatio ?? true);
                        break;
                    case EditMode.REMOVE_BG:
                        processedUrl = await removeBackground(image.file);
                        break;
                    case EditMode.ENHANCE:
                        processedUrl = await enhanceImage(image.file);
                        break;
                    default:
                        throw new Error("وضع التعديل غير معروف");
                }
                return { id: image.id, processedUrl, error: undefined };
            } catch (error) {
                console.error(`Failed to process image ${image.file.name}:`, error);
                const errorMessage = error instanceof Error ? error.message : "حدث خطأ غير متوقع";
                return { id: image.id, processedUrl: undefined, error: errorMessage };
            }
        });

        const results = await Promise.allSettled(processingPromises);

        setImages(prev => {
            const newImages = [...prev];
            results.forEach(result => {
                if (result.status === 'fulfilled' && result.value) {
                    const { id, processedUrl, error } = result.value;
                    const index = newImages.findIndex(img => img.id === id);
                    if (index !== -1) {
                        newImages[index] = { ...newImages[index], isProcessing: false, processedUrl, error };
                    }
                } else if (result.status === 'rejected') {
                    // This case might be redundant if the catch block inside the promise works correctly, but it's good for safety.
                    console.error("A promise was rejected:", result.reason);
                }
            });
            return newImages;
        });
    }, [images, editMode]);

    const handleDelete = () => {
        const hasSelection = images.some(img => img.isSelected);

        if (hasSelection) {
            const imagesToDelete = images.filter(img => img.isSelected);
            const imagesToKeep = images.filter(img => !img.isSelected);

            imagesToDelete.forEach(img => {
                URL.revokeObjectURL(img.originalUrl);
            });
            setImages(imagesToKeep);
        } else {
            // If no images are selected, clear all images
            images.forEach(img => URL.revokeObjectURL(img.originalUrl));
            setImages([]);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col p-4 sm:p-6 lg:p-8 font-['Cairo']">
            <header className="text-center mb-8">
                <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600 py-2">
                    محرر الصور بالذكاء الاصطناعي
                </h1>
                <p className="mt-2 text-lg text-gray-400">
                    عدّل صورك دفعة واحدة: تغيير الحجم، إزالة الخلفية، وتحسين الجودة.
                </p>
            </header>

            <main className="flex-grow flex flex-col lg:flex-row gap-8">
                <aside className="w-full lg:w-1/3 xl:w-1/4 flex flex-col gap-6">
                    <ImageUpload onFilesChange={handleFilesChange} />
                    {images.length > 0 && (
                        <ControlPanel 
                            onProcess={handleProcessing} 
                            editMode={editMode} 
                            setEditMode={setEditMode} 
                            imageCount={images.length}
                            selectedImageCount={images.filter(img => img.isSelected).length}
                            onDelete={handleDelete}
                            onToggleSelectAll={toggleSelectAll}
                        />
                    )}
                </aside>
                <section className="flex-grow w-full lg:w-2/3 xl:w-3/4 bg-gray-900/50 rounded-xl p-4 border border-gray-700/50">
                    <ImageGrid images={images} onToggleSelect={toggleImageSelection} />
                </section>
            </main>
            <footer className="fixed bottom-4 right-4 text-xs text-white opacity-50">
                by majed almalki
            </footer>
        </div>
    );
};

export default App;