import json
import re
from typing import List, Tuple, Optional

from model.advise import Advise
from model.section import Section


def clean_text(text: str) -> str:
    """
    Remove leading/trailing data from the text and ensure it is in a clean format for JSON parsing.
    """
    text = text.strip()
    # Remove any leading/trailing characters that might interfere with JSON parsing
    if text.startswith("```json"):
        text = text[7:].strip()  # Remove the "```json" prefix
    if text.endswith("```"):
        text = text[:-3].strip()  # Remove the trailing "```"
    return text



def parse_advice(text: str) -> Advise:
    text = clean_text(text)
    try:
        data = json.loads(text)
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse AI response as JSON: {e}")
    status = data.get("status", "")
    questions = data.get("questions", [])
    raw_suggestions = data.get("suggestions", [])
    suggestions: List[Tuple[str, str]] = []
    for item in raw_suggestions:
        if isinstance(item, dict) and "field" in item and "suggestion" in item:
            suggestions.append((item["field"], item["suggestion"]))
    completed = True if status.lower() == "outline confirmed" else False
    return Advise(
        additional_questions=questions,
        suggestions=suggestions,
        completed=completed,
    )

def parse_structure(text: str) -> Tuple[List[Section], str, bool]:
    """
    Parse AI's JSON response into sections list and qa_summary.
    """
    text = clean_text(text)
    try:
        data = json.loads(text)
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse Structure JSON: {e}")
    raw_sections = data.get("sections", [])
    # qaSummary holds the combined Q&A and outline summary to save tokens
    qa_summary = data.get("qaSummary", "")
    completed = data.get("completed", False)
    sections: List[Section] = []
    for item in raw_sections:
        if isinstance(item, dict):
            sections.append(Section(**item))
    return sections, qa_summary, completed
