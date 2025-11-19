import { NextResponse } from 'next/server';
import { decodePayload } from '../../../services/steganography';
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
		const body = await req.json();
		let text: string = body?.text;

		if (typeof text !== 'string') {
			return NextResponse.json(
				{ error: 'Invalid request body. Expected { text: string }' },
				{ status: 400, headers: corsHeaders }
			);
		}

		// Support clients who send escaped zero-width sequences (e.g. "\\u200b")
		const unescapeZwc = (s: string) =>
			s
				.replace(/\\u200b/gi, '\u200b')
				.replace(/\\u200c/gi, '\u200c')
				.replace(/\\u200d/gi, '\u200d')
				.replace(/\\u2060/gi, '\u2060')
				.replace(/\\uFEFF/gi, '\uFEFF');

		const normalized = unescapeZwc(text);
		const payload: HiddenPayload | null = decodePayload(normalized);
		return NextResponse.json({ payload }, { headers: corsHeaders });
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500, headers: corsHeaders });
	}
}


