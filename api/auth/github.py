from http.server import BaseHTTPRequestHandler
import urllib.parse
import requests
import json
import os

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/auth/github':
            self.handle_github_auth_start()
        elif self.path.startswith('/api/auth/github/callback'):
            self.handle_github_callback()
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'Not Found')
    
    def handle_github_auth_start(self):
        # Get environment variables
        client_id = os.environ.get('GITHUB_CLIENT_ID')
        callback_url = os.environ.get('GITHUB_CALLBACK_URL', 'https://astra-website-vercel-test.vercel.app/api/auth/github/callback')
        
        if not client_id:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(b'GitHub Client ID not configured')
            return
        
        # GitHub OAuth URL
        github_auth_url = f"https://github.com/login/oauth/authorize?client_id={client_id}&redirect_uri={callback_url}&scope=repo%20read:user%20user:email"
        
        # Redirect to GitHub
        self.send_response(302)
        self.send_header('Location', github_auth_url)
        self.end_headers()
    
    def handle_github_callback(self):
        # Parse query parameters
        query = urllib.parse.urlparse(self.path).query
        params = urllib.parse.parse_qs(query)
        code = params.get('code', [None])[0]
        
        if not code:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b'Missing authorization code')
            return
        
        # Get environment variables
        client_id = os.environ.get('GITHUB_CLIENT_ID')
        client_secret = os.environ.get('GITHUB_CLIENT_SECRET')
        
        if not client_id or not client_secret:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(b'GitHub OAuth not configured')
            return
        
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
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b'Failed to get access token')
                return
            
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
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response_data).encode())
            
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(f'Error: {str(e)}'.encode())