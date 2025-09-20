import React, { useState, useCallback } from 'react';
import { ImageFile, GeneratedResult } from './types';
import { composeImages } from './services/geminiService';
import { ImageUploader } from './components/ImageUploader';
import { Spinner } from './components/Spinner';
import { ImageIcon } from './components/icons/ImageIcon';

const App: React.FC = () => {
  const [personImage, setPersonImage] = useState<ImageFile | null>(null);
  const [productImage, setProductImage] = useState<ImageFile | null>(null);
  const [prompt, setPrompt] = useState<string>('Make the person interact with or use the product naturally. Ensure the final image is realistic with correct scale, lighting, and perspective.');
  const [generatedResult, setGeneratedResult] = useState<GeneratedResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        const mimeType = result.split(';')[0].split(':')[1];
        resolve({ base64, mimeType });
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>, imageType: 'person' | 'product') => {
    const file = event.target.files?.[0];
    if (file) {
      const { base64, mimeType } = await fileToBase64(file);
      const imageFileData: ImageFile = {
        file,
        preview: URL.createObjectURL(file),
        base64,
        mimeType,
      };
      if (imageType === 'person') {
        setPersonImage(imageFileData);
      } else {
        setProductImage(imageFileData);
      }
    }
  }, []);

  const handleGenerate = async () => {
    if (!personImage || !productImage) {
      setError('Vui lòng tải lên cả ảnh nhân vật và ảnh sản phẩm.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setGeneratedResult(null);

    try {
      const result = await composeImages(personImage, productImage, prompt);
      setGeneratedResult(result);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đã xảy ra lỗi không xác định.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <div className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
            AI Image Composer
          </h1>
          <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
            Tạo ảnh ghép chân thực bằng AI. Tải lên ảnh chân dung và sản phẩm để AI kết hợp chúng một cách tự nhiên.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg space-y-6 border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ImageUploader id="person-upload" label="Ảnh nhân vật" image={personImage} onImageChange={(e) => handleImageChange(e, 'person')} />
              <ImageUploader id="product-upload" label="Ảnh sản phẩm" image={productImage} onImageChange={(e) => handleImageChange(e, 'product')} />
            </div>
            
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
                Yêu cầu (Prompt)
              </label>
              <textarea
                id="prompt"
                rows={4}
                className="w-full bg-gray-900 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Mô tả cách bạn muốn nhân vật tương tác với sản phẩm..."
              />
            </div>
            
            <button
              onClick={handleGenerate}
              disabled={isLoading || !personImage || !productImage}
              className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
            >
              {isLoading ? <><Spinner className="mr-2" /> Đang xử lý...</> : 'Tạo ảnh'}
            </button>
            {error && <p className="text-red-400 text-center text-sm mt-2">{error}</p>}
          </div>

          {/* Output Panel */}
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 flex items-center justify-center min-h-[400px] lg:min-h-full">
            {isLoading && (
               <div className="text-center text-gray-400">
                 <Spinner />
                 <p className="mt-4">AI đang sáng tạo, vui lòng chờ trong giây lát...</p>
               </div>
            )}
            {!isLoading && !generatedResult && (
              <div className="text-center text-gray-500">
                <ImageIcon className="w-24 h-24 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Kết quả sẽ hiển thị ở đây</h3>
                <p className="text-sm">Tải lên hai hình ảnh và nhấn "Tạo ảnh" để bắt đầu.</p>
              </div>
            )}
            {generatedResult?.image && (
              <div className="w-full flex flex-col items-center">
                 <img src={generatedResult.image} alt="Generated composition" className="max-w-full max-h-[80vh] rounded-lg object-contain" />
                 {generatedResult.text && <p className="text-sm text-gray-400 mt-4 italic text-center">"{generatedResult.text}"</p>}
                 <a 
                   href={generatedResult.image} 
                   download="generated-image.png"
                   className="mt-4 bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors"
                 >
                   Tải xuống
                 </a>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
