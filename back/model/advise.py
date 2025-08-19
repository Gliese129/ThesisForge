import re
from dataclasses import dataclass
from typing import Tuple

from pydantic import BaseModel
from ._utils import _to_camel


class Advise(BaseModel):
    additional_questions: list[str] = None
    suggestions: list[Tuple[str, str]] = None
    completed: bool = False

    class Config:
        alias_generator = _to_camel
        validate_by_name = True

