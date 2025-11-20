
import { NextResponse } from 'next/server';
import { encodePayload, hashPassword } from '../../../services/steganography';
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
		const payloadInput = body?.payload;

		if (typeof visibleText !== 'string' || !payloadInput || typeof payloadInput.o !== 'string') {
			return NextResponse.json(
				{ error: 'Invalid request body. Expected { visibleText: string, payload: { o: string, p?: string, access_codes?: string[] } }' },
				{ status: 400, headers: corsHeaders }
			);
		}

        // Transform access_codes to hashes if provided
        let access_hashes: string[] | undefined = undefined;
        if (Array.isArray(body.payload.access_codes)) {
             access_hashes = await Promise.all(body.payload.access_codes.map((c: string) => hashPassword(c)));
        } else if (body.payload.p) {
            // Legacy support: if 'p' is sent but no access_codes, keep 'p' or convert to hash?
            // For API consistency, let's create a hash for 'p' as well if we want to move to the new system.
            // But to be safe, let's just keep 'p' if access_codes is missing, OR convert it.
            // Let's convert it to unify logic.
            const h = await hashPassword(body.payload.p);
            access_hashes = [h];
        }

        const payload: HiddenPayload = {
            o: payloadInput.o,
            // Remove raw password 'p' from final payload if we have hashes
            access_hashes, 
            g: payloadInput.g,
            t: payloadInput.t
        };

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
