# Railway Deployment Guide

This guide will help you deploy the SABI Web API to Railway.

## Features

This application includes Railway-optimized configuration:

- **Automatic Health Checks**: Configured to use `/api/health` endpoint
- **Resilient MongoDB Connection**: Server starts even if MongoDB is unavailable, with automatic retry
- **Nixpacks Build**: Explicit build configuration via `nixpacks.toml`
- **Optimized Deployment**: `.railwayignore` excludes unnecessary files
- **Graceful Shutdown**: Proper handling of SIGTERM and SIGINT signals

## Prerequisites

- Railway account (sign up at https://railway.app)
- MongoDB Atlas account (or other MongoDB hosting)
- SMTP email service configured

## Quick Deploy Steps

### 1. Connect GitHub Repository

1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Authorize Railway to access your GitHub account
5. Select the `peetee09/webApi` repository
6. Railway will automatically detect the Node.js application

### 2. Configure Environment Variables

After Railway creates your project:

1. Go to your project dashboard
2. Click on your service
3. Navigate to the "Variables" tab
4. Add the following environment variables:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_TOKEN=generate-a-secure-random-token
ADMIN_PORTAL_URL=https://admin.yourdomain.com
```

**Note:** Railway will automatically set the `PORT` variable, so you don't need to add it.

### 3. Setup MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (M0 free tier is sufficient to start)
4. In "Database Access", create a database user with read/write privileges
5. In "Network Access", add `0.0.0.0/0` to allow connections from anywhere (or restrict to Railway IPs)
6. Click "Connect" on your cluster
7. Choose "Connect your application"
8. Copy the connection string
9. Replace `<password>` with your database user password
10. Add this as `MONGODB_URI` in Railway environment variables

### 4. Configure Email Service (Gmail Example)

1. Enable 2-factor authentication on your Gmail account
2. Go to https://myaccount.google.com/apppasswords
3. Generate an "App Password" for "Mail"
4. Use this app password as `EMAIL_PASS` in Railway

### 5. Generate Admin Token

Generate a secure random token for admin authentication:

```bash
# On Linux/Mac:
openssl rand -hex 32

# Or use an online generator:
# https://www.uuidgenerator.net/
```

Add this token as `ADMIN_TOKEN` in Railway environment variables.

### 6. Deploy

1. Railway will automatically deploy your application
2. Once deployment is complete, Railway will provide a public URL (e.g., `https://your-app.railway.app`)
3. You can also add a custom domain in the "Settings" tab

### 7. Verify Deployment

Test your deployment:

1. **Health Check**: Visit `https://your-app.railway.app/api/health`
   - Should return `{"status":"OK",...}`

2. **Test API**: Use curl or Postman to test the enquiry endpoint

```bash
curl -X POST https://your-app.railway.app/api/enquiries \
  -H "Content-Type: application/json" \
  -d '{
    "basicInfo": {
      "fullName": "Test User",
      "organization": "Test Org",
      "industry": "Technology",
      "organizationSize": "1-50",
      "organizationType": "Private"
    },
    "contactInfo": {
      "email": "test@example.com",
      "phone": "1234567890",
      "province": "Test Province",
      "city": "Test City"
    },
    "serviceRequirements": {
      "services": ["Web Development"],
      "projectDetails": "Test project"
    }
  }'
```

### 8. Custom Domain (Optional)

1. Go to your Railway project
2. Click on "Settings"
3. Scroll to "Domains"
4. Click "Add Domain"
5. Enter your custom domain
6. Configure your DNS records as instructed by Railway

### 9. Update CORS Origins

Once you have your Railway URL (or custom domain):

1. Update `CORS_ORIGINS` environment variable to include your actual domain
2. Example: `CORS_ORIGINS=https://mywebsite.com,https://your-app.railway.app`

## Monitoring

### View Logs

1. Go to your Railway project
2. Click on your service
3. Navigate to the "Deployments" tab
4. Click on the latest deployment
5. View real-time logs

### Resource Usage

Railway free tier includes:
- $5 free credit per month
- Automatic sleep after 5 minutes of inactivity (can be upgraded)

Monitor your usage in the Railway dashboard.

## Troubleshooting

### Application Won't Start

- Check the deployment logs for errors
- Verify all environment variables are set correctly
- Ensure MongoDB connection string is correct
- Check Node.js version compatibility (should be 18.x or higher)

### Database Connection Failed

- Verify MongoDB Atlas network access allows Railway connections
- Check MongoDB connection string format
- Ensure database user credentials are correct

### Email Not Sending

- Verify email credentials are correct
- For Gmail, ensure you're using an App Password, not your regular password
- Check that 2FA is enabled on your Gmail account

### 404 Errors

- Ensure static files are in the `public` directory
- Check that the file paths in your HTML are correct

## Support

- Railway Documentation: https://docs.railway.app
- MongoDB Atlas Documentation: https://docs.atlas.mongodb.com
- GitHub Issues: https://github.com/peetee09/webApi/issues

## Updating the Application

When you push changes to the GitHub repository:

1. Railway will automatically detect the changes
2. It will rebuild and redeploy your application
3. You can monitor the deployment progress in the Railway dashboard

## Rollback

If a deployment fails or has issues:

1. Go to the "Deployments" tab in Railway
2. Find a previous successful deployment
3. Click the three dots menu
4. Select "Redeploy"
