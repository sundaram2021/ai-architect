import type {
  ActivityEvent,
  ActivityType,
  ClarifyingQuestion,
  OrchestratorOutput,
  DesignAgentInput,
  DesignAgentOutput,
  DesignNode,
  DesignEdge,
  ResearchAgentInput,
  ResearchAgentOutput,
  ResearchOption,
  StreamChunk,
} from "@/lib/schemas/agent-schemas";

export type {
  ActivityEvent,
  ActivityType,
  ClarifyingQuestion,
  OrchestratorOutput,
  DesignAgentInput,
  DesignAgentOutput,
  DesignNode,
  DesignEdge,
  ResearchAgentInput,
  ResearchAgentOutput,
  ResearchOption,
  StreamChunk,
};

export type AgentPhase =
  | "idle" // No active processing
  | "gathering" // Collecting requirements via questions
  | "researching" // Research agent is active
  | "designing" // Design agent is active
  | "complete"; // Task finished

/**
 * Activity feed state for UI display.
 */
export interface ActivityFeedState {
  activities: ActivityEvent[];
  currentActivity: ActivityEvent | null;
  isProcessing: boolean;
}

export interface AgentMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;

  question?: ClarifyingQuestion;
  research?: ResearchAgentOutput;
  design?: DesignAgentOutput;
  activities?: ActivityEvent[];
  selectedOption?: {
    questionId: string;
    optionId: string;
    value: string;
  };
}

export interface ConversationState {
  messages: AgentMessage[];
  phase: AgentPhase;
  activities: ActivityFeedState;

  requirements: string[];
  decisions: Array<{
    topic: string;
    choice: string;
    reasoning?: string;
  }>;
}

// ============================================================================
// STREAM HANDLER TYPES
// ============================================================================

/**
 * Callbacks for handling streamed chunks.
 */
export interface StreamHandlers {
  onActivity: (activity: ActivityEvent) => void;
  onMessage: (content: string, isComplete: boolean) => void;
  onQuestion: (question: ClarifyingQuestion) => void;
  onResearch: (research: ResearchAgentOutput) => void;
  onDesign: (design: DesignAgentOutput) => void;
  onError: (error: { message: string; code?: string }) => void;
  onDone: (success: boolean) => void;
}

export function createActivity(
  type: ActivityType,
  message: string,
  detail?: string
): ActivityEvent {
  return {
    id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    message,
    detail,
    timestamp: Date.now(),
  };
}

export function parseStreamChunk(data: string): StreamChunk | null {
  try {
    return JSON.parse(data) as StreamChunk;
  } catch {
    console.error("Failed to parse stream chunk:", data);
    return null;
  }
}

export interface GatheredState {
  requirements: string[];
  decisions: Array<{ topic: string; choice: string }>;
  questionsAnswered: number;
}

export interface ReadinessResult {
  ready: boolean;
  missing: string[];
}

export function createEmptyGatheredState(): GatheredState {
  return { requirements: [], decisions: [], questionsAnswered: 0 };
}

export function computeReadiness(state: GatheredState): ReadinessResult {
  const missing: string[] = [];

  if (state.requirements.length === 0) {
    missing.push("system type or core requirements");
  }

  if (state.decisions.length === 0 && state.questionsAnswered < 2) {
    missing.push("more details about your needs");
  }

  return {
    ready: missing.length === 0,
    missing,
  };
}
