# Django + Gunicorn image
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# System deps for psycopg2 etc.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
 && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt \
    && pip install --no-cache-dir gunicorn

# Copy project
COPY backend/ /app/

# Collect static (safe to ignore failures if no static)
RUN python manage.py collectstatic --noinput || true

EXPOSE 8000

CMD ["gunicorn", "ai_tutor_sg.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
