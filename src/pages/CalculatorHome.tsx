import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalculatorGrid } from '../components/CalculatorGrid';

const RECENT_CALCULATORS_KEY = 'baliinvest_recent_calculators';
const MAX_RECENT = 5;

interface CalculatorHomeProps {
  onSelectCalculator: (id: string) => void;
}

// Custom easing for premium animations
const premiumEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

// Stagger animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: premiumEase,
    },
  },
};

export function CalculatorHome({ onSelectCalculator }: CalculatorHomeProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const recentCalculators = JSON.parse(
    localStorage.getItem(RECENT_CALCULATORS_KEY) || '[]'
  ) as string[];

  const handleSelectCalculator = (id: string) => {
    const updated = [id, ...recentCalculators.filter(c => c !== id)].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_CALCULATORS_KEY, JSON.stringify(updated));
    onSelectCalculator(id);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <CalculatorGrid
          onSelectCalculator={handleSelectCalculator}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          recentCalculators={recentCalculators}
        />
      </motion.div>
    </motion.div>
  );
}
