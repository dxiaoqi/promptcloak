<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# PromptCloak

Zero-width steganography for prompts & invite codes. Encode secrets into visible text with optional time/geo locks, and expose open APIs for encode/decode.

This contains everything you need to run the app locally (Next.js).

View your app in AI Studio: https://ai.studio/apps/drive/1CD1FWoM21oQqyZIU-thkqEtdVHOZr5tI

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Public APIs

- POST `/api/encode`  
  Body: `{ "visibleText": string, "payload": { "o": string, "p": string, "g"?: { "lat": number, "lng": number }, "t"?: number } }`  
  Query options: `format=plain` (return text/plain), `escape=true` (also return escaped).

- POST `/api/decode`  
  Body: `{ "text": string }`  
  Accepts escaped zero-width sequences and normalizes automatically.
