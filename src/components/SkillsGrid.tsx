import { motion, useReducedMotion } from 'framer-motion';
import type { Skill } from '../data/siteData';

interface Props { skills: Skill[] }

export default function SkillsGrid({ skills }: Props) {
  const reduce = useReducedMotion();
  return (
    <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6">
      {skills.map((skill, i) => (
        <motion.li
          key={skill.name}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.4), ease: 'easeOut' }}
          className={[
            'group flex aspect-square items-center justify-center rounded-xl border text-center font-mono text-xs transition-colors',
            skill.level === 'core'
              ? 'border-primary/30 bg-gradient-to-br from-primary/15 to-accent/10 text-text'
              : 'border-line bg-white/[0.03] text-muted hover:border-primary/40 hover:text-text',
          ].join(' ')}
          title={`${skill.name} · ${skill.level}`}
        >
          <motion.span whileHover={reduce ? undefined : { scale: 1.08 }} className="px-1">
            {skill.name}
          </motion.span>
        </motion.li>
      ))}
    </ul>
  );
}
