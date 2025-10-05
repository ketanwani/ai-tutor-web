from django.core.management.base import BaseCommand
from quiz.models import Question, Topic
import json
import hashlib


def hash_q(stem: str, answer: str) -> str:
    return hashlib.sha256((stem.strip() + "|||" + str(answer).strip()).encode('utf-8')).hexdigest()


class Command(BaseCommand):
    help = 'Import questions from JSONL/JSON files into the Question bank'

    def add_arguments(self, parser):
        parser.add_argument('--file', required=True, help='Path to a JSON or JSONL file')
        parser.add_argument('--subject', default='Math')
        parser.add_argument('--level', default='P4')
        parser.add_argument('--topic', default=None, help='Topic name to attach (optional)')
        parser.add_argument('--source', default='custom')
        parser.add_argument('--license', default='MIT')

    def handle(self, *args, **opts):
        path = opts['file']
        subject = opts['subject']
        level = opts['level']
        topic_name = opts['topic']
        source = opts['source']
        license_name = opts['license']

        topic = None
        if topic_name:
            topic, _ = Topic.objects.get_or_create(name=topic_name, subject=subject, level=level)

        created_count = 0
        seen = set()

        def upsert(q_obj):
            nonlocal created_count
            stem = q_obj.get('question') or q_obj.get('question_text') or ''
            answer = q_obj.get('answer') or q_obj.get('correct_answer') or ''
            if not stem or not answer:
                return
            h = hash_q(stem, answer)
            if h in seen:
                return
            seen.add(h)

            options = q_obj.get('options') or []
            explanation = q_obj.get('explanation') or ''
            difficulty = q_obj.get('difficulty') or 'medium'
            source_id = q_obj.get('id') or ''

            Question.objects.get_or_create(
                subject=subject,
                level=level,
                question_text=stem,
                correct_answer=str(answer),
                defaults={
                    'topic': topic,
                    'is_multiple_choice': True if options else False,
                    'options': options if isinstance(options, list) else [],
                    'explanation': explanation,
                    'difficulty': difficulty,
                    'source': source,
                    'source_id': str(source_id),
                    'license': license_name,
                }
            )
            created_count += 1

        # detect JSON vs JSONL
        if path.endswith('.jsonl') or path.endswith('.jsonlines'):
            with open(path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        obj = json.loads(line)
                        upsert(obj)
                    except Exception:
                        continue
        else:
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, dict) and 'data' in data:
                    data = data['data']
                if isinstance(data, list):
                    for obj in data:
                        upsert(obj)

        self.stdout.write(self.style.SUCCESS(f'Imported ~{created_count} questions into bank'))


