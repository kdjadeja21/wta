"use client";

import { Activity, TrendingUp, TrendingDown, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeightStats } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  stats: WeightStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const formatChange = (change: number | null) => {
    if (change === null) return '-';
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)} kg`;
  };

  const getChangeColor = (change: number | null) => {
    if (change === null) return 'text-gray-500';
    if (change > 0) return 'text-red-600';
    if (change < 0) return 'text-green-600';
    return 'text-gray-500';
  };

  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
      {/* Current Weight */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs md:text-sm font-medium">Current Weight</CardTitle>
          <Activity className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-lg md:text-2xl font-bold text-purple-600">
            {stats.current ? `${stats.current} kg` : '-'}
          </div>
        </CardContent>
      </Card>

      {/* Week Change */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs md:text-sm font-medium">Week Change</CardTitle>
          <TrendingUp className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className={cn("text-lg md:text-2xl font-bold", getChangeColor(stats.weekChange))}>
            {formatChange(stats.weekChange)}
          </div>
        </CardContent>
      </Card>

      {/* Month Change */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs md:text-sm font-medium">Month Change</CardTitle>
          <TrendingUp className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className={cn("text-lg md:text-2xl font-bold", getChangeColor(stats.monthChange))}>
            {formatChange(stats.monthChange)}
          </div>
        </CardContent>
      </Card>

      {/* Highest / Lowest */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs md:text-sm font-medium">Highest / Lowest</CardTitle>
          <Target className="h-4 w-4 text-cyan-600" />
        </CardHeader>
        <CardContent>
          <div className="text-lg md:text-2xl font-bold text-cyan-600">
            {stats.highest && stats.lowest
              ? `${stats.highest} / ${stats.lowest} kg`
              : '-'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

