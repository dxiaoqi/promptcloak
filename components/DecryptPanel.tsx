
import React, { useState, useEffect } from 'react';
import { RetroButton, RetroCard, RetroTextArea, RetroInput } from './RetroComponents';
import { decodePayload, checkConstraints, hashPassword } from '../services/steganography';
import { LoadingState } from '../types';

interface DecryptPanelProps {
    variant?: 'default' | 'claim';
}

export const DecryptPanel: React.FC<DecryptPanelProps> = ({ variant = 'default' }) => {
  const [cipherText, setCipherText] = useState('');
  const [claimCode, setClaimCode] = useState('');
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [result, setResult] = useState<{ success: boolean; content: string; secret?: string | null; reason?: string; locked?: boolean; prompt?: { type: 'text' | 'image', content: string } } | null>(null);
  const [log, setLog] = useState<string[]>([]);
  
  // Modal States
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);

  const addLog = (msg: string) => setLog(prev => [...prev, `> ${msg}`]);

  useEffect(() => {
      if (result?.locked) {
          if (variant === 'claim') {
              setShowPasswordModal(true);
          }
      } else if (result?.success) {
          setShowPasswordModal(false);
          if (variant === 'claim' && result.prompt) {
              setShowRewardModal(true);
          }
      }
  }, [result, variant]);

  const handleDecrypt = async () => {
    if (!cipherText) return;
    setStatus(LoadingState.PROCESSING);
    setLog([]);
    setResult(null);
    setClaimCode('');
    setShowRewardModal(false);
    
    try {
      addLog("Initializing Decryptor Core...");
      addLog("Analyzing Hidden Spectrum...");
      
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

      if (hiddenPayload.access_hashes && hiddenPayload.access_hashes.length > 0) {
         addLog("SECURE CHANNEL DETECTED. Identity verification required.");
         setResult({
             success: false,
             content: hiddenPayload.o,
             locked: true,
             reason: "Access Restricted"
         });
         setStatus(LoadingState.SUCCESS);
         return;
      }

      // ... (Env check logic)
      const validation = checkConstraints(hiddenPayload, null, new Date()); // simplified env check for initial decode
      
      if (validation.success) {
        addLog("ACCESS GRANTED: Protocol Verified.");
        setResult({
          success: true,
          content: hiddenPayload.o, 
          secret: hiddenPayload.p,
          prompt: hiddenPayload.prompt
        });
      } else {
        // ...
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
           // Re-check Geo/Time
           // ...
           setResult({
               success: true,
               content: payload.o,
               locked: false,
               prompt: payload.prompt,
               secret: payload.p
           });
           setShowPasswordModal(false);
      } else {
          addLog("ACCESS DENIED: Invalid Claim Code.");
          alert("Invalid Code");
      }
      setStatus(LoadingState.SUCCESS);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* REWARD POPUP MODAL (Only for 'claim' variant) */}
      {showRewardModal && variant === 'claim' && result?.prompt && (
          <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in duration-300">
              <div className="max-w-2xl w-full bg-slate-900 border-2 border-teal-500 p-8 shadow-[0_0_100px_rgba(20,184,166,0.3)] relative">
                  <button 
                      onClick={() => setShowRewardModal(false)}
                      className="absolute top-4 right-4 text-slate-500 hover:text-white"
                  >
                      ✕ CLOSE
                  </button>
                  
                  <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400 mb-2">
                          CONGRATULATIONS!
                      </h2>
                      <p className="text-slate-400 uppercase tracking-widest text-sm">
                          You have successfully unlocked the hidden layer
                      </p>
                  </div>

                  {result.prompt.type === 'image' ? (
                      <div className="flex justify-center mb-8">
                          <img 
                            src={result.prompt.content} 
                            alt="Reward" 
                            className="max-h-[60vh] border-4 border-slate-800 shadow-2xl"
                          />
                      </div>
                  ) : (
                      <div className="bg-teal-900/20 border border-teal-500/30 p-6 rounded mb-8 max-h-[60vh] overflow-y-auto">
                          <pre className="whitespace-pre-wrap font-mono text-teal-100 text-lg">
                              {result.prompt.content}
                          </pre>
                      </div>
                  )}

                  <div className="flex justify-center">
                      <RetroButton onClick={() => setShowRewardModal(false)} className="w-auto px-8">
                          CLAIM REWARD
                      </RetroButton>
                  </div>
              </div>
          </div>
      )}

      {/* PASSWORD MODAL (Only for 'claim' variant, or if locked) */}
      {(showPasswordModal || (result?.locked && variant === 'default')) && (
          <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-slate-900 border-2 border-teal-900 p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] transform transition-all animate-in zoom-in-95 duration-200">
                  <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-slate-800 rounded-full mx-auto flex items-center justify-center border border-slate-600 mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                      </div>
                      <h3 className="text-xl font-bold text-teal-400 tracking-widest">SECURE CHANNEL LOCKED</h3>
                      <p className="text-xs text-slate-500 mt-2">Identity verification required to access the hidden layer.</p>
                  </div>

                  <div className="space-y-4">
                      <div>
                          <label className="text-[10px] uppercase text-slate-400 mb-1 block">Claim Code / Password</label>
                          <RetroInput 
                              type="password"
                              value={claimCode}
                              onChange={e => setClaimCode(e.target.value)}
                              placeholder="ENTER CODE..."
                              className="text-center text-lg tracking-widest"
                          />
                      </div>
                      <RetroButton 
                          onClick={handleUnlock} 
                          disabled={!claimCode || status === LoadingState.PROCESSING} 
                          className="w-full py-3 text-lg"
                      >
                          {status === LoadingState.PROCESSING ? 'VERIFYING...' : 'UNLOCK ARTIFACT'}
                      </RetroButton>
                  </div>
              </div>
          </div>
      )}

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
                 {!result.locked ? (
                    <div className={`p-4 border-l-4 ${result.success ? 'border-teal-500 bg-teal-900/20' : 'border-red-500 bg-red-900/10'}`}>
                    <h3 className={`font-bold text-lg mb-2 ${result.success ? 'text-teal-400' : 'text-red-400'}`}>
                        {result.success ? 'DECRYPTION SUCCESSFUL' : 'ACCESS RESTRICTED'}
                    </h3>
                    
                    {/* INLINE PROMPT DISPLAY (Only for default variant) */}
                    {variant === 'default' && result.success && result.prompt && (
                        <div className="mb-6 p-4 border-2 border-teal-500/50 bg-black relative overflow-hidden group animate-in zoom-in duration-300">
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
                 ) : (
                     <div className="h-full flex items-center justify-center text-slate-700 flex-col blur-sm">
                        <p className="mb-2 opacity-50">SECURE CONTENT HIDDEN</p>
                        <div className="w-full h-px bg-slate-800 w-1/2"></div>
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
