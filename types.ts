
export enum AppMode {
  ENCRYPT = 'ENCRYPT',
  DECRYPT = 'DECRYPT',
  QR_TOOLS = 'QR_TOOLS'
}

export interface GeoLocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface HiddenPayload {
  o: string; // Original Text
  p: string; // Password
  g?: { lat: number; lng: number }; // Geo Constraints
  t?: number; // Time Constraint (Timestamp)
}

export interface EncryptionResult {
  cipherText: string;
  generatedAt: string;
  hasGeoLock: boolean;
  hasTimeLock: boolean;
}

export interface DecryptionResult {
  success: boolean;
  originalText: string;
  secret?: string;
  message: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
