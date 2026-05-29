import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

interface Props {
  roles: string[];
  className?: string;
}

export default function RotatingRole({ roles, className }: Props) {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || roles.length < 2) return;
    const id = setInterval(() => setI((p) => (p + 1) % roles.length), 2400);
    return () => clearInterval(id);
  }, [reduce, roles.length]);

  if (reduce) return <span className={className}>{roles[0]}</span>;

  return (
    <span className={className} style={{ display: 'inline-block', position: 'relative' }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={roles[i]}
          initial={{ opacity: 0, y: '0.4em' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '-0.4em' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{ display: 'inline-block' }}
        >
          {roles[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
