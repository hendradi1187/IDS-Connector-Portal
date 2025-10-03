'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AnimatedLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showAnimation?: boolean;
}

const sizeClasses = {
  sm: 'h-16',
  md: 'h-24',
  lg: 'h-32',
  xl: 'h-40',
};

export function AnimatedLogo({
  className,
  size = 'lg',
  showAnimation = true
}: AnimatedLogoProps) {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        showAnimation && 'animate-fade-in',
        className
      )}
    >
      <div
        className={cn(
          'relative',
          sizeClasses[size],
          showAnimation && 'animate-pulse-glow'
        )}
      >
        <Image
          src="/logo-rapidsk.png"
          alt="RapIDSK - Data Space Konektor"
          width={400}
          height={150}
          priority
          className={cn(
            'h-full w-auto object-contain transition-all duration-300',
            'hover:scale-105 hover:drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]',
            'cursor-pointer'
          )}
        />
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            filter: drop-shadow(0 0 8px rgba(6, 182, 212, 0.3));
          }
          50% {
            filter: drop-shadow(0 0 16px rgba(6, 182, 212, 0.5));
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
