
'use client';

import React from 'react';
import { DecryptPanel } from '../../components/DecryptPanel';

export default function ClaimPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 p-4 flex items-center justify-center scanlines">
      <div className="max-w-4xl w-full space-y-8">
         <header className="text-center space-y-2 mb-8">
             <h1 className="text-3xl md:text-4xl font-bold text-teal-500 tracking-tighter">PROMPTCLOAK DECODER</h1>
             <div className="h-px w-24 bg-teal-800 mx-auto"></div>
             <p className="text-slate-500 text-sm uppercase tracking-widest">Artifact Extraction Protocol</p>
         </header>

         <DecryptPanel variant="claim" />
         
         <div className="text-center mt-8">
             <a href="/" className="text-xs text-slate-600 hover:text-teal-500 uppercase tracking-widest transition-colors">
                 ← Return to Main System
             </a>
         </div>
      </div>
    </div>
  );
}
