from sanic import Sanic, json

from model import ArticleOutline
from model.openai import OpenAIStateless
from model.section import Section
from utils.paser_response import parse_section_content
from utils.prompts import generate_content_prompt

app = Sanic.get_app()

# content generation routes
@app.route('/article/generate-content/get-prompt', methods=['POST'])
async def get_generate_content_prompt(request):
    data = request.json
    if not data:
        return json({"error": "No data provided"}, status=400)


    outline = ArticleOutline(**data["outline"])
    sections = []
    section_id = data.get("sectionId", 0)
    for i, section in enumerate(data.get("sections", [])):
        section_obj = Section(**section)
        if not section_obj.title:
            section_obj.title = f"Section {i+1}"
        sections.append(section_obj)
    prompt = generate_content_prompt(outline, sections, section_id)

    return json({"prompt": prompt}, status=200)

@app.route('/article/generate-content/manual', methods=['POST'])
async def generate_content_manual(request):
    data = request.json
    if not data:
        return json({"error": "No data provided"}, status=400)

    ai_response = data.get("text", "")
    text, summary = parse_section_content(ai_response)
    return json({
        "text": text,
        "summary": summary
    }, status=200)

@app.route('/article/generate-content', methods=['POST'])
async def generate_content(request):
    data = request.json
    if not data:
        return json({"error": "No data provided"}, status=400)

    outline = ArticleOutline(**data["outline"])
    sections = []
    for i, section in enumerate(data.get("sections", [])):
        section_obj = Section(**section)
        if not section_obj.title:
            section_obj.title = f"Section {i+1}"
        sections.append(section_obj)
    section_id = data.get("sectionId", 0)
    if section_id < 0 or section_id >= len(sections):
        return json({"error": "Invalid sectionId"}, status=400)

    prompt = generate_content_prompt(outline, sections, section_id)
    ai = OpenAIStateless()
    ai_response = await ai.ask(prompt)
    print(ai_response)
    try:
        text, summary = parse_section_content(ai_response)
    except TypeError as e:
        return json({"error": str(e)}, status=400)
    return json({
        "text": text,
        "summary": summary
    }, status=200, ensure_ascii=False)
