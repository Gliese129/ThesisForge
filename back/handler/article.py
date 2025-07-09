from sanic import Sanic, json

from model.advise import Advise
from model.article import ArticleOutline
from utils.prompts import generate_outline_prompt

app = Sanic.get_app()

@app.route('/article/outline/get-prompt', methods=['POST'])
async def get_prompt(request):
    data = request.json
    if not data:
        return json({"error": "No data provided"}, status=400)


    outline = ArticleOutline.from_json(data)
    prompt = generate_outline_prompt(outline)

    return json({"prompt": prompt}, status=200)

@app.route('/article/outline/update/manual', methods=['POST'])
async def update_outline(request):
    data = request.json
    if not data:
        return json({"error": "No data provided"}, status=400)

    ai_response = data.get("text", "")
    try:
        advise = Advise.from_text(ai_response)
    except TypeError as e:
        return json({"error": str(e)}, status=400)

    return json(advise.to_dict(),  status=200)