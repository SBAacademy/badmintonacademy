"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  Upload,
  Link as LinkIcon,
  X,
  Star,
  Trash2,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Plus,
} from "lucide-react";
import { CoachPhoto, DEFAULT_COACH_IMAGE } from "@/data/coaches";

interface CoachMultiPhotoUploadProps {
  coachId?: string;
  photos: CoachPhoto[];
  onChange: (photos: CoachPhoto[]) => void;
  maxPhotos?: number;
}

export function CoachMultiPhotoUpload({
  coachId = "new",
  photos,
  onChange,
  maxPhotos = 12,
}: CoachMultiPhotoUploadProps) {
  const [uploadMode, setUploadMode] = useState<"upload" | "url">("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to ensure exactly one primary photo
  const updatePhotosWithPrimaryRule = (newPhotos: CoachPhoto[]) => {
    if (newPhotos.length === 0) {
      onChange([]);
      return;
    }

    const hasPrimary = newPhotos.some((p) => p.isPrimary);
    let foundFirst = false;

    const normalized = newPhotos.map((p, idx) => {
      let isPrimary = p.isPrimary;
      if (!hasPrimary && idx === 0) {
        isPrimary = true;
      } else if (isPrimary) {
        if (!foundFirst) {
          foundFirst = true;
        } else {
          isPrimary = false; // only single primary allowed
        }
      }
      return {
        ...p,
        sortOrder: idx + 1,
        isPrimary,
      };
    });

    onChange(normalized);
  };

  // Upload single or multiple files
  const handleFilesUpload = async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    setErrorMessage(null);

    // Validate available slots
    const availableSlots = maxPhotos - photos.length;
    if (availableSlots <= 0) {
      setErrorMessage(`Maximum limit of ${maxPhotos} photos reached for this coach.`);
      return;
    }

    const filesToUpload = fileList.slice(0, availableSlots);
    if (fileList.length > availableSlots) {
      setErrorMessage(`Only ${availableSlots} photos could be added (max ${maxPhotos}).`);
    }

    // Validate formats & sizes
    for (const file of filesToUpload) {
      if (!file.type.startsWith("image/")) {
        setErrorMessage(`"${file.name}" is not a valid image format.`);
        return;
      }
      if (file.size > 12 * 1024 * 1024) {
        setErrorMessage(`"${file.name}" exceeds the 12MB size limit.`);
        return;
      }
    }

    setIsUploading(true);
    setUploadProgress({ current: 0, total: filesToUpload.length });

    const newlyUploadedPhotos: CoachPhoto[] = [];

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      setUploadProgress({ current: i + 1, total: filesToUpload.length });

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (data.success && data.url) {
          newlyUploadedPhotos.push({
            id: `photo_${coachId}_${Date.now()}_${i}`,
            coachId,
            imageUrl: data.url,
            sortOrder: photos.length + newlyUploadedPhotos.length + 1,
            isPrimary: photos.length === 0 && newlyUploadedPhotos.length === 0,
          });
        } else {
          setErrorMessage(data.error || `Failed to upload "${file.name}".`);
        }
      } catch (err) {
        console.error("Multi-upload error:", err);
        setErrorMessage(`Network error uploading "${file.name}".`);
      }
    }

    setIsUploading(false);
    setUploadProgress(null);

    if (newlyUploadedPhotos.length > 0) {
      updatePhotosWithPrimaryRule([...photos, ...newlyUploadedPhotos]);
    }
  };

  // Add photo via external URL
  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    if (photos.length >= maxPhotos) {
      setErrorMessage(`Maximum limit of ${maxPhotos} photos reached.`);
      return;
    }

    const newPhoto: CoachPhoto = {
      id: `photo_${coachId}_${Date.now()}`,
      coachId,
      imageUrl: urlInput.trim(),
      sortOrder: photos.length + 1,
      isPrimary: photos.length === 0,
    };

    updatePhotosWithPrimaryRule([...photos, newPhoto]);
    setUrlInput("");
    setErrorMessage(null);
  };

  // Set designated primary photo
  const handleSetPrimary = (index: number) => {
    const updated = photos.map((p, idx) => ({
      ...p,
      isPrimary: idx === index,
    }));
    updatePhotosWithPrimaryRule(updated);
  };

  // Move photo left / earlier
  const handleMoveLeft = (index: number) => {
    if (index === 0) return;
    const updated = [...photos];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    updatePhotosWithPrimaryRule(updated);
  };

  // Move photo right / later
  const handleMoveRight = (index: number) => {
    if (index === photos.length - 1) return;
    const updated = [...photos];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    updatePhotosWithPrimaryRule(updated);
  };

  // Delete photo with auto-fallback for primary
  const handleDeletePhoto = (index: number) => {
    const isDeletingPrimary = photos[index].isPrimary;
    const filtered = photos.filter((_, idx) => idx !== index);

    if (isDeletingPrimary && filtered.length > 0) {
      // Safely assign first remaining photo as primary
      filtered[0].isPrimary = true;
    }

    updatePhotosWithPrimaryRule(filtered);
  };

  // Drag & drop handlers
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#1F2937]">
        <div>
          <label className="text-[#A8B0BA] font-bold uppercase tracking-wider flex items-center gap-2">
            <span>Coach Photos &amp; Action Gallery</span>
            <span className="px-1.5 py-0.5 bg-[#B8F000]/10 border border-[#B8F000]/30 text-[#B8F000] text-[10px]">
              {photos.length} / {maxPhotos} Photos
            </span>
          </label>
          <p className="text-[10px] text-[#6B7280] mt-0.5">
            Upload multiple photos (portraits, match action, podium). Click ★ to set as the public primary avatar.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-[#07090D] border border-[#1F2937] p-0.5 text-[10px] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setUploadMode("upload")}
            className={`px-2.5 py-1 uppercase transition-colors flex items-center gap-1 cursor-pointer ${
              uploadMode === "upload"
                ? "bg-[#B8F000] text-[#07090D] font-bold"
                : "text-[#A8B0BA] hover:text-white"
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Select Files</span>
          </button>
          <button
            type="button"
            onClick={() => setUploadMode("url")}
            className={`px-2.5 py-1 uppercase transition-colors flex items-center gap-1 cursor-pointer ${
              uploadMode === "url"
                ? "bg-[#B8F000] text-[#07090D] font-bold"
                : "text-[#A8B0BA] hover:text-white"
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>Add URL</span>
          </button>
        </div>
      </div>

      {/* Hidden Multi-file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/svg+xml,image/avif"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFilesUpload(e.target.files);
            e.target.value = ""; // reset
          }
        }}
      />

      {/* Mode 1: Device Multi-file Upload Drag & Drop Zone */}
      {uploadMode === "upload" && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => {
            if (!isUploading) fileInputRef.current?.click();
          }}
          className={`border-2 border-dashed p-5 text-center cursor-pointer transition-colors relative overflow-hidden ${
            dragActive
              ? "border-[#B8F000] bg-[#B8F000]/10"
              : "border-[#1F2937] bg-[#07090D] hover:border-[#374151] hover:bg-[#0B0F14]"
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center py-3 space-y-2">
              <RefreshCw className="w-7 h-7 text-[#B8F000] animate-spin" />
              <p className="font-bold text-white uppercase text-xs">
                Uploading photos ({uploadProgress?.current || 0} of {uploadProgress?.total || 0})...
              </p>
              <div className="w-48 bg-[#11161D] border border-[#1F2937] h-1.5 overflow-hidden">
                <div
                  className="bg-[#B8F000] h-full transition-all duration-200"
                  style={{
                    width: `${
                      uploadProgress
                        ? Math.round((uploadProgress.current / uploadProgress.total) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
              <p className="text-[10px] text-[#A8B0BA]">Saving images to database storage</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-2 space-y-1.5">
              <div className="w-9 h-9 rounded-full bg-[#11161D] border border-[#1F2937] flex items-center justify-center text-[#B8F000]">
                <Plus className="w-5 h-5" />
              </div>
              <p className="font-bold text-white uppercase text-xs">
                Click to browse multiple photos <span className="text-[#A8B0BA] font-normal">or drop files here</span>
              </p>
              <p className="text-[10px] text-[#6B7280]">
                Supports selecting multiple JPG, PNG, WebP files at once (up to 12MB each)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Direct URL Input */}
      {uploadMode === "url" && (
        <form onSubmit={handleAddUrl} className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste image URL (https://... or /images/...)"
            className="flex-1 px-3 py-2 bg-[#07090D] border border-[#1F2937] text-white text-xs focus:outline-none focus:border-[#B8F000]"
          />
          <button
            type="submit"
            disabled={!urlInput.trim()}
            className="px-4 py-2 bg-[#B8F000] hover:bg-[#cbf722] disabled:opacity-50 text-[#07090D] font-bold text-xs uppercase cursor-pointer"
          >
            Add Photo
          </button>
        </form>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-2.5 bg-rose-500/10 border border-rose-500/40 text-rose-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-white cursor-pointer ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Photo Gallery Grid */}
      {photos.length === 0 ? (
        <div className="p-4 bg-[#07090D] border border-[#1F2937] text-center text-[#6B7280] text-xs">
          No photos uploaded yet for this coach. Upload one or more photos above.
        </div>
      ) : (
        <div className="space-y-3">
          {/* Primary Photo Status Readout */}
          <div className="p-2.5 bg-[#07090D] border border-[#B8F000]/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-[#B8F000] fill-[#B8F000]" />
              <span className="text-white text-[11px] font-bold">
                Primary Profile Cover:{" "}
                <span className="text-[#B8F000]">
                  Photo #{(photos.findIndex((p) => p.isPrimary) !== -1 ? photos.findIndex((p) => p.isPrimary) : 0) + 1}
                </span>
              </span>
            </div>
            <span className="text-[10px] text-[#A8B0BA]">
              Used for Coach Cards, Rosters &amp; Spotlights
            </span>
          </div>

          {/* Thumbnails Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((photo, index) => {
              const isPrimary = photo.isPrimary;

              return (
                <div
                  key={photo.id || index}
                  className={`bg-[#07090D] border rounded-none overflow-hidden flex flex-col justify-between group relative transition-all ${
                    isPrimary
                      ? "border-2 border-[#B8F000] ring-2 ring-[#B8F000]/20"
                      : "border-[#1F2937] hover:border-[#374151]"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[3/4] w-full bg-black/60 overflow-hidden">
                    <Image
                      src={photo.imageUrl || DEFAULT_COACH_IMAGE}
                      alt={`Coach photo ${index + 1}`}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 640px) 50vw, 25vw"
                      unoptimized
                    />

                    {/* Order Tag & Primary Badge */}
                    <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 z-10">
                      <span className="px-1.5 py-0.5 bg-[#07090D]/90 border border-[#1F2937] text-white text-[9px] font-bold">
                        #{index + 1}
                      </span>
                      {isPrimary && (
                        <span className="px-1.5 py-0.5 bg-[#B8F000] text-[#07090D] font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                          <Star className="w-2.5 h-2.5 fill-[#07090D]" />
                          <span>Primary</span>
                        </span>
                      )}
                    </div>

                    {/* External View Link */}
                    <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <a
                        href={photo.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 bg-[#07090D]/90 hover:bg-[#11161D] border border-[#1F2937] text-white hover:text-[#B8F000] block"
                        title="View full image"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-2 bg-[#0B0F14] border-t border-[#1F2937] space-y-2">
                    {/* Primary Button */}
                    {!isPrimary ? (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(index)}
                        className="w-full py-1 px-1.5 bg-[#11161D] hover:bg-[#B8F000] hover:text-[#07090D] text-[#A8B0BA] border border-[#1F2937] font-bold text-[10px] uppercase flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Set as coach primary profile image"
                      >
                        <Star className="w-3 h-3" />
                        <span>Make Primary</span>
                      </button>
                    ) : (
                      <div className="py-1 px-1.5 bg-[#B8F000]/10 border border-[#B8F000]/40 text-[#B8F000] font-bold text-[10px] uppercase text-center flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Main Cover</span>
                      </div>
                    )}

                    {/* Reorder and Delete Controls */}
                    <div className="flex items-center justify-between gap-1 pt-1 border-t border-[#1F2937]/60">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveLeft(index)}
                          disabled={index === 0}
                          className="p-1 bg-[#11161D] hover:bg-[#17212C] disabled:opacity-30 border border-[#1F2937] text-[#A8B0BA] hover:text-white cursor-pointer"
                          title="Move earlier"
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveRight(index)}
                          disabled={index === photos.length - 1}
                          className="p-1 bg-[#11161D] hover:bg-[#17212C] disabled:opacity-30 border border-[#1F2937] text-[#A8B0BA] hover:text-white cursor-pointer"
                          title="Move later"
                        >
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(index)}
                        className="p-1 bg-[#11161D] hover:bg-rose-950/50 border border-[#1F2937] hover:border-rose-500/40 text-[#6B7280] hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete this photo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
