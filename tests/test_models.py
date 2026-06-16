from uuid import uuid4

from app.models import Post, PrivacySettings, ProfileInfo, User, VisibilityLevel


def test_user_defaults_and_privacy():
    user = User(
        username="joule",
        password_hash="hashed",
        email="joule@example.org",
        profile_info=ProfileInfo(name="Joule", pronouns="she/they"),
        privacy_settings=PrivacySettings(),
    )
    assert user.role == "normalUser"
    assert user.privacy_settings.dating_data_visibility == VisibilityLevel.private


def test_post_vote_defaults():
    post = Post(author_id=uuid4(), content="hello", category_id="research")
    assert post.votes.up == 0
    assert post.votes.down == 0
