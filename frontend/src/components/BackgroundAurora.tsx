import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const BackgroundAurora: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 40,
        y: (e.clientY / window.innerHeight - 0.5) * 40,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="aurora-bg">
      {/* Dynamic Polychromatic Gradient Orbs */}
      <motion.div
        animate={{
          x: [0, 80, -60, 0],
          y: [0, -70, 50, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          transform: `translate(${mousePos.x * 1.2}px, ${mousePos.y * 1.2}px)`,
        }}
        className="aurora-orb w-[650px] h-[650px] bg-violet-600/25 top-[-15%] left-[5%]"
      />
      <motion.div
        animate={{
          x: [0, -90, 70, 0],
          y: [0, 60, -80, 0],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          transform: `translate(${mousePos.x * -1}px, ${mousePos.y * -1}px)`,
        }}
        className="aurora-orb w-[700px] h-[700px] bg-pink-500/20 top-[20%] right-[-10%]"
      />
      <motion.div
        animate={{
          x: [0, 70, -80, 0],
          y: [0, 80, -60, 0],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="aurora-orb w-[550px] h-[550px] bg-cyan-500/20 bottom-[-10%] left-[25%]"
      />
      <motion.div
        animate={{
          x: [0, -60, 50, 0],
          y: [0, -50, 60, 0],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
        className="aurora-orb w-[600px] h-[600px] bg-emerald-500/15 bottom-[15%] right-[15%]"
      />
      {/* Subtle overlay grid */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
          backgroundSize: '36px 36px'
        }}
      />
    </div>
  );
};
