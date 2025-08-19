import os

import openai
from dotenv import load_dotenv

class OpenAIStateless:
    """
    An OpenAI model without history management.
    """
    def __init__(self, model_name: str='gpt-4o', api_key: str=None, temperature: float=0.7):
        self.model_name = model_name
        if api_key:
            self.api_key = api_key
        else:
            load_dotenv()
            self.api_key = os.getenv('OPENAI_API_KEY')
        self.history = [
            {"role": "system", "content": "You are an expert academic writing assistant."}
        ]
        self.temperature = temperature

    async def ask(self, prompt: str) -> str:
        # Simulate a call to OpenAI's API
        if not self.api_key:
            raise ValueError("API key is not set. Please provide a valid OpenAI API key.")
        history = self.history + [{"role": "user", "content": prompt}]
        client = openai.Client(api_key=self.api_key)
        response = client.responses.create(
            model=self.model_name,
            input=history,
            temperature=self.temperature,
        )
        return response.output_text.strip()


class OpenAIStateful(OpenAIStateless):
    """
    An OpenAI model with history management.
    """
    def __init__(self, model_name: str='gpt-4o', api_key: str=None, temperature: float=0.7):
        super().__init__(model_name, api_key, temperature)
        self.history = []

    def ask(self, prompt: str) -> str:
        # Simulate a call to OpenAI's API
        if not self.api_key:
            raise ValueError("API key is not set. Please provide a valid OpenAI API key.")
        self.history.append({"role": "user", "content": prompt})

        response = openai.ChatCompletion.create(
            model=self.model_name,
            messages=self.history,
            temperature=self.temperature,
        )
        answer = response.choices[0].message['content'].strip()
        self.history.append({"role": "assistant", "content": answer})
        return answer

    def reset(self):
        """
        Reset the conversation history.
        """
        self.history = []
        self.history.append({"role": "system", "content": "You are an expert academic writing assistant."})