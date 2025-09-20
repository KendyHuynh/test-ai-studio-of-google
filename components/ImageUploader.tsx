import React from 'react';
import { ImageFile } from '../types';
import { ImageIcon } from './icons/ImageIcon';

interface ImageUploaderProps {
  id: string;
  label: string;
  image: ImageFile | null;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ id, label, image, onImageChange, className }) => {
  return (
    <div className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-800 border-gray-600 hover:border-gray-500 hover:bg-gray-700 transition-colors ${className}`}>
      <label htmlFor={id} className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
        {image ? (
          <img src={image.preview} alt={label} className="object-contain w-full h-full p-2" />
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400">
            <ImageIcon className="w-10 h-10 mb-3" />
            <p className="mb-2 text-sm text-center"><span className="font-semibold">Bấm để tải lên</span> hoặc kéo thả</p>
            <p className="text-xs text-center">{label}</p>
          </div>
        )}
      </label>
      <input id={id} type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={onImageChange} />
    </div>
  );
};
