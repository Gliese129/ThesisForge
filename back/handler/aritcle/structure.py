from sanic import Sanic, json

from model.article import ArticleOutline
from model.openai import OpenAIStateless
from model.section import Section
from utils.paser_response import parse_structure
from utils.prompts import update_structure_prompt, generate_structure_prompt

app = Sanic.get_app()

# structure generation routes
@app.route('/article/generate-structure/get-prompt', methods=['POST'])
async def generate_structure_get_prompt(request):
    data = request.json
    if not data:
        return json({"error": "No data provided"}, status=400)

    outline = ArticleOutline(**data)
    if not outline.title:
        return json({"error": "Title is required"}, status=400)

    prompt = generate_structure_prompt(outline)


    # Here you would typically call a function to generate the structure based on the outline
    # For now, we will just return the outline as a placeholder
    return json({"prompt": prompt}, status=200)

@app.route('/article/generate-structure/manual', methods=['POST'])
async def generate_structure_manual(request):
    data = request.json
    if not data:
        return json({"error": "No data provided"}, status=400)

    ai_response = data.get("text", "")
    try:
        sections, qa_summary, _ = parse_structure(ai_response)
    except TypeError as e:
        return json({"error": str(e)}, status=400)

    sections = [section.model_dump(by_alias=True) for section in sections]
    return json({
        "sections": sections,
        "qaSummary": qa_summary
    }, status=200)

@app.route('/article/generate-structure', methods=['POST'])
async def generate_structure(request):
    data = request.json
    if not data:
        return json({"error": "No data provided"}, status=400)

    outline = ArticleOutline(**data)
    if not outline.title:
        return json({"error": "Title is required"}, status=400)

    prompt = generate_structure_prompt(outline)
    ai = OpenAIStateless()
    ai_response = await ai.ask(prompt)
    print(ai_response) # TODO: remove debug print

    try:
        result = parse_structure(ai_response)
    except TypeError as e:
        return json({"error": str(e)}, status=400)

    sections, qa_summary, _ = result
    sections = [section.model_dump(by_alias=True) for section in sections]
    return json({
        "sections": sections,
        "qaSummary": qa_summary
    }, status=200)

# structure update routes
@app.route('/article/update-structure/get-prompt', methods=['POST'])
async def update_structure_get_prompt(request):
    data = request.json
    if not data:
        return json({"error": "No data provided"}, status=400)

    outline_raw, sections_raw = data.get("outline"), data.get("sections")

    outline = ArticleOutline(**outline_raw)
    sections = [Section(**section) for section in sections_raw] if sections_raw else []

    prompt = update_structure_prompt(outline, sections)

    return json({"prompt": prompt}, status=200)

@app.route('/article/update-structure/manual', methods=['POST'])
async def update_structure_manual(request):
    data = request.json
    if not data:
        return json({"error": "No data provided"}, status=400)

    ai_response: str = data.get("text", "").strip()
    try:
        sections, qa_summary, completed = parse_structure(ai_response)
    except TypeError as e:
        return json({"error": str(e)}, status=400)

    sections = [section.model_dump(by_alias=True) for section in sections]
    return json({
        "sections": sections,
        "qaSummary": qa_summary,
        "completed": completed
    }, status=200)

@app.route('/article/update-structure', methods=['POST'])
async def update_structure(request):
    data = request.json
    if not data:
        return json({"error": "No data provided"}, status=400)
    outline_raw, sections_raw = data.get("outline"), data.get("sections")
    outline = ArticleOutline(**outline_raw)
    sections = [Section(**section) for section in sections_raw] if sections_raw else []
    if not outline.title:
        return json({"error": "Title is required"}, status=400)
    prompt = update_structure_prompt(outline, sections)
    ai = OpenAIStateless()
    ai_response = await ai.ask(prompt)
    print(ai_response)
    try:
        sections, qa_summary, completed = parse_structure(ai_response)
    except TypeError as e:
        return json({"error": str(e)}, status=400)
    sections = [section.model_dump(by_alias=True) for section in sections]
    return json({
        "sections": sections,
        "qaSummary": qa_summary,
        "completed": completed
    }, status=200)
