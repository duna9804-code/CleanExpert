export interface ElementData {
  symbol: string;
  nameKo: string;
  nameEn: string;
  atomicNumber: number;
  relativeMass: number; // 원자량 (상대 질량)
  exactMassG: number; // 실제 질량 (g)
  colorBg: string;
  colorBorder: string;
  colorText: string;
  glowColor: string;
  description: string;
}

export interface DiscoveredRatio {
  id: string;
  leftElement: string;
  leftCount: number;
  rightElement: string;
  rightCount: number;
  totalMass: number;
  ratioString: string;
  timestamp: number;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface UserLabData {
  discoveredRatios: DiscoveredRatio[];
  tabProgress: {
    tab1Completed: boolean;
    tab2Completed: boolean;
    tab3Completed: boolean;
  };
  moleExploredElements: string[];
  quizScore?: number;
}
