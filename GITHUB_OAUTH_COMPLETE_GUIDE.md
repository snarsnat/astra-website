# Complete GitHub OAuth Setup Guide for ASTRA

## 🎯 What We're Building

When a user logs into their ASTRA dashboard, they should see a "Connect GitHub" button that:
1. Connects their GitHub account via OAuth
2. Requests read/write permissions for repositories
3. Allows them to select repositories for security scanning

## 🔗 Authorization Callback URL

**For GitHub OAuth App Registration:**

### Local Development:
```
http://localhost:8080/api/auth/github/callback
```

### Production (Vercel):
```
https://astra-website-vercel-test.vercel.app/api/auth/github/callback
```

## 📋 Step-by-Step Setup

### Step 1: Register GitHub OAuth App

1. Go to: **https://github.com/settings/developers**
2. Click **"New OAuth App"**
3. Fill in the following details:

**Application Details:**
- **Application name**: `ASTRA Security Scanner`
- **Homepage URL**: `https://astra-website-vercel-test.vercel.app`
- **Application description**: `Security vulnerability scanner for GitHub repositories`

**Authorization callback URL:**
```
http://localhost:8080/api/auth/github/callback
```

### Step 2: Get Your Credentials

After creating the app, you'll get:
- **Client ID**: `your_client_id_here`
- **Client Secret**: `your_client_secret_here`

### Step 3: Configure ASTRA Server

Update `/Users/nausheensuraj/.openclaw/workspace/astra-website/server.py`:

Find these lines (around line 29-31):
```python
GITHUB_CLIENT_ID = os.environ.get('GITHUB_CLIENT_ID', 'your_client_id_here')
GITHUB_CLIENT_SECRET = os.environ.get('GITHUB_CLIENT_SECRET', 'your_client_secret_here')
GITHUB_CALLBACK_URL = os.environ.get('GITHUB_CALLBACK_URL', 'http://localhost:8080/api/auth/github/callback')
```

Replace `'your_client_id_here'` and `'your_client_secret_here'` with your actual credentials.

### Step 4: Required Permissions (Scopes)

The OAuth app requests these permissions:
- `repo` - **Full control of private repositories** (read/write access)
- `read:user` - Read user profile data
- `user:email` - Read user email addresses

## 🚀 How It Works

### User Flow:
1. User logs into ASTRA dashboard at `http://localhost:8080/dashboard.html`
2. In the "Connected Apps" section, they see the GitHub card
3. They click **"Connect GitHub"** button
4. They're redirected to GitHub OAuth authorization page
5. User authorizes the requested permissions
6. GitHub redirects back to: `http://localhost:8080/api/auth/github/callback`
7. ASTRA exchanges the authorization code for an access token
8. User can now select repositories for security scanning

### Technical Flow:
```
User → ASTRA Dashboard → /api/auth/github → GitHub OAuth → /api/auth/github/callback → ASTRA Dashboard
```

## 🧪 Testing the Integration

### Test 1: Check if OAuth is configured
```bash
curl http://localhost:8080/api/auth/github/status
```
Should return: `{"configured": true, "client_id": "your_client_id"}`

### Test 2: Start OAuth flow
Open in browser: `http://localhost:8080/api/auth/github`

### Test 3: Test with the dashboard
1. Open: `http://localhost:8080/dashboard.html`
2. Click the "Connect GitHub" button in the GitHub card
3. You should be redirected to GitHub for authorization

## 🔧 Files Modified

### 1. `server.py` - Already has:
- `/api/auth/github` - Start OAuth flow
- `/api/auth/github/callback` - Handle OAuth callback
- `/api/auth/github/status` - Check OAuth status
- `/api/auth/github/disconnect` - Disconnect GitHub
- `/api/github/repositories` - List user repositories

### 2. `dashboard.html` - Already has:
- GitHub card in "Connected Apps" section
- "Connect GitHub" button with ID `connect-github-btn`
- Status display for GitHub connection
- Repository count display
- Last sync timestamp
- Permissions display

### 3. JavaScript in `dashboard.html`:
- `startGitHubOAuth()` function that redirects to `/api/auth/github`
- Event listener for the "Connect GitHub" button
- GitHub status checking logic

## 🌐 Production Deployment (Vercel)

### Environment Variables to set in Vercel:
```
GITHUB_CLIENT_ID=your_actual_client_id
GITHUB_CLIENT_SECRET=your_actual_client_secret
GITHUB_CALLBACK_URL=https://astra-website-vercel-test.vercel.app/api/auth/github/callback
```

### Update GitHub OAuth App for production:
1. Go to your OAuth app settings
2. Update **Authorization callback URL** to:
   ```
   https://astra-website-vercel-test.vercel.app/api/auth/github/callback
   ```

## 🐛 Troubleshooting

### Issue 1: "Redirect URI mismatch"
- Ensure the callback URL in GitHub matches exactly what's in `server.py`
- Check for trailing slashes
- Local: `http://localhost:8080/api/auth/github/callback`
- Production: `https://astra-website-vercel-test.vercel.app/api/auth/github/callback`

### Issue 2: "Invalid client secret"
- Regenerate client secret in GitHub
- Update `server.py` with new secret
- Restart the server

### Issue 3: OAuth flow not starting
- Check server is running: `python server.py`
- Test endpoint: `curl http://localhost:8080/api/auth/github/status`
- Check browser console for JavaScript errors

### Issue 4: Callback not working
- Verify the callback URL is registered in GitHub
- Check server logs for OAuth errors
- Test with: `http://localhost:8080/test-github.html`

## 📊 Database Schema

The GitHub OAuth data is stored in `astra_auth.db`:

```sql
-- GitHub connections table
CREATE TABLE github_connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    github_user_id TEXT NOT NULL,
    github_username TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    scopes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- GitHub repositories table
CREATE TABLE github_repositories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    github_connection_id INTEGER NOT NULL,
    repo_id TEXT NOT NULL,
    repo_name TEXT NOT NULL,
    repo_full_name TEXT NOT NULL,
    is_private BOOLEAN,
    last_scanned TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (github_connection_id) REFERENCES github_connections(id)
);
```

## ✅ Next Steps After Setup

1. **Test the connection** with `http://localhost:8080/test-github.html`
2. **Verify dashboard integration** by connecting via the dashboard
3. **Test repository listing** after connection
4. **Deploy to production** with Vercel environment variables
5. **Monitor OAuth usage** in GitHub Developer Settings

## 📞 Support

If you encounter issues:
1. Check server logs: Look for Python error messages
2. Test endpoints directly with curl
3. Verify GitHub OAuth app settings
4. Check database connection and tables

The GitHub OAuth integration is now ready to use! Users can connect their GitHub accounts and start scanning repositories for security vulnerabilities.