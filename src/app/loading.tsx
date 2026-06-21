import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d1117' }}>
      <Loader2 size={28} className="text-[#22c55e] animate-spin" />
    </div>
  );
}
