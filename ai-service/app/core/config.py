from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "PlayerIQ AI Service"
    app_env: str = "development"
    data_path: str = "../data"
    model_path: str = "./models"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()

