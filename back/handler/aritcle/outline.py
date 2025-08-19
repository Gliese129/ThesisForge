from sanic import Sanic, json

from model.article import ArticleOutline
from model.openai import OpenAIStateless
from utils.paser_response import parse_advice
from utils.prompts import generate_outline_prompt

app = Sanic.get_app()

# outline update routes
@app.route('/article/update-outline/get-prompt', methods=['POST'])
async def outline_get_prompt(request):
    data = request.json
    if not data:
        return json({"error": "No data provided"}, status=400)

    outline = ArticleOutline(**data)
    prompt = generate_outline_prompt(outline)

    return json({"prompt": prompt}, status=200)

@app.route('/article/update-outline/manual', methods=['POST'])
async def update_outline_manually(request):
    data = request.json
    if not data:
        return json({"error": "No data provided"}, status=400)

    ai_response = data.get("text", "")
    try:
        advise = parse_advice(ai_response)
    except TypeError as e:
        return json({"error": str(e)}, status=400)

    return json(advise.model_dump(by_alias=True),  status=200)

@app.route('/article/update-outline', methods=['POST'])
async def update_outline(request):
    data = request.json
    if not data:
        return json({"error": "No data provided"}, status=400)

    outline = ArticleOutline(**data)
    if not outline.title:
        return json({"error": "Title is required"}, status=400)

    prompt = generate_outline_prompt(outline)
    ai = OpenAIStateless()
    ai_response = await ai.ask(prompt)
    print(ai_response)
    try:
        advise = parse_advice(ai_response)
    except TypeError as e:
        return json({"error": str(e)}, status=400)

    return json(advise.model_dump(by_alias=True), status=200)