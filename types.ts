
export type ViewState = 'splash' | 'platform_selection' | 'info' | 'settings' | 'game_selection' | 'admin';

export type Platform = '1xbet' | 'linebet';

export type Language = 'en' | 'ar';

export type GameType = 'crash' | 'apple';

export enum GameState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  PREDICTED = 'PREDICTED'
}

export interface PredictionResult {
  path: number[];
  confidence: number;
  analysis: string;
  id: string;
  timestamp: number;
  gridData?: boolean[][];
}

export interface PredictionData {
  multiplier: number;
  confidence: number;
  safeCashOut: number;
  timestamp: string;
}

export interface UserConditionData {
  userId: string;
  screenshot: string | null;
  profileScreenshot: string | null;
}
