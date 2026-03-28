from pydantic import BaseModel, ConfigDict, Field


class APIModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class AttributeScores(APIModel):
    shooting: int = Field(ge=0, le=100)
    passing: int = Field(ge=0, le=100)
    dribbling: int = Field(ge=0, le=100)
    defending: int = Field(ge=0, le=100)
    creativity: int = Field(ge=0, le=100)
    physical: int = Field(ge=0, le=100)


class RatingResponse(APIModel):
    player_id: str = Field(serialization_alias="playerId")
    player_name: str = Field(serialization_alias="playerName")
    team: str
    nationality: str
    position: str
    overall_rating: int = Field(serialization_alias="overallRating")
    ppi: int
    matches_analyzed: int = Field(serialization_alias="matchesAnalyzed")
    sources: list[str]
    attributes: AttributeScores


class PlaystyleResponse(APIModel):
    player_id: str = Field(serialization_alias="playerId")
    playstyle: str
    cluster_distance: float = Field(serialization_alias="clusterDistance")
    supporting_traits: list[str] = Field(serialization_alias="supportingTraits")


class PressureResponse(APIModel):
    player_id: str = Field(serialization_alias="playerId")
    pressure_index: float = Field(serialization_alias="pressureIndex")
    pressure_score: int = Field(serialization_alias="pressureScore")
    pressure_events: int = Field(serialization_alias="pressureEvents")
    interpretation: str


class RadarPoint(APIModel):
    metric: str
    player_one: int = Field(serialization_alias="playerOne")
    player_two: int = Field(serialization_alias="playerTwo")


class CompareResponse(APIModel):
    player_one: str = Field(serialization_alias="playerOne")
    player_two: str = Field(serialization_alias="playerTwo")
    winner: str
    summary: str
    radar: list[RadarPoint]


class ReportResponse(APIModel):
    player_id: str = Field(serialization_alias="playerId")
    summary: str
    strengths: list[str]
    development_areas: list[str] = Field(serialization_alias="developmentAreas")


class SimulationTick(APIModel):
    minute: int
    second: int
    player_id: str = Field(serialization_alias="playerId")
    player_name: str = Field(serialization_alias="playerName")
    team: str
    event_type: str = Field(serialization_alias="eventType")
    live_rating: int = Field(serialization_alias="liveRating")
    live_ppi: int = Field(serialization_alias="livePpi")


class SimulationResponse(APIModel):
    match_id: str = Field(serialization_alias="matchId")
    status: str
    timeline: list[SimulationTick]


class TurningPoint(APIModel):
    minute: int
    intensity: int
    team: str
    note: str


class TurningPointResponse(APIModel):
    match_id: str = Field(serialization_alias="matchId")
    turning_points: list[TurningPoint] = Field(serialization_alias="turningPoints")


class TeamMomentumScore(APIModel):
    team: str
    score: float


class MomentumBucket(APIModel):
    bucket_start: int = Field(serialization_alias="bucketStart")
    bucket_end: int = Field(serialization_alias="bucketEnd")
    label: str
    minute_mark: int = Field(serialization_alias="minuteMark")
    scores: list[TeamMomentumScore]
    leading_team: str | None = Field(default=None, serialization_alias="leadingTeam")
    swing: bool = False
    swing_magnitude: float = Field(default=0.0, serialization_alias="swingMagnitude")
    note: str | None = None


class MatchMomentumResponse(APIModel):
    match_id: str = Field(serialization_alias="matchId")
    teams: list[str]
    buckets: list[MomentumBucket]


class DatasetSummaryResponse(APIModel):
    total_events: int = Field(serialization_alias="totalEvents")
    total_players: int = Field(serialization_alias="totalPlayers")
    indian_players: int = Field(serialization_alias="indianPlayers")
    competitions: list[str]
    sources: list[str]


class PlayerListItem(APIModel):
    player_id: str = Field(serialization_alias="playerId")
    player_name: str = Field(serialization_alias="playerName")
    team: str
    nationality: str
    position: str
    is_indian: bool = Field(serialization_alias="isIndian")
    sources: list[str]


class PlayerListResponse(APIModel):
    players: list[PlayerListItem]
