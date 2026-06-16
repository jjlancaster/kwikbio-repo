from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class VerificationStatus(str, Enum):
    unverified = "unverified"
    photo_verified = "photoVerified"
    fully_verified = "fullyVerified"


class UserRole(str, Enum):
    normal_user = "normalUser"
    researcher = "researcher"
    moderator = "moderator"
    child_account = "childAccount"


class VisibilityLevel(str, Enum):
    public = "public"
    donated = "donated"
    private = "private"


class ProfileInfo(BaseModel):
    name: str
    pronouns: str = Field(description="Inclusive pronoun text chosen by the user.")
    biography: Optional[str] = None
    education_level: Optional[str] = None
    research_interests: List[str] = Field(default_factory=list)
    dating_preferences: List[str] = Field(default_factory=list)
    trust_badge: Optional[str] = None


class PrivacySettings(BaseModel):
    profile_visibility: VisibilityLevel = VisibilityLevel.public
    research_data_visibility: VisibilityLevel = VisibilityLevel.donated
    dating_data_visibility: VisibilityLevel = VisibilityLevel.private


class User(BaseModel):
    model_config = ConfigDict(use_enum_values=True)

    id: UUID = Field(default_factory=uuid4)
    username: str
    password_hash: str
    email: EmailStr
    profile_info: ProfileInfo
    privacy_settings: PrivacySettings
    verification_status: VerificationStatus = VerificationStatus.unverified
    trust_score_by_topic: Dict[str, float] = Field(default_factory=dict)
    trust_beacon_selections: List[str] = Field(default_factory=list)
    role: UserRole = UserRole.normal_user


class PostMetadata(BaseModel):
    dataset_id: Optional[str] = None
    project_id: Optional[str] = None


class VoteCounts(BaseModel):
    up: int = 0
    down: int = 0


class Post(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    author_id: UUID
    content: str
    media_urls: List[str] = Field(default_factory=list)
    category_id: str
    tags: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    votes: VoteCounts = Field(default_factory=VoteCounts)
    trust_weight: float = 0.0
    metadata: PostMetadata = Field(default_factory=PostMetadata)


class Comment(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    post_id: UUID
    parent_comment_id: Optional[UUID] = None
    author_id: UUID
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    votes: VoteCounts = Field(default_factory=VoteCounts)


class ProjectMember(BaseModel):
    user_id: UUID
    role: str
    permissions: List[str] = Field(default_factory=list)


class Project(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    name: str
    description: str
    owner_id: UUID
    members: List[ProjectMember] = Field(default_factory=list)
    datasets: List[str] = Field(default_factory=list)
    starship_model: Optional[str] = None
    trust_level: float = 0.0


class TrustRating(str, Enum):
    positive = "positive"
    negative = "negative"


class Trust(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    from_user_id: UUID
    to_user_id: UUID
    topic_id: str
    rating: TrustRating
    beacon_id: Optional[str] = None
