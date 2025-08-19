from sanic import Sanic
from sanic.response import json, text

app = Sanic("ThesisForge")

@app.route('/')
async def index(request):
    return text("Welcome to ThesisForge!")

# manually import handler modules
import handler


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8080, debug=True, auto_reload=True)
