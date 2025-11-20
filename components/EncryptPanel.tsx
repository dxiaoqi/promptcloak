
import React, { useState, useRef } from 'react';
import { RetroButton, RetroCard, RetroInput, RetroTextArea } from './RetroComponents';
import { GeoLocationData, LoadingState, HiddenPayload } from '../types';
import { encodePayload, hashPassword } from '../services/steganography';

export const EncryptPanel: React.FC = () => {
  const [text, setText] = useState('');
  const [password, setPassword] = useState('');
  
  // Prompt Content State
  const [promptType, setPromptType] = useState<'text' | 'image'>('text');
  const [promptContent, setPromptContent] = useState('');
  const [promptImage, setPromptImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security Constraints - Temporarily Disabled
  const [useGeo, setUseGeo] = useState(false);
  const [useTime, setUseTime] = useState(false);
  
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [output, setOutput] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Max image size ~50KB to avoid massive clipboard lag
  const MAX_IMG_SIZE = 50 * 1024; 

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMG_SIZE) {
       alert(`Image too large! Max size is 50KB for steganography. Current: ${(file.size/1024).toFixed(1)}KB`);
       return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
       if (typeof ev.target?.result === 'string') {
           setPromptImage(ev.target.result);
       }
    };
    reader.readAsDataURL(file);
  };

  const handleEncrypt = async () => {
    if (!text || !password) return;
    
    setStatus(LoadingState.PROCESSING);
    setErrorMsg('');
    setShareUrl('');
    let geo: GeoLocationData | null = null;
    let timestamp: number | undefined = undefined;

    try {
      if (useTime) {
        timestamp = new Date().getTime();
      }

      // Handle Multiple Passwords
      const rawPasswords = password.split(',').map(s => s.trim()).filter(s => s.length > 0);
      const hashedPasswords = await Promise.all(rawPasswords.map(p => hashPassword(p)));

      // Construct Payload
      const payload: HiddenPayload = {
        o: text,
        access_hashes: hashedPasswords,
        g: geo ? { lat: geo.latitude, lng: geo.longitude } : undefined,
        t: timestamp,
        prompt: promptType === 'image' && promptImage ? {
            type: 'image',
            content: promptImage
        } : (promptContent ? {
            type: 'text',
            content: promptContent
        } : undefined)
      };

      // Encode
      const finalCipher = encodePayload(text, payload);
      
      // Check approximate size to warn user
      if (finalCipher.length > 1000000) {
          console.warn("Warning: Generated text is very large!");
      }

      setOutput(finalCipher);
      
      // Generate Short Share URL via Storage API
      try {
          const res = await fetch('/api/storage', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ content: finalCipher })
          });
          
          if (res.ok) {
              const json = await res.json();
              if (json.id) {
                  const url = `${window.location.origin}/share?id=${json.id}`;
                  setShareUrl(url);
              }
          } else {
              console.error("Storage failed, falling back to manual copy");
          }
      } catch (storageErr) {
          console.error("Storage API error", storageErr);
      }

      setStatus(LoadingState.SUCCESS);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "Encryption System Failure");
      setStatus(LoadingState.ERROR);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <RetroCard title="Source Data">
            <div className="space-y-4">
              <div>
                <label className="block text-teal-700 mb-1 uppercase text-sm">Visible Message</label>
                <RetroTextArea 
                  value={text} 
                  onChange={e => setText(e.target.value)}
                  placeholder="Enter public text..."
                />
              </div>
              <div>
                <label className="block text-teal-700 mb-1 uppercase text-sm">Unlock Keys (Codes)</label>
                <RetroInput 
                  type="text" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  placeholder="CODE1, CODE2..."
                />
              </div>
            </div>
          </RetroCard>

          <RetroCard title="Hidden Reward (Prompt)">
             <div className="space-y-4">
                <div className="flex gap-4 text-sm mb-2">
                    <button 
                        onClick={() => setPromptType('text')}
                        className={`flex-1 py-1 border ${promptType === 'text' ? 'bg-teal-900 border-teal-500 text-teal-300' : 'border-slate-700 text-slate-500'}`}
                    >
                        TEXT PROMPT
                    </button>
                    <button 
                        onClick={() => setPromptType('image')}
                        className={`flex-1 py-1 border ${promptType === 'image' ? 'bg-teal-900 border-teal-500 text-teal-300' : 'border-slate-700 text-slate-500'}`}
                    >
                        IMAGE PROMPT
                    </button>
                </div>

                {promptType === 'text' ? (
                    <RetroTextArea 
                        value={promptContent}
                        onChange={e => setPromptContent(e.target.value)}
                        placeholder="Enter the secret prompt or reward text..."
                        className="h-24"
                    />
                ) : (
                    <div className="border-2 border-dashed border-slate-700 p-4 text-center relative hover:border-teal-800 transition-colors">
                        <input 
                            type="file" 
                            accept="image/*" 
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        {promptImage ? (
                            <div className="relative">
                                <img src={promptImage} alt="Preview" className="max-h-32 mx-auto object-contain border border-teal-900" />
                                <button 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setPromptImage(null);
                                        if(fileInputRef.current) fileInputRef.current.value = '';
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-900 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center border border-red-500 z-10"
                                >
                                    X
                                </button>
                            </div>
                        ) : (
                            <div className="text-slate-500 py-4">
                                <p className="mb-1">CLICK TO UPLOAD</p>
                                <p className="text-[10px] uppercase text-slate-600">Max 50KB (Pixel Art / Icons)</p>
                            </div>
                        )}
                    </div>
                )}
             </div>
          </RetroCard>

          {/* Security Constraints - Temporarily Hidden */}
          <div style={{ display: 'none' }}>
             <RetroCard title="Security Constraints">
                {/* ... content preserved ... */}
             </RetroCard>
          </div>

          {status === LoadingState.ERROR && (
            <div className="p-3 border-2 border-red-800 bg-red-900/20 text-red-400 text-sm font-bold">
              ERROR: {errorMsg}
            </div>
          )}

          <RetroButton 
            onClick={handleEncrypt} 
            className="w-full"
            isLoading={status === LoadingState.PROCESSING}
            disabled={!text || !password}
          >
            Inject Data Layer
          </RetroButton>
        </div>

        <div>
          <RetroCard title="Output Stream" className="h-full min-h-[400px]">
            {status === LoadingState.SUCCESS ? (
               <div className="space-y-4 h-full flex flex-col">
                 <div className="flex-grow p-4 border-2 border-teal-900/30 bg-teal-950/10 text-teal-300 font-serif tracking-wide leading-relaxed whitespace-pre-wrap overflow-y-auto text-sm break-all">
                   {output}
                 </div>
                 <div className="text-xs text-slate-500 text-center">
                   * Visual text remains unaltered. Payload hidden in the hidden spectrum.
                 </div>
                 <RetroButton 
                   variant="secondary" 
                   className="w-full text-sm py-2"
                   onClick={() => navigator.clipboard.writeText(output)}
                 >
                   Copy Payload
                 </RetroButton>

                 {shareUrl ? (
                     <div className="mt-4 pt-4 border-t border-slate-800">
                         <p className="text-xs text-teal-500 mb-2 text-center">SHAREABLE LINK GENERATED</p>
                         <div className="flex gap-2">
                             <input 
                                type="text" 
                                readOnly 
                                value={shareUrl} 
                                className="bg-black border border-teal-900 text-teal-600 text-xs p-2 flex-grow font-mono" 
                             />
                             <button 
                                onClick={() => navigator.clipboard.writeText(shareUrl)}
                                className="bg-teal-900 text-teal-300 px-3 py-1 text-xs border border-teal-600 hover:bg-teal-800"
                             >
                                COPY
                             </button>
                         </div>
                         <div className="mt-4 flex justify-center bg-white p-2 w-fit mx-auto">
                            <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareUrl)}`} 
                                alt="Share QR"
                                className="w-32 h-32 image-pixelated" 
                            />
                         </div>
                     </div>
                 ) : (
                     output.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-800 text-center">
                            <p className="text-[10px] text-slate-600">
                                Output saved locally but link generation failed.<br/>
                                Please copy payload manually.
                            </p>
                        </div>
                     )
                 )}
               </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-700 flex-col space-y-4">
                <div className="w-16 h-16 border-4 border-slate-800 border-t-teal-900 rounded-full animate-spin"></div>
                <p className="tracking-widest text-xs">WAITING FOR INPUT...</p>
              </div>
            )}
          </RetroCard>
        </div>
      </div>
    </div>
  );
};
