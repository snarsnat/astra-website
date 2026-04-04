# ASTRA Website

A dashboard for managing GitHub repositories with read/write permissions.

## Features

- **GitHub Integration**: Connect your GitHub account with read/write repository permissions
- **Repository Management**: View and manage your GitHub repositories
- **Secure Authentication**: OAuth-based authentication with GitHub
- **Dashboard**: Clean, modern interface for repository management

## Deployment

This project is deployed on Vercel:
- **Production**: https://astra-website-vercel-test.vercel.app
- **Dashboard**: https://astra-website-vercel-test.vercel.app/dashboard.html

## Setup

1. **Environment Variables** (set in Vercel dashboard):
   - `GITHUB_CLIENT_ID`: GitHub OAuth App Client ID
   - `GITHUB_CLIENT_SECRET`: GitHub OAuth App Client Secret
   - `GITHUB_CALLBACK_URL`: https://astra-website-vercel-test.vercel.app/api/auth/github/callback

2. **GitHub OAuth App Setup**:
   - Go to GitHub → Settings → Developer settings → OAuth Apps
   - Create new OAuth App
   - Homepage URL: https://astra-website-vercel-test.vercel.app
   - Authorization callback URL: https://astra-website-vercel-test.vercel.app/api/auth/github/callback

## Development

The project uses:
- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Python serverless functions (Vercel Functions)
- **Deployment**: Vercel with automatic GitHub integration

## Automatic Deployments

This repository is connected to Vercel for automatic deployments:
- Pushes to `master` branch trigger production deployments
- All deployments are automatically built and deployed

## API Endpoints

- `GET /api/auth/github` - Start GitHub OAuth flow
- `GET /api/auth/github/callback` - GitHub OAuth callback

## License

MIT