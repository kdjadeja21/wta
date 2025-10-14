import { WeightEntry, BMIResult, WeightStats, GoalProgress } from "./types";
import { subDays, isAfter, isBefore, differenceInDays } from "date-fns";

// Calculate BMI
export function calculateBMI(heightCm: number, weightKg: number): number {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) return 0;
  
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return parseFloat(bmi.toFixed(1));
}

// Get BMI category
export function getBMICategory(bmi: number): BMIResult {
  if (bmi === 0) {
    return { bmi: 0, category: 'Normal', color: 'text-gray-500' };
  }
  
  if (bmi < 18.5) {
    return { bmi, category: 'Underweight', color: 'text-blue-600' };
  } else if (bmi < 25) {
    return { bmi, category: 'Normal', color: 'text-green-600' };
  } else if (bmi < 30) {
    return { bmi, category: 'Overweight', color: 'text-orange-600' };
  } else {
    return { bmi, category: 'Obese', color: 'text-red-600' };
  }
}

// Get weight at specific date or nearest
function getWeightAtDate(weights: WeightEntry[], targetDate: Date): number | null {
  if (weights.length === 0) return null;
  
  const targetDateStr = targetDate.toISOString().split('T')[0];
  const exactMatch = weights.find(w => w.date === targetDateStr);
  
  if (exactMatch) return exactMatch.weight;
  
  // Find nearest weight before target date
  const sortedWeights = [...weights].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  for (const weight of sortedWeights) {
    if (new Date(weight.date) <= targetDate) {
      return weight.weight;
    }
  }
  
  return sortedWeights[sortedWeights.length - 1]?.weight || null;
}

// Calculate weight change over period
function calculateWeightChange(weights: WeightEntry[], daysAgo: number): number | null {
  if (weights.length === 0) return null;
  
  const currentWeight = weights[0]?.weight;
  if (!currentWeight) return null;
  
  const pastDate = subDays(new Date(), daysAgo);
  const pastWeight = getWeightAtDate(weights, pastDate);
  
  if (!pastWeight) return null;
  
  return parseFloat((currentWeight - pastWeight).toFixed(1));
}

// Calculate weekly change
export function calculateWeeklyChange(weights: WeightEntry[]): number | null {
  return calculateWeightChange(weights, 7);
}

// Calculate monthly change
export function calculateMonthlyChange(weights: WeightEntry[]): number | null {
  return calculateWeightChange(weights, 30);
}

// Get highest and lowest weights
export function getHighestLowest(weights: WeightEntry[]): { highest: number | null; lowest: number | null } {
  if (weights.length === 0) {
    return { highest: null, lowest: null };
  }
  
  const values = weights.map(w => w.weight);
  return {
    highest: Math.max(...values),
    lowest: Math.min(...values),
  };
}

// Get current weight
export function getCurrentWeight(weights: WeightEntry[]): number | null {
  if (weights.length === 0) return null;
  return weights[0]?.weight || null;
}

// Calculate all weight stats
export function calculateWeightStats(weights: WeightEntry[]): WeightStats {
  const { highest, lowest } = getHighestLowest(weights);
  
  return {
    current: getCurrentWeight(weights),
    weekChange: calculateWeeklyChange(weights),
    monthChange: calculateMonthlyChange(weights),
    highest,
    lowest,
  };
}

// Filter weights by date range
export function filterWeightsByDateRange(
  weights: WeightEntry[],
  startDate: Date,
  endDate: Date
): WeightEntry[] {
  return weights.filter(w => {
    const date = new Date(w.date);
    return !isBefore(date, startDate) && !isAfter(date, endDate);
  });
}

// Filter weights by days
export function filterWeightsByDays(weights: WeightEntry[], days: number): WeightEntry[] {
  const endDate = new Date();
  const startDate = subDays(endDate, days - 1);
  return filterWeightsByDateRange(weights, startDate, endDate);
}

// Calculate goal progress
export function calculateGoalProgress(
  currentWeight: number,
  goalWeight: number,
  weights: WeightEntry[]
): GoalProgress | null {
  if (!currentWeight || !goalWeight || weights.length === 0) return null;
  
  // Get start weight (oldest entry)
  const sortedWeights = [...weights].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const startWeight = sortedWeights[0].weight;
  
  // Calculate progress percentage
  const totalChange = startWeight - goalWeight;
  const currentChange = startWeight - currentWeight;
  const progress = totalChange !== 0 ? Math.min(Math.max((currentChange / totalChange) * 100, 0), 100) : 0;
  
  // Calculate remaining weight
  const remaining = currentWeight - goalWeight;
  
  // Calculate days tracked
  const firstDate = new Date(sortedWeights[0].date);
  const lastDate = new Date(sortedWeights[sortedWeights.length - 1].date);
  const daysTracked = differenceInDays(lastDate, firstDate) + 1;
  
  return {
    targetWeight: goalWeight,
    currentWeight,
    startWeight,
    progress: parseFloat(progress.toFixed(1)),
    remaining: parseFloat(remaining.toFixed(1)),
    daysTracked,
  };
}

// Validate weight input
export function validateWeight(weight: number): { valid: boolean; message?: string } {
  if (isNaN(weight) || weight <= 0) {
    return { valid: false, message: "Weight must be a positive number" };
  }
  
  if (weight > 500) {
    return { valid: false, message: "Weight must be less than 500kg" };
  }
  
  return { valid: true };
}

// Format weight change for display
export function formatWeightChange(change: number | null): string {
  if (change === null) return '-';
  
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}`;
}

