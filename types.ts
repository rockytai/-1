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

export interface VersusConfig {
  p1: BattlePlayer;
  p2: BattlePlayer;
  words: Word[];
  opponentType: 'HUMAN' | 'COMPUTER';
}

export interface BattleResult {
  status: 'WIN' | 'LOSE';
  stars: number;
}
