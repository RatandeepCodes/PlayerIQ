from pydantic import BaseModel, Field


class AttributeScores(BaseModel):
    shooting: int = Field(ge=0, le=100)
    passing: int = Field(ge=0, le=100)
    dribbling: int = Field(ge=0, le=100)
    defending: int = Field(ge=0, le=100)
    creativity: int = Field(ge=0, le=100)
    physical: int = Field(ge=0, le=100)


class RatingResponse(BaseModel):
    player_id: str = Field(serialization_alias="playerId")
    player_name: str = Field(serialization_alias="playerName")
    team: str
    position: str
    overall_rating: int = Field(serialization_alias="overallRating")
    ppi: int
    attributes: AttributeScores


class PlaystyleResponse(BaseModel):
    player_id: str = Field(serialization_alias="playerId")
    playstyle: str
    cluster_distance: float = Field(serialization_alias="clusterDistance")
    supporting_traits: list[str] = Field(serialization_alias="supportingTraits")


class PressureResponse(BaseModel):
    player_id: str = Field(serialization_alias="playerId")
    pressure_index: float = Field(serialization_alias="pressureIndex")
    pressure_score: int = Field(serialization_alias="pressureScore")
    interpretation: str


class RadarPoint(BaseModel):
    metric: str
    player_one: int = Field(serialization_alias="playerOne")
    player_two: int = Field(serialization_alias="playerTwo")


class CompareResponse(BaseModel):
    player_one: str = Field(serialization_alias="playerOne")
    player_two: str = Field(serialization_alias="playerTwo")
    winner: str
    summary: str
    radar: list[RadarPoint]


class ReportResponse(BaseModel):
    player_id: str = Field(serialization_alias="playerId")
    summary: str
    strengths: list[str]
    development_areas: list[str] = Field(serialization_alias="developmentAreas")


class SimulationTick(BaseModel):
    minute: int
    player_id: str = Field(serialization_alias="playerId")
    live_rating: int = Field(serialization_alias="liveRating")
    live_ppi: int = Field(serialization_alias="livePpi")


class SimulationResponse(BaseModel):
    match_id: str = Field(serialization_alias="matchId")
    status: str
    timeline: list[SimulationTick]


class TurningPoint(BaseModel):
    minute: int
    intensity: int
    team: str
    note: str


class TurningPointResponse(BaseModel):
    match_id: str = Field(serialization_alias="matchId")
    turning_points: list[TurningPoint] = Field(serialization_alias="turningPoints")

