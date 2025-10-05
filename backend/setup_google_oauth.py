#!/usr/bin/env python
"""
Google OAuth setup script for AI Tutor SG
Run this script to configure Google OAuth for development
"""

import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ai_tutor_sg.settings')
django.setup()

from django.contrib.sites.models import Site
from allauth.socialaccount.models import SocialApp

def setup_google_oauth():
    """Setup Google OAuth for development"""
    
    # Get or create the site
    site, created = Site.objects.get_or_create(
        id=1,
        defaults={
            'domain': 'localhost:8000',
            'name': 'AI Tutor SG'
        }
    )
    if created:
        print(f"Created site: {site.domain}")
    else:
        print(f"Using existing site: {site.domain}")
    
    # Create Google OAuth app for development
    google_app, created = SocialApp.objects.get_or_create(
        provider='google',
        defaults={
            'name': 'Google OAuth',
            'client_id': 'your-google-client-id.apps.googleusercontent.com',
            'secret': 'your-google-client-secret',
        }
    )
    
    if created:
        print("Created Google OAuth app")
    else:
        print("Google OAuth app already exists")
    
    # Add the site to the app
    google_app.sites.add(site)
    google_app.save()
    
    print("\nGoogle OAuth setup complete!")
    print("Note: For production, update the client_id and secret in Django admin")
    print("Django Admin: http://localhost:8000/admin/")
    print("Social Applications: http://localhost:8000/admin/socialaccount/socialapp/")

if __name__ == '__main__':
    setup_google_oauth()
