from dataclasses import dataclass
import re
from typing import Optional, Union

from pydantic import BaseModel

from ._utils import _to_camel


class Section(BaseModel):
    title: str = None
    description: str
    expected_word_count: Optional[int] = None
    note: Optional[str] = None

    class Config:
        alias_generator = _to_camel
        validate_by_name = True