// QR Code utilities for secure ticket generation and validation

const SECRET_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? 'fallback-secret';

// Generate a secure hash for QR code validation
export function generateSecureHash(ticketId: string, eventId: string, userId: string): string {
  const data = `${ticketId}:${eventId}:${userId}:${SECRET_KEY}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// Generate QR code data with embedded verification info
export function generateQRCodeData(params: {
  ticketId: string;
  ticketNumber: string;
  eventId: string;
  userId: string;
}): string {
  const { ticketId, ticketNumber, eventId, userId } = params;
  const hash = generateSecureHash(ticketId, eventId, userId);
  const timestamp = Date.now().toString(36);
  
  // Format: SDTS|ticketId|ticketNumber|eventId|hash|timestamp
  // SDTS = Smart Digital Ticketing System prefix for identification
  return `SDTS|${ticketId}|${ticketNumber}|${eventId}|${hash}|${timestamp}`;
}

// Parse and validate QR code data
export function parseQRCodeData(qrData: string): {
  isValid: boolean;
  ticketId?: string;
  ticketNumber?: string;
  eventId?: string;
  hash?: string;
  timestamp?: string;
} {
  try {
    // Check for SDTS format
    if (qrData.startsWith('SDTS|')) {
      const parts = qrData.split('|');
      if (parts.length >= 5) {
        return {
          isValid: true,
          ticketId: parts[1],
          ticketNumber: parts[2],
          eventId: parts[3],
          hash: parts[4],
          timestamp: parts[5]
        };
      }
    }
    
    // Legacy format support (eventId-ticketNumber-userId)
    const legacyParts = qrData.split('-');
    if (legacyParts.length >= 3) {
      return {
        isValid: true,
        eventId: legacyParts[0],
        ticketNumber: legacyParts.slice(1, -1).join('-'),
      };
    }
    
    return { isValid: false };
  } catch {
    return { isValid: false };
  }
}

// Verify QR code hash matches expected value
export function verifyQRCodeHash(
  ticketId: string,
  eventId: string,
  userId: string,
  providedHash: string
): boolean {
  const expectedHash = generateSecureHash(ticketId, eventId, userId);
  return expectedHash === providedHash;
}
