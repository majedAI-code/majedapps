
export interface ImageFile {
    id: string;
    file: File;
    originalUrl: string;
    processedUrl?: string;
    isSelected: boolean;
    isProcessing: boolean;
    error?: string;
}

export enum EditMode {
    RESIZE = 'resize',
    REMOVE_BG = 'remove-bg',
    ENHANCE = 'enhance',
}
