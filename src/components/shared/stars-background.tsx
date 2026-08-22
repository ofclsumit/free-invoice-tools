"use client";

import * as React from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  type SpringOptions,
  type Transition,
} from 'framer-motion';

import { cn } from '@/lib/utils';

type StarLayerProps = React.ComponentPropsWithoutRef<typeof motion.div> & {
  count: number;
  size: number;
  transition: Transition;
  starColor: string;
};

function generateStars(count: number, starColor: string) {
  const shadows: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * 4000) - 2000;
    const y = Math.floor(Math.random() * 4000) - 2000;
    shadows.push(`${x}px ${y}px ${starColor}`);
  }
  return shadows.join(', ');
}

function StarLayer({
  count = 1000,
  size = 1,
  transition = { repeat: Infinity, duration: 50, ease: 'linear' },
  starColor = '#fff',
  className,
  ...props
}: StarLayerProps) {
  const [boxShadow, setBoxShadow] = React.useState<string>('');

  React.useEffect(() => {
    setBoxShadow(generateStars(count, starColor));
  }, [count, starColor]);

  return (
    <motion.div
      data-slot="star-layer"
      animate={{ y: [0, -2000] }}
      transition={transition}
      className={cn('absolute top-0 left-0 w-full h-[2000px]', className)}
      {...props}
    >
      <div
        className="absolute bg-transparent rounded-full"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          boxShadow: boxShadow,
        }}
      />
      <div
        className="absolute bg-transparent rounded-full top-[2000px]"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          boxShadow: boxShadow,
        }}
      />
    </motion.div>
  );
}

export type StarsBackgroundProps = React.ComponentProps<'div'> & {
  factor?: number;
  speed?: number;
  transition?: SpringOptions;
  starColor?: string;
  pointerEvents?: boolean;
};

export function StarsBackground({
  children,
  className,
  factor = 0.05,
  speed = 50,
  transition = { stiffness: 50, damping: 20 },
  starColor = 'rgba(255, 255, 255, 0.8)',
  pointerEvents = true,
  ...props
}: StarsBackgroundProps) {
  const offsetX = useMotionValue(1);
  const offsetY = useMotionValue(1);

  const springX = useSpring(offsetX, transition);
  const springY = useSpring(offsetY, transition);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const newOffsetX = -(e.clientX - centerX) * factor;
      const newOffsetY = -(e.clientY - centerY) * factor;
      offsetX.set(newOffsetX);
      offsetY.set(newOffsetY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [offsetX, offsetY, factor]);

  return (
    <div
      data-slot="stars-background"
      className={cn(
        'relative w-full min-h-screen overflow-hidden bg-[#F8FAFC] dark:bg-[radial-gradient(ellipse_at_bottom,_#0d0a1b_0%,_#030014_100%)] transition-colors duration-300',
        className,
      )}
      {...props}
    >
      {/* Stars layer is hidden entirely in light mode (hidden dark:block) to optimize CPU/GPU cycles */}
      <motion.div
        style={{ x: springX, y: springY }}
        className={cn('absolute inset-0 hidden dark:block', { 'pointer-events-none': !pointerEvents })}
      >
        <StarLayer
          count={800}
          size={1}
          transition={{ repeat: Infinity, duration: speed, ease: 'linear' }}
          starColor={starColor}
        />
        <StarLayer
          count={300}
          size={1.5}
          transition={{
            repeat: Infinity,
            duration: speed * 1.5,
            ease: 'linear',
          }}
          starColor={starColor}
        />
        <StarLayer
          count={100}
          size={2}
          transition={{
            repeat: Infinity,
            duration: speed * 2.5,
            ease: 'linear',
          }}
          starColor={starColor}
        />
      </motion.div>
      <div className="relative z-10 w-full min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
}
