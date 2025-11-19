'use client';

import React, { useState } from 'react';
import { EncryptPanel } from '../components/EncryptPanel';
import { DecryptPanel } from '../components/DecryptPanel';
import { QRPanel } from '../components/QRPanel';
import { AppMode } from '../types';

export default function HomePage() {
	const [mode, setMode] = useState<AppMode>(AppMode.ENCRYPT);

	return (
		<div className="min-h-screen scanlines bg-[#050505] text-slate-200 p-4 md:p-8 overflow-x-hidden">
			<div className="max-w-6xl mx-auto">
				<header className="mb-12 text-center space-y-4">
					<h1
						className="text-5xl md:text-7xl font-bold tracking-tighter text-teal-500"
						style={{ textShadow: '4px 4px 0px rgba(20, 184, 166, 0.2)' }}
					>
						PROMPTCLOAK
					</h1>
					<div className="h-1 w-full bg-gradient-to-r from-transparent via-teal-800 to-transparent"></div>
					<p className="text-slate-500 uppercase tracking-[0.3em] text-sm md:text-base">
						Zero-width steganography for prompts & invite codes
					</p>
				</header>

				<nav className="flex flex-wrap justify-center gap-4 mb-12">
					<button
						onClick={() => setMode(AppMode.ENCRYPT)}
						className={`px-8 py-2 border-b-4 transition-all uppercase text-xl font-bold ${
							mode === AppMode.ENCRYPT
								? 'border-teal-500 text-teal-400 bg-teal-900/20'
								: 'border-slate-800 text-slate-600 hover:text-slate-400'
						}`}
					>
						[ Encrypt ]
					</button>
					<button
						onClick={() => setMode(AppMode.DECRYPT)}
						className={`px-8 py-2 border-b-4 transition-all uppercase text-xl font-bold ${
							mode === AppMode.DECRYPT
								? 'border-teal-500 text-teal-400 bg-teal-900/20'
								: 'border-slate-800 text-slate-600 hover:text-slate-400'
						}`}
					>
						[ Decrypt ]
					</button>
					<button
						onClick={() => setMode(AppMode.QR_TOOLS)}
						className={`px-8 py-2 border-b-4 transition-all uppercase text-xl font-bold ${
							mode === AppMode.QR_TOOLS
								? 'border-teal-500 text-teal-400 bg-teal-900/20'
								: 'border-slate-800 text-slate-600 hover:text-slate-400'
						}`}
					>
						[ QR Tools ]
					</button>
				</nav>

				<main className="relative min-h-[600px]">
					<div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
						<div className="absolute left-0 top-10 w-full h-px bg-teal-500"></div>
						<div className="absolute left-10 top-0 w-px h-full bg-teal-500"></div>
						<div className="absolute right-10 top-0 w-px h-full bg-teal-500"></div>
						<div className="absolute left-0 bottom-10 w-full h-px bg-teal-500"></div>
					</div>

					<div className="relative z-10 p-2 md:p-6">
						{mode === AppMode.ENCRYPT && <EncryptPanel />}
						{mode === AppMode.DECRYPT && <DecryptPanel />}
						{mode === AppMode.QR_TOOLS && <QRPanel />}
					</div>
				</main>

				<footer className="mt-16 text-center text-slate-700 text-xs uppercase tracking-widest">
					<p>System Ready // Connection Secure</p>
				</footer>
			</div>
		</div>
	);
}


