import { useState, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export interface UseBarcodeScannerOptions {
    onScan: (value: string) => void;
    onError?: (error: string) => void;
}

export function useBarcodeScanner({ onScan, onError }: UseBarcodeScannerOptions) {
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const scannerIdRef = useRef<string | null>(null);

    const startScanning = useCallback(async (scannerId: string) => {
        if (isScanning) {
            return;
        }

        try {
            setError(null);
            setIsScanning(true);

            const scanner = new Html5Qrcode(scannerId);
            scannerRef.current = scanner;
            scannerIdRef.current = scannerId;

            // Start scanning with camera
            await scanner.start(
                { facingMode: 'environment' }, // Use back camera on mobile, default on desktop
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                },
                (decodedText) => {
                    // Success callback
                    onScan(decodedText);
                    stopScanning();
                },
                (errorMessage) => {
                    // Error callback - ignore if it's just "NotFoundException" (no QR code in view)
                    if (errorMessage !== 'NotFoundException') {
                        // Only show non-critical errors
                    }
                }
            );
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to start camera';
            setError(errorMessage);
            setIsScanning(false);
            if (onError) {
                onError(errorMessage);
            }
        }
    }, [isScanning, onScan, onError]);

    const stopScanning = useCallback(async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
                await scannerRef.current.clear();
            } catch (err) {
                console.error('Error stopping scanner:', err);
            }
            scannerRef.current = null;
            scannerIdRef.current = null;
        }
        setIsScanning(false);
        setError(null);
    }, []);

    return {
        isScanning,
        error,
        startScanning,
        stopScanning,
    };
}
