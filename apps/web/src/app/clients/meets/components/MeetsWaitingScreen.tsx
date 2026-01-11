"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";

interface MeetsWaitingScreenProps {
  waitingTitle: string;
  waitingIntro: string;
  roomId: string;
  isAdmin: boolean;
}

export default function MeetsWaitingScreen({
  waitingTitle,
  waitingIntro,
  roomId,
  isAdmin,
}: MeetsWaitingScreenProps) {
  return (
    <div className="relative flex flex-col h-full w-full bg-[#060606] items-center justify-center text-[#FEFCD9] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="acm-glow-ball absolute top-1/4 left-1/3 opacity-30" />
        <div className="acm-glow-ball acm-glow-ball-pink absolute bottom-1/4 right-1/3 opacity-20" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-6">
          <Image
            src="/assets/acm_topleft.svg"
            alt="ACM Logo"
            width={60}
            height={60}
            className="opacity-80"
          />
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-full bg-[#F95F4A] blur-3xl opacity-20 animate-pulse scale-150"></div>
          <Loader2 className="w-14 h-14 text-[#F95F4A] animate-spin relative z-10" />
        </div>
        
        <h2 
          className="text-4xl mb-4"
          style={{ fontFamily: "'PolySans Bulky Wide', sans-serif" }}
        >
          <span className="text-[#F95F4A]">{waitingTitle.split(' ')[0]}</span>{' '}
          <span className="text-[#FEFCD9]">{waitingTitle.split(' ').slice(1).join(' ')}</span>
        </h2>
        
        <p 
          className="text-[#FEFCD9]/50 text-center max-w-md px-6 leading-relaxed text-sm"
          style={{ fontFamily: "'PolySans Trial', sans-serif" }}
        >
          {waitingIntro} If you are facing issues, ask on the{" "}
          <a
            href="https://chat.whatsapp.com/Lj6GFN4bLggBJmQWBwUSTz"
            className="text-[#F95F4A] hover:text-[#FF007A] underline underline-offset-2 transition-colors"
            target="_blank"
            rel="noreferrer"
          >
            ACM Community WhatsApp
          </a>
          .
        </p>
        
        {isAdmin && (
          <div 
            className="mt-6 acm-pill px-5 py-2.5"
            style={{ fontFamily: "'PolySans Mono', monospace" }}
          >
            <span className="text-[#FEFCD9]/50 text-xs uppercase tracking-[0.1em] mr-2">Room</span>
            <span className="text-[#F95F4A] font-bold">{roomId}</span>
          </div>
        )}
        
        <div 
          className="mt-8 flex items-center gap-3 px-5 py-2.5 rounded-full border border-[#FEFCD9]/10 bg-black/30"
          style={{ fontFamily: "'PolySans Mono', monospace" }}
        >
          <div className="acm-live-indicator"></div>
          <span className="text-[#FEFCD9]/50 text-[11px] uppercase tracking-[0.15em]">Connecting to meeting</span>
        </div>
      </div>
    </div>
  );
}
