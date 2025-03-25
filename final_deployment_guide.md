# Final Deployment Guide for Math Learning App

This guide provides instructions for deploying the Math Learning App to Fly.io to resolve the mixed content errors and 405 Method Not Allowed errors.

## Prerequisites

1. Fly.io CLI installed
2. Valid Fly.io authentication token
3. Valid Replicate API token

## Deployment Steps

### 1. Deploy the Backend

```bash
cd math_backend
./deploy_backend.sh
```

This script will:
- Set the REPLICATE_API_TOKEN environment variable
- Deploy the backend to Fly.io

### 2. Deploy the Frontend

```bash
cd math_frontend
./deploy_frontend.sh
```

This script will:
- Build the frontend with the latest changes
- Deploy the frontend to Fly.io

## Verification Steps

After deployment, verify the following:

1. Frontend is accessible at: https://math-learning-app-frontend-new.fly.dev/
2. Backend is accessible at: https://math-learning-app-backend.fly.dev/
3. Login functionality works correctly
4. Character selection (黄小星 and 李小毛) works correctly
5. Bilingual questions display correctly
6. No mixed content errors appear in the browser console

## Troubleshooting

If you encounter any issues:

1. Check the browser console for errors
2. Verify that all API calls are using HTTPS
3. Check the Fly.io logs for any backend errors:
   ```bash
   flyctl logs -a math-learning-app-backend
   ```
4. Check the Fly.io logs for any frontend errors:
   ```bash
   flyctl logs -a math-learning-app-frontend-new
   ```

## Manual Deployment

If the deployment scripts fail, you can manually deploy using the Fly.io web interface:

1. Go to https://fly.io/dashboard
2. Select the appropriate app
3. Click on "Deploy" and follow the instructions
