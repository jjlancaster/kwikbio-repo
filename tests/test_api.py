from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_model_catalog_contains_user():
    response = client.get("/api/v1/model-catalog")
    assert response.status_code == 200
    assert "User" in response.json()["models"]
