import { Zap } from "lucide-react";

export function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 text-primary mx-auto mb-4">
          <Zap className="h-full w-full" />
        </div>
        <p className="text-gray-600 text-sm">
          Gukusanya SafeAlert Rwanda...
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Loading Emergency Response Platform...
        </p>
      </div>
    </div>
  );
}
