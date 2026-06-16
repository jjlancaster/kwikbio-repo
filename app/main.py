from __future__ import annotations

from fastapi import FastAPI

from .models import Comment, Post, Project, Trust, User

app = FastAPI(
    title="SciCrush.ai Gateway API",
    version="1.0.0",
    description=(
        "Versioned API schema for SciCrush social/research models. "
        "Includes transparency-oriented trust and personalization controls."
    ),
)


@app.get("/api/v1/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/v1/model-catalog")
def model_catalog() -> dict[str, list[str]]:
    return {
        "models": [
            User.__name__,
            Post.__name__,
            Comment.__name__,
            Project.__name__,
            Trust.__name__,
        ]
    }
