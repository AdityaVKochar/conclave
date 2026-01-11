"use client";

import { RefreshCw, UserX } from "lucide-react";
import Image from "next/image";
import type { ConnectionState } from "../types";
import ConnectionIndicator from "./ConnectionIndicator";
import VideoSettings from "./video-settings";

interface MeetsHeaderProps {
  isJoined: boolean;
  isAdmin: boolean;
  roomId: string;
  isMirrorCamera: boolean;
  isVideoSettingsOpen: boolean;
  onToggleVideoSettings: () => void;
  onToggleMirror: () => void;
  isCameraOff: boolean;
  displayNameInput: string;
  displayNameStatus: { type: "success" | "error"; message: string } | null;
  isDisplayNameUpdating: boolean;
  canUpdateDisplayName: boolean;
  onDisplayNameInputChange: (value: string) => void;
  onDisplayNameSubmit: () => void;
  selectedAudioInputDeviceId?: string;
  selectedAudioOutputDeviceId?: string;
  onAudioInputDeviceChange: (deviceId: string) => void;
  onAudioOutputDeviceChange: (deviceId: string) => void;
  isScreenSharing: boolean;
  ghostEnabled: boolean;
  connectionState: ConnectionState;
}

export default function MeetsHeader({
  isJoined,
  isAdmin,
  roomId,
  isMirrorCamera,
  isVideoSettingsOpen,
  onToggleVideoSettings,
  onToggleMirror,
  isCameraOff,
  displayNameInput,
  displayNameStatus,
  isDisplayNameUpdating,
  canUpdateDisplayName,
  onDisplayNameInputChange,
  onDisplayNameSubmit,
  selectedAudioInputDeviceId,
  selectedAudioOutputDeviceId,
  onAudioInputDeviceChange,
  onAudioOutputDeviceChange,
  isScreenSharing,
  ghostEnabled,
  connectionState,
}: MeetsHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-[100] pointer-events-none">
      <div className="flex items-center justify-between px-4 py-3 pointer-events-auto">
        <a href="/" className="flex items-center">
          <Image
            src="/assets/acm_topleft.svg"
            alt="ACM Logo"
            width={128}
            height={128}
          />
        </a>

        {isJoined && (
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
            {isAdmin && (
              <span 
                className="text-[12px] text-[#FEFCD9]/50"
                style={{ fontFamily: "'PolySans Mono', monospace" }}
              >
                <span className="text-[#FEFCD9]/30">room</span>{" "}
                <span className="text-[#F95F4A]">{roomId}</span>
              </span>
            )}
            <VideoSettings
              isMirrorCamera={isMirrorCamera}
              isOpen={isVideoSettingsOpen}
              onToggleOpen={onToggleVideoSettings}
              onToggleMirror={onToggleMirror}
              isCameraOff={isCameraOff}
              isAdmin={isAdmin}
              displayNameInput={displayNameInput}
              displayNameStatus={displayNameStatus}
              isDisplayNameUpdating={isDisplayNameUpdating}
              canUpdateDisplayName={canUpdateDisplayName}
              onDisplayNameInputChange={onDisplayNameInputChange}
              onDisplayNameSubmit={onDisplayNameSubmit}
              selectedAudioInputDeviceId={selectedAudioInputDeviceId}
              selectedAudioOutputDeviceId={selectedAudioOutputDeviceId}
              onAudioInputDeviceChange={onAudioInputDeviceChange}
              onAudioOutputDeviceChange={onAudioOutputDeviceChange}
            />
          </div>
        )}

        <div className="flex items-center gap-4">
          {isScreenSharing && (
            <div className="flex items-center gap-1.5 text-[#F95F4A] text-[10px] uppercase tracking-wider" style={{ fontFamily: "'PolySans Mono', monospace" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#F95F4A] animate-pulse"></span>
              Sharing
            </div>
          )}
          {ghostEnabled && isJoined && (
            <div className="flex items-center gap-1.5 text-[#FF007A] text-[10px] uppercase tracking-wider" style={{ fontFamily: "'PolySans Mono', monospace" }}>
              <UserX className="w-3 h-3" />
              Ghost
            </div>
          )}
          {connectionState === "reconnecting" && (
            <div className="flex items-center gap-1.5 text-amber-400 text-[10px] uppercase tracking-wider" style={{ fontFamily: "'PolySans Mono', monospace" }}>
              <RefreshCw className="w-3 h-3 animate-spin" />
              Reconnecting
            </div>
          )}
          <div className="flex flex-col items-end">
            <span 
              className="text-sm text-[#FEFCD9]"
              style={{ fontFamily: "'PolySans Bulky Wide', sans-serif" }}
            >
              c0nclav3
            </span>
            <span 
              className="text-[9px] uppercase tracking-[0.15em] text-[#FEFCD9]/40"
              style={{ fontFamily: "'PolySans Mono', monospace" }}
            >
              by acm-vit
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
