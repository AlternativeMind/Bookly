'use client'

import { motion } from 'framer-motion'
import clsx from 'clsx'

interface ExamplesViewProps {
  onSelectExample: (prompt: string) => void
}

interface ExampleCard {
  category: string
  prompt: string
  color: 'primary' | 'secondary'
}

const EXAMPLES: ExampleCard[] = [
  // Discovery
  { category: 'Discovery', prompt: 'Find me a mystery novel for teens with a strong female lead', color: 'primary' },
  { category: 'Discovery', prompt: 'What are the best books for reluctant readers aged 8-10?', color: 'primary' },
  { category: 'Discovery', prompt: 'Recommend a series similar to the Diary of a Wimpy Kid', color: 'primary' },
  // Research
  { category: 'Research', prompt: 'What books won awards in 2023?', color: 'secondary' },
  { category: 'Research', prompt: 'Compare the themes in Harry Potter and Percy Jackson', color: 'secondary' },
  { category: 'Research', prompt: 'What are the most reviewed books in the fantasy genre?', color: 'secondary' },
  // Context
  { category: 'Context', prompt: 'What grade level is Dog Man appropriate for?', color: 'primary' },
  { category: 'Context', prompt: 'Tell me about the author of Captain Underpants', color: 'primary' },
  { category: 'Context', prompt: 'What books do you carry for early readers?', color: 'primary' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 240, damping: 22 } },
}

export default function ExamplesView({ onSelectExample }: ExamplesViewProps) {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide">
      <div className="max-w-4xl mx-auto p-8 md:p-12">
        <div className="mb-10">
          <h2 className="font-headline text-3xl font-black text-on-surface mb-2">
            Example Prompts
          </h2>
          <p className="font-body text-on-surface-variant text-sm">
            Click any prompt to send it directly to the AI Scholar. Explore the breadth of The Archive.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {EXAMPLES.map((card) => (
            <motion.button
              key={card.prompt}
              onClick={() => onSelectExample(card.prompt)}
              className="group text-left p-5 rounded-xl bg-surface-container-high transition-all"
              style={{ border: '1px solid rgba(72,72,71,0.10)' }}
              variants={cardVariants}
              whileHover={{
                y: -2,
                backgroundColor: '#262626',
              }}
              whileTap={{ scale: 0.98 }}
            >
              <p
                className={clsx(
                  'text-[10px] font-body font-semibold uppercase tracking-widest mb-3',
                  card.color === 'primary' ? 'text-primary' : 'text-secondary'
                )}
              >
                {card.category}
              </p>
              <p className="font-body text-on-surface text-sm leading-relaxed group-hover:text-white transition-colors">
                {card.prompt}
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-on-surface-variant group-hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                <span className="font-body text-[11px] tracking-wide">Ask the Archive</span>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
