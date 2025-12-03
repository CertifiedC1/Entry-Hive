import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff } from 'lucide-react';

interface QRScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
}

export const QRScanner = ({ onScan, onError }: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startScanning = async () => {
    try {
      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScan(decodedText);
          stopScanning();
        },
        (errorMessage) => {
          // Ignore scanning errors as they happen continuously
        }
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error('Error starting scanner:', err);
      setHasCamera(false);
      onError?.(err.message || 'Failed to access camera');
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="space-y-4">
      <div 
        id="qr-reader" 
        ref={containerRef}
        className={`w-full rounded-lg overflow-hidden bg-muted ${isScanning ? 'min-h-[300px]' : 'h-0'}`}
      />
      
      {!hasCamera && (
        <div className="text-center p-4 bg-destructive/10 rounded-lg border border-destructive/20">
          <CameraOff className="h-8 w-8 mx-auto mb-2 text-destructive" />
          <p className="text-sm text-destructive">
            Camera access denied or not available. Please allow camera access or enter the QR code manually.
          </p>
        </div>
      )}

      {hasCamera && (
        <Button
          type="button"
          variant={isScanning ? 'destructive' : 'default'}
          onClick={isScanning ? stopScanning : startScanning}
          className="w-full"
        >
          {isScanning ? (
            <>
              <CameraOff className="mr-2 h-4 w-4" />
              Stop Camera
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              Scan with Camera
            </>
          )}
        </Button>
      )}
    </div>
  );
};
