
import { Team, Match } from '@/types/football';

export const premierLeagueTeams: Team[] = [
  {
    id: 'arsenal',
    name: 'Arsenal FC',
    shortName: 'Arsenal',
    league: 'Premier League',
    form: [1, 1, 0.5, 1, 1], // Recent form: WWDWW
    stats: {
      matchesPlayed: 15,
      wins: 11,
      draws: 2,
      losses: 2,
      goalsFor: 28,
      goalsAgainst: 12,
      goalDifference: 16,
      points: 35,
      attackStrength: 1.87,
      defenseStrength: 0.8,
      eloRating: 2150
    }
  },
  {
    id: 'chelsea',
    name: 'Chelsea FC',
    shortName: 'Chelsea',
    league: 'Premier League',
    form: [1, 0.5, 1, 0, 1], // Recent form: WDWLW
    stats: {
      matchesPlayed: 15,
      wins: 8,
      draws: 4,
      losses: 3,
      goalsFor: 24,
      goalsAgainst: 17,
      goalDifference: 7,
      points: 28,
      attackStrength: 1.6,
      defenseStrength: 1.13,
      eloRating: 2080
    }
  },
  {
    id: 'manchester-city',
    name: 'Manchester City',
    shortName: 'Man City',
    league: 'Premier League',
    form: [1, 1, 1, 0.5, 1], // Recent form: WWWDW
    stats: {
      matchesPlayed: 15,
      wins: 12,
      draws: 1,
      losses: 2,
      goalsFor: 35,
      goalsAgainst: 15,
      goalDifference: 20,
      points: 37,
      attackStrength: 2.33,
      defenseStrength: 1.0,
      eloRating: 2200
    }
  },
  {
    id: 'liverpool',
    name: 'Liverpool FC',
    shortName: 'Liverpool',
    league: 'Premier League',
    form: [1, 1, 0, 1, 1], // Recent form: WWLWW
    stats: {
      matchesPlayed: 15,
      wins: 10,
      draws: 3,
      losses: 2,
      goalsFor: 30,
      goalsAgainst: 16,
      goalDifference: 14,
      points: 33,
      attackStrength: 2.0,
      defenseStrength: 1.07,
      eloRating: 2170
    }
  },
  {
    id: 'manchester-united',
    name: 'Manchester United',
    shortName: 'Man Utd',
    league: 'Premier League',
    form: [0, 1, 0.5, 1, 0], // Recent form: LWDWL
    stats: {
      matchesPlayed: 15,
      wins: 7,
      draws: 3,
      losses: 5,
      goalsFor: 18,
      goalsAgainst: 20,
      goalDifference: -2,
      points: 24,
      attackStrength: 1.2,
      defenseStrength: 1.33,
      eloRating: 2020
    }
  },
  {
    id: 'tottenham',
    name: 'Tottenham Hotspur',
    shortName: 'Tottenham',
    league: 'Premier League',
    form: [1, 0, 1, 0.5, 1], // Recent form: WLWDW
    stats: {
      matchesPlayed: 15,
      wins: 8,
      draws: 2,
      losses: 5,
      goalsFor: 26,
      goalsAgainst: 18,
      goalDifference: 8,
      points: 26,
      attackStrength: 1.73,
      defenseStrength: 1.2,
      eloRating: 2050
    }
  }
];

export const upcomingMatches: Match[] = [
  {
    id: 'match-1',
    homeTeam: premierLeagueTeams[0], // Arsenal
    awayTeam: premierLeagueTeams[1], // Chelsea
    date: '2024-12-28T15:00:00Z',
    isFinished: false
  },
  {
    id: 'match-2',
    homeTeam: premierLeagueTeams[2], // Man City
    awayTeam: premierLeagueTeams[3], // Liverpool
    date: '2024-12-29T17:30:00Z',
    isFinished: false
  },
  {
    id: 'match-3',
    homeTeam: premierLeagueTeams[4], // Man Utd
    awayTeam: premierLeagueTeams[5], // Tottenham
    date: '2024-12-30T14:00:00Z',
    isFinished: false
  }
];
