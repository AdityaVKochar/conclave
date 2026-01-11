"use client";

import { UserCheck, X } from "lucide-react";

interface AdminTipsOverlayProps {
  currentStep: number;
  onNextStep: () => void;
  onSkip: () => void;
  onClose: () => void;
}

export default function AdminTipsOverlay({
  onSkip,
  onClose,
}: AdminTipsOverlayProps) {
  return (
    <div 
      className="fixed bottom-28 right-4 z-40 animate-in slide-in-from-right-full duration-300"
      style={{ fontFamily: "'PolySans Trial', sans-serif" }}
    >
      <div className="acm-card-featured p-4 max-w-xs">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-[#F95F4A]/20">
              <UserCheck className="w-4 h-4 text-[#F95F4A]" />
            </div>
            <span 
              className="text-xs text-[#FEFCD9] uppercase tracking-[0.1em]"
              style={{ fontFamily: "'PolySans Bold', sans-serif" }}
            >
              New Participant
            </span>
          </div>
          <button
            onClick={onClose}
            className="acm-control-btn !w-6 !h-6"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        <p className="text-sm text-[#FEFCD9]/60 mb-4 leading-relaxed">
          Click their video to verify attendance
        </p>

        <button
          onClick={onSkip}
          className="text-[11px] text-[#FEFCD9]/40 hover:text-[#F95F4A] transition-colors uppercase tracking-[0.1em]"
          style={{ fontFamily: "'PolySans Mono', monospace" }}
        >
          Don&apos;t show again
        </button>
      </div>
    </div>
  );
}
