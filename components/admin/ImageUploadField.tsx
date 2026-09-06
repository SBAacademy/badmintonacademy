"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  Upload,
  Link as LinkIcon,
  X,
  Check,
  RefreshCw,
  Image as ImageIcon,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  aspectRatio?: "16/9" | "4/3" | "1/1" | "3/4";
  required?: boolean;
  helpText?: string;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  aspectRatio = "16/9",
  required = false,
  helpText,
}: ImageUploadFieldProps) {
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectClass =
    aspectRatio === "1/1"
      ? "aspect-square"
      : aspectRatio === "4/3"
      ? "aspect-[4/3]"
      : aspectRatio === "3/4"
      ? "aspect-[3/4]"
      : "aspect-[16/9]";

  const handleFileUpload = async (file: File) => {
    setErrorMessage(null);

    // Client-side validation
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (JPG, PNG, WebP, GIF, SVG, AVIF).");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage("Image exceeds the maximum 15MB limit.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        onChange(data.url);
      } else {
        setErrorMessage(data.error || "Failed to upload image. Please try again.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setErrorMessage("Network error while uploading image. Please retry.");
    } finally {
      setIsUploading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      {/* Field Label and Mode Switcher */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono font-bold text-[#A8B0BA] uppercase tracking-wider flex items-center gap-1.5">
          <span>{label}</span>
          {required && <span className="text-[#B8F000]">*</span>}
        </label>

        {/* Tab switch between device upload and URL paste */}
        <div className="flex items-center bg-[#07090D] border border-[#1F2937] p-0.5 font-mono text-[10px]">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`px-2 py-0.5 uppercase transition-colors flex items-center gap-1 ${
              mode === "upload"
                ? "bg-[#B8F000] text-[#07090D] font-bold"
                : "text-[#A8B0BA] hover:text-white"
            }`}
          >
            <Upload className="w-2.5 h-2.5" />
            <span>Upload File</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`px-2 py-0.5 uppercase transition-colors flex items-center gap-1 ${
              mode === "url"
                ? "bg-[#B8F000] text-[#07090D] font-bold"
                : "text-[#A8B0BA] hover:text-white"
            }`}
          >
            <LinkIcon className="w-2.5 h-2.5" />
            <span>Image URL</span>
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
          }
        }}
      />

      {/* Mode 1: Device File Upload Dropzone (if no value or if replacing) */}
      {mode === "upload" && !value && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
            dragActive
              ? "border-[#B8F000] bg-[#B8F000]/5"
              : "border-[#1F2937] bg-[#07090D] hover:border-[#374151] hover:bg-[#0B0F14]"
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center py-4 space-y-2">
              <RefreshCw className="w-6 h-6 text-[#B8F000] animate-spin" />
              <p className="font-mono text-xs uppercase font-bold text-white tracking-wider">
                Uploading image...
              </p>
              <p className="font-mono text-[10px] text-[#A8B0BA]">Saving to public storage</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-3 space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#11161D] border border-[#1F2937] flex items-center justify-center text-[#B8F000]">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  Click to browse <span className="text-[#A8B0BA] font-normal">or drag &amp; drop</span>
                </p>
                <p className="font-mono text-[10px] text-[#6B7280] mt-0.5">
                  JPG, PNG, WebP, GIF, SVG, AVIF up to 15MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Direct URL Input */}
      {mode === "url" && (
        <div className="space-y-1.5">
          <input
            type="url"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://images.unsplash.com/... or /uploads/..."
            className="w-full px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white font-mono text-xs focus:outline-none focus:border-[#B8F000]"
          />
        </div>
      )}

      {/* Visual Image Preview & Controls (Rendered whenever value exists) */}
      {value && (
        <div className="space-y-2">
          <div className={`relative ${aspectClass} w-full bg-[#07090D] border border-[#1F2937] overflow-hidden group`}>
            <Image
              src={value}
              alt="Uploaded preview"
              fill
              className="object-cover"
              unoptimized
            />

            {/* Gradient Overlay for controls */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-3 py-1.5 bg-[#B8F000] text-[#07090D] font-mono text-xs uppercase font-black hover:bg-[#cbf722] flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                <span>Change Image</span>
              </button>

              <button
                type="button"
                onClick={() => onChange("")}
                className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-mono text-xs uppercase font-bold flex items-center gap-1 shadow-md cursor-pointer"
              >
                <X className="w-3 h-3" />
                <span>Remove</span>
              </button>
            </div>

            {/* Status tags */}
            <div className="absolute top-2 left-2 flex items-center gap-1">
              <span className="px-2 py-0.5 bg-[#07090D]/90 border border-[#1F2937] text-[#B8F000] font-mono text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Check className="w-2.5 h-2.5" />
                <span>Ready</span>
              </span>
            </div>

            <div className="absolute bottom-2 right-2">
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="px-2 py-0.5 bg-[#07090D]/90 border border-[#1F2937] text-white hover:text-[#B8F000] font-mono text-[9px] flex items-center gap-1 transition-colors"
                title="Open in new window"
              >
                <ExternalLink className="w-2.5 h-2.5" />
                <span>Full View</span>
              </a>
            </div>
          </div>

          {/* Current File Path / URL readout */}
          <div className="flex items-center justify-between text-[11px] font-mono text-[#A8B0BA] bg-[#07090D] border border-[#1F2937] px-2.5 py-1">
            <span className="truncate max-w-[80%] text-white">{value}</span>
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-rose-400 hover:text-rose-300 uppercase text-[10px] font-bold"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Error Message Box */}
      {errorMessage && (
        <div className="p-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-white"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {helpText && (
        <p className="font-mono text-[10px] text-[#6B7280]">{helpText}</p>
      )}
    </div>
  );
}
