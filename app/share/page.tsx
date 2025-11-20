
'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { RetroCard, RetroButton } from '../../components/RetroComponents';

function ShareContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
        const id = searchParams.get('id');
        const rawData = searchParams.get('data');

        if (rawData) {
            setData(rawData);
            setLoading(false);
            return;
        }

        if (id) {
            try {
                const res = await fetch(`/api/storage?id=${id}`);
                if (!res.ok) throw new Error("Artifact not found or expired");
                const json = await res.json();
                setData(json.content);
            } catch (e: any) {
                setError(e.message || "Retrieval Failed");
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
            setError("No artifact ID provided");
        }
    };

    fetchData();
  }, [searchParams]);

  const handleCopy = () => {
    navigator.clipboard.writeText(data);
    alert("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 p-4 flex items-center justify-center scanlines">
      <div className="max-w-2xl w-full space-y-8">
         <header className="text-center space-y-2">
             <h1 className="text-3xl md:text-4xl font-bold text-teal-500 tracking-tighter">PROMPTCLOAK</h1>
             <p className="text-slate-500 text-sm uppercase tracking-widest">Secure Transmission Received</p>
         </header>

         <RetroCard title="Incoming Shadow Artifact">
            <div className="space-y-6 text-center">
                {loading ? (
                    <div className="py-12 animate-pulse text-teal-500">
                        RECEIVING TRANSMISSION...
                    </div>
                ) : error ? (
                    <div className="py-12 text-red-500 border border-red-900 bg-red-900/10">
                        <p className="font-bold">SIGNAL LOST</p>
                        <p className="text-xs mt-2">{error}</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-teal-900/20 border border-teal-500/30 p-4 rounded">
                            <h2 className="text-xl text-teal-300 font-bold mb-2">🎉 恭喜你获得影子Prompt</h2>
                            <p className="text-sm text-slate-400">
                                You have received a secured artifact. Copy the data below and visit the decoder to claim your reward.
                            </p>
                        </div>

                        <div className="relative">
                            <textarea 
                                readOnly
                                value={data}
                                className="w-full h-48 bg-black border-2 border-slate-800 p-4 text-slate-400 font-mono text-xs resize-none focus:outline-none focus:border-teal-500"
                            />
                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row justify-center">
                            <RetroButton onClick={handleCopy} className="px-8">
                                COPY DATA
                            </RetroButton>
                            <a href="/claim" className="block">
                                <RetroButton variant="secondary" className="px-8 w-full sm:w-auto">
                                    GO TO DECODER
                                </RetroButton>
                            </a>
                        </div>
                    </>
                )}
            </div>
         </RetroCard>
      </div>
    </div>
  );
}

export default function SharePage() {
    return (
        <Suspense fallback={<div className="text-center text-teal-500 mt-20">Loading Signal...</div>}>
            <ShareContent />
        </Suspense>
    );
}
