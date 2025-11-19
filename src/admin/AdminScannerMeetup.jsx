import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Scan, Camera, CameraOff } from "lucide-react";

const AdminScannerMeetup = () => {
  const scannerRef = useRef(null);
  const [cameraId, setCameraId] = useState("");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");

  // Load cameras and prefer back camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras.length === 0) {
          setError("No camera found");
          return;
        }

        const backCam = cameras.find((c) =>
          c.label.toLowerCase().includes("back")
        );
        const defaultCam = backCam || cameras[0];
        setCameraId(defaultCam.id);
      } catch (err) {
        setError("Camera access denied");
      }
    };

    initCamera();
  }, []);

  // Start scanning
  const startScanner = async () => {
    if (!cameraId || scanning) return;

    try {
      const qrScanner = new Html5Qrcode("qr-reader");
      scannerRef.current = qrScanner;

      await qrScanner.start(
        cameraId,
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          // Success: vibrate + alert (or emit event)
          if (navigator.vibrate) navigator.vibrate(200);
          alert(`Scanned: ${decodedText}`);
          stopScanner(); // optional: stop after scan
        },
        () => {
          // Scan error (silent)
        }
      );

      setScanning(true);
      setError("");
    } catch (err) {
      setError("Failed to start camera");
    }
  };

  // Stop scanning
  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error(err);
      }
    }
    setScanning(false);
  };

  // Auto-start when camera is ready
  useEffect(() => {
    if (cameraId && !scanning) {
      const timer = setTimeout(startScanner, 300);
      return () => clearTimeout(timer);
    }
  }, [cameraId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopScanner();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center p-4">
      {/* Title */}
      <h1 className="text-2xl font-light text-white mb-6 tracking-wider">
        QR Scanner
      </h1>

      {/* Scanner Container */}
      <div className="relative w-80 h-80 bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
        {/* QR Reader */}
        <div id="qr-reader" className="w-full h-full" />

        {/* Scanning Animation Overlay */}
        {scanning && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Corner Brackets */}
            <div className="absolute top-4 left-4 w-12 h-12 border-l-4 border-t-4 border-green-400 rounded-tl-lg"></div>
            <div className="absolute top-4 right-4 w-12 h-12 border-r-4 border-t-4 border-green-400 rounded-tr-lg"></div>
            <div className="absolute bottom-4 left-4 w-12 h-12 border-l-4 border-b-4 border-green-400 rounded-bl-lg"></div>
            <div className="absolute bottom-4 right-4 w-12 h-12 border-r-4 border-b-4 border-green-400 rounded-br-lg"></div>

            {/* Laser Line Animation */}
            <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-70">
              <div
                className="h-full w-32 mx-auto bg-green-400 blur-sm"
                style={{
                  animation: "scan 2s ease-in-out infinite",
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Error or Loading State */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
            <p className="text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={scanning ? stopScanner : startScanner}
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full font-medium text-sm transition-all hover:scale-105 active:scale-95"
        >
          {scanning ? (
            <>
              <CameraOff size={18} />
              Stop
            </>
          ) : (
            <>
              <Camera size={18} />
              Start
            </>
          )}
        </button>

        {/* Optional: Camera Switcher (minimal) */}
        {/* Uncomment if you want camera switcher */}
        {/* <select
          value={cameraId}
          onChange={(e) => {
            stopScanner();
            setCameraId(e.target.value);
          }}
          className="bg-gray-800 text-white text-xs px-3 py-2 rounded-full"
        >
          {cameraList.map((cam) => (
            <option key={cam.id} value={cam.id}>
              {cam.label.split("(")[0].trim()}
            </option>
          ))}
        </select> */}
      </div>

      {/* Subtle Status */}
      <p className="text-gray-500 text-xs mt-4">
        {scanning ? "Scanning..." : "Ready"}
      </p>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes scan {
          0%,
          100% {
            transform: translateY(60px);
          }
          50% {
            transform: translateY(260px);
          }
        }
      `}</style>
    </div>
  );
};

export default AdminScannerMeetup;