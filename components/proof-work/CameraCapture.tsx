"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, RefreshCw, AlertCircle, X, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraCaptureProps {
  onCapture: (imageData: string, timestamp: Date, deviceLabel: string) => void;
  disabled?: boolean;
  locationName?: string;
  isCaptured?: boolean;
  capturedImage?: string | null;
  timestamp?: Date | null;
  deviceLabel?: string;
  onRetake?: () => void;
}

export function CameraCapture({ 
  onCapture, 
  disabled,
  locationName = "Getting location...",
  isCaptured,
  capturedImage,
  timestamp,
  deviceLabel,
  onRetake
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [internalDeviceLabel, setInternalDeviceLabel] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getDeviceLabel = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevice = devices.find(d => d.kind === "videoinput");
      return videoDevice?.label || "Unknown Device";
    } catch {
      return "Unknown Device";
    }
  };

  const startCamera = useCallback(async () => {
    if (stream || isCaptured) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
        }
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      const label = await getDeviceLabel();
      setInternalDeviceLabel(label);
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Camera access denied.");
    } finally {
      setIsLoading(false);
    }
  }, [stream, isCaptured]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL("image/jpeg", 0.85);
    const now = new Date();
    
    onCapture(imageData, now, internalDeviceLabel);
    stopCamera();
  }, [internalDeviceLabel, onCapture, stopCamera]);

  useEffect(() => {
    if (!isCaptured && !stream) {
      startCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCaptured, startCamera, stream]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.onloadedmetadata = () => {
        setIsCameraReady(true);
      };
    }
  }, [stream]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });
  };

  if (isCaptured && capturedImage) {
    return (
      <div className="relative bg-[#1a1a1a] rounded-[2rem] overflow-hidden aspect-[3/4] w-full max-w-md mx-auto flex flex-col">
        <img
          src={capturedImage}
          alt="Captured"
          className="w-full h-full object-cover"
        />
        
        {/* Verification Overlay */}
        <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10">
          <div className="px-4 py-3 flex items-center gap-2 border-b border-white/10">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-white text-xs font-bold tracking-wide">LIVE CAPTURE AUTHENTICATED</span>
          </div>
          <div className="px-4 py-3 flex items-center justify-between bg-black/40">
            <div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider mb-1 uppercase">TIMESTAMP</p>
              <p className="text-white text-sm font-medium">{timestamp ? formatTime(timestamp) : ""}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-medium tracking-wider mb-1 uppercase">DEVICE</p>
              <p className="text-white text-sm font-medium">{deviceLabel || internalDeviceLabel || "Unknown"}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-[#1a1a1a] rounded-[2rem] overflow-hidden aspect-[3/4] w-full max-w-md mx-auto flex flex-col items-center justify-center">
      {error ? (
        <div className="text-center p-6 text-white">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p>{error}</p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isCameraReady ? "opacity-100" : "opacity-0"}`}
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]">
              <div className="flex items-center gap-2 text-white">
                <RefreshCw className="w-5 h-5 animate-spin" />
              </div>
            </div>
          )}

          {/* Top Bar */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
            <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-white text-xs font-bold tracking-wide">LIVE</span>
              </div>
              <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors">
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center Guide */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="w-64 h-64 rounded-full border border-cyan-400/50 relative">
              {/* Optional: Add some reticle markings if desired */}
            </div>
            {/* Grid Lines */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20">
              <div className="border-r border-b border-white"></div>
              <div className="border-r border-b border-white"></div>
              <div className="border-b border-white"></div>
              <div className="border-r border-b border-white"></div>
              <div className="border-r border-b border-white"></div>
              <div className="border-b border-white"></div>
              <div className="border-r border-white"></div>
              <div className="border-r border-white"></div>
              <div></div>
            </div>
          </div>

          {/* Bottom Overlays */}
          <div className="absolute bottom-32 left-6 right-6 flex flex-col gap-3 z-10">
            <div className="bg-black/60 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 flex items-center gap-3">
              <Clock className="w-4 h-4 text-slate-300" />
              <span className="text-white text-sm font-medium">{formatTime(currentTime)}</span>
            </div>
            <div className="bg-black/60 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 flex items-center gap-3">
              <MapPin className="w-4 h-4 text-slate-300" />
              <span className="text-white text-sm font-medium truncate">{locationName}</span>
            </div>
          </div>

          {/* Capture Button */}
          {isCameraReady && !isLoading && (
            <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center z-10">
              <button
                onClick={capturePhoto}
                disabled={disabled}
                className="w-16 h-16 rounded-full bg-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg"
              >
                <div className="w-[52px] h-[52px] rounded-full border-2 border-slate-200 group-hover:border-slate-300 transition-colors" />
              </button>
              <span className="text-white text-xs font-bold tracking-[0.2em] mt-4 uppercase opacity-80">
                Tap to Capture
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}