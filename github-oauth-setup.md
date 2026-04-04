# GitHub OAuth Integration Setup for ASTRA

## 1. Register a GitHub OAuth App

Go to: https://github.com/settings/developers

1. Click "New OAuth App"
2. Fill in the details:
   - **Application name**: ASTRA Security Dashboard
   - **Homepage URL**: `http://localhost:8080` (or your production URL)
   - **Authorization callback URL**: `http://localhost:8080/api/auth/github/callback`
3. Click "Register application"
4. Copy the **Client ID** and generate a **Client Secret**

## 2. Environment Variables

Add these to your `.env` file or server configuration:

```bash
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
GITHUB_CALLBACK_URL=http://localhost:8080/api/auth/github/callback
SESSION_SECRET=your_session_secret_here
```

## 3. Required Scopes

The app needs these GitHub OAuth scopes:
- `repo` - Full control of private repositories
- `read:user` - Read user profile data
- `user:email` - Read user email addresses

## 4. Database Updates Needed

Add these tables to your database:

```sql
-- GitHub connections table
CREATE TABLE IF NOT EXISTS github_connections (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    github_user_id INTEGER UNIQUE,
    github_username TEXT,
    github_email TEXT,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    scopes TEXT,  -- JSON array of granted scopes
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Repository connections table
CREATE TABLE IF NOT EXISTS github_repositories (
    id TEXT PRIMARY KEY,
    github_connection_id TEXT,
    repo_id INTEGER,
    repo_name TEXT,
    repo_full_name TEXT,
    repo_private BOOLEAN,
    repo_url TEXT,
    repo_html_url TEXT,
    is_astra_installed BOOLEAN DEFAULT 0,
    installed_at TIMESTAMP,
    last_synced TIMESTAMP,
    FOREIGN KEY (github_connection_id) REFERENCES github_connections (id)
);
```

## 5. API Endpoints to Implement

### Authentication Flow:
1. `GET /api/auth/github` - Start GitHub OAuth flow
2. `GET /api/auth/github/callback` - GitHub OAuth callback
3. `GET /api/auth/github/status` - Check GitHub connection status
4. `DELETE /api/auth/github/disconnect` - Disconnect GitHub account

### Repository Management:
1. `GET /api/github/repositories` - List user's repositories
2. `POST /api/github/repositories/:repo_id/install-astra` - Install ASTRA to a repository
3. `GET /api/github/repositories/:repo_id/status` - Check ASTRA installation status

## 6. Implementation Steps

1. Update `server.py` to handle GitHub OAuth routes
2. Add GitHub OAuth buttons to dashboard UI
3. Create repository selection interface
4. Implement ASTRA installation workflow
5. Add GitHub connection status to user profile

## 7. Security Considerations

1. Store GitHub tokens encrypted
2. Implement token refresh mechanism
3. Validate repository permissions before installation
4. Rate limit API calls to GitHub
5. Log all GitHub API interactions

## 8. Testing

Test the flow:
1. Connect GitHub account
2. List repositories
3. Select a repository
4. Install ASTRA
5. Verify installation
6. Disconnect and reconnect