"use client";
import { Html5Qrcode } from 'html5-qrcode';
import React, { useEffect, useRef, useState } from 'react'

const QrScanner = () => {
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

        } catch (err) {
            setError(`Error scanning QR code from image: ${err}`);
        } finally {
            html5QrCode.clear();
        }
    };
    const startScanning = () => {
        setResult('');
        if (!html5QrCode || !qrCodeRef.current) {
            setError("QR Code scanner initialization failed.");
            return;
        }
        const width = screen.width;
        const config = {
            fps: 10,
            qrbox: { width: 300, height: 300 },
            aspectRatio: width >= 600 ? 1.3 : 1.6,
        };

        html5QrCode
            .start(
                { facingMode: "environment" },
                config,
                (decodedText: string) => {
                    console.log(`QR Code scanned: ${decodedText}`);
                    setResult(decodedText);
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

    useEffect(() => {
        const qrCodeInstance = new Html5Qrcode("qr-reader");
        setHtml5QrCode(qrCodeInstance);

        return () => {
            stopScanning();
        };
    }, []);

    return (
        <div className='px-5 py-10'>
            <h1 className="text-center text-xl font-semibold">
                NextJS QR Scanner
            </h1>
            <div className="my-10 flex justify-center items-center gap-10">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageScan}
                />
                <button onClick={() => fileInputRef.current?.click()} className='border rounded-lg py-2 px-5 '>Album</button>
                <button onClick={startScanning} className='border rounded-lg py-2 px-5 '>Start Scanning (Camera)</button>
                <button onClick={stopScanning} className='border rounded-lg py-2 px-5 '>Stop Scanning</button>
            </div>
            <div id="qr-reader" ref={qrCodeRef} className="w-2/3 mx-auto" />

            <div className="text-center py-20">
                {error && <h1 className="text-red-600">Error - {error}</h1>}
                {result && <h1 className="">Result - {result}</h1>}
            </div>
        </div>
    )
}

export default QrScanner
