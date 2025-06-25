
export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo?: string;
  league: string;
  form: number[]; // last 5 matches results (1=win, 0.5=draw, 0=loss)
  stats: TeamStats;
}

export interface TeamStats {
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  attackStrength: number;
  defenseStrength: number;
  eloRating: number;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  date: string;
  homeScore?: number;
  awayScore?: number;
  isFinished: boolean;
}

export interface PredictionResult {
  homeWinProbability: number;
  drawProbability: number;
  awayWinProbability: number;
  expectedGoals: {
    home: number;
    away: number;
  };
  confidence: number;
  algorithm: string;
  additionalMetrics?: {
    bothTeamsScore?: number;
    totalGoalsOver25?: number;
    correctScoreProbabilities?: { [score: string]: number };
  };
}

export interface AlgorithmConfig {
  id: string;
  name: string;
  description: string;
  accuracy: number;
  complexity: 'Low' | 'Medium' | 'High';
  speed: 'Fast' | 'Medium' | 'Slow';
}
