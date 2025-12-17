
export interface Word {
  id: number;
  word: string;
  meaning: string;
  level: number;
}

export interface Player {
  id: number;
  name: string;
  avatar: string;
  maxUnlockedLevel: number;
  stars: Record<number, number>;
  highScores: Record<number, number>; 
  totalScore: number;                 
  mistakes: number[];
  // New RPG Elements
  level: number;
  xp: number;
  unlockedAchievements: number[];
}

export interface World {
  id: number;
  name: string;
  enemy: string;
  hp: number;
  img: string;
  theme: string;
  bgPattern: string;
  desc: string;
  textColor: string;
}

export interface BattlePlayer extends Player {
  hp: number;
  score: number;
}

export type VersusMode = 'TIME_ATTACK' | 'RACE_TO_10';

export interface VersusConfig {
  p1: BattlePlayer;
  p2: BattlePlayer;
  words: Word[];
  opponentType: 'HUMAN' | 'COMPUTER';
  gameMode: VersusMode;
}

export interface BattleResult {
  status: 'WIN' | 'LOSE';
  stars: number;
  score: number; 
  leveledUp?: boolean;
  newLevel?: number;
}

export interface Achievement {
  id: number;
  title: string;
  desc: string;
  icon: string;
  condition: (p: Player) => boolean;
}
