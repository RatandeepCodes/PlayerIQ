export interface Player {
  id: string;
  name: string;
  club: string;
  nationality: string;
  position: string;
  age: number;
  rating: number;
  image?: string;
  attributes: {
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defending: number;
    physical: number;
  };
  recentForm: number[];
  strengths: string[];
  growthAreas: string[];
  playstyle: string;
  summary: string;
  pressureRating: number;
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  competition: string;
  date: string;
  venue: string;
  status: 'completed' | 'upcoming' | 'live';
  momentum?: { minute: number; home: number; away: number }[];
  turningPoints?: { minute: number; event: string; description: string }[];
  stats?: { label: string; home: number; away: number }[];
  phases?: { title: string; minutes: string; description: string }[];
}

export const players: Player[] = [
  {
    id: 'messi',
    name: 'Lionel Messi',
    club: 'Inter Miami',
    nationality: 'Argentina',
    position: 'Forward',
    age: 38,
    rating: 93,
    attributes: { pace: 78, shooting: 90, passing: 94, dribbling: 95, defending: 35, physical: 62 },
    recentForm: [8.2, 7.8, 9.1, 8.5, 7.9, 8.8, 9.3],
    strengths: ['Vision', 'Dribbling', 'Free Kicks', 'Playmaking'],
    growthAreas: ['Defensive Contribution', 'Aerial Duels'],
    playstyle: 'Creative playmaker who orchestrates attacks with sublime vision and dribbling ability.',
    summary: 'The greatest of all time. Messi continues to redefine football with his unmatched creativity.',
    pressureRating: 96,
  },
  {
    id: 'haaland',
    name: 'Erling Haaland',
    club: 'Manchester City',
    nationality: 'Norway',
    position: 'Striker',
    age: 24,
    rating: 91,
    attributes: { pace: 89, shooting: 93, passing: 65, dribbling: 78, defending: 45, physical: 92 },
    recentForm: [7.5, 8.9, 9.2, 8.1, 8.7, 9.0, 8.3],
    strengths: ['Finishing', 'Positioning', 'Physical Power', 'Pace'],
    growthAreas: ['Passing Range', 'Build-up Play'],
    playstyle: 'A lethal goalscorer who combines devastating pace with clinical finishing inside the box.',
    summary: "The most feared striker in world football. Haaland's goal record is unprecedented.",
    pressureRating: 88,
  },
  {
    id: 'mbappe',
    name: 'Kylian Mbappé',
    club: 'Real Madrid',
    nationality: 'France',
    position: 'Forward',
    age: 26,
    rating: 92,
    attributes: { pace: 97, shooting: 89, passing: 80, dribbling: 92, defending: 36, physical: 76 },
    recentForm: [8.0, 8.5, 7.9, 9.0, 8.2, 8.8, 9.1],
    strengths: ['Explosive Pace', 'Finishing', 'Counter-Attacks', 'Big Game Impact'],
    growthAreas: ['Consistency', 'Aerial Ability'],
    playstyle: 'Electric forward who terrorizes defenses with blistering speed and clinical finishing.',
    summary: 'The heir to the throne. Mbappé brings electrifying pace and a killer instinct to Real Madrid.',
    pressureRating: 91,
  },
  {
    id: 'bellingham',
    name: 'Jude Bellingham',
    club: 'Real Madrid',
    nationality: 'England',
    position: 'Midfielder',
    age: 21,
    rating: 90,
    attributes: { pace: 76, shooting: 82, passing: 85, dribbling: 86, defending: 72, physical: 80 },
    recentForm: [8.1, 8.5, 7.8, 8.9, 8.3, 9.0, 8.6],
    strengths: ['Box-to-Box Energy', 'Goals from Midfield', 'Leadership', 'Versatility'],
    growthAreas: ['Defensive Positioning', 'Long-Range Passing'],
    playstyle: 'Dynamic midfielder who arrives late in the box with devastating effect.',
    summary: 'The complete midfielder. Bellingham dominates games with energy, skill, and intelligence.',
    pressureRating: 89,
  },
  {
    id: 'vinicius',
    name: 'Vinícius Jr',
    club: 'Real Madrid',
    nationality: 'Brazil',
    position: 'Winger',
    age: 24,
    rating: 92,
    attributes: { pace: 95, shooting: 82, passing: 78, dribbling: 94, defending: 30, physical: 68 },
    recentForm: [8.5, 9.0, 8.2, 7.8, 9.1, 8.7, 8.9],
    strengths: ['Dribbling', 'Speed', 'Big Game Performances', '1v1 Ability'],
    growthAreas: ['Decision Making', 'Weak Foot'],
    playstyle: 'A dazzling winger who beats defenders with flair and produces moments of magic.',
    summary: 'The most exciting player in world football. Vinícius turns matches on their head.',
    pressureRating: 90,
  },
  {
    id: 'salah',
    name: 'Mohamed Salah',
    club: 'Liverpool',
    nationality: 'Egypt',
    position: 'Forward',
    age: 32,
    rating: 89,
    attributes: { pace: 88, shooting: 90, passing: 79, dribbling: 88, defending: 42, physical: 72 },
    recentForm: [8.3, 8.7, 7.9, 8.5, 9.0, 8.1, 8.8],
    strengths: ['Left-Foot Finishing', 'Movement', 'Consistency', 'Work Rate'],
    growthAreas: ['Heading', 'Passing Under Pressure'],
    playstyle: 'A prolific forward who cuts inside from the right with deadly precision.',
    summary: "Liverpool's Egyptian King. Salah's consistency at the highest level is remarkable.",
    pressureRating: 87,
  },
  {
    id: 'rodri',
    name: 'Rodri',
    club: 'Manchester City',
    nationality: 'Spain',
    position: 'Midfielder',
    age: 28,
    rating: 91,
    attributes: { pace: 60, shooting: 72, passing: 88, dribbling: 80, defending: 88, physical: 85 },
    recentForm: [8.0, 8.2, 8.5, 8.1, 8.4, 8.3, 8.6],
    strengths: ['Game Control', 'Positioning', 'Tackling', 'Composure'],
    growthAreas: ['Pace', 'Long-Range Shooting'],
    playstyle: 'The ultimate midfield anchor who controls the tempo and shields the defense.',
    summary: 'The Ballon d\'Or winner. Rodri is the most important midfielder in world football.',
    pressureRating: 93,
  },
  {
    id: 'musiala',
    name: 'Jamal Musiala',
    club: 'Bayern Munich',
    nationality: 'Germany',
    position: 'Midfielder',
    age: 21,
    rating: 88,
    attributes: { pace: 80, shooting: 78, passing: 84, dribbling: 92, defending: 48, physical: 64 },
    recentForm: [7.8, 8.5, 8.2, 8.8, 8.0, 8.6, 8.9],
    strengths: ['Close Control', 'Creativity', 'Agility', 'Through Balls'],
    growthAreas: ['Physical Strength', 'Defensive Work'],
    playstyle: 'A silky dribbler who glides past opponents and creates chances from nothing.',
    summary: "Germany's golden boy. Musiala combines elegance with devastating effectiveness.",
    pressureRating: 84,
  },
  {
    id: 'lewandowski',
    name: 'Robert Lewandowski',
    club: 'Barcelona',
    nationality: 'Poland',
    position: 'Striker',
    age: 36,
    rating: 88,
    attributes: { pace: 68, shooting: 94, passing: 76, dribbling: 82, defending: 40, physical: 78 },
    recentForm: [7.5, 8.2, 8.8, 7.9, 8.5, 9.1, 8.0],
    strengths: ['Finishing', 'Positioning', 'Hold-Up Play', 'Penalty Box Movement'],
    growthAreas: ['Pace', 'Pressing Intensity'],
    playstyle: 'A master striker who finds space and finishes with lethal precision.',
    summary: "One of the greatest strikers ever. Lewandowski's movement in the box is unparalleled.",
    pressureRating: 90,
  },
  {
    id: 'ronaldo',
    name: 'Cristiano Ronaldo',
    club: 'Al Nassr',
    nationality: 'Portugal',
    position: 'Forward',
    age: 40,
    rating: 85,
    attributes: { pace: 72, shooting: 92, passing: 72, dribbling: 78, defending: 34, physical: 80 },
    recentForm: [7.8, 8.5, 8.0, 7.5, 8.2, 8.8, 7.9],
    strengths: ['Heading', 'Finishing', 'Aerial Presence', 'Mentality'],
    growthAreas: ['Pace', 'Pressing'],
    playstyle: 'A goal machine who thrives on big moments and aerial dominance.',
    summary: 'The ultimate competitor. Ronaldo continues to defy age with his incredible scoring instinct.',
    pressureRating: 95,
  },
];

export const matches: Match[] = [
  {
    id: 'match-1',
    homeTeam: 'Real Madrid',
    awayTeam: 'Manchester City',
    homeScore: 3,
    awayScore: 2,
    competition: 'UEFA Champions League — Semi-Final',
    date: '2026-04-01',
    venue: 'Santiago Bernabéu',
    status: 'completed',
    momentum: [
      { minute: 0, home: 50, away: 50 },
      { minute: 10, home: 55, away: 45 },
      { minute: 20, home: 60, away: 40 },
      { minute: 25, home: 45, away: 55 },
      { minute: 35, home: 50, away: 50 },
      { minute: 45, home: 55, away: 45 },
      { minute: 50, home: 40, away: 60 },
      { minute: 60, home: 55, away: 45 },
      { minute: 70, home: 65, away: 35 },
      { minute: 75, home: 70, away: 30 },
      { minute: 80, home: 60, away: 40 },
      { minute: 90, home: 65, away: 35 },
    ],
    turningPoints: [
      { minute: 23, event: 'Goal', description: 'Vinícius Jr opens the scoring with a stunning run.' },
      { minute: 51, event: 'Goal', description: 'Haaland equalizes with a powerful header.' },
      { minute: 67, event: 'Red Card', description: 'Kyle Walker sent off for a professional foul.' },
      { minute: 74, event: 'Goal', description: 'Bellingham puts Madrid ahead from close range.' },
      { minute: 82, event: 'Goal', description: 'De Bruyne pulls one back with a long-range strike.' },
      { minute: 88, event: 'Goal', description: 'Mbappé seals it in stoppage time with a counter-attack.' },
    ],
    stats: [
      { label: 'Possession', home: 48, away: 52 },
      { label: 'Shots', home: 16, away: 12 },
      { label: 'Shots on Target', home: 8, away: 5 },
      { label: 'Passes', home: 420, away: 480 },
      { label: 'Tackles', home: 22, away: 18 },
      { label: 'Corners', home: 7, away: 4 },
    ],
    phases: [
      { title: 'Opening Exchanges', minutes: "0\u201320'", description: 'Both sides cautious. Madrid press high while City build from the back.' },
      { title: 'Madrid Strike First', minutes: "20\u201345'", description: 'Vinícius Jr breaks the deadlock. City respond with sustained pressure.' },
      { title: 'City Fightback', minutes: "45\u201360'", description: 'Haaland equalizes early in the second half. City dominate possession.' },
      { title: 'The Red Card Shift', minutes: "60\u201375'", description: "Walker's red card changes everything. Madrid seize control." },
      { title: 'Dramatic Finale', minutes: "75\u201390'", description: 'Three goals in fifteen minutes. Mbappé seals an epic victory.' },
    ],
  },
  {
    id: 'match-2',
    homeTeam: 'Barcelona',
    awayTeam: 'Bayern Munich',
    homeScore: 2,
    awayScore: 2,
    competition: 'UEFA Champions League — Quarter-Final',
    date: '2026-03-28',
    venue: 'Camp Nou',
    status: 'completed',
    momentum: [
      { minute: 0, home: 50, away: 50 },
      { minute: 15, home: 60, away: 40 },
      { minute: 30, home: 55, away: 45 },
      { minute: 45, home: 45, away: 55 },
      { minute: 60, home: 50, away: 50 },
      { minute: 75, home: 55, away: 45 },
      { minute: 90, home: 50, away: 50 },
    ],
    turningPoints: [
      { minute: 18, event: 'Goal', description: 'Lewandowski scores against his former club.' },
      { minute: 42, event: 'Goal', description: 'Musiala equalizes with a stunning solo goal.' },
      { minute: 68, event: 'Goal', description: "Raphinha restores Barcelona's lead." },
      { minute: 85, event: 'Goal', description: 'Kane equalizes from the penalty spot.' },
    ],
    stats: [
      { label: 'Possession', home: 58, away: 42 },
      { label: 'Shots', home: 14, away: 10 },
      { label: 'Shots on Target', home: 6, away: 4 },
      { label: 'Passes', home: 540, away: 380 },
      { label: 'Tackles', home: 16, away: 20 },
      { label: 'Corners', home: 6, away: 3 },
    ],
    phases: [
      { title: 'Barcelona Dominance', minutes: "0\u201330'", description: 'Barcelona control the ball and create early chances.' },
      { title: 'Bayern Response', minutes: "30\u201360'", description: 'Bayern grow into the game and find their rhythm.' },
      { title: 'Late Drama', minutes: "60\u201390'", description: 'A pulsating final thirty minutes with two late goals.' },
    ],
  },
  {
    id: 'match-3',
    homeTeam: 'Liverpool',
    awayTeam: 'Arsenal',
    homeScore: 1,
    awayScore: 0,
    competition: 'Premier League',
    date: '2026-03-25',
    venue: 'Anfield',
    status: 'completed',
    momentum: [
      { minute: 0, home: 50, away: 50 },
      { minute: 15, home: 55, away: 45 },
      { minute: 30, home: 60, away: 40 },
      { minute: 45, home: 55, away: 45 },
      { minute: 60, home: 50, away: 50 },
      { minute: 75, home: 60, away: 40 },
      { minute: 90, home: 55, away: 45 },
    ],
    turningPoints: [
      { minute: 72, event: 'Goal', description: 'Salah scores the winner with a curling finish.' },
    ],
    stats: [
      { label: 'Possession', home: 52, away: 48 },
      { label: 'Shots', home: 11, away: 8 },
      { label: 'Shots on Target', home: 5, away: 3 },
      { label: 'Passes', home: 460, away: 440 },
      { label: 'Tackles', home: 20, away: 22 },
      { label: 'Corners', home: 5, away: 6 },
    ],
    phases: [
      { title: 'Tight First Half', minutes: "0\u201345'", description: 'A cagey opening with both teams cancelling each other out.' },
      { title: 'Salah Magic', minutes: "45\u201390'", description: 'Liverpool push harder and Salah produces a moment of brilliance.' },
    ],
  },
];

export const featuredStats = [
  { label: 'Goals Tracked', value: '12,847' },
  { label: 'Players Profiled', value: '4,200+' },
  { label: 'Matches Analyzed', value: '3,156' },
  { label: 'Leagues Covered', value: '42' },
];
