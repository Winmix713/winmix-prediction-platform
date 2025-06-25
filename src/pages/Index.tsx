
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { MatchSelector } from '@/components/MatchSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { upcomingMatches, premierLeagueTeams } from '@/data/mockData';
import { algorithmConfigs } from '@/data/algorithms';
import { PredictionService } from '@/services/predictionService';
import { Match, PredictionResult } from '@/types/football';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('default');
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  const handleMatchSelect = (match: Match) => {
    setSelectedMatch(match);
    setPrediction(null);
  };

  const handlePredict = () => {
    if (selectedMatch) {
      const result = PredictionService.predict(selectedMatch, selectedAlgorithm);
      setPrediction(result);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MatchSelector
          matches={upcomingMatches}
          selectedMatch={selectedMatch}
          onMatchSelect={handleMatchSelect}
        />
        
        <Card>
          <CardHeader>
            <CardTitle>Prediction Algorithms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {algorithmConfigs.slice(0, 4).map((algo) => (
                <div
                  key={algo.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedAlgorithm === algo.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedAlgorithm(algo.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{algo.name}</div>
                      <div className="text-xs text-muted-foreground">{algo.description}</div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge variant="secondary">{algo.accuracy}%</Badge>
                      <span className="text-xs text-muted-foreground">{algo.speed}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <Button 
                onClick={handlePredict} 
                disabled={!selectedMatch}
                className="w-full"
              >
                Generate Prediction
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {prediction && selectedMatch && (
        <Card>
          <CardHeader>
            <CardTitle>
              Prediction: {selectedMatch.homeTeam.shortName} vs {selectedMatch.awayTeam.shortName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {prediction.homeWinProbability}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedMatch.homeTeam.shortName} Win
                </div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {prediction.drawProbability}%
                </div>
                <div className="text-sm text-muted-foreground">Draw</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {prediction.awayWinProbability}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedMatch.awayTeam.shortName} Win
                </div>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Expected Goals</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>{selectedMatch.homeTeam.shortName}</span>
                    <span className="font-medium">{prediction.expectedGoals.home}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{selectedMatch.awayTeam.shortName}</span>
                    <span className="font-medium">{prediction.expectedGoals.away}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Prediction Details</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Algorithm</span>
                    <span className="text-sm">{prediction.algorithm}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Confidence</span>
                    <span className="font-medium">{Math.round(prediction.confidence * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'predictions' && (
        <Card>
          <CardHeader>
            <CardTitle>Predictions History</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Prediction history will be shown here</p>
          </CardContent>
        </Card>
      )}
      {activeTab === 'algorithms' && (
        <Card>
          <CardHeader>
            <CardTitle>Algorithm Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {algorithmConfigs.map((algo) => (
                <div key={algo.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{algo.name}</h3>
                    <div className="flex space-x-2">
                      <Badge variant="secondary">{algo.accuracy}% accuracy</Badge>
                      <Badge variant="outline">{algo.complexity}</Badge>
                      <Badge variant="outline">{algo.speed}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{algo.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {activeTab === 'analysis' && (
        <Card>
          <CardHeader>
            <CardTitle>Team Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {premierLeagueTeams.map((team) => (
                <div key={team.id} className="p-4 border rounded-lg">
                  <h3 className="font-medium mb-2">{team.name}</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Points</span>
                      <span className="font-medium">{team.stats.points}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ELO Rating</span>
                      <span className="font-medium">{team.stats.eloRating}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Goals For/Against</span>
                      <span className="font-medium">{team.stats.goalsFor}/{team.stats.goalsAgainst}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Form</span>
                      <span className="font-medium">
                        {team.form.map((result, i) => (
                          <span key={i} className={result === 1 ? 'text-green-600' : result === 0.5 ? 'text-yellow-600' : 'text-red-600'}>
                            {result === 1 ? 'W' : result === 0.5 ? 'D' : 'L'}
                          </span>
                        ))}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </Layout>
  );
};

export default Index;
