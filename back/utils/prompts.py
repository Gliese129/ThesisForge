from typing import List

from model.article import ArticleOutline
from model.section import Section
from utils.formatter import format_outline_info, format_extra_questions, format_section_plans, format_section_contents


def generate_outline_prompt(outline: ArticleOutline) -> str:
    formatted_outline_info = format_outline_info(outline)
    formatted_extra_questions = format_extra_questions(outline)
    prompt = f"""
You are an expert academic writing assistant.

Below is a student's article writing plan:
{formatted_outline_info}

Additional clarifications from the student (if any):
{formatted_extra_questions}

Please provide your analysis and suggestions as a single valid JSON object in one of these schemas:
""""""
If more information is needed:
{
  "status": "Need info",
  "questions": [
    "First follow-up question?",
    "Second follow-up question?"
  ],
  "suggestions": [
    {"field": "fieldName", "suggestion": "improvement"},
    [optional] {"field": "existingNotes", "suggestion": "Based on the original notes and previous Q&A, summarize key points here to save tokens."}
  ]
}

If all required information is present:
{
  "status": "Outline confirmed",
  "questions": [],
  "suggestions": [
  [optional] {"field": "existingNotes", "suggestion": "Based on the original notes and previous Q&A, summarize key points here to save tokens."}
  ]
}

Your response MUST be ONLY the JSON object, with no extra text or formatting. It must be parseable by Python's json.loads().
FieldName can be any of: title, subjectArea, purpose, targetAudience, language, minWordCount, maxWordCount, requireReferences, includeFormulas, preferredTone, focusArea, avoidTopics, existingNotes, needAbstract.
Also, summarize the previous Q&A to existing notes to save tokens.
"""
    return prompt.strip()

def generate_structure_prompt(outline: ArticleOutline) -> str:
    formatted_outline_info = format_outline_info(outline)
    formatted_extra_questions = format_extra_questions(outline)
    prompt = f"""
You are an expert academic writing assistant.

Below is a student's article writing plan:
{formatted_outline_info}

Additional clarifications from the student (if any):
{formatted_extra_questions}

The student has provided a confirmed and complete writing plan for their article.

Please generate a detailed outline for the article as a JSON object.
""""""
The JSON must contain two keys:
1. "sections": an array of objects conforming to the Section schema:
   [
     {
       "title": "...",
       "description": "...",
       "expectedWordCount": <number or null>,
       "note": <string or null>
     },
     ...
   ]
2. "qaSummary": a concise string that integrates the key points from the previous Q&A clarifications and the outline’s summary, minimizing token usage.

Your response MUST be ONLY this JSON object, with no extra text. It must be parseable by Python's json.loads().
"""
    return prompt.strip()



def update_structure_prompt(outline: ArticleOutline, sections: List[Section]) -> str:
    formatted_outline_info = format_outline_info(outline)
    qa_summary = outline.qa_summary or ""
    formatted_section_plan = format_section_plans(sections)
    prompt = """
You are an expert academic writing assistant.

The student has provided their article plan and current sections.

Please generate a structured article outline update as a single JSON object with exactly these keys:

1. "sections": an array of objects matching the Section schema:
   [
     {
       "title": "...",
       "description": "...",
       "wordCount": <number or null>,
       "note": <string or null>
     },
     ...
   ]
2. "qaSummary": a concise string integrating any new clarifications and summary notes.
3. "completed": a boolean. Set to true if no changes are needed (keep sections as-is), or false if you modified the sections or summary.
"""f"""
Context:
- Outline Information:
{formatted_outline_info}
- Additional Q&A Summary:
{qa_summary}
- Current Section Plans:
{formatted_section_plan}

Your response MUST be ONLY this JSON object. No plaintext, no extra commentary. It must parse with json.loads().
"""
    return prompt.strip()


def generate_content_prompt(outline: ArticleOutline, sections: list[Section], section_id: int) -> str:
    formatted_outline_info = format_outline_info(outline)
    previous_section_contents = format_section_contents(sections[:section_id])
    current_section_plan = format_section_plans([sections[section_id]]) if section_id < len(sections) else "No current section plan."
    future_section_plans = format_section_plans(sections[section_id+1:]) if section_id + 1 < len(sections) else "No future sections."
    prompt = f"""
You are an expert academic writing assistant.

You're working on a structured article. The writing editor uses **Markdown** format (same syntax as the Milkdown + Crepe editor), with a special comment format:

- `[[original text | human suggestion]]`: this indicates a human made a suggestion on that part of the text.  
  When you see this, revise the original text accordingly.
- [content](https://example.com): this indicates a reference link. ")" should be applied only to the link, not the preceding text.

Below is the writing **outline** and other section summaries (you can use this as context):

{formatted_outline_info}

Previous section summaries (prior context):
{previous_section_contents}

Future section plans (for context only, do not write these sections yet):
{future_section_plans}

Now, you are editing **Section {section_id}:**
{current_section_plan}

Existing content:
{sections[section_id].content if section_id < len(sections) else "No existing content."}

### Your Task:
1. Write this section from scratch, using the notes and description.
2. After writing, **generate a concise Summary (2–3 lines)** of this section’s key content for context tracking.

Remember:

Use clear and academic tone.
If formulas or references are needed, write them in markdown format ($$...$$ for math).
Keep the same language as specified in the outline.

Avoid repeating information from earlier sections unless contextually needed.

Output Format:
# Section Content
Your full section content in markdown format here.

---

# Summary
A concise 2-3 line summary of this section's key points here.


"""
    return prompt.strip()
