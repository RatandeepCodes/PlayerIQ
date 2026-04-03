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
  status: "completed" | "upcoming" | "live";
  momentum?: { minute: number; home: number; away: number }[];
  turningPoints?: { minute: number; event: string; description: string }[];
  stats?: { label: string; home: number; away: number }[];
  phases?: { title: string; minutes: string; description: string }[];
}

export const players: Player[] = [
  {
    id: "messi",
    name: "Lionel Messi",
    club: "Inter Miami",
    nationality: "Argentina",
    position: "Forward",
    age: 38,
    rating: 93,
    attributes: { pace: 78, shooting: 90, passing: 94, dribbling: 95, defending: 35, physical: 62 },
    recentForm: [8.2, 7.8, 9.1, 8.5, 7.9, 8.8, 9.3],
    strengths: ["Vision", "Dribbling", "Free Kicks", "Playmaking"],
    growthAreas: ["Defensive Contribution", "Aerial Duels"],
    playstyle: "Creative playmaker who orchestrates attacks with elite vision and close control.",
    summary: "Messi still shapes matches through timing, composure, and final-third imagination.",
    pressureRating: 96,
  },
  {
    id: "haaland",
    name: "Erling Haaland",
    club: "Manchester City",
    nationality: "Norway",
    position: "Striker",
    age: 24,
    rating: 91,
    attributes: { pace: 89, shooting: 93, passing: 65, dribbling: 78, defending: 45, physical: 92 },
    recentForm: [7.5, 8.9, 9.2, 8.1, 8.7, 9.0, 8.3],
    strengths: ["Finishing", "Positioning", "Physical Power", "Pace"],
    growthAreas: ["Passing Range", "Build-up Play"],
    playstyle: "Penalty-box finisher with relentless movement and explosive transition threat.",
    summary: "Haaland remains one of the most direct and devastating scorers in world football.",
    pressureRating: 88,
  },
  {
    id: "mbappe",
    name: "Kylian Mbappe",
    club: "Real Madrid",
    nationality: "France",
    position: "Forward",
    age: 26,
    rating: 92,
    attributes: { pace: 97, shooting: 89, passing: 80, dribbling: 92, defending: 36, physical: 76 },
    recentForm: [8.0, 8.5, 7.9, 9.0, 8.2, 8.8, 9.1],
    strengths: ["Explosive Pace", "Finishing", "Counter-Attacks", "Big Game Impact"],
    growthAreas: ["Consistency", "Aerial Ability"],
    playstyle: "Electric forward who wins space early and punishes transition gaps instantly.",
    summary: "Mbappe brings pace, directness, and elite end-product to every attack.",
    pressureRating: 91,
  },
  {
    id: "bellingham",
    name: "Jude Bellingham",
    club: "Real Madrid",
    nationality: "England",
    position: "Midfielder",
    age: 21,
    rating: 90,
    attributes: { pace: 76, shooting: 82, passing: 85, dribbling: 86, defending: 72, physical: 80 },
    recentForm: [8.1, 8.5, 7.8, 8.9, 8.3, 9.0, 8.6],
    strengths: ["Box-to-Box Energy", "Goals from Midfield", "Leadership", "Versatility"],
    growthAreas: ["Defensive Positioning", "Long-Range Passing"],
    playstyle: "Dynamic midfielder who arrives in decisive areas with timing and power.",
    summary: "Bellingham combines volume, maturity, and high-value contributions across the pitch.",
    pressureRating: 89,
  },
  {
    id: "vinicius",
    name: "Vinicius Jr",
    club: "Real Madrid",
    nationality: "Brazil",
    position: "Winger",
    age: 24,
    rating: 92,
    attributes: { pace: 95, shooting: 82, passing: 78, dribbling: 94, defending: 30, physical: 68 },
    recentForm: [8.5, 9.0, 8.2, 7.8, 9.1, 8.7, 8.9],
    strengths: ["Dribbling", "Speed", "Big Game Performances", "1v1 Ability"],
    growthAreas: ["Decision Making", "Weak Foot"],
    playstyle: "High-volume dribbler who stretches games and attacks defenders repeatedly.",
    summary: "Vinicius changes the geometry of matches with direct running and sudden acceleration.",
    pressureRating: 90,
  },
  {
    id: "salah",
    name: "Mohamed Salah",
    club: "Liverpool",
    nationality: "Egypt",
    position: "Forward",
    age: 32,
    rating: 89,
    attributes: { pace: 88, shooting: 90, passing: 79, dribbling: 88, defending: 42, physical: 72 },
    recentForm: [8.3, 8.7, 7.9, 8.5, 9.0, 8.1, 8.8],
    strengths: ["Left-Foot Finishing", "Movement", "Consistency", "Work Rate"],
    growthAreas: ["Heading", "Passing Under Pressure"],
    playstyle: "Inside forward who attacks the half-space and finishes with repeatable precision.",
    summary: "Salah keeps delivering goals and volume chances from the right side of Liverpool's attack.",
    pressureRating: 87,
  },
  {
    id: "rodri",
    name: "Rodri",
    club: "Manchester City",
    nationality: "Spain",
    position: "Midfielder",
    age: 28,
    rating: 91,
    attributes: { pace: 60, shooting: 72, passing: 88, dribbling: 80, defending: 88, physical: 85 },
    recentForm: [8.0, 8.2, 8.5, 8.1, 8.4, 8.3, 8.6],
    strengths: ["Game Control", "Positioning", "Tackling", "Composure"],
    growthAreas: ["Pace", "Long-Range Shooting"],
    playstyle: "Tempo-setter who balances possession control with defensive coverage.",
    summary: "Rodri remains one of the best rhythm-setters in elite possession football.",
    pressureRating: 93,
  },
  {
    id: "musiala",
    name: "Jamal Musiala",
    club: "Bayern Munich",
    nationality: "Germany",
    position: "Midfielder",
    age: 21,
    rating: 88,
    attributes: { pace: 80, shooting: 78, passing: 84, dribbling: 92, defending: 48, physical: 64 },
    recentForm: [7.8, 8.5, 8.2, 8.8, 8.0, 8.6, 8.9],
    strengths: ["Close Control", "Creativity", "Agility", "Through Balls"],
    growthAreas: ["Physical Strength", "Defensive Work"],
    playstyle: "Press-resistant carrier who creates separation with balance and quick feet.",
    summary: "Musiala brings a rare blend of elegance and unpredictability between the lines.",
    pressureRating: 84,
  },
  {
    id: "lewandowski",
    name: "Robert Lewandowski",
    club: "Barcelona",
    nationality: "Poland",
    position: "Striker",
    age: 36,
    rating: 88,
    attributes: { pace: 68, shooting: 94, passing: 76, dribbling: 82, defending: 40, physical: 78 },
    recentForm: [7.5, 8.2, 8.8, 7.9, 8.5, 9.1, 8.0],
    strengths: ["Finishing", "Positioning", "Hold-Up Play", "Penalty Box Movement"],
    growthAreas: ["Pace", "Pressing Intensity"],
    playstyle: "Reference striker who thrives on timing, angles, and elite finishing mechanics.",
    summary: "Lewandowski still turns small shooting windows into high-value end product.",
    pressureRating: 90,
  },
  {
    id: "ronaldo",
    name: "Cristiano Ronaldo",
    club: "Al Nassr",
    nationality: "Portugal",
    position: "Forward",
    age: 40,
    rating: 85,
    attributes: { pace: 72, shooting: 92, passing: 72, dribbling: 78, defending: 34, physical: 80 },
    recentForm: [7.8, 8.5, 8.0, 7.5, 8.2, 8.8, 7.9],
    strengths: ["Heading", "Finishing", "Aerial Presence", "Mentality"],
    growthAreas: ["Pace", "Pressing"],
    playstyle: "Shot-heavy scorer who still attacks decisive moments with conviction.",
    summary: "Ronaldo remains dangerous whenever the game turns into a finishing contest.",
    pressureRating: 95,
  },
  {
    id: "P101",
    name: "Sunil Chhetri",
    club: "Bengaluru FC",
    nationality: "India",
    position: "Striker",
    age: 40,
    rating: 84,
    attributes: { pace: 72, shooting: 85, passing: 74, dribbling: 78, defending: 42, physical: 70 },
    recentForm: [7.7, 8.0, 7.9, 8.3, 8.1, 7.8, 8.4],
    strengths: ["Finishing", "Movement", "Leadership", "Composure"],
    growthAreas: ["Aerial Duels", "Recovery Pace"],
    playstyle: "Smart penalty-box striker who thrives on timing, movement, and decisive finishes.",
    summary: "India's iconic number nine still sets the tone with sharp movement and calm finishing.",
    pressureRating: 89,
  },
  {
    id: "P104",
    name: "Lallianzuala Chhangte",
    club: "Mumbai City",
    nationality: "India",
    position: "Winger",
    age: 27,
    rating: 82,
    attributes: { pace: 88, shooting: 76, passing: 75, dribbling: 84, defending: 45, physical: 68 },
    recentForm: [7.8, 8.2, 7.6, 8.5, 8.0, 8.4, 8.1],
    strengths: ["Acceleration", "Direct Running", "Ball Carrying", "Transitions"],
    growthAreas: ["Final Pass", "Back-Post Finishing"],
    playstyle: "Explosive wide attacker who stretches back lines and attacks open space quickly.",
    summary: "One of India's most dangerous wingers, offering pace and intent in every isolation.",
    pressureRating: 83,
  },
  {
    id: "P102",
    name: "Sahal Abdul Samad",
    club: "Mohun Bagan SG",
    nationality: "India",
    position: "Attacking Midfielder",
    age: 28,
    rating: 81,
    attributes: { pace: 79, shooting: 72, passing: 82, dribbling: 86, defending: 46, physical: 62 },
    recentForm: [7.6, 7.9, 8.1, 8.0, 8.3, 7.8, 8.2],
    strengths: ["Close Control", "Creativity", "Tight Turns", "Link Play"],
    growthAreas: ["Defensive Duels", "Shot Volume"],
    playstyle: "Smooth creator who slips between lines and carries through pressure.",
    summary: "Sahal brings control and invention to attacks that need subtle midfield craft.",
    pressureRating: 82,
  },
];

const pickPlayer = (id: string): Player => {
  const player = players.find((candidate) => candidate.id === id);

  if (!player) {
    throw new Error(`Missing mock player: ${id}`);
  }

  return player;
};

export const spotlightPlayers: Player[] = [
  pickPlayer("P101"),
  pickPlayer("mbappe"),
  pickPlayer("P104"),
  pickPlayer("rodri"),
  pickPlayer("P102"),
  pickPlayer("salah"),
];

export const matches: Match[] = [
  {
    id: "match-1",
    homeTeam: "Real Madrid",
    awayTeam: "Manchester City",
    homeScore: 3,
    awayScore: 2,
    competition: "UEFA Champions League - Semi-Final",
    date: "2026-04-01",
    venue: "Santiago Bernabeu",
    status: "completed",
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
      { minute: 23, event: "Goal", description: "Vinicius Jr opens the scoring with a sharp driving run." },
      { minute: 51, event: "Goal", description: "Haaland levels the match with a powerful header." },
      { minute: 67, event: "Red Card", description: "Kyle Walker sees red after a recovery foul." },
      { minute: 74, event: "Goal", description: "Bellingham restores Madrid's lead from close range." },
      { minute: 82, event: "Goal", description: "De Bruyne answers with a long-range strike." },
      { minute: 88, event: "Goal", description: "Mbappe seals it on the break late on." },
    ],
    stats: [
      { label: "Possession", home: 48, away: 52 },
      { label: "Shots", home: 16, away: 12 },
      { label: "Shots on Target", home: 8, away: 5 },
      { label: "Passes", home: 420, away: 480 },
      { label: "Tackles", home: 22, away: 18 },
      { label: "Corners", home: 7, away: 4 },
    ],
    phases: [
      { title: "Opening Exchanges", minutes: "0-20'", description: "Both sides probe space without giving much away." },
      { title: "Madrid Strike First", minutes: "20-45'", description: "Madrid hit the first breakthrough and threaten in transition." },
      { title: "City Fightback", minutes: "45-60'", description: "City respond with possession pressure and find an equalizer." },
      { title: "The Red Card Shift", minutes: "60-75'", description: "The sending-off tilts the match and changes the territory battle." },
      { title: "Dramatic Finale", minutes: "75-90'", description: "Late swings turn the closing phase into a shootout of big moments." },
    ],
  },
  {
    id: "match-2",
    homeTeam: "Barcelona",
    awayTeam: "Bayern Munich",
    homeScore: 2,
    awayScore: 2,
    competition: "UEFA Champions League - Quarter-Final",
    date: "2026-03-28",
    venue: "Camp Nou",
    status: "completed",
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
      { minute: 18, event: "Goal", description: "Lewandowski scores against his former club." },
      { minute: 42, event: "Goal", description: "Musiala levels it with a solo run." },
      { minute: 68, event: "Goal", description: "Barcelona reclaim the lead through quick wing play." },
      { minute: 85, event: "Goal", description: "Bayern equalize from the penalty spot." },
    ],
    stats: [
      { label: "Possession", home: 58, away: 42 },
      { label: "Shots", home: 14, away: 10 },
      { label: "Shots on Target", home: 6, away: 4 },
      { label: "Passes", home: 540, away: 380 },
      { label: "Tackles", home: 16, away: 20 },
      { label: "Corners", home: 6, away: 3 },
    ],
    phases: [
      { title: "Barcelona Control", minutes: "0-30'", description: "Barcelona own the ball and work central overloads." },
      { title: "Bayern Response", minutes: "30-60'", description: "Bayern improve the press and attack more directly." },
      { title: "Late Drama", minutes: "60-90'", description: "The closing stages swing with end-to-end transitions." },
    ],
  },
  {
    id: "match-3",
    homeTeam: "Liverpool",
    awayTeam: "Arsenal",
    homeScore: 1,
    awayScore: 0,
    competition: "Premier League",
    date: "2026-03-25",
    venue: "Anfield",
    status: "completed",
    momentum: [
      { minute: 0, home: 50, away: 50 },
      { minute: 15, home: 55, away: 45 },
      { minute: 30, home: 60, away: 40 },
      { minute: 45, home: 55, away: 45 },
      { minute: 60, home: 50, away: 50 },
      { minute: 75, home: 60, away: 40 },
      { minute: 90, home: 55, away: 45 },
    ],
    turningPoints: [{ minute: 72, event: "Goal", description: "Salah bends in the winner from the right channel." }],
    stats: [
      { label: "Possession", home: 52, away: 48 },
      { label: "Shots", home: 11, away: 8 },
      { label: "Shots on Target", home: 5, away: 3 },
      { label: "Passes", home: 460, away: 440 },
      { label: "Tackles", home: 20, away: 22 },
      { label: "Corners", home: 5, away: 6 },
    ],
    phases: [
      { title: "Tight First Half", minutes: "0-45'", description: "Both teams stay compact and limit central access." },
      { title: "Salah Magic", minutes: "45-90'", description: "Liverpool push the tempo and find one decisive action." },
    ],
  },
];

export const featuredStats = [
  { label: "Goals Tracked", value: "12,847" },
  { label: "Players Profiled", value: "4,200+" },
  { label: "Matches Analyzed", value: "3,156" },
  { label: "Leagues Covered", value: "42" },
];
