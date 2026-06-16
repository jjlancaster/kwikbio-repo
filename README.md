# SciCrush.ai Gateway – Data Model Starter

This repository now includes a lightweight, testable backend starter for the SciCrush.ai gateway concept.

## Included

- Versioned API routes under `/api/v1/*`.
- Pydantic data models for:
  - `User`
  - `Post`
  - `Comment`
  - `Project` (Starship)
  - `Trust`
- Transparent trust-weight computation utility.
- Algorithmic-personalization opt-out flag support.
- Unit + integration/API tests.
- GitHub Actions CI pipeline.

## Quickstart

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pytest -q
```

## API Docs

When served with Uvicorn, interactive docs are available at:

- `/docs` (Swagger UI)
- `/openapi.json` (OpenAPI schema)

Example run:

```bash
uvicorn app.main:app --reload
```

## Ethical AI and FAIR Notes

- Trust weighting logic is explicit in `app/service.py` and designed to be auditable.
- Personalization controls expose user opt-out state.
- Models include privacy settings and role/verification fields to support safety-aware flows.
