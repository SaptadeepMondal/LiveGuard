from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MODE: str = "demo"  # 'demo' or 'live'
    DATABASE_URL: str = "sqlite:///./liveguard.db"
    INGEST_SHARED_SECRET: str = "super_secret_dev_key"

    class Config:
        env_file = ".env"

settings = Settings()
