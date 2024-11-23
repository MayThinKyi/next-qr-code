'use client';
import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function QrScanner() {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<string | null>(null);

    const qrCodeRef = useRef<HTMLDivElement | null>(null);
    const [html5QrCode, setHtml5QrCode] = useState<Html5Qrcode | null>(null);
    const [scanning, setScanning] = useState<boolean>(false);

    const handleImageScan = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const html5QrCode = new Html5Qrcode("qr-reader");
        try {
            const decodedText = await html5QrCode.scanFile(file);
            setResult(decodedText);
            console.log('decodedText', decodedText)
            stopScanning();
        } catch (err) {
            setError(`Error scanning QR code from image: ${err}`);
        } finally {
            html5QrCode.clear();
        }
    };

    const startScanning = () => {
        if (!html5QrCode || !qrCodeRef.current) {
            setError("QR Code scanner initialization failed.");
            return;
        }
        const width = screen.width;
        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: width >= 600 ? 0.58 : 1.6,
        };

        html5QrCode
            .start(
                { facingMode: "environment" },
                config,
                (decodedText: string) => {
                    console.log(`QR Code scanned: ${decodedText}`);
                    //   if (onScanResult) onScanResult(decodedText);
                    stopScanning();
                },
                (errorMessage: string) => {
                    // console.log(`Error scanning: ${errorMessage}`);
                    setError(errorMessage);
                }
            )
            .then(() => {
                setError(null);

                setTimeout(() => {
                    setScanning(true);
                }, 1000);
            })
            .catch((err) => {
                setError(`Error starting QR code scanner: ${err}`);
            });
    };

    const stopScanning = () => {
        if (!html5QrCode) return;

        html5QrCode
            .stop()
            .then(() => {
                setScanning(false);
                setError(null);
            })
            .catch((err) => {
                setError(`Error stopping QR code scanner: ${err}`);
            });
    };

    const stopToScan = () => {
        stopScanning();
    };

    useEffect(() => {
        const qrCodeInstance = new Html5Qrcode("qr-reader");
        setHtml5QrCode(qrCodeInstance);

        return () => {
            stopScanning();
        };
    }, []);

    useEffect(() => {
        if (html5QrCode) {
            startScanning();
        }
    }, [html5QrCode]);

    return (
        <div className=" sm:max-w-lg mx-auto">
            <div className="relative">
                {scanning && (
                    <div className="absolute top-0 text-white bg-black/30 z-20 w-full h-[3rem] flex justify-between items-center text-texticon-font-gy1-90 px-2">
                        <ChevronLeft
                            className="text-white cursor-pointer"
                            onClick={stopToScan}
                        />

                        <p className="font-normal text-base">Scan QR code</p>

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-sm font-normal"
                        >
                            Album
                        </button>
                    </div>
                )}
                <div id="qr-reader" ref={qrCodeRef} className="" />

                {scanning && (
                    <p className="w-full absolute p-4 z-20 text-center transform -translate-x-1/2 -translate-y-1/2 bottom-[11rem] left-1/2 text-white">
                        Align QR code within frame to scan
                    </p>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageScan}
                />
            </div>
        </div>
    );
}
