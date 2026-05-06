"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CloudUpload, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CameraCapture } from "@/components/proof-work/CameraCapture";
import { LocationDisplay } from "@/components/proof-work/LocationDisplay";
import { TaskContextCard } from "@/components/proof-work/TaskContextCard";

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

export default function ProofVerificationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const taskId = searchParams.get("id");
  
  const [selectedTaskId, setSelectedTaskId] = useState<string>(taskId || "");
  const [capturedImage, setCapturedImage] = useState<string>("");
  const [timestamp, setTimestamp] = useState<Date | null>(null);
  const [deviceLabel, setDeviceLabel] = useState<string>("");
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [taskList, setTaskList] = useState<TaskItem[]>([]);

  useEffect(() => {
    const storedTasks = localStorage.getItem("manager_tasks");
    if (storedTasks) {
      const tasks = JSON.parse(storedTasks);
      setTaskList(tasks);
    }
  }, []);

  const selectedTask = taskList.find(t => t.id === selectedTaskId) || taskList[0];

  useEffect(() => {
    if (taskId) {
      setSelectedTaskId(taskId);
    }
  }, [taskId]);

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

    setIsUploading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const storedTasks = JSON.parse(localStorage.getItem("manager_tasks") || "[]");
    const updatedTasks = storedTasks.map((t: TaskItem) => 
      t.id === selectedTaskId ? { ...t, status: "pending_approval" as const, proofImage: capturedImage, proofTimestamp: timestamp } : t
    );
    localStorage.setItem("manager_tasks", JSON.stringify(updatedTasks));
    
    toast.success("Proof submitted! Waiting for manager approval.");
    setIsUploading(false);
    
    router.push("/staff/tasks");
  };

  const handleRetake = () => {
    setCapturedImage("");
    setTimestamp(null);
  };

  const handleGoBack = () => {
    router.push("/staff/tasks");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50/50 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleGoBack}
            className="h-10 w-10 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:scale-105 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Proof Verification
          </h1>
        </div>

        {/* Loading State */}
        {(!selectedTask || taskList.length === 0) ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-500">Loading task...</p>
          </div>
        ) : (
          <>
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 lg:gap-8">
          
          {/* Left Column - Camera / Image */}
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

          {/* Right Column - Data & Actions */}
          <div className="space-y-4 lg:space-y-6">
            <TaskContextCard task={selectedTask} />
            <LocationDisplay onLocationCapture={handleLocation} disabled={isUploading} />
            
            <div className="space-y-3 pt-2">
              <Button
                onClick={handleUpload}
                disabled={!capturedImage || isUploading}
                className="w-full h-12 lg:h-12 bg-black hover:bg-slate-800 text-white font-medium rounded-xl text-[15px] transition-all disabled:bg-slate-300 disabled:text-slate-500"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-5 h-5 mr-2" />
                    Confirm Upload
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleRetake}
                disabled={!capturedImage || isUploading}
                className="w-full h-12 lg:h-12 bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-medium rounded-xl text-[15px] transition-all disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retake Photo
              </Button>
            </div>
</div>
           
        </div>
          </>
        )}
      </div>
    </div>
  );
}