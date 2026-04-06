import { WifiOff } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
          <WifiOff size={40} color="white" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">You&apos;re offline</h1>
        <p className="text-muted-foreground mb-6">
          e-Dent requires an internet connection to book appointments and view real-time availability.
          Please check your connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
        <p className="mt-4 text-xs text-muted-foreground">
          For emergencies, please call the PKU UTHM clinic directly.
        </p>
      </div>
    </div>
  );
}
