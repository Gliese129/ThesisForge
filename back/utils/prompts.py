from model.article import ArticleOutline
from utils.formatter import format_outline_info, format_extra_questions


def generate_outline_prompt(outline: ArticleOutline) -> str:
    formatted_outline_info = format_outline_info(outline)
    formatted_extra_questions = format_extra_questions(outline)
    prompt = f"""
You are an expert academic writing assistant.

Below is a student's article writing plan:
{formatted_outline_info}

Additional clarifications from the student (if any):
{formatted_extra_questions}
""""""
Please perform the following steps:

1. Carefully analyze the plan and identify any vague or incomplete areas.  
2. If there is missing, vague, or potentially inconsistent information, ask 2–4 specific follow-up questions to clarify.
   ⚠️ Do not mention field names. Ask naturally, as if you're conversing.  
3. Suggest any improvements to the existing fields by explicitly indicating which field you're modifying and what the updated value should be.
   ⚠️ Suggest at most one improvement per field.
   ⚠️ Do not add any explanations, comments, punctuation, or quotation marks.
   ⚠️ Do not suggest new fields, only improvements to existing ones. Only list fields that need improvement.
4. If all necessary information is sufficient for generating an outline, begin your response with:  
   Status: Outline confirmed
   You may still provide optional suggestions if relevant.
   
The following are reserved structured fields.  
If you find issues or improvements for them, list them in Suggestions, not in Questions:

title, subjectArea, purpose, targetAudience, language, minWordCount, maxWordCount, requireReferences, includeFormulas, preferredTone, focusArea, avoidTopics, existingNotes, needAbstract

Only ask clarifying questions for other missing or high-level information.

### Output Format
If more info is needed:
- Status: Need info
- Questions:
    - ...
    - ...
- Suggestions:
    - {field name} → {suggested improvement}
    - ...

If info is sufficient:
- Status: Outline confirmed
- Questions:
    - ...
    - ...

- Suggestions:
    - {field name} → {suggested improvement}
    - ...
"""
    return prompt.strip()