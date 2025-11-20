
import { NextResponse } from 'next/server';
import { decodePayload, hashPassword } from '../../../services/steganography';
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
        const claimCode: string | undefined = body?.claimCode; // New input for unlocking

		if (typeof text !== 'string') {
			return NextResponse.json(
				{ error: 'Invalid request body. Expected { text: string, claimCode?: string }' },
				{ status: 400, headers: corsHeaders }
			);
		}

		// Support clients who send escaped hidden spectrum sequences (e.g. "\\u200b")
		const unescapeZwc = (s: string) =>
			s
				.replace(/\\u200b/gi, '\u200b')
				.replace(/\\u200c/gi, '\u200c')
				.replace(/\\u200d/gi, '\u200d')
				.replace(/\\u2060/gi, '\u2060')
				.replace(/\\uFEFF/gi, '\uFEFF');

		const normalized = unescapeZwc(text);
		const rawPayload: HiddenPayload | null = decodePayload(normalized);

        if (!rawPayload) {
            return NextResponse.json({ payload: null }, { headers: corsHeaders });
        }

        // --- Security Logic ---
        // Check if the payload is locked with hashes
        if (rawPayload.access_hashes && Array.isArray(rawPayload.access_hashes) && rawPayload.access_hashes.length > 0) {
            // If user didn't provide a code, return locked state
            if (!claimCode) {
                return NextResponse.json({ 
                    payload: {
                        locked: true,
                        requiresAuth: true,
                        message: "Content locked. Please provide a valid claimCode.",
                        // Do NOT return 'o' (original text) here
                        g: rawPayload.g, // Geo constraints might be public? Or hide them too. Let's share them so client knows if they are blocked by location first.
                        t: rawPayload.t
                    } 
                }, { headers: corsHeaders });
            }

            // Validate Code
            const inputHash = await hashPassword(claimCode);
            const isMatch = rawPayload.access_hashes.includes(inputHash);

            if (isMatch) {
                 return NextResponse.json({ 
                    payload: {
                        ...rawPayload,
                        locked: false,
                        // Return content
                    } 
                }, { headers: corsHeaders });
            } else {
                 return NextResponse.json({ 
                    error: "Invalid Claim Code",
                    locked: true 
                }, { status: 403, headers: corsHeaders });
            }
        } 
        
        // Legacy Support: Check 'p' if it exists
        if (rawPayload.p) {
             if (claimCode && claimCode !== rawPayload.p) {
                 return NextResponse.json({ error: "Invalid Password" }, { status: 403, headers: corsHeaders });
             }
             // Note: If p exists but no claimCode, we currently return it (backward compat behavior from original DecryptPanel).
             // If you want to lock 'p' strictly, add logic here. 
             // For now, we assume 'access_hashes' is the new secure way.
        }

		return NextResponse.json({ payload: rawPayload }, { headers: corsHeaders });
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500, headers: corsHeaders });
	}
}
