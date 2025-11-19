import React from 'react';
import Script from 'next/script';

export const metadata = {
	title: 'PromptCloak',
	description: 'Zero-width steganography for prompts & invite codes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>
				{/* Inline global styles (ported from index.html) */}
				<style>{`
          ::-webkit-scrollbar { width: 12px; background: #000; }
          ::-webkit-scrollbar-thumb { background: #334155; border: 2px solid #000; }
          ::-webkit-scrollbar-thumb:hover { background: #475569; }
          .scanlines::before {
            content: " ";
            display: block;
            position: absolute;
            top: 0; left: 0; bottom: 0; right: 0;
            background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), 
                        linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
            z-index: 50;
            background-size: 100% 2px, 3px 100%;
            pointer-events: none;
          }
          body { font-family: 'VT323', monospace; background-color: #050505; color: #e2e8f0; }
        `}</style>
				{children}
				{/* Tailwind via CDN to match original setup */}
				<Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
			</body>
		</html>
	);
}


