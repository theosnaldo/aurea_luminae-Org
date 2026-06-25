import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Camera, X, Check } from 'lucide-react';

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void;
  onClose: () => void;
}

export default function WebcamCapture({ onCapture, onClose }: WebcamCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [image, setImage] = useState<string | null>(null);

  const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImage(imageSrc);
    }
  }, [webcamRef]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1D23] p-4 rounded-2xl border border-white/10 max-w-md w-full">
        {image ? (
          <div className="space-y-4">
            <img src={image} alt="Capture" className="w-full rounded-xl" />
            <div className="flex gap-2">
              <button onClick={() => setImage(null)} className="flex-1 bg-red-900/50 text-red-200 py-2 rounded-xl text-xs font-bold hover:bg-red-800">Tentar Novamente</button>
              <button onClick={() => onCapture(image)} className="flex-1 bg-[#D4AF37] text-[#0f1115] py-2 rounded-xl text-xs font-bold hover:bg-[#C5A030]">Usar Foto</button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full rounded-xl"
              disablePictureInPicture={false}
              forceScreenshotSourceSize={false}
              imageSmoothing={true}
              mirrored={false}
              videoConstraints={{ facingMode: "user" }}
              screenshotQuality={0.8}
              onUserMedia={() => console.log('Camera started')}
              onUserMediaError={(err) => console.error('Camera error', err)}
            />
            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 bg-white/5 text-[#94A3B8] py-2 rounded-xl text-xs font-bold hover:bg-white/10">Cancelar</button>
              <button onClick={capture} className="flex-1 bg-[#D4AF37] text-[#0f1115] py-2 rounded-xl text-xs font-bold hover:bg-[#C5A030] flex items-center justify-center gap-2">
                <Camera className="w-4 h-4" /> Capturar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
