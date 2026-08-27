FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

COPY backend/requirements.txt ./requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/

EXPOSE 8000

# default to test-key for local dev to use stubbed LLM responses
ENV OPENAI_API_KEY=test-key

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
