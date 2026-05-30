import { motion, useReducedMotion } from 'framer-motion';
import type { SkillCat } from '../data/siteData';

interface Props { categories: SkillCat[] }

export default function SkillsGrid({ categories }: Props) {
  const reduce = useReducedMotion();
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {categories.map((cat, i) => (
        <motion.div
          key={cat.name}
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.4, delay: Math.min(i * 0.06, 0.4), ease: 'easeOut' }}
          className="rounded-2xl border border-line bg-white/[0.04] p-6 backdrop-blur-md transition-colors hover:border-primary/40"
        >
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-primary">
            // {cat.name}
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {cat.items.map((item) => (
              <li
                key={item}
                className="rounded-full border border-line bg-white/[0.03] px-3 py-1 font-mono text-xs text-muted transition-colors hover:border-primary/40 hover:text-text"
              >
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      ))}
    </div>
  );
}
