
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Match } from '@/types/football';

interface MatchSelectorProps {
  matches: Match[];
  selectedMatch: Match | null;
  onMatchSelect: (match: Match) => void;
}

export const MatchSelector: React.FC<MatchSelectorProps> = ({
  matches,
  selectedMatch,
  onMatchSelect
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Match to Predict</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {matches.map((match) => (
            <div
              key={match.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedMatch?.id === match.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => onMatchSelect(match)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-medium">
                    {match.homeTeam.shortName}
                  </div>
                  <span className="text-muted-foreground">vs</span>
                  <div className="text-sm font-medium">
                    {match.awayTeam.shortName}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(match.date)}
                </div>
              </div>
              {selectedMatch?.id === match.id && (
                <div className="mt-2 pt-2 border-t border-border/50">
                  <div className="text-xs text-muted-foreground">
                    Home: {match.homeTeam.name} • Away: {match.awayTeam.name}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
