import { NextResponse } from 'next/server';
import { encodePayload } from '../../../services/steganography';
import { HiddenPayload } from '../../../types';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
	return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const format = (searchParams.get('format') || 'json').toLowerCase(); // 'json' | 'plain'
		const escape = (searchParams.get('escape') || 'false').toLowerCase() === 'true'; // return escaped zwc too

		const body = await req.json();
		const visibleText: string = body?.visibleText;
		const payload: HiddenPayload = body?.payload;

		if (typeof visibleText !== 'string' || !payload || typeof payload.o !== 'string' || typeof payload.p !== 'string') {
			return NextResponse.json(
				{ error: 'Invalid request body. Expected { visibleText: string, payload: HiddenPayload }' },
				{ status: 400, headers: corsHeaders }
			);
		}

		const cipherText = encodePayload(visibleText, payload);

		// Optionally return plain text (safer for copy/paste without JSON viewers altering content)
		if (format === 'plain') {
			return new NextResponse(cipherText, {
				headers: {
					...corsHeaders,
					'Content-Type': 'text/plain; charset=utf-8',
					'X-Content-Type-Options': 'nosniff',
				},
			});
		}

		// Optionally include an escaped representation for transports that cannot carry invisible chars
		const escapeZwc = (s: string) =>
			s
				.replace(/\u200b/g, '\\u200b')
				.replace(/\u200c/g, '\\u200c')
				.replace(/\u200d/g, '\\u200d')
				.replace(/\u2060/g, '\\u2060')
				.replace(/\uFEFF/g, '\\uFEFF');

		const json = escape ? { cipherText, cipherTextEscaped: escapeZwc(cipherText) } : { cipherText };
		return NextResponse.json(json, { headers: corsHeaders });
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500, headers: corsHeaders });
	}
}


