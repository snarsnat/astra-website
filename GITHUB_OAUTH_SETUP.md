# GitHub OAuth Setup for ASTRA

## 1. Register GitHub OAuth App

Go to: **https://github.com/settings/developers**

Click **"New OAuth App"** and fill in:

### Required Fields:
- **Application name**: `ASTRA Security Scanner`
- **Homepage URL**: `https://astra-website-vercel-test.vercel.app`
- **Application description**: `Security vulnerability scanner for GitHub repositories`

### **CRITICAL: Authorization Callback URL**
```
http://localhost:8080/api/auth/github/callback
```

**For production (Vercel):**
```
https://astra-website-vercel-test.vercel.app/api/auth/github/callback
```

## 2. Get Your Credentials

After registration, you'll get:
- **Client ID**: `your_client_id_here`
- **Client Secret**: `your_client_secret_here`

## 3. Configure ASTRA Server

Update `server.py` with your credentials:

```python
# GitHub OAuth Configuration
GITHUB_CLIENT_ID = os.environ.get('GITHUB_CLIENT_ID', 'your_client_id_here')
GITHUB_CLIENT_SECRET = os.environ.get('GITHUB_CLIENT_SECRET', 'your_client_secret_here')
GITHUB_CALLBACK_URL = os.environ.get('GITHUB_CALLBACK_URL', 'http://localhost:8080/api/auth/github/callback')
```

## 4. Required Permissions (Scopes)

The app requests these permissions:
- `repo` - Full control of private repositories (read/write)
- `read:user` - Read user profile data
- `user:email` - Read user email addresses

## 5. How It Works

1. User clicks **"Connect GitHub"** button in dashboard
2. Redirects to GitHub OAuth authorization page
3. User authorizes the requested permissions
4. GitHub redirects back to: `http://localhost:8080/api/auth/github/callback`
5. ASTRA exchanges code for access token
6. User can now select repositories for scanning

## 6. Test the Integration

### Local Development:
1. Start server: `python server.py`
2. Open: `http://localhost:8080/dashboard.html`
3. Click **"Connect GitHub"** button
4. Authorize in GitHub
5. You'll be redirected back to ASTRA

### Production (Vercel):
1. Set environment variables in Vercel:
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
   - `GITHUB_CALLBACK_URL`
2. Open: `https://astra-website-vercel-test.vercel.app/dashboard.html`
3. Click **"Connect GitHub"** button

## 7. Environment Variables

For Vercel deployment, add these in Project Settings → Environment Variables:

```
GITHUB_CLIENT_ID=your_actual_client_id
GITHUB_CLIENT_SECRET=your_actual_client_secret
GITHUB_CALLBACK_URL=https://astra-website-vercel-test.vercel.app/api/auth/github/callback
```

## 8. Troubleshooting

### Common Issues:

1. **"Redirect URI mismatch"**
   - Ensure callback URL in GitHub matches exactly: `http://localhost:8080/api/auth/github/callback`
   - No trailing slashes

2. **"Invalid client secret"**
   - Regenerate client secret in GitHub
   - Update environment variables

3. **Permissions not granted**
   - User must authorize all requested scopes
   - Check scopes in GitHub OAuth app settings

## 9. Security Notes

- Never commit Client Secret to git
- Use environment variables
- Tokens expire - implement refresh logic
- Validate state parameter to prevent CSRF

## 10. Dashboard Integration

The dashboard already has:
- "Connect GitHub" button
- GitHub connection status display
- Repository selection interface
- Read/Write permissions display

To connect: Click the GitHub card in "Connected Apps" section.