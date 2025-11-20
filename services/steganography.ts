
import { HiddenPayload, GeoLocationData } from "../types";

// --- Configuration ---
// Base4 Zero Width Character Mapping
// 00: Zero Width Space
// 01: Zero Width Non-Joiner
// 10: Zero Width Joiner
// 11: Word Joiner
const ZWC_MAP = ['\u200b', '\u200c', '\u200d', '\u2060']; 
const MARKER_START = '\uFEFF\u200B'; // BOM + ZWSP as header
const MARKER_END = '\u200B\uFEFF';

// --- Crypto Helper (SHA-256) ---
// Supports both Browser (subtle) and Node (crypto module)
export async function hashPassword(text: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(text);
  
  // Node.js environment check
  if (typeof window === 'undefined' && typeof global !== 'undefined') {
     try {
       // Use Node.js crypto module via dynamic import or global require if available
       // For Next.js API routes, this will run in Node
       const crypto = await import('crypto');
       const hash = crypto.createHash('sha256').update(text).digest('hex');
       return hash;
     } catch (e) {
       console.error("Node Crypto fail", e);
       return ""; // Fallback or error
     }
  }

  // Browser environment
  if (window.crypto && window.crypto.subtle) {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  return "";
}

// --- LZW Compression Algorithm ---

const lzwCompress = (uncompressed: string): number[] => {
  const dict: { [key: string]: number } = {};
  const data = (uncompressed + "").split("");
  const out: number[] = [];
  let phrase = data[0];
  let code = 256;
  
  for (let i = 1; i < data.length; i++) {
    const currChar = data[i];
    if (dict[phrase + currChar] != null) {
      phrase += currChar;
    } else {
      out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
      dict[phrase + currChar] = code;
      code++;
      phrase = currChar;
    }
  }
  out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
  return out;
};

const lzwDecompress = (compressed: number[]): string => {
  const dict: { [key: number]: string } = {};
  let currChar = String.fromCharCode(compressed[0]);
  let oldPhrase = currChar;
  const out = [currChar];
  let code = 256;
  let phrase;
  
  for (let i = 1; i < compressed.length; i++) {
    const currCode = compressed[i];
    if (currCode < 256) {
      phrase = String.fromCharCode(compressed[i]);
    } else {
      phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
    }
    out.push(phrase);
    currChar = phrase.charAt(0);
    dict[code] = oldPhrase + currChar;
    code++;
    oldPhrase = phrase;
  }
  return out.join("");
};

// --- Base4 Encoding Logic ---

const numberToZWC = (num: number): string => {
  // Convert number to 16-bit binary string, then map pairs of bits to ZWC
  const binary = num.toString(2).padStart(16, '0'); 
  let zwcStr = '';
  for (let i = 0; i < 16; i += 2) {
    const chunk = binary.substr(i, 2);
    const index = parseInt(chunk, 2);
    zwcStr += ZWC_MAP[index];
  }
  return zwcStr;
};

const zwcToNumber = (zwcChunk: string): number => {
  let binary = '';
  for (const char of zwcChunk) {
    const index = ZWC_MAP.indexOf(char);
    if (index !== -1) {
      binary += index.toString(2).padStart(2, '0');
    }
  }
  return parseInt(binary, 2);
};

/**
 * Encodes a JSON payload using LZW compression and Base4 Hidden Spectrum characters.
 * Uses URI encoding to support Unicode inputs safely within LZW 8-bit dictionary assumptions.
 */
export const encodePayload = (visibleText: string, payload: HiddenPayload): string => {
  try {
    // URI encode to ensure input to LZW is pure ASCII
    const jsonStr = encodeURIComponent(JSON.stringify(payload));
    // 1. Compress
    const compressedData = lzwCompress(jsonStr);
    
    // 2. Encode to ZWC
    const encodedStr = compressedData.map(numberToZWC).join('');
    
    return visibleText + MARKER_START + encodedStr + MARKER_END;
  } catch (e) {
    console.error("Encoding failed", e);
    return visibleText;
  }
};

/**
 * Attempts to find and decode invisible payload from text.
 */
export const decodePayload = (text: string): HiddenPayload | null => {
  const startIndex = text.indexOf(MARKER_START);
  const endIndex = text.lastIndexOf(MARKER_END);

  if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
    return null;
  }

  const rawEncoded = text.slice(startIndex + MARKER_START.length, endIndex);
  
  // Chunk into groups of 8 ZWC chars (16 bits / 2 bits per char = 8 chars)
  const chunks = rawEncoded.match(/.{1,8}/g) || [];
  if (chunks.length === 0) return null;

  const compressedData = chunks.map(zwcToNumber);

  try {
    const jsonStrEncoded = lzwDecompress(compressedData);
    const jsonStr = decodeURIComponent(jsonStrEncoded);
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Decoding parsing failed", e);
    return null;
  }
};

// --- Constraint Validation Helpers ---

const DEG_TO_RAD = Math.PI / 180;
const EARTH_RADIUS_KM = 6371;

const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const dLat = (lat2 - lat1) * DEG_TO_RAD;
  const dLon = (lon2 - lon1) * DEG_TO_RAD;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * DEG_TO_RAD) * Math.cos(lat2 * DEG_TO_RAD) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
};

export const checkConstraints = (
  payload: HiddenPayload,
  currentGeo: GeoLocationData | null,
  currentTime: Date
): { success: boolean; reason?: string } => {
  
  // 1. Check Time
  if (payload.t) {
    const lockTime = new Date(payload.t);
    // Calculate difference in hours
    const diffHours = Math.abs(currentTime.getTime() - lockTime.getTime()) / (1000 * 60 * 60);
    
    // Strictness: Must be within 1 hour of the timestamp (simulating "Specified Time")
    if (diffHours > 1) {
       return { 
         success: false, 
         reason: `TEMPORAL LOCK ACTIVE. Access denied. Timeline deviation: ${diffHours.toFixed(2)}h.` 
       };
    }
  }

  // 2. Check Location
  if (payload.g) {
    if (!currentGeo) {
      return { success: false, reason: "GEOLOCATION SIGNAL LOST. SPATIAL LOCK ENGAGED." };
    }
    const dist = getDistanceKm(payload.g.lat, payload.g.lng, currentGeo.latitude, currentGeo.longitude);
    // Strictness: 5km radius
    if (dist > 5) {
      return { 
        success: false, 
        reason: `SPATIAL LOCK ACTIVE. Access denied. Delta: ${dist.toFixed(2)}km.` 
      };
    }
  }

  return { success: true };
};
