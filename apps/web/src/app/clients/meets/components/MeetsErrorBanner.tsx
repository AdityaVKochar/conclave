"use client";

import { AlertCircle, X } from "lucide-react";
import type { MeetError } from "../types";

interface MeetsErrorBannerProps {
  meetError: MeetError;
  onDismiss: () => void;
}

export default function MeetsErrorBanner({
  meetError,
  onDismiss,
}: MeetsErrorBannerProps) {
  return (
    <div 
      className="px-6 py-4 bg-[#F95F4A]/10 border-b border-[#F95F4A]/30 flex items-center justify-between backdrop-blur-sm"
      style={{ fontFamily: "'PolySans Trial', sans-serif" }}
    >
      <div className="flex items-center gap-3 text-[#F95F4A]">
        <div className="p-1.5 rounded-full bg-[#F95F4A]/20">
          <AlertCircle className="w-4 h-4" />
        </div>
        <span className="text-sm">{meetError.message}</span>
      </div>
      <button
        onClick={onDismiss}
        className="acm-control-btn !w-8 !h-8 !bg-[#F95F4A]/10 !border-[#F95F4A]/30 !text-[#F95F4A]"
        title="Dismiss error"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
