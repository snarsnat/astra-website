# GitHub OAuth Setup Instructions for ASTRA

## 1. Register a GitHub OAuth App

1. Go to **GitHub → Settings → Developer settings → OAuth Apps**
2. Click **"New OAuth App"**
3. Fill in the following details:

### Application Details:
- **Application name**: `ASTRA Security Scanner`
- **Homepage URL**: `https://astra-website-vercel-test.vercel.app`
- **Application description**: `Security vulnerability scanner for GitHub repositories`

### Authorization Callback URL:
```
https://astra-website-vercel-test.vercel.app/github-callback
```

**For local development:**
```
http://localhost:3000/github-callback
```

## 2. Get Your OAuth Credentials

After creating the app, you'll get:
- **Client ID**: `your_client_id_here`
- **Client Secret**: `your_client_secret_here`

## 3. Configure the Server

Update the `server.py` file with your credentials:

```python
# GitHub OAuth Configuration
GITHUB_CLIENT_ID = "your_client_id_here"
GITHUB_CLIENT_SECRET = "your_client_secret_here"
GITHUB_REDIRECT_URI = "https://astra-website-vercel-test.vercel.app/github-callback"
```

## 4. OAuth Scopes Required

The app requests the following scopes:
- `repo` - Full control of private repositories
- `read:org` - Read organization membership
- `user:email` - Read user email addresses

## 5. Testing the Integration

1. Start the server: `python server.py`
2. Open the dashboard: `http://localhost:3000/dashboard.html`
3. Click **"Connect GitHub"** button
4. You'll be redirected to GitHub for authorization
5. After authorization, you'll be redirected back to ASTRA

## 6. Environment Variables (for production)

For Vercel deployment, set these environment variables:

```bash
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
GITHUB_REDIRECT_URI=https://astra-website-vercel-test.vercel.app/github-callback
```

## 7. Security Notes

- Never commit your Client Secret to version control
- Use environment variables in production
- The callback URL must exactly match the registered URL
- GitHub OAuth tokens expire and need to be refreshed

## 8. Troubleshooting

### Common Issues:

1. **"Redirect URI mismatch"**
   - Ensure the callback URL in your code matches exactly with GitHub settings
   - Check for trailing slashes

2. **"Invalid client secret"**
   - Regenerate your client secret in GitHub
   - Update all places where it's used

3. **"Scope not authorized"**
   - Make sure you're requesting the correct scopes
   - The user must authorize all requested scopes

4. **"State parameter invalid"**
   - The state parameter helps prevent CSRF attacks
   - Ensure it's being generated and validated correctly

## 9. Next Steps After Connection

Once GitHub is connected, users can:
- Browse their repositories
- Select repositories to scan
- View security reports
- Get vulnerability alerts
- Manage scan schedules

## 10. Support

For issues with the GitHub OAuth integration:
1. Check the server logs
2. Verify your OAuth app settings in GitHub
3. Ensure all URLs are HTTPS in production
4. Test with the GitHub API directly using curl:

```bash
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user
```