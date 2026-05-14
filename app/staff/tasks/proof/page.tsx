"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CloudUpload, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CameraCapture } from "@/components/proof-work/CameraCapture";
import { LocationDisplay } from "@/components/proof-work/LocationDisplay";
import { TaskContextCard } from "@/components/proof-work/TaskContextCard";
import { sopAPI } from "@/lib/api/sop";

interface LocationData {
  latitude: number;
  longitude: number;
  name?: string;
}

interface TaskItem {
  id: string;
  task: string;
  location: string;
  priority: "high" | "medium" | "low";
  status: "done" | "pending" | "upcoming" | "overdue";
  due: string;
  assignee?: string;
}

function ProofPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const executionId = searchParams.get("id");

  const [capturedImage, setCapturedImage] = useState<string>("");
  const [timestamp, setTimestamp] = useState<Date | null>(null);
  const [deviceLabel, setDeviceLabel] = useState<string>("");
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [task, setTask] = useState<TaskItem | null>(null);

  useEffect(() => {
    // Load task context passed from the tasks page
    const stored = localStorage.getItem("proof_task");
    if (stored) {
      setTask(JSON.parse(stored));
    }
  }, []);

  const handleCapture = useCallback((imageData: string, time: Date, device: string) => {
    setCapturedImage(imageData);
    setTimestamp(time);
    setDeviceLabel(device);
  }, []);

  const handleLocation = useCallback((loc: LocationData | null) => {
    setLocation(loc);
  }, []);

  const handleUpload = async () => {
    if (!capturedImage) {
      toast.error("Please capture an image first");
      return;
    }
    if (!executionId) {
      toast.error("Missing task ID");
      return;
    }

    setIsUploading(true);
    try {
      await sopAPI.submitProof(executionId, {
        proof_image: capturedImage,
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
        location_name: location?.name ?? null,
      });

      localStorage.removeItem("proof_task");
      toast.success("Proof submitted! Waiting for manager approval.");
      router.push("/staff/tasks");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to submit proof");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage("");
    setTimestamp(null);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50/50 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/staff/tasks")}
            className="h-10 w-10 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:scale-105 transition-all">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Submit Proof</h1>
            <p className="text-slate-500 text-sm mt-0.5">Take a photo to confirm task completion</p>
          </div>
        </div>

        {!task ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-500 text-sm">Loading task details...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 lg:gap-8">
            <div>
              <CameraCapture
                onCapture={handleCapture}
                disabled={isUploading}
                locationName={location?.name || "Locating..."}
                isCaptured={!!capturedImage}
                capturedImage={capturedImage}
                timestamp={timestamp}
                deviceLabel={deviceLabel}
                onRetake={handleRetake}
              />
            </div>

            <div className="space-y-4 lg:space-y-6">
              <TaskContextCard task={task} />
              <LocationDisplay onLocationCapture={handleLocation} disabled={isUploading} />

              <div className="space-y-3 pt-2">
                <Button
                  onClick={handleUpload}
                  disabled={!capturedImage || isUploading}
                  className="w-full h-12 bg-black hover:bg-slate-800 text-white font-medium rounded-xl text-[15px] transition-all disabled:bg-slate-300 disabled:text-slate-500">
                  {isUploading ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Uploading...</>
                  ) : (
                    <><CloudUpload className="w-5 h-5 mr-2" />Submit Proof</>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleRetake}
                  disabled={!capturedImage || isUploading}
                  className="w-full h-12 bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-medium rounded-xl text-[15px] transition-all disabled:opacity-50">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retake Photo
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProofVerificationPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
      </div>
    }>
      <ProofPageInner />
    </Suspense>
  );
}
