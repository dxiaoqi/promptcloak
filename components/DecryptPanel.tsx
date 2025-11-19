
import React, { useState } from 'react';
import { RetroButton, RetroCard, RetroTextArea } from './RetroComponents';
import { decodePayload, checkConstraints } from '../services/steganography';
import { LoadingState } from '../types';

export const DecryptPanel: React.FC = () => {
  const [cipherText, setCipherText] = useState('');
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [result, setResult] = useState<{ success: boolean; content: string; secret?: string | null; reason?: string } | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => setLog(prev => [...prev, `> ${msg}`]);

  const handleDecrypt = async () => {
    if (!cipherText) return;
    setStatus(LoadingState.PROCESSING);
    setLog([]);
    setResult(null);
    
    try {
      addLog("Initializing Decryptor Core...");
      addLog("Analyzing Zero-Width Spectrum...");
      
      // 1. Attempt to extract hidden payload
      const hiddenPayload = decodePayload(cipherText);

      if (!hiddenPayload) {
        addLog("FAILURE: No encrypted signature found.");
        addLog("Text appears to be standard plaintext.");
        setResult({
          success: false,
          content: cipherText,
          reason: "No embedded PromptCloak data detected."
        });
        setStatus(LoadingState.SUCCESS);
        return;
      }

      addLog("Signature detected. Verifying Environmental Constraints...");
      
      // 2. Check Constraints (Time/Geo)
      const currentObj = new Date();
      let currentGeo = null;

      // Check if Geo is required before asking for permission to save UX
      if (hiddenPayload.g) {
        addLog("Geospatial Lock detected. Requesting coordinates...");
        try {
          await new Promise<void>((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                currentGeo = {
                  latitude: pos.coords.latitude,
                  longitude: pos.coords.longitude,
                  accuracy: pos.coords.accuracy
                };
                addLog(`Coordinates Acquired: [${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}]`);
                resolve();
              },
              (err) => {
                addLog("WARNING: Geolocation signal lost.");
                resolve(); 
              },
              { timeout: 5000 }
            );
          });
        } catch (e) {
           addLog("Geo-system failure.");
        }
      }

      const validation = checkConstraints(hiddenPayload, currentGeo, currentObj);
      
      if (validation.success) {
        addLog("ACCESS GRANTED: Protocol Verified.");
        addLog("Extracting secured layer...");
        setResult({
          success: true,
          content: hiddenPayload.o, // Original Text
          secret: hiddenPayload.p // Secret Password
        });
      } else {
        addLog(`ACCESS DENIED: ${validation.reason}`);
        addLog("Showing surface data only.");
        setResult({
          success: false,
          content: hiddenPayload.o, // Show original text as "surface" content
          reason: validation.reason
        });
      }
      setStatus(LoadingState.SUCCESS);

    } catch (e) {
      console.error(e);
      addLog("CRITICAL FAILURE: System Error.");
      setStatus(LoadingState.ERROR);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        <RetroCard title="Input Stream">
           <RetroTextArea 
              value={cipherText} 
              onChange={e => setCipherText(e.target.value)}
              placeholder="Paste the data-enriched text here..."
              className="h-64"
            />
        </RetroCard>
        <RetroButton 
          onClick={handleDecrypt} 
          className="w-full"
          isLoading={status === LoadingState.PROCESSING}
          disabled={!cipherText}
        >
          Execute Decryption Algorithm
        </RetroButton>
        
        {/* Log Console */}
        <div className="bg-black border-2 border-slate-800 p-4 font-mono text-xs h-40 overflow-y-auto text-green-500">
          {log.map((l, i) => <div key={i} className="mb-1">{l}</div>)}
          {status === LoadingState.PROCESSING && <div className="animate-pulse">_</div>}
        </div>
      </div>

      <div>
         <RetroCard title="Decrypted Data" className="h-full min-h-[300px]">
            {result ? (
              <div className="space-y-6">
                <div className={`p-4 border-l-4 ${result.success ? 'border-teal-500 bg-teal-900/20' : 'border-red-500 bg-red-900/10'}`}>
                  <h3 className={`font-bold text-lg mb-2 ${result.success ? 'text-teal-400' : 'text-red-400'}`}>
                    {result.success ? 'DECRYPTION SUCCESSFUL' : 'ACCESS RESTRICTED'}
                  </h3>
                  
                  {result.success && result.secret && (
                    <div className="mb-4 p-3 border border-teal-500/50 bg-black relative overflow-hidden group">
                      <span className="text-xs uppercase text-teal-600 block mb-1">Extracted Password</span>
                      <span className="text-xl text-white font-mono tracking-wider">{result.secret}</span>
                      <div className="absolute top-0 right-0 w-4 h-4 bg-teal-500 animate-pulse"></div>
                    </div>
                  )}

                  {!result.success && result.reason && (
                    <div className="mb-4 p-2 bg-red-900/20 text-red-300 text-xs font-mono border border-red-900/50">
                      {result.reason}
                    </div>
                  )}

                  <div>
                     <span className="text-xs uppercase text-slate-500 block mb-1">
                       Message Content
                     </span>
                     <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                       {result.content}
                     </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-700 flex-col">
                <p className="mb-2 opacity-50">NO ACTIVE SESSION</p>
                <div className="w-full h-px bg-slate-800 w-1/2"></div>
              </div>
            )}
         </RetroCard>
      </div>
    </div>
  );
};
