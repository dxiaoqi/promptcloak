
import React, { useState } from 'react';
import { RetroButton, RetroCard, RetroInput, RetroTextArea } from './RetroComponents';
import { GeoLocationData, LoadingState, HiddenPayload } from '../types';
import { encodePayload } from '../services/steganography';

export const EncryptPanel: React.FC = () => {
  const [text, setText] = useState('');
  const [password, setPassword] = useState('');
  const [useGeo, setUseGeo] = useState(false);
  const [useTime, setUseTime] = useState(false);
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [output, setOutput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleEncrypt = async () => {
    if (!text || !password) return;
    
    setStatus(LoadingState.PROCESSING);
    setErrorMsg('');
    let geo: GeoLocationData | null = null;
    let timestamp: number | undefined = undefined;

    try {
      if (useGeo) {
        await new Promise<void>((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error("Geolocation not supported by this browser"));
            return;
          }
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              geo = {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: pos.coords.accuracy
              };
              resolve();
            },
            (err) => {
              console.warn("Geo fail", err);
              // Fail hard if user explicitly requested Geo Lock
              reject(new Error("Failed to acquire location for Geo-Lock. Please enable location permissions."));
            }
          );
        });
      }

      if (useTime) {
        timestamp = new Date().getTime();
      }

      // Construct Payload
      const payload: HiddenPayload = {
        o: text,
        p: password,
        g: geo ? { lat: geo.latitude, lng: geo.longitude } : undefined,
        t: timestamp
      };

      // Encode: Original Text + Invisible LZW Compressed Payload
      const finalCipher = encodePayload(text, payload);

      setOutput(finalCipher);
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
                <label className="block text-teal-700 mb-1 uppercase text-sm">Original Message</label>
                <RetroTextArea 
                  value={text} 
                  onChange={e => setText(e.target.value)}
                  placeholder="Enter text to secure..."
                />
              </div>
              <div>
                <label className="block text-teal-700 mb-1 uppercase text-sm">Encryption Key (Password)</label>
                <RetroInput 
                  type="text" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  placeholder="SECRET PASSCODE"
                />
              </div>
            </div>
          </RetroCard>

          <RetroCard title="Security Constraints">
            <div className="space-y-4 text-slate-300">
              <p className="text-sm text-slate-500 mb-4">Configure environmental locks.</p>
              
              <label className="flex items-center space-x-3 cursor-pointer group">
                <div className={`w-6 h-6 border-2 flex items-center justify-center transition-colors ${useGeo ? 'border-teal-500 bg-teal-900' : 'border-slate-600'}`}>
                  {useGeo && <span className="block w-3 h-3 bg-teal-400" />}
                </div>
                <input type="checkbox" className="hidden" checked={useGeo} onChange={e => setUseGeo(e.target.checked)} />
                <span className="group-hover:text-teal-400 transition-colors">Lock to Current Location</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer group">
                <div className={`w-6 h-6 border-2 flex items-center justify-center transition-colors ${useTime ? 'border-teal-500 bg-teal-900' : 'border-slate-600'}`}>
                  {useTime && <span className="block w-3 h-3 bg-teal-400" />}
                </div>
                <input type="checkbox" className="hidden" checked={useTime} onChange={e => setUseTime(e.target.checked)} />
                <span className="group-hover:text-teal-400 transition-colors">Lock to Current Time</span>
              </label>
            </div>
          </RetroCard>

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
                 <div className="flex-grow p-4 border-2 border-teal-900/30 bg-teal-950/10 text-teal-300 font-serif tracking-wide leading-relaxed whitespace-pre-wrap overflow-y-auto text-sm">
                   {output}
                 </div>
                 <div className="text-xs text-slate-500 text-center">
                   * Visual text remains unaltered. Payload hidden in zero-width spectrum.
                 </div>
                 <RetroButton 
                   variant="secondary" 
                   className="w-full text-sm py-2"
                   onClick={() => navigator.clipboard.writeText(output)}
                 >
                   Copy Payload
                 </RetroButton>
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
