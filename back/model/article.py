from typing import Optional, List
from pydantic import BaseModel, Field
from ._utils import _to_camel

class AdditionalQuestion(BaseModel):
    question: str = ""
    answer: str = ""

    class Config:
        alias_generator = _to_camel
        validate_by_name = True


class ArticleOutline(BaseModel):
    title: str = ""
    subject_area: str = ""
    purpose: str = ""
    target_audience: str = ""
    language: str = ""
    min_word_count: Optional[int] = None
    max_word_count: Optional[int] = None
    require_references: bool = False
    include_formulas: bool = False
    preferred_tone: str = ""
    focus_area: Optional[str] = ""
    avoid_topics: str = ""
    existing_notes: str = ""
    need_abstract: bool = False
    additional_questions: List[AdditionalQuestion] = Field(default_factory=list)
    qa_summary: Optional[str] = ""

    class Config:
        alias_generator = _to_camel
        validate_by_name = True
