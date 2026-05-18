'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';

type FooterPageBackProps = {
  className?: string;
  /** When true, shows a “Home” link next to the back control */
  showHomeLink?: boolean;
};

export default function FooterPageBack({ className = '', showHomeLink = false }: FooterPageBackProps) {
  const router = useRouter();

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
        aria-label="Go back"
      >
        <span className="w-8 h-8 rounded-full bg-gradient-to-r from-[#B630F4] to-[#2ACCED] flex items-center justify-center">
          <FaArrowLeft className="text-black text-sm" />
        </span>
        <span className="text-sm font-medium">Back</span>
      </button>
      {showHomeLink && (
        <Link
          href="/"
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Home
        </Link>
      )}
    </div>
  );
}
