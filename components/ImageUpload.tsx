
import React, { useState, useCallback } from 'react';
import { UploadIcon } from './Icon';

interface ImageUploadProps {
    onFilesChange: (files: FileList) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onFilesChange }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true);
        } else if (e.type === "dragleave") {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFilesChange(e.dataTransfer.files);
        }
    }, [onFilesChange]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFilesChange(e.target.files);
            e.target.value = ''; // Reset input to allow re-uploading the same file
        }
    };

    return (
        <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-300 ${isDragging ? 'border-purple-500 bg-gray-700/50' : 'border-gray-600 hover:border-purple-500 hover:bg-gray-800/50'}`}
        >
            <input
                type="file"
                id="file-upload"
                multiple
                accept="image/png, image/jpeg, image/webp"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleChange}
            />
            <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer text-center">
                <UploadIcon className="w-12 h-12 text-gray-500 mb-4" />
                <p className="text-lg font-semibold text-gray-300">اسحب وأفلت الصور هنا</p>
                <p className="text-gray-400">أو <span className="font-bold text-purple-400">انقر للاختيار</span></p>
                <p className="text-xs text-gray-500 mt-2">يدعم PNG, JPG, WEBP</p>
            </label>
        </div>
    );
};
