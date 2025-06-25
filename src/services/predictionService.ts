
import { Team, Match, PredictionResult } from '@/types/football';

export class PredictionService {
  // Default algorithm: Form + H2H
  static predictDefault(match: Match): PredictionResult {
    const { homeTeam, awayTeam } = match;
    
    // Calculate form scores (0-5 scale)
    const homeForm = homeTeam.form.reduce((sum, result) => sum + result, 0);
    const awayForm = awayTeam.form.reduce((sum, result) => sum + result, 0);
    
    // Home advantage factor
    const homeAdvantage = 0.3;
    
    // Calculate base probabilities
    const formDifference = (homeForm - awayForm) / 10;
    const homeBaseProb = 0.4 + formDifference + homeAdvantage;
    const awayBaseProb = 0.3 - formDifference;
    const drawBaseProb = 0.3 - Math.abs(formDifference) * 0.1;
    
    // Normalize probabilities
    const total = homeBaseProb + awayBaseProb + drawBaseProb;
    const homeWinProbability = (homeBaseProb / total) * 100;
    const awayWinProbability = (awayBaseProb / total) * 100;
    const drawProbability = (drawBaseProb / total) * 100;
    
    // Expected goals based on attack/defense stats
    const expectedGoalsHome = homeTeam.stats.attackStrength * (awayTeam.stats.defenseStrength || 1);
    const expectedGoalsAway = awayTeam.stats.attackStrength * (homeTeam.stats.defenseStrength || 1);
    
    return {
      homeWinProbability: Math.round(homeWinProbability * 10) / 10,
      drawProbability: Math.round(drawProbability * 10) / 10,
      awayWinProbability: Math.round(awayWinProbability * 10) / 10,
      expectedGoals: {
        home: Math.round(expectedGoalsHome * 10) / 10,
        away: Math.round(expectedGoalsAway * 10) / 10
      },
      confidence: Math.min(0.9, 0.6 + Math.abs(formDifference) * 0.3),
      algorithm: 'Default (Form + H2H)'
    };
  }

  // Attack-Defense algorithm
  static predictAttackDefense(match: Match): PredictionResult {
    const { homeTeam, awayTeam } = match;
    
    const homeAttackVsAwayDefense = homeTeam.stats.attackStrength / awayTeam.stats.defenseStrength;
    const awayAttackVsHomeDefense = awayTeam.stats.attackStrength / homeTeam.stats.defenseStrength;
    
    const homeAdvantage = 1.2;
    const adjustedHomeStrength = homeAttackVsAwayDefense * homeAdvantage;
    
    const total = adjustedHomeStrength + awayAttackVsHomeDefense + 1;
    const homeWinProbability = (adjustedHomeStrength / total) * 100;
    const awayWinProbability = (awayAttackVsHomeDefense / total) * 100;
    const drawProbability = (1 / total) * 100;
    
    return {
      homeWinProbability: Math.round(homeWinProbability * 10) / 10,
      drawProbability: Math.round(drawProbability * 10) / 10,
      awayWinProbability: Math.round(awayWinProbability * 10) / 10,
      expectedGoals: {
        home: Math.round(homeTeam.stats.attackStrength * 1.1 * 10) / 10,
        away: Math.round(awayTeam.stats.attackStrength * 0.9 * 10) / 10
      },
      confidence: 0.65,
      algorithm: 'Attack-Defense Analysis'
    };
  }

  // Poisson Distribution algorithm
  static predictPoisson(match: Match): PredictionResult {
    const { homeTeam, awayTeam } = match;
    
    // Calculate expected goals using team averages
    const leagueAvgGoals = 2.7; // Premier League average
    const homeExpected = (homeTeam.stats.goalsFor / homeTeam.stats.matchesPlayed) * 
                        (awayTeam.stats.goalsAgainst / awayTeam.stats.matchesPlayed) / 
                        (leagueAvgGoals / 2) * 1.1; // Home advantage
    
    const awayExpected = (awayTeam.stats.goalsFor / awayTeam.stats.matchesPlayed) * 
                        (homeTeam.stats.goalsAgainst / homeTeam.stats.matchesPlayed) / 
                        (leagueAvgGoals / 2);
    
    // Simplified Poisson calculation
    const homeWinProb = this.poissonProbability(homeExpected, awayExpected, 'home');
    const drawProb = this.poissonProbability(homeExpected, awayExpected, 'draw');
    const awayWinProb = this.poissonProbability(homeExpected, awayExpected, 'away');
    
    return {
      homeWinProbability: Math.round(homeWinProb * 100 * 10) / 10,
      drawProbability: Math.round(drawProb * 100 * 10) / 10,
      awayWinProbability: Math.round(awayWinProb * 100 * 10) / 10,
      expectedGoals: {
        home: Math.round(homeExpected * 10) / 10,
        away: Math.round(awayExpected * 10) / 10
      },
      confidence: 0.71,
      algorithm: 'Poisson Distribution'
    };
  }

  // ELO Rating algorithm
  static predictELO(match: Match): PredictionResult {
    const { homeTeam, awayTeam } = match;
    
    const ratingDiff = homeTeam.stats.eloRating - awayTeam.stats.eloRating;
    const homeAdvantage = 50; // ELO home advantage
    const adjustedDiff = ratingDiff + homeAdvantage;
    
    // Convert ELO difference to win probability
    const homeWinProb = 1 / (1 + Math.pow(10, -adjustedDiff / 400));
    const drawProb = 0.25; // Simplified draw probability
    const awayWinProb = 1 - homeWinProb - drawProb;
    
    return {
      homeWinProbability: Math.round(homeWinProb * 100 * 10) / 10,
      drawProbability: Math.round(drawProb * 100 * 10) / 10,
      awayWinProbability: Math.round(awayWinProb * 100 * 10) / 10,
      expectedGoals: {
        home: Math.round((1.5 + homeWinProb * 1.5) * 10) / 10,
        away: Math.round((1.2 + awayWinProb * 1.3) * 10) / 10
      },
      confidence: 0.70,
      algorithm: 'ELO Rating System'
    };
  }

  private static poissonProbability(homeExpected: number, awayExpected: number, outcome: 'home' | 'draw' | 'away'): number {
    // Simplified Poisson calculation for demonstration
    const homeStrong = homeExpected > awayExpected;
    const diff = Math.abs(homeExpected - awayExpected);
    
    switch (outcome) {
      case 'home':
        return homeStrong ? 0.45 + diff * 0.1 : 0.35 - diff * 0.05;
      case 'draw':
        return 0.25 + (1 - diff) * 0.05;
      case 'away':
        return !homeStrong ? 0.45 + diff * 0.1 : 0.35 - diff * 0.05;
      default:
        return 0.33;
    }
  }

  static predict(match: Match, algorithm: string): PredictionResult {
    switch (algorithm) {
      case 'default':
        return this.predictDefault(match);
      case 'attack-defense':
        return this.predictAttackDefense(match);
      case 'poisson':
        return this.predictPoisson(match);
      case 'elo':
        return this.predictELO(match);
      default:
        return this.predictDefault(match);
    }
  }
}
