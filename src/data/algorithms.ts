
import { AlgorithmConfig } from '@/types/football';

export const algorithmConfigs: AlgorithmConfig[] = [
  {
    id: 'default',
    name: 'Default (Form + H2H)',
    description: 'Combines recent team form with head-to-head historical data',
    accuracy: 68.5,
    complexity: 'Medium',
    speed: 'Fast'
  },
  {
    id: 'attack-defense',
    name: 'Attack-Defense Analysis',
    description: 'Analyzes attacking strength vs defensive weakness',
    accuracy: 65.2,
    complexity: 'Low',
    speed: 'Fast'
  },
  {
    id: 'poisson',
    name: 'Poisson Distribution',
    description: 'Mathematical goal probability model using statistical distribution',
    accuracy: 71.3,
    complexity: 'High',
    speed: 'Medium'
  },
  {
    id: 'elo',
    name: 'ELO Rating System',
    description: 'Chess-adapted team strength rating system',
    accuracy: 69.8,
    complexity: 'Medium',
    speed: 'Fast'
  },
  {
    id: 'ensemble',
    name: 'ML Ensemble',
    description: 'Weighted combination of multiple prediction algorithms',
    accuracy: 73.1,
    complexity: 'High',
    speed: 'Slow'
  },
  {
    id: 'random-forest',
    name: 'Random Forest',
    description: 'Decision tree ensemble with feature importance analysis',
    accuracy: 72.4,
    complexity: 'High',
    speed: 'Slow'
  },
  {
    id: 'seasonal',
    name: 'Seasonal Trends',
    description: 'Recent form momentum and seasonal performance patterns',
    accuracy: 66.9,
    complexity: 'Medium',
    speed: 'Medium'
  }
];
