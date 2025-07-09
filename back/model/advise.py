import re
from dataclasses import dataclass
from typing import Tuple


@dataclass
class Advise:
    additional_questions: list[str] = None
    suggestions: list[Tuple[str, str]] = None
    completed: bool = False

    @classmethod
    def from_text(cls, text: str):
        lines = text.strip().split("\n")

        mode = None  # Tracks current section: 'questions', 'suggestions', or None

        question_pattern = r"^\s*\*\s*(.+?)\s*$"
        suggestion_pattern = r"^\s*\*\s*(.+?)\s*→\s*(.+?)\s*$"
        status_pattern = r"^\s*\*\s*Status:\s*(.*)$"

        completed = False
        questions = []
        suggestions = []

        for line in lines:
            # Check section headers
            if line.strip().startswith("* Questions:"):
                mode = 'questions'
                continue
            elif line.strip().startswith("* Suggestions:"):
                mode = 'suggestions'
                continue
            elif re.match(status_pattern, line):
                status_match = re.match(status_pattern, line)
                if status_match and "confirmed" in status_match.group(1).lower():
                    completed = True
                continue

            # Process contents based on mode
            if mode == 'questions':
                q_match = re.match(question_pattern, line)
                if q_match:
                    questions.append(q_match.group(1).strip())

            elif mode == 'suggestions':
                s_match = re.match(suggestion_pattern, line)
                if s_match:
                    suggestions.append((s_match.group(1).strip(), s_match.group(2).strip()))

        return cls(
            additional_questions=questions,
            suggestions=suggestions,
            completed=completed
        )

    def to_dict(self):
        return {
            "additional_questions": self.additional_questions or [],
            "suggestions": self.suggestions or [],
            "completed": self.completed
        }
