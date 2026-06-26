'use client';

import { motion } from 'framer-motion';

interface GoldDoodleLoaderProps {
  className?: string;
  text?: string;
}

export default function GoldDoodleLoader({ className = '', text = 'Mengukir Karya...' }: GoldDoodleLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg 
        width="64" 
        height="64" 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]"
      >
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#BF953F" />
            <stop offset="25%" stopColor="#FCF6BA" />
            <stop offset="50%" stopColor="#B38728" />
            <stop offset="75%" stopColor="#FBF5B7" />
            <stop offset="100%" stopColor="#AA771C" />
          </linearGradient>
          
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Artistic Scribble / Doodle Path */}
        <motion.path
          d="M20 60 C 10 30, 40 10, 50 40 C 60 70, 90 80, 80 40 C 70 0, 30 20, 40 60 C 50 100, 80 70, 70 50 C 60 30, 30 40, 20 60 Z"
          stroke="url(#goldGradient)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
          initial={{ pathLength: 0, opacity: 0.3 }}
          animate={{ 
            pathLength: [0, 1, 1, 0],
            opacity: [0.3, 1, 1, 0.3]
          }}
          transition={{ 
            duration: 4,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />

        {/* Small floating sparkles */}
        <motion.circle
          cx="25" cy="25" r="1.5" fill="#FCF6BA"
          animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        />
        <motion.circle
          cx="75" cy="35" r="2" fill="#FCF6BA"
          animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
        />
        <motion.circle
          cx="45" cy="75" r="1" fill="#FCF6BA"
          animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 1.5 }}
        />
      </svg>
      
      {text && (
        <motion.span 
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
          className="mt-4 text-[10px] font-bold tracking-[0.3em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#AA771C]"
        >
          {text}
        </motion.span>
      )}
    </div>
  );
}
