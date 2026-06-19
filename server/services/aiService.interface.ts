import { UserProfile, LogAnalysisResult } from './geminiService';

export interface IAIService {
  generateInsights(profile: UserProfile | null, history: Record<string, unknown>[]): Promise<string[]>;
  generateActivityLog(params: {
    userMessage?: string;
    profile?: UserProfile;
    history?: Record<string, unknown>[];
    imageBase64?: string;
  }): Promise<LogAnalysisResult>;
}
