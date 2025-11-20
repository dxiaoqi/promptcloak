
import React, { useState } from 'react';
import { RetroButton, RetroCard, RetroTextArea, RetroInput } from './RetroComponents';
import { decodePayload, checkConstraints, hashPassword } from '../services/steganography';
import { LoadingState } from '../types';

export const DecryptPanel: React.FC = () => {
  const [cipherText, setCipherText] = useState('');
  const [claimCode, setClaimCode] = useState('');
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [result, setResult] = useState<{ success: boolean; content: string; secret?: string | null; reason?: string; locked?: boolean; prompt?: { type: 'text' | 'image', content: string } } | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => setLog(prev => [...prev, `> ${msg}`]);

  const handleDecrypt = async () => {
    if (!cipherText) return;
    setStatus(LoadingState.PROCESSING);
    setLog([]);
    setResult(null);
    setClaimCode('');
    
    try {
      addLog("Initializing Decryptor Core...");
      addLog("Analyzing Hidden Spectrum...");
      
      // 1. Attempt to extract hidden payload
      const hiddenPayload = decodePayload(cipherText);

      if (!hiddenPayload) {
        addLog("FAILURE: No encrypted signature found.");
        setResult({
          success: false,
          content: cipherText,
          reason: "No embedded PromptCloak data detected."
        });
        setStatus(LoadingState.SUCCESS);
        return;
      }

      addLog("Signature detected. Verifying Security Protocol...");

      // 2. Check Access Control (Hashes)
      if (hiddenPayload.access_hashes && hiddenPayload.access_hashes.length > 0) {
         addLog("SECURE CHANNEL DETECTED. Identity verification required.");
         setResult({
             success: false,
             content: hiddenPayload.o,
             locked: true,
             reason: "Please enter your Claim Code to unlock content."
         });
         setStatus(LoadingState.SUCCESS);
         return;
      }

      // 3. Check Constraints (Time/Geo)
      addLog("Verifying Environmental Constraints...");
      const currentObj = new Date();
      let currentGeo = null;

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
              () => {
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
        setResult({
          success: true,
          content: hiddenPayload.o, 
          secret: hiddenPayload.p,
          prompt: hiddenPayload.prompt
        });
      } else {
        addLog(`ACCESS DENIED: ${validation.reason}`);
        setResult({
          success: false,
          content: hiddenPayload.o, 
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

  const handleUnlock = async () => {
      if (!claimCode || !result || !cipherText) return;
      
      const payload = decodePayload(cipherText);
      if (!payload || !payload.access_hashes) return;

      setStatus(LoadingState.PROCESSING);
      addLog(`Verifying Identity Claim: [${claimCode}]...`);

      const inputHash = await hashPassword(claimCode);
      const isValid = payload.access_hashes.includes(inputHash);

      if (isValid) {
           addLog("IDENTITY CONFIRMED. Access Granted.");
           // Re-check Geo/Time for consistency
            const currentObj = new Date();
            let currentGeo = null;
             if (payload.g) {
                 addLog("Checking environmental constraints...");
                 try {
                    await new Promise<void>((resolve) => {
                        navigator.geolocation.getCurrentPosition(
                        (pos) => {
                            currentGeo = {
                            latitude: pos.coords.latitude,
                            longitude: pos.coords.longitude,
                            accuracy: pos.coords.accuracy
                            };
                            resolve();
                        },
                        () => resolve(),
                        { timeout: 5000 }
                        );
                    });
                 } catch(e) {}
            }

           const validation = checkConstraints(payload, currentGeo, currentObj);
           
           if (validation.success) {
               setResult({
                   success: true,
                   content: payload.o,
                   locked: false,
                   prompt: payload.prompt,
                   secret: payload.p
               });
           } else {
               setResult({
                   success: false,
                   content: payload.o,
                   locked: false,
                   reason: validation.reason
               });
           }
      } else {
          addLog("ACCESS DENIED: Invalid Claim Code.");
          // Provide feedback on fail?
      }
      setStatus(LoadingState.SUCCESS);
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
        
        <div className="bg-black border-2 border-slate-800 p-4 font-mono text-xs h-40 overflow-y-auto text-green-500">
          {log.map((l, i) => <div key={i} className="mb-1">{l}</div>)}
          {status === LoadingState.PROCESSING && <div className="animate-pulse">_</div>}
        </div>
      </div>

      <div>
         <RetroCard title="Decrypted Data" className="h-full min-h-[300px]">
            {result ? (
              <div className="space-y-6">
                 {result.locked ? (
                     <div className="p-4 border-l-4 border-amber-500 bg-amber-900/20 space-y-4">
                         <h3 className="font-bold text-lg text-amber-400 mb-2">SECURE CHANNEL LOCKED</h3>
                         <p className="text-sm text-amber-200/80 mb-4">{result.reason}</p>
                         
                         <div className="space-y-2">
                            <label className="text-xs uppercase text-amber-500">Enter Claim Code / Password</label>
                            <div className="flex gap-2">
                                <RetroInput 
                                    value={claimCode}
                                    onChange={e => setClaimCode(e.target.value)}
                                    placeholder="CODE-XXXX"
                                    className="flex-grow"
                                />
                                <RetroButton onClick={handleUnlock} disabled={!claimCode} className="w-auto px-4">
                                    UNLOCK
                                </RetroButton>
                            </div>
                         </div>
                     </div>
                 ) : (
                    <div className={`p-4 border-l-4 ${result.success ? 'border-teal-500 bg-teal-900/20' : 'border-red-500 bg-red-900/10'}`}>
                    <h3 className={`font-bold text-lg mb-2 ${result.success ? 'text-teal-400' : 'text-red-400'}`}>
                        {result.success ? 'DECRYPTION SUCCESSFUL' : 'ACCESS RESTRICTED'}
                    </h3>
                    
                    {/* PROMPT DISPLAY */}
                    {result.success && result.prompt && (
                        <div className="mb-6 p-4 border-2 border-teal-500/50 bg-black relative overflow-hidden group">
                             <span className="text-xs uppercase text-teal-400 block mb-3 border-b border-teal-900 pb-1 tracking-widest">
                                {result.prompt.type === 'image' ? 'Visual Artifact' : 'Secret Prompt'}
                             </span>
                             
                             {result.prompt.type === 'image' ? (
                                 <div className="relative">
                                     <img 
                                        src={result.prompt.content} 
                                        alt="Secret Reward" 
                                        className="max-w-full h-auto max-h-64 mx-auto border border-teal-900/50 shadow-[0_0_15px_rgba(20,184,166,0.2)]" 
                                     />
                                     <div className="absolute bottom-2 right-2">
                                         <a 
                                            href={result.prompt.content} 
                                            download="artifact.png"
                                            className="bg-teal-900/80 text-teal-300 text-[10px] px-2 py-1 border border-teal-500 hover:bg-teal-800"
                                         >
                                             SAVE
                                         </a>
                                     </div>
                                 </div>
                             ) : (
                                 <div className="font-mono text-teal-100 whitespace-pre-wrap bg-teal-900/10 p-2 border border-teal-900/30">
                                     {result.prompt.content}
                                 </div>
                             )}
                        </div>
                    )}

                    {!result.success && result.reason && (
                        <div className="mb-4 p-2 bg-red-900/20 text-red-300 text-xs font-mono border border-red-900/50">
                        {result.reason}
                        </div>
                    )}

                    <div>
                        <span className="text-xs uppercase text-slate-500 block mb-1">
                        Original Context
                        </span>
                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm opacity-80">
                        {result.content}
                        </p>
                    </div>
                    </div>
                 )}
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
