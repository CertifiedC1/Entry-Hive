// Client-side QR code parsing utilities

export interface ParsedQRData {
  isValid: boolean;
  format: 'sdts' | 'legacy' | 'unknown';
  ticketId?: string;
  ticketNumber?: string;
  eventId?: string;
  hash?: string;
  timestamp?: string;
  rawData: string;
}

/**
 * Parse QR code data from various formats
 * Supports both new SDTS format and legacy formats
 */
export function parseQRCode(qrData: string): ParsedQRData {
  const trimmedData = qrData.trim();
  
  // Check for SDTS format: SDTS|ticketId|ticketNumber|eventId|hash|timestamp
  if (trimmedData.startsWith('SDTS|')) {
    const parts = trimmedData.split('|');
    if (parts.length >= 5) {
      return {
        isValid: true,
        format: 'sdts',
        ticketId: parts[1],
        ticketNumber: parts[2],
        eventId: parts[3],
        hash: parts[4],
        timestamp: parts[5],
        rawData: trimmedData
      };
    }
  }
  
  // Legacy format: eventId-TKT-timestamp-random-userId
  if (trimmedData.includes('-TKT-')) {
    const parts = trimmedData.split('-');
    if (parts.length >= 3) {
      // Find TKT position and extract ticket number
      const tktIndex = parts.indexOf('TKT');
      if (tktIndex >= 0) {
        const eventId = parts.slice(0, tktIndex).join('-');
        const ticketNumber = `TKT-${parts.slice(tktIndex + 1, -1).join('-')}`;
        return {
          isValid: true,
          format: 'legacy',
          eventId,
          ticketNumber,
          rawData: trimmedData
        };
      }
    }
  }
  
  // Simple format: could be just ticket number or raw qr_code
  return {
    isValid: true,
    format: 'unknown',
    rawData: trimmedData
  };
}

/**
 * Extract searchable identifiers from parsed QR data
 */
export function getSearchIdentifiers(parsed: ParsedQRData): {
  ticketId?: string;
  ticketNumber?: string;
  qrCode: string;
} {
  return {
    ticketId: parsed.ticketId,
    ticketNumber: parsed.ticketNumber,
    qrCode: parsed.rawData
  };
}
