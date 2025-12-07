import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff, CheckCircle } from 'lucide-react';

interface QRScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
  showValidateButton?: boolean;
}

export interface QRScannerRef {
  getScannedCode: () => string | null;
  clearScannedCode: () => void;
}

export const QRScanner = forwardRef<QRScannerRef, QRScannerProps>(
  ({ onScan, onError, showValidateButton = false }, ref) => {
    const [isScanning, setIsScanning] = useState(false);
    const [hasCamera, setHasCamera] = useState(true);
    const [scannedCode, setScannedCode] = useState<string | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      getScannedCode: () => scannedCode,
      clearScannedCode: () => setScannedCode(null),
    }));

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
            if (showValidateButton) {
              // Store the code and wait for user to click validate
              setScannedCode(decodedText);
            } else {
              // Auto-validate mode
              onScan(decodedText);
              stopScanning();
            }
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

    const handleValidate = () => {
      if (scannedCode) {
        onScan(scannedCode);
        setScannedCode(null);
        stopScanning();
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

        {scannedCode && showValidateButton && (
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm text-center mb-3 text-muted-foreground">QR Code Detected!</p>
            <p className="text-xs font-mono text-center mb-3 truncate">{scannedCode}</p>
            <Button 
              onClick={handleValidate}
              className="w-full"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Validate Ticket
            </Button>
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
  }
);

QRScanner.displayName = 'QRScanner';
