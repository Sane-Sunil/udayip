# UdayIP - Project Portfolio

## Local Development
Run `npm start` to start the local server with file-based storage.

## Cloud Deployment (Netlify)
The cloud version uses in-memory storage which resets on each deployment. For persistent storage in production, you have several options:

### Option 1: Use GitHub as Backend (Recommended)
1. Create a private GitHub repository
2. Store projects in a JSON file in the repo
3. Use GitHub API to read/write projects
4. Set up GitHub Personal Access Token as environment variable

### Option 2: Use Netlify Functions with Database
- [FaunaDB](https://www.fauna.com/) - Free tier available
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Free tier available
- [Supabase](https://supabase.com/) - Open source Firebase alternative

### Option 3: Use Netlify's Built-in Features
- [Netlify Forms](https://docs.netlify.com/forms/overview/) for data collection
- [Netlify Functions](https://docs.netlify.com/edge/functions/overview/) with external API

## Environment Variables
Set these in your Netlify dashboard:
- `ADMIN_PASSWORD` - Your admin password
- `GITHUB_TOKEN` - GitHub personal access token (if using GitHub backend)
- `GITHUB_REPO` - Repository name (if using GitHub backend)

## Current Limitation
The current cloud deployment uses in-memory storage that resets on each deploy. This is fine for testing but not for production use.