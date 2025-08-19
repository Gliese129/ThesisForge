import re

def _to_camel(string: str) -> str:
    return re.sub(r'_([a-zA-Z])', lambda m: m.group(1).upper(), string)