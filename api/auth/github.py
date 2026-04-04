import urllib.parse
import requests
import json
import os

def handler(request):
    # Extract path from request
    path = request.get('path', '')
    
    if path == '/api/auth/github':
        return handle_github_auth_start(request)
    elif path.startswith('/api/auth/github/callback'):
        return handle_github_callback(request)
    else:
        return {
            'statusCode': 404,
            'body': 'Not Found'
        }

def handle_github_auth_start(request):
    # Get environment variables
    client_id = os.environ.get('GITHUB_CLIENT_ID')
    callback_url = os.environ.get('GITHUB_CALLBACK_URL', 'https://astra-website-vercel-test.vercel.app/api/auth/github/callback')
    
    if not client_id:
        return {
            'statusCode': 500,
            'body': 'GitHub Client ID not configured'
        }
    
    # GitHub OAuth URL
    github_auth_url = f"https://github.com/login/oauth/authorize?client_id={client_id}&redirect_uri={callback_url}&scope=repo%20read:user%20user:email"
    
    # Redirect to GitHub
    return {
        'statusCode': 302,
        'headers': {
            'Location': github_auth_url
        }
    }

def handle_github_callback(request):
    # Parse query parameters from request
    query_string = request.get('queryStringParameters', {})
    code = query_string.get('code')
    
    if not code:
        return {
            'statusCode': 400,
            'body': 'Missing authorization code'
        }
    
    # Get environment variables
    client_id = os.environ.get('GITHUB_CLIENT_ID')
    client_secret = os.environ.get('GITHUB_CLIENT_SECRET')
    
    if not client_id or not client_secret:
        return {
            'statusCode': 500,
            'body': 'GitHub OAuth not configured'
        }
    
    # Exchange code for access token
    token_url = 'https://github.com/login/oauth/access_token'
    token_data = {
        'client_id': client_id,
        'client_secret': client_secret,
        'code': code
    }
    token_headers = {
        'Accept': 'application/json'
    }
    
    try:
        token_response = requests.post(token_url, data=token_data, headers=token_headers)
        token_json = token_response.json()
        access_token = token_json.get('access_token')
        
        if not access_token:
            return {
                'statusCode': 400,
                'body': 'Failed to get access token'
            }
        
        # Get user info from GitHub
        user_response = requests.get('https://api.github.com/user', headers={
            'Authorization': f'token {access_token}',
            'Accept': 'application/json'
        })
        user_data = user_response.json()
        
        # Get user emails
        emails_response = requests.get('https://api.github.com/user/emails', headers={
            'Authorization': f'token {access_token}',
            'Accept': 'application/json'
        })
        emails_data = emails_response.json()
        
        # Find primary email
        primary_email = None
        for email in emails_data:
            if email.get('primary') and email.get('verified'):
                primary_email = email.get('email')
                break
        
        # Create response data
        response_data = {
            'success': True,
            'user': {
                'id': user_data.get('id'),
                'login': user_data.get('login'),
                'name': user_data.get('name'),
                'email': primary_email or user_data.get('email'),
                'avatar_url': user_data.get('avatar_url'),
                'html_url': user_data.get('html_url')
            },
            'access_token': access_token
        }
        
        # Return JSON response
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json'
            },
            'body': json.dumps(response_data)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': f'Error: {str(e)}'
        }