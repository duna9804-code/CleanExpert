import { ElementData, QuizQuestion } from '../types';

export const ELEMENTS: Record<string, ElementData> = {
  H: {
    symbol: 'H',
    nameKo: '수소',
    nameEn: 'Hydrogen',
    atomicNumber: 1,
    relativeMass: 1,
    exactMassG: 1.674e-24,
    colorBg: 'bg-slate-100 text-slate-900 border-slate-300',
    colorBorder: 'border-slate-400',
    colorText: 'text-slate-900',
    glowColor: 'rgba(203, 213, 225, 0.6)',
    description: '가장 가벼운 원소로, 양성자 1개로 구성되어 있습니다.'
  },
  C: {
    symbol: 'C',
    nameKo: '탄소',
    nameEn: 'Carbon',
    atomicNumber: 6,
    relativeMass: 12,
    exactMassG: 1.993e-23,
    colorBg: 'bg-zinc-800 text-white border-zinc-700',
    colorBorder: 'border-zinc-700',
    colorText: 'text-white',
    glowColor: 'rgba(39, 39, 42, 0.7)',
    description: '원자량의 기준이 되는 원소(¹²C = 12.00)입니다.'
  },
  N: {
    symbol: 'N',
    nameKo: '질소',
    nameEn: 'Nitrogen',
    atomicNumber: 7,
    relativeMass: 14,
    exactMassG: 2.325e-23,
    colorBg: 'bg-blue-600 text-white border-blue-500',
    colorBorder: 'border-blue-500',
    colorText: 'text-white',
    glowColor: 'rgba(37, 99, 235, 0.6)',
    description: '공기의 약 78%를 차지하는 비금속 기체 원소입니다.'
  },
  O: {
    symbol: 'O',
    nameKo: '산소',
    nameEn: 'Oxygen',
    atomicNumber: 8,
    relativeMass: 16,
    exactMassG: 2.657e-23,
    colorBg: 'bg-rose-600 text-white border-rose-500',
    colorBorder: 'border-rose-500',
    colorText: 'text-white',
    glowColor: 'rgba(225, 29, 72, 0.6)',
    description: '생명 호흡과 연소에 필수적인 16족 원소입니다.'
  }
};

export const AVOGADRO_CONSTANT = 6.02214076e23;
export const AVOGADRO_DISPLAY = "6.022 × 10²³";

export const CHEMISTRY_QUIZ: QuizQuestion[] = [
  {
    id: 1,
    question: "원자의 실제 질량이 너무 작아 측정과 계산이 불편하여 만든 '원자량'의 기준이 되는 원소와 기준값은?",
    options: [
      "수소(¹H) = 1.00",
      "탄소(¹²C) = 12.00",
      "산소(¹⁶O) = 16.00",
      "질소(¹⁴N) = 14.00"
    ],
    correctIndex: 1,
    explanation: "국제 순수·응용화학연합(IUPAC)은 질량수 12인 탄소 원자(¹²C)의 상대적 질량을 정확히 12.00으로 정하고 이를 원자량의 기준으로 삼습니다."
  },
  {
    id: 2,
    question: "1몰(mol)에 들어있는 입자 수(아보가드로수, NA)에 대한 설명으로 옳은 것은?",
    options: [
      "원소의 종류에 따라 1몰에 들어있는 입자 수가 다르다.",
      "탄소(C) 12g에 들어있는 탄소 원자 수는 6.022 × 10²³개이다.",
      "수소(H) 1g에는 탄소 12g보다 12배 더 많은 수의 원자가 들어있다.",
      "산소(O) 16g에는 1몰보다 적은 3.01 × 10²³개의 원자가 들어있다."
    ],
    correctIndex: 1,
    explanation: "어떤 원소든 '원자량에 g을 붙인 질량' 속에는 정확히 1몰(6.022 × 10²³개)의 원자가 들어있습니다. 따라서 탄소 12g, 수소 1g, 산소 16g 모두 정확히 1몰입니다."
  },
  {
    id: 3,
    question: "질소(N, 원자량 14) 28g에 들어있는 질소 원자의 몰수와 개수는?",
    options: [
      "1몰, 6.022 × 10²³개",
      "2몰, 1.204 × 10²⁴개",
      "0.5몰, 3.011 × 10²³개",
      "14몰, 8.43 × 10²⁴개"
    ],
    correctIndex: 1,
    explanation: "질소의 1몰 질량은 14g이므로, 28g은 28 ÷ 14 = 2몰에 해당합니다. 입자 수는 2 × (6.022 × 10²³) = 1.2044 × 10²⁴개입니다."
  }
];
