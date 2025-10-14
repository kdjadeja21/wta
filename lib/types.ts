// Type definitions for the Weight Tracking App
import { Timestamp } from "firebase/firestore";

export interface WeightEntry {
  id?: string; // Firestore document ID
  date: string; // Format: YYYY-MM-DD
  weight: number; // in kg
  createdAt?: Timestamp | Date; // Firestore timestamp
}

export interface UserProfile {
  email: string;
  username: string;
  height?: number; // in cm
  goalWeight?: number; // in kg
  createdAt?: Timestamp | Date; // Firestore timestamp
  updatedAt?: Timestamp | Date; // Firestore timestamp
}

export interface User {
  id: string;
  email: string;
  password: string;
  height?: number; // in cm
  goalWeight?: number; // in kg
  weights: WeightEntry[];
}

export interface UserData {
  users: User[];
  currentUser: string | null;
}

export interface AuthResult {
  success: boolean;
  message: string;
  user?: User;
}

export interface WeightStats {
  current: number | null;
  weekChange: number | null;
  monthChange: number | null;
  highest: number | null;
  lowest: number | null;
}

export interface BMIResult {
  bmi: number;
  category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese';
  color: string;
}

export interface GoalProgress {
  targetWeight: number;
  currentWeight: number;
  startWeight: number;
  progress: number; // percentage
  remaining: number; // kg to lose/gain
  daysTracked: number;
}

export type DateRange = {
  from: Date;
  to: Date;
} | undefined;

