
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

           <RetroCard title="API Reference">
               <div className="space-y-6 font-mono text-xs">
                   {/* Encode Section */}
                   <div className="relative group">
                       <div className="flex items-center justify-between mb-2">
                           <span className="bg-teal-900 text-teal-300 px-2 py-1 rounded">POST /api/encode</span>
                           <button 
                             onClick={() => handleCopyCurl('/api/encode', encodeBody)}
                             className="text-[10px] uppercase bg-slate-800 hover:bg-teal-900 border border-slate-700 hover:border-teal-500 text-slate-300 px-2 py-1 transition-colors"
                           >
                             {copied === '/api/encode' ? 'COPIED!' : 'COPY CURL'}
                           </button>
                       </div>
                       <p className="text-slate-500 mb-2">Encrypts visible text with a hidden payload.</p>
                       <pre className="bg-black p-3 border border-slate-800 text-slate-300 overflow-x-auto rounded custom-scrollbar">
{JSON.stringify(encodeBody, null, 2)}
                       </pre>
                   </div>

                   {/* Decode Section */}
                   <div className="relative group">
                       <div className="flex items-center justify-between mb-2">
                           <span className="bg-blue-900 text-blue-300 px-2 py-1 rounded">POST /api/decode</span>
                           <button 
                             onClick={() => handleCopyCurl('/api/decode', decodeBody)}
                             className="text-[10px] uppercase bg-slate-800 hover:bg-blue-900 border border-slate-700 hover:border-blue-500 text-slate-300 px-2 py-1 transition-colors"
                           >
                              {copied === '/api/decode' ? 'COPIED!' : 'COPY CURL'}
                           </button>
                       </div>
                       <p className="text-slate-500 mb-2">Decrypts and validates claim codes.</p>
                       <pre className="bg-black p-3 border border-slate-800 text-slate-300 overflow-x-auto rounded custom-scrollbar">
{JSON.stringify(decodeBody, null, 2)}
                       </pre>
                   </div>
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
