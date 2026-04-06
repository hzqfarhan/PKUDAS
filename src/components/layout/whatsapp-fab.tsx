'use client';

import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

export function WhatsAppFAB() {
  const [mounted, setMounted] = useState(false);
  const whatsappUrl = process.env.NEXT_PUBLIC_DR_AMIN_WHATSAPP_URL;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Render a fallback or disabled state if URL is missing
  if (!whatsappUrl) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="fixed bottom-6 right-6 z-50 group">
          <div className="w-14 h-14 bg-muted text-white/50 rounded-full flex items-center justify-center shadow-lg border border-glass-border">
            <MessageCircle size={24} strokeWidth={2} />
          </div>
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 text-xs font-medium text-white bg-gray-600 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            WhatsApp URL not configured
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <a 
      href={whatsappUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 group hover:-translate-y-1 transition-transform duration-200"
      aria-label="Chat with Dr Amin on WhatsApp"
    >
      <div className="w-14 h-14 bg-success text-white rounded-full flex items-center justify-center shadow-lg border border-glass-border hover:shadow-xl transition-shadow">
        <MessageCircle size={28} strokeWidth={2} />
      </div>
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 text-xs font-medium text-white bg-primary rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Chat with Dr Amin on WhatsApp
      </div>
    </a>
  );
}
