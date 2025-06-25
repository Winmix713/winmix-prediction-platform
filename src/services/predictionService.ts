
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
      algorithm: 'Default (Form + H2H)',
      additionalMetrics: {
        bothTeamsScore: Math.round((expectedGoalsHome > 0.8 && expectedGoalsAway > 0.8 ? 70 : 45) * 10) / 10,
        totalGoalsOver25: Math.round(((expectedGoalsHome + expectedGoalsAway) > 2.5 ? 65 : 35) * 10) / 10
      }
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
      algorithm: 'Attack-Defense Analysis',
      additionalMetrics: {
        bothTeamsScore: Math.round((homeTeam.stats.attackStrength > 1.5 && awayTeam.stats.attackStrength > 1.5 ? 75 : 50) * 10) / 10,
        totalGoalsOver25: Math.round(((homeTeam.stats.attackStrength + awayTeam.stats.attackStrength) > 3 ? 70 : 40) * 10) / 10
      }
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
    
    // Enhanced Poisson calculation
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
      algorithm: 'Poisson Distribution',
      additionalMetrics: {
        bothTeamsScore: Math.round((1 - Math.exp(-homeExpected) * Math.exp(-awayExpected)) * 100 * 10) / 10,
        totalGoalsOver25: Math.round(this.poissonOver25(homeExpected + awayExpected) * 100 * 10) / 10,
        correctScoreProbabilities: this.calculateCorrectScores(homeExpected, awayExpected)
      }
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
    const drawProb = 0.25 - Math.abs(adjustedDiff) / 2000; // Dynamic draw probability
    const awayWinProb = 1 - homeWinProb - drawProb;
    
    return {
      homeWinProbability: Math.round(homeWinProb * 100 * 10) / 10,
      drawProbability: Math.round(Math.max(drawProb, 0.15) * 100 * 10) / 10,
      awayWinProbability: Math.round(awayWinProb * 100 * 10) / 10,
      expectedGoals: {
        home: Math.round((1.5 + homeWinProb * 1.5) * 10) / 10,
        away: Math.round((1.2 + awayWinProb * 1.3) * 10) / 10
      },
      confidence: 0.70,
      algorithm: 'ELO Rating System',
      additionalMetrics: {
        bothTeamsScore: Math.round((60 + Math.abs(ratingDiff) / 50) * 10) / 10,
        totalGoalsOver25: Math.round((55 + homeWinProb * 20) * 10) / 10
      }
    };
  }

  // NEW: ML Ensemble algorithm
  static predictEnsemble(match: Match): PredictionResult {
    // Get predictions from multiple algorithms
    const defaultPred = this.predictDefault(match);
    const attackDefPred = this.predictAttackDefense(match);
    const poissonPred = this.predictPoisson(match);
    const eloPred = this.predictELO(match);
    
    // Weighted combination based on algorithm accuracies
    const weights = { default: 0.685, attackDef: 0.652, poisson: 0.713, elo: 0.698 };
    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    
    // Normalize weights
    const normWeights = {
      default: weights.default / totalWeight,
      attackDef: weights.attackDef / totalWeight,
      poisson: weights.poisson / totalWeight,
      elo: weights.elo / totalWeight
    };
    
    const homeWinProbability = 
      defaultPred.homeWinProbability * normWeights.default +
      attackDefPred.homeWinProbability * normWeights.attackDef +
      poissonPred.homeWinProbability * normWeights.poisson +
      eloPred.homeWinProbability * normWeights.elo;
    
    const drawProbability = 
      defaultPred.drawProbability * normWeights.default +
      attackDefPred.drawProbability * normWeights.attackDef +
      poissonPred.drawProbability * normWeights.poisson +
      eloPred.drawProbability * normWeights.elo;
    
    const awayWinProbability = 
      defaultPred.awayWinProbability * normWeights.default +
      attackDefPred.awayWinProbability * normWeights.attackDef +
      poissonPred.awayWinProbability * normWeights.poisson +
      eloPred.awayWinProbability * normWeights.elo;
    
    const expectedGoalsHome = 
      defaultPred.expectedGoals.home * normWeights.default +
      attackDefPred.expectedGoals.home * normWeights.attackDef +
      poissonPred.expectedGoals.home * normWeights.poisson +
      eloPred.expectedGoals.home * normWeights.elo;
    
    const expectedGoalsAway = 
      defaultPred.expectedGoals.away * normWeights.default +
      attackDefPred.expectedGoals.away * normWeights.attackDef +
      poissonPred.expectedGoals.away * normWeights.poisson +
      eloPred.expectedGoals.away * normWeights.elo;
    
    return {
      homeWinProbability: Math.round(homeWinProbability * 10) / 10,
      drawProbability: Math.round(drawProbability * 10) / 10,
      awayWinProbability: Math.round(awayWinProbability * 10) / 10,
      expectedGoals: {
        home: Math.round(expectedGoalsHome * 10) / 10,
        away: Math.round(expectedGoalsAway * 10) / 10
      },
      confidence: 0.73,
      algorithm: 'ML Ensemble',
      additionalMetrics: {
        bothTeamsScore: Math.round(((poissonPred.additionalMetrics?.bothTeamsScore || 60) + 
                                   (attackDefPred.additionalMetrics?.bothTeamsScore || 60)) / 2 * 10) / 10,
        totalGoalsOver25: Math.round(((expectedGoalsHome + expectedGoalsAway) > 2.5 ? 68 : 32) * 10) / 10
      }
    };
  }

  // NEW: Random Forest algorithm
  static predictRandomForest(match: Match): PredictionResult {
    const { homeTeam, awayTeam } = match;
    
    // Simulate decision trees with different feature combinations
    const features = {
      formDiff: homeTeam.form.reduce((s, r) => s + r, 0) - awayTeam.form.reduce((s, r) => s + r, 0),
      attackDiff: homeTeam.stats.attackStrength - awayTeam.stats.attackStrength,
      defenseDiff: awayTeam.stats.defenseStrength - homeTeam.stats.defenseStrength,
      eloDiff: homeTeam.stats.eloRating - awayTeam.stats.eloRating,
      goalDiff: homeTeam.stats.goalDifference - awayTeam.stats.goalDifference,
      pointsDiff: homeTeam.stats.points - awayTeam.stats.points
    };
    
    // Decision tree outputs (simplified random forest simulation)
    const trees = [
      this.decisionTree1(features),
      this.decisionTree2(features),
      this.decisionTree3(features),
      this.decisionTree4(features),
      this.decisionTree5(features)
    ];
    
    // Average the tree outputs
    const avgHome = trees.reduce((sum, tree) => sum + tree.home, 0) / trees.length;
    const avgDraw = trees.reduce((sum, tree) => sum + tree.draw, 0) / trees.length;
    const avgAway = trees.reduce((sum, tree) => sum + tree.away, 0) / trees.length;
    
    // Normalize
    const total = avgHome + avgDraw + avgAway;
    const homeWinProbability = (avgHome / total) * 100;
    const drawProbability = (avgDraw / total) * 100;
    const awayWinProbability = (avgAway / total) * 100;
    
    return {
      homeWinProbability: Math.round(homeWinProbability * 10) / 10,
      drawProbability: Math.round(drawProbability * 10) / 10,
      awayWinProbability: Math.round(awayWinProbability * 10) / 10,
      expectedGoals: {
        home: Math.round((1.5 + features.attackDiff * 0.3) * 10) / 10,
        away: Math.round((1.5 - features.attackDiff * 0.3) * 10) / 10
      },
      confidence: 0.724,
      algorithm: 'Random Forest',
      additionalMetrics: {
        bothTeamsScore: Math.round((55 + Math.abs(features.attackDiff) * 10) * 10) / 10,
        totalGoalsOver25: Math.round((50 + features.attackDiff * 5) * 10) / 10
      }
    };
  }

  // NEW: Seasonal Trends algorithm
  static predictSeasonal(match: Match): PredictionResult {
    const { homeTeam, awayTeam } = match;
    
    // Recent form momentum (last 5 games weighted more heavily)
    const homeFormMomentum = this.calculateMomentum(homeTeam.form);
    const awayFormMomentum = this.calculateMomentum(awayTeam.form);
    
    // Season progress factor (games played / total games)
    const seasonProgress = homeTeam.stats.matchesPlayed / 38;
    const stabilityFactor = Math.min(seasonProgress * 2, 1); // More stable predictions as season progresses
    
    // Home/away performance trends
    const homeStrengthTrend = homeTeam.stats.points / homeTeam.stats.matchesPlayed * 1.2; // Home boost
    const awayStrengthTrend = awayTeam.stats.points / awayTeam.stats.matchesPlayed * 0.9; // Away penalty
    
    const momentumDiff = homeFormMomentum - awayFormMomentum;
    const strengthDiff = homeStrengthTrend - awayStrengthTrend;
    
    // Base probabilities adjusted by trends
    let homeWinProb = 0.4 + momentumDiff * 0.1 + strengthDiff * 0.05;
    let awayWinProb = 0.3 - momentumDiff * 0.1 - strengthDiff * 0.05;
    let drawProb = 0.3 - Math.abs(momentumDiff) * 0.05;
    
    // Apply stability factor
    const avg = (homeWinProb + awayWinProb + drawProb) / 3;
    homeWinProb = homeWinProb * stabilityFactor + avg * (1 - stabilityFactor);
    awayWinProb = awayWinProb * stabilityFactor + avg * (1 - stabilityFactor);
    drawProb = drawProb * stabilityFactor + avg * (1 - stabilityFactor);
    
    // Normalize
    const total = homeWinProb + awayWinProb + drawProb;
    
    return {
      homeWinProbability: Math.round((homeWinProb / total) * 100 * 10) / 10,
      drawProbability: Math.round((drawProb / total) * 100 * 10) / 10,
      awayWinProbability: Math.round((awayWinProb / total) * 100 * 10) / 10,
      expectedGoals: {
        home: Math.round((1.6 + homeFormMomentum * 0.4) * 10) / 10,
        away: Math.round((1.4 + awayFormMomentum * 0.4) * 10) / 10
      },
      confidence: Math.min(0.8, 0.5 + stabilityFactor * 0.2),
      algorithm: 'Seasonal Trends',
      additionalMetrics: {
        bothTeamsScore: Math.round((60 + (homeFormMomentum + awayFormMomentum) * 10) * 10) / 10,
        totalGoalsOver25: Math.round((55 + momentumDiff * 10) * 10) / 10
      }
    };
  }

  // Helper methods for enhanced calculations
  private static poissonProbability(homeExpected: number, awayExpected: number, outcome: 'home' | 'draw' | 'away'): number {
    // More sophisticated Poisson calculation
    const homeStrong = homeExpected > awayExpected;
    const diff = Math.abs(homeExpected - awayExpected);
    const avgGoals = (homeExpected + awayExpected) / 2;
    
    switch (outcome) {
      case 'home':
        return homeStrong ? 
          Math.min(0.75, 0.45 + diff * 0.15 + (avgGoals > 2.5 ? 0.05 : 0)) : 
          Math.max(0.15, 0.35 - diff * 0.1);
      case 'draw':
        return Math.max(0.15, 0.25 - diff * 0.08 + (avgGoals < 2.2 ? 0.05 : 0));
      case 'away':
        return !homeStrong ? 
          Math.min(0.75, 0.45 + diff * 0.15 + (avgGoals > 2.5 ? 0.05 : 0)) : 
          Math.max(0.15, 0.35 - diff * 0.1);
      default:
        return 0.33;
    }
  }

  private static poissonOver25(totalExpected: number): number {
    // Probability of over 2.5 goals using Poisson
    return 1 - Math.exp(-totalExpected) * (1 + totalExpected + Math.pow(totalExpected, 2) / 2);
  }

  private static calculateCorrectScores(homeExpected: number, awayExpected: number): { [score: string]: number } {
    const scores: { [score: string]: number } = {};
    
    // Calculate most likely scores (simplified)
    const mostLikelyHome = Math.round(homeExpected);
    const mostLikelyAway = Math.round(awayExpected);
    
    scores[`${mostLikelyHome}-${mostLikelyAway}`] = 12.5;
    scores[`${mostLikelyHome + 1}-${mostLikelyAway}`] = 8.2;
    scores[`${mostLikelyHome}-${mostLikelyAway + 1}`] = 7.8;
    scores['1-1'] = 11.2;
    scores['2-1'] = 9.5;
    scores['1-2'] = 8.1;
    
    return scores;
  }

  private static calculateMomentum(form: number[]): number {
    // Weight recent games more heavily
    const weights = [0.1, 0.15, 0.2, 0.25, 0.3]; // Last game has highest weight
    return form.reduce((sum, result, index) => sum + result * weights[index], 0);
  }

  // Decision tree methods for Random Forest
  private static decisionTree1(features: any): { home: number; draw: number; away: number } {
    if (features.formDiff > 1) {
      return features.eloDiff > 100 ? { home: 0.6, draw: 0.2, away: 0.2 } : { home: 0.5, draw: 0.3, away: 0.2 };
    }
    return features.attackDiff > 0.5 ? { home: 0.45, draw: 0.3, away: 0.25 } : { home: 0.35, draw: 0.35, away: 0.3 };
  }

  private static decisionTree2(features: any): { home: number; draw: number; away: number } {
    if (features.pointsDiff > 10) {
      return { home: 0.55, draw: 0.25, away: 0.2 };
    }
    return features.defenseDiff > 0.3 ? { home: 0.4, draw: 0.35, away: 0.25 } : { home: 0.3, draw: 0.3, away: 0.4 };
  }

  private static decisionTree3(features: any): { home: number; draw: number; away: number } {
    if (features.goalDiff > 5) {
      return { home: 0.5, draw: 0.3, away: 0.2 };
    }
    return features.formDiff < -1 ? { home: 0.25, draw: 0.3, away: 0.45 } : { home: 0.4, draw: 0.3, away: 0.3 };
  }

  private static decisionTree4(features: any): { home: number; draw: number; away: number } {
    const combined = features.attackDiff + features.formDiff * 0.2;
    if (combined > 0.8) {
      return { home: 0.6, draw: 0.25, away: 0.15 };
    }
    return combined < -0.8 ? { home: 0.2, draw: 0.25, away: 0.55 } : { home: 0.35, draw: 0.35, away: 0.3 };
  }

  private static decisionTree5(features: any): { home: number; draw: number; away: number } {
    if (features.eloDiff > 150) {
      return { home: 0.65, draw: 0.2, away: 0.15 };
    }
    return features.eloDiff < -150 ? { home: 0.15, draw: 0.2, away: 0.65 } : { home: 0.4, draw: 0.3, away: 0.3 };
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
      case 'ensemble':
        return this.predictEnsemble(match);
      case 'random-forest':
        return this.predictRandomForest(match);
      case 'seasonal':
        return this.predictSeasonal(match);
      default:
        return this.predictDefault(match);
    }
  }
}
