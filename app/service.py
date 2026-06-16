from __future__ import annotations

from typing import Dict, List

from .models import Post, Trust, TrustRating


def compute_post_trust_weight(post: Post, trusts: List[Trust]) -> float:
    """Simple transparent trust weight formula.

    +1 for each positive trust on 'general' or the post category.
    -1 for each negative trust on the same scopes.
    Final score scales by net vote signal to avoid opaque ranking.
    """
    relevant = [
        t
        for t in trusts
        if t.to_user_id == post.author_id and t.topic_id in {"general", post.category_id}
    ]
    score = sum(1 if t.rating == TrustRating.positive else -1 for t in relevant)
    vote_signal = post.votes.up - post.votes.down
    return float(score + (vote_signal * 0.1))


def fairness_flags(user_preferences: Dict[str, bool]) -> Dict[str, bool]:
    """Expose explainable controls for algorithmic personalization."""
    return {
        "personalization_enabled": user_preferences.get("personalization_enabled", True),
        "bias_audit_visible": True,
        "opt_out_available": True,
    }
