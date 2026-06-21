import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1117]">
      <div className="text-center max-w-md px-4">
        <h1 className="text-6xl font-bold text-[#22c55e] mb-4">404</h1>
        <h2 className="text-xl font-semibold text-[#c9d1d9] mb-2">Page Not Found</h2>
        <p className="text-[#8b949e] mb-6">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#22c55e' }}
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
