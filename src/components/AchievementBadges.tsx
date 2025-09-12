import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Trophy, Star, Target } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
}

interface AchievementBadgesProps {
  achievements: Achievement[];
}

export function AchievementBadges({ achievements }: AchievementBadgesProps) {
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  return (
    <Card className="p-6 bg-white">
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <Trophy className="w-6 h-6 text-yellow-600" />
          <div>
            <h3>Achievement Badges</h3>
            <p className="text-sm text-gray-600">
              Track your learning milestones and celebrate your progress!
            </p>
          </div>
        </div>

        {/* Unlocked Achievements */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4>Earned Badges ({unlockedAchievements.length})</h4>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              <Star className="w-3 h-3 mr-1" />
              {unlockedAchievements.length} Unlocked
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg border-2 border-yellow-200"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h5 className="font-medium text-yellow-800">{achievement.name}</h5>
                    <p className="text-xs text-yellow-700">{achievement.description}</p>
                  </div>
                  <Badge variant="default" className="bg-yellow-600">
                    ✓
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Locked Achievements */}
        {lockedAchievements.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4>Available Challenges</h4>
              <Badge variant="outline" className="text-gray-600">
                <Target className="w-3 h-3 mr-1" />
                {lockedAchievements.length} Remaining
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lockedAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 opacity-75"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="text-2xl grayscale">{achievement.icon}</div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-600">{achievement.name}</h5>
                      <p className="text-xs text-gray-500">{achievement.description}</p>
                    </div>
                    <Badge variant="outline" className="text-gray-400">
                      🔒
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievement Tips */}
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
          <div className="flex items-start space-x-3">
            <Trophy className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h5 className="font-medium text-blue-800">Achievement Tips</h5>
              <p className="text-sm text-blue-700 mt-1">
                Badges help track your learning journey and provide motivation. Complete daily goals, 
                maintain streaks, and explore different learning modes to unlock all achievements!
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}