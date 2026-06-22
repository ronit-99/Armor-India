from pathlib import Path

from pydantic import PrivateAttr
from pydantic_settings import BaseSettings, SettingsConfigDict

_ROOT_ENV = Path(__file__).resolve().parents[2] / ".env"
_BACKEND_ENV = Path(__file__).resolve().parents[1] / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(
            str(_ROOT_ENV) if _ROOT_ENV.exists()
            else str(_BACKEND_ENV) if _BACKEND_ENV.exists()
            else ".env"
        ),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    openai_vision_model: str = "gpt-4o-mini"
    app_name: str = "Armor India"
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001"

    _runtime_api_key: str = PrivateAttr(default="")

    @property
    def effective_api_key(self) -> str:
        if self._runtime_api_key:
            return self._runtime_api_key
        return self.openai_api_key

    def set_runtime_api_key(self, key: str) -> None:
        self._runtime_api_key = key.strip()

    @property
    def ai_enabled(self) -> bool:
        key = self.effective_api_key
        return bool(key and key not in ("", "your_openai_api_key_here"))

    def save_api_key_to_env(self, key: str) -> bool:
        env_path = _ROOT_ENV if _ROOT_ENV.parent.exists() else _BACKEND_ENV
        try:
            lines: list[str] = []
            if env_path.exists():
                lines = env_path.read_text(encoding="utf-8").splitlines()
            updated = False
            new_lines = []
            for line in lines:
                if line.startswith("OPENAI_API_KEY="):
                    new_lines.append(f"OPENAI_API_KEY={key}")
                    updated = True
                else:
                    new_lines.append(line)
            if not updated:
                new_lines.append(f"OPENAI_API_KEY={key}")
            env_path.write_text("\n".join(new_lines) + "\n", encoding="utf-8")
            self.openai_api_key = key
            self._runtime_api_key = key
            return True
        except Exception:
            self.set_runtime_api_key(key)
            return False


settings = Settings()
