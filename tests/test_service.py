from uuid import uuid4

from app.models import Post, Trust, TrustRating
from app.service import compute_post_trust_weight, fairness_flags


def test_compute_post_trust_weight():
    author_id = uuid4()
    post = Post(author_id=author_id, content="data", category_id="research")
    post.votes.up = 5

    trusts = [
        Trust(from_user_id=uuid4(), to_user_id=author_id, topic_id="general", rating=TrustRating.positive),
        Trust(from_user_id=uuid4(), to_user_id=author_id, topic_id="research", rating=TrustRating.positive),
        Trust(from_user_id=uuid4(), to_user_id=author_id, topic_id="dating", rating=TrustRating.negative),
    ]

    assert compute_post_trust_weight(post, trusts) == 2.5


def test_fairness_flags_opt_out():
    flags = fairness_flags({"personalization_enabled": False})
    assert flags["personalization_enabled"] is False
    assert flags["opt_out_available"] is True
