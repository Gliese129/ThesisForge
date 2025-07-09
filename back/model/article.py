from dataclasses import dataclass, field
from typing import Optional, List

@dataclass
class AdditionalQuestion:
    question: str
    answer: str

@dataclass
class ArticleOutline:
    title: str
    subject_area: str
    purpose: str
    target_audience: str
    language: str
    min_word_count: Optional[int] = None
    max_word_count: Optional[int] = None
    require_references: bool = False
    include_formulas: bool = False
    preferred_tone: str = ""
    focus_area: Optional[str] = None
    avoid_topics: str = field(default_factory=list)
    existing_notes: str = ""
    need_abstract: bool = False
    additional_questions: Optional[List[AdditionalQuestion]] = field(default_factory=list)

    @classmethod
    def from_json(cls, data: dict):
        return cls(
            title=data.get("title", ""),
            subject_area=data.get("subjectArea", ""),
            purpose=data.get("purpose", ""),
            target_audience=data.get("targetAudience", ""),
            language=data.get("language", ""),
            min_word_count=data.get("minWordCount", None),
            max_word_count=data.get("maxWordCount", None),
            require_references=data.get("requireReferences", False),
            include_formulas=data.get("includeFormulas", False),
            preferred_tone=data.get("preferredTone", ""),
            focus_area=data.get("focusArea"),
            avoid_topics=data.get("avoidTopics", ""),
            existing_notes=data.get("existingNotes", ""),
            need_abstract=data.get("needAbstract", False),
            additional_questions=[
                AdditionalQuestion(**q) for q in data.get("additionalQuestions", [])
            ]
        )