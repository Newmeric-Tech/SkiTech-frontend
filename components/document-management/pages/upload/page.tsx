"use client";

import React, { useState, useRef } from "react";
import { DocTabs } from "@/components/document-management/DocTabs";
import { UploadCloud, FileText, X, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UploadDocumentPage() {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...droppedFiles]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const simulateUpload = () => {
    if (files.length === 0) return;
    setUploading(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
          setFiles([]);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <div className="space-y-6 pb-20 font-[family-name:var(--font-merriweather)] max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-black tracking-tight">Upload Document</h1>
        <p className="text-neutral-500 mt-1">Add new files to the organization securely.</p>
      </div>

      <DocTabs />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-black/10 shadow-sm p-6 lg:p-8">
          <h2 className="text-xl font-bold text-black mb-6">Document Details</h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Document Title</label>
              <input 
                type="text" 
                placeholder="e.g. Q3 Financial Report" 
                className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Description</label>
              <textarea 
                rows={3}
                placeholder="Briefly describe the document contents..." 
                className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Category</label>
                <select className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 bg-white">
                  <option>Select Category</option>
                  <option>Finance</option>
                  <option>HR</option>
                  <option>Legal</option>
                  <option>Marketing</option>
                  <option>Engineering</option>
                  <option>Operations</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Assign Department</label>
                <select className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 bg-white">
                  <option>Select Department</option>
                  <option>All Departments</option>
                  <option>Finance</option>
                  <option>Human Resources</option>
                  <option>Legal</option>
                  <option>Marketing</option>
                  <option>Engineering</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Tags (Comma separated)</label>
              <input 
                type="text" 
                placeholder="e.g. report, q3, finance" 
                className="w-full px-4 py-2 border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-3">Visibility Options</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {["Private", "Team Only", "Department", "Org Wide"].map((opt, i) => (
                  <label key={opt} className={`flex flex-col items-center justify-center p-3 border rounded-xl cursor-pointer transition-colors ${i === 3 ? 'border-black bg-black/5' : 'border-black/10 hover:bg-neutral-50'}`}>
                    <input type="radio" name="visibility" className="sr-only" defaultChecked={i === 3} />
                    <span className={`text-sm font-semibold ${i === 3 ? 'text-black' : 'text-neutral-600'}`}>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-black/10 shadow-sm p-6">
            <h2 className="text-xl font-bold text-black mb-4">Upload File</h2>
            
            <div 
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                dragActive ? 'border-black bg-black/5' : 'border-black/20 hover:bg-neutral-50 hover:border-black/40'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                multiple
                className="hidden" 
                onChange={handleChange}
                accept=".pdf,.docx,.xlsx,.png,.jpg"
              />
              <UploadCloud className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-black mb-1">Click to upload or drag & drop</p>
              <p className="text-xs text-neutral-500">PDF, DOCX, XLSX, PNG, JPG (Max 50MB)</p>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-6 space-y-3">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-black/5">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileText className="w-5 h-5 text-blue-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-black truncate">{file.name}</p>
                        <p className="text-xs text-neutral-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFile(i)}
                      className="p-1.5 text-neutral-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {uploading && (
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-black">Uploading...</span>
                  <span className="text-neutral-500">{progress}%</span>
                </div>
                <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-black rounded-full"
                  />
                </div>
              </div>
            )}

            <button 
              onClick={simulateUpload}
              disabled={files.length === 0 || uploading}
              className={`w-full mt-6 py-3 rounded-xl font-bold transition-all shadow-sm ${
                files.length === 0 || uploading 
                  ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed' 
                  : 'bg-black text-white hover:bg-neutral-800 shadow-black/20 hover:shadow-md'
              }`}
            >
              {uploading ? 'Uploading...' : 'Upload & Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Success Toast Animation */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 bg-black text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50"
          >
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div>
              <p className="font-bold text-sm">Upload Successful</p>
              <p className="text-xs text-white/70">Document has been saved and shared.</p>
            </div>
            <button onClick={() => setSuccess(false)} className="ml-4 text-white/50 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
