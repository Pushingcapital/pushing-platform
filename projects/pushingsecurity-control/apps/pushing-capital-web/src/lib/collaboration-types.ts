export type CollaborationAgent = "adk";

export type CollaborationMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  agent?: CollaborationAgent | "system";
  runtime?: string;
};

export type CollaborationTurn = {
  agent: CollaborationAgent;
  answer: string;
  runtime: string;
};

export type CollaborationResponse = {
  sessionId: string;
  turns: CollaborationTurn[];
};
