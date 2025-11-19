import React, { useState, useRef } from 'react';
import { RetroButton, RetroCard, RetroTextArea } from './RetroComponents';
//import { scanQRCodeImage } from '../services/gemini';
import { LoadingState } from '../types';

export const QRPanel: React.FC = () => {
  const [mode, setMode] = useState<'GENERATE' | 'SCAN'>('GENERATE');
  const [inputText, setInputText] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  
  // Scanner State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scanStatus, setScanStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [scannedResult, setScannedResult] = useState<string | null>(null);

  const generateQR = () => {
    if (!inputText) return;
    // Use a simple stateless API for QR generation to avoid heavy deps
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(inputText)}&bgcolor=050505&color=2dd4bf`;
    setQrUrl(url);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanStatus(LoadingState.PROCESSING);
    setScannedResult(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      try {
        //const text = await scanQRCodeImage(base64String);
        //setScannedResult(text);
        setScanStatus(LoadingState.SUCCESS);
      } catch (err) {
        console.error(err);
        setScanStatus(LoadingState.ERROR);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-center space-x-4 mb-8">
         <RetroButton 
           variant={mode === 'GENERATE' ? 'primary' : 'secondary'} 
           onClick={() => setMode('GENERATE')}
         >
           Generate QR
         </RetroButton>
         <RetroButton 
           variant={mode === 'SCAN' ? 'primary' : 'secondary'} 
           onClick={() => setMode('SCAN')}
         >
           AI Scanner
         </RetroButton>
      </div>

      {mode === 'GENERATE' && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
             <RetroCard title="Data Input">
               <RetroTextArea 
                 value={inputText}
                 onChange={e => setInputText(e.target.value)}
                 placeholder="Enter text to encode into QR..."
               />
               <div className="mt-4">
                 <RetroButton onClick={generateQR} className="w-full" disabled={!inputText}>
                   Construct Matrix
                 </RetroButton>
               </div>
             </RetroCard>
          </div>
          <div className="flex items-center justify-center">
            <RetroCard title="Visual Matrix">
               <div className="w-[300px] h-[300px] bg-black border-2 border-slate-800 flex items-center justify-center">
                 {qrUrl ? (
                   <img src={qrUrl} alt="QR Code" className="w-full h-full object-contain image-pixelated" />
                 ) : (
                   <span className="text-slate-700">AWAITING DATA</span>
                 )}
               </div>
            </RetroCard>
          </div>
        </div>
      )}

      {mode === 'SCAN' && (
        <div className="max-w-xl mx-auto">
          <RetroCard title="Vision Input">
            <div className="space-y-6 text-center">
              <p className="text-slate-400">
                Upload a QR code image or take a photo. The AI Vision module will extract the data.
              </p>
              
              <input 
                type="file" 
                accept="image/*" 
                capture="environment"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-4 border-dashed border-slate-700 hover:border-teal-500 cursor-pointer p-12 transition-colors bg-slate-900/50"
              >
                {scanStatus === LoadingState.PROCESSING ? (
                  <span className="animate-pulse text-teal-400">ANALYZING PIXELS...</span>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-slate-300 font-bold">CLICK TO CAPTURE / UPLOAD</span>
                  </div>
                )}
              </div>

              {scannedResult && (
                <div className="bg-teal-900/20 border-2 border-teal-500 p-4 text-left">
                  <span className="text-xs text-teal-500 block mb-1">DECODED DATA</span>
                  <p className="text-white break-all font-mono text-lg">{scannedResult}</p>
                </div>
              )}
            </div>
          </RetroCard>
        </div>
      )}
    </div>
  );
};