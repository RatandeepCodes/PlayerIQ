export interface ApiDirectoryPlayer {
  playerId: string;
  name: string;
  team?: string;
  position?: string;
  nationality?: string;
  hasAnalytics?: boolean;
}

export interface ApiPlayersResponse {
  players?: ApiDirectoryPlayer[];
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    hasMore?: boolean;
  };
}

export interface ApiPlayerOverview {
  overallRating?: number | null;
  ppi?: number | null;
  pressureIndex?: number | null;
  playstyle?: string | null;
  reportSummary?: string | null;
  matchesAnalyzed?: number | null;
}

export interface ApiPlayerProfile {
  player?: {
    playerId: string;
    name?: string;
    team?: string;
    position?: string;
    nationality?: string;
  };
  overview?: ApiPlayerOverview;
  analytics?: {
    attributes?: Partial<Record<"shooting" | "passing" | "dribbling" | "defending" | "creativity" | "physical", number>>;
    report?: {
      strengths?: string[];
      developmentAreas?: string[];
      summary?: string;
    };
    playstyleProfile?: {
      name?: string;
      supportingTraits?: string[];
    };
    pressure?: {
      pressureIndex?: number | null;
      pressureScore?: number | null;
      pressureEvents?: number | null;
      interpretation?: string;
    };
  };
}

export interface ApiPlayerHistorySnapshot {
  overallRating?: number | null;
  ppi?: number | null;
}

export interface ApiPlayerHistoryResponse {
  snapshots?: ApiPlayerHistorySnapshot[];
}

export interface ApiComparisonRadarPoint {
  metric: string;
  playerOne: number;
  playerTwo: number;
}

export interface ApiComparisonCategoryWinner {
  metric: string;
  winner: "playerOne" | "playerTwo" | null;
}

export interface ApiPlayerComparisonResponse {
  summary?: string;
  radar?: ApiComparisonRadarPoint[];
  categoryWinners?: ApiComparisonCategoryWinner[];
}

export interface ApiMatchDirectoryEntry {
  matchId: string;
  title?: string;
  teams?: string[];
  competition?: string;
  season?: string;
  status?: "completed" | "upcoming" | "live";
  homeScore?: number;
  awayScore?: number;
  hasEvents?: boolean;
}

export interface ApiMatchesResponse {
  matches?: ApiMatchDirectoryEntry[];
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    hasMore?: boolean;
  };
}

export interface ApiLiveFeedMatch {
  id: string;
  homeTeam?: string;
  awayTeam?: string;
  homeScore?: number;
  awayScore?: number;
  competition?: string;
  date?: string;
  venue?: string;
  status?: "completed" | "upcoming" | "live";
}

export interface ApiHomeMatchFeedResponse {
  recentMatch?: ApiLiveFeedMatch | null;
  upcomingMatches?: ApiLiveFeedMatch[];
}

export interface ApiMatchBucket {
  bucketStart?: number;
  bucketEnd?: number;
  startMinute?: number;
  endMinute?: number;
  minuteMark?: number;
  label?: string;
  leadingTeam?: string | null;
  isSwing?: boolean;
  note?: string;
  scores?: Record<string, number>;
}

export interface ApiTurningPoint {
  minute?: number;
  team?: string;
  note?: string;
}

export interface ApiMatchAnalysisResponse {
  overview?: {
    teams?: string[];
  };
  summary?: {
    totalMomentumWindows?: number;
    totalTurningPoints?: number;
    swingMoments?: number;
  };
  momentumBuckets?: ApiMatchBucket[];
  turningPointList?: ApiTurningPoint[];
}
