export type AppStatus = 'idle' | 'loading' | 'analyzed' | 'error';

export type ChatMessage = {
  role: 'user' | 'assistant';
  text: string;
};

export type DecisionOption = {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  tradeOff: string;
};

export type DecisionAnalysis = {
  chatResponse: string;

  panel1: {
    title: string;
    narration: string;
  };

  panel2: {
    title: string;
    questions: string[];
  };

  panel3: {
    title: string;
    options: DecisionOption[];
  };

  panel4: {
    title: string;
    verdict: string;
    reasoning: string;
    assumptions: string[];
  };

  panel5: {
    title: string;
    confidenceScore: number;
    explanation: string;
  };
};