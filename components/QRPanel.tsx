
import React, { useState, useEffect } from 'react';
import { RetroCard } from './RetroComponents';

export const QRPanel: React.FC = () => {
  const [host, setHost] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHost(window.location.origin);
    }
  }, []);

  const handleCopyCurl = (endpoint: string, body: object) => {
    const url = `${host}${endpoint}`;
    const cmd = `curl -X POST '${url}' \\
  -H 'Content-Type: application/json' \\
  -d '${JSON.stringify(body, null, 2)}'`;
    
    navigator.clipboard.writeText(cmd);
    setCopied(endpoint);
    setTimeout(() => setCopied(null), 2000);
  };

  const encodeBody = {
    visibleText: "Hello World",
    payload: {
      o: "Secret Content",
      access_codes: ["CODE123"],
      prompt: {
        type: "text",
        content: "You won!"
      }
    }
  };

  const decodeBody = {
    text: "Hello World...",
    claimCode: "CODE123"
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
       
       <div className="grid md:grid-cols-2 gap-8">
           <RetroCard title="About PromptCloak">
               <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                   <p className="mb-4">
                       <strong>PromptCloak</strong> is a steganographic tool designed for AI prompts and invite codes. 
                       It embeds hidden payloads (rewards, activation codes, or secret prompts) into visible text.
                   </p>
                   <ul className="list-disc pl-5 space-y-2 text-slate-400">
                       <li><strong>Digital Shadow Architecture:</strong> We utilize the hidden spectrum to construct an invisible data layer that exists parallel to your visible text, like a digital shadow.</li>
                       <li><strong>Access Control:</strong> Secure content with multiple claim codes.</li>
                       <li><strong>Rewards:</strong> Embed text or pixel-art images (up to ~50KB) as unlockable rewards.</li>
                       {/* <li><strong>Environmental Locks:</strong> (Experimental) Lock content to specific GPS coordinates or timestamps.</li> */}
                   </ul>
               </div>
           </RetroCard>

           <RetroCard title="System Architecture">
               <div className="space-y-4 text-slate-400 text-sm">
                   <p>
                       PromptCloak operates as a decentralized, stateless protocol. 
                       Information is not stored on our servers; it is encrypted and embedded directly into the transport medium (text).
                   </p>
                   
                   <div className="p-4 border border-teal-900 bg-teal-900/10 rounded text-teal-200 text-xs font-mono">
                       <p className="mb-2 font-bold">PROTOCOL FLOW:</p>
                       <ol className="list-decimal pl-4 space-y-1">
                           <li>Input Source & Reward</li>
                           <li>Apply Access Control (Hashing)</li>
                           <li>Compress & Encode to Hidden Spectrum</li>
                           <li>Inject into Visible Text Carrier</li>
                           <li>Share via Public Channels</li>
                       </ol>
                   </div>

                   <p className="text-xs italic opacity-60">
                       * API Reference is currently restricted to authorized integrators. Use the web interface for standard operations.
                   </p>
               </div>
           </RetroCard>
       </div>

       <div className="text-center border-t border-slate-800 pt-8">
           <p className="text-slate-600 text-sm uppercase tracking-widest">
               Documentation v1.0 // System Online
           </p>
       </div>
    </div>
  );
};
