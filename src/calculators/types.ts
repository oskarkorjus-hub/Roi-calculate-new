import type { ComponentType } from 'react';

export interface CalculatorConfig {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: string; // Material Symbols icon name
  color: 'green' | 'indigo' | 'orange' | 'cyan' | 'purple' | 'rose';
  component: ComponentType;
  tags: string[];
}

export type CalculatorId = 'xirr' | 'rental-roi' | 'flip-analysis' | 'mortgage' | 'cashflow';
