# SABI Web Application

Full-stack web application for SABI (South African Business Investment) featuring an enquiry form system with Express.js backend and MongoDB database.

## Project Structure

```
webApi/
├── public/              # Frontend files (served statically)
│   ├── index.html      # Main landing page
│   ├── about.html      # About page
│   ├── services.html   # Services page
│   ├── form.html       # Enquiry form
│   ├── success.html    # Success page
│   ├── app.js          # Frontend JavaScript
│   ├── styles.css      # Styles
│   ├── sitemap.xml     # SEO sitemap
│   └── *.png           # Images
├── Server.js           # Express server
├── package.json        # Dependencies
└── .env               # Environment variables (not in git)
```

## Features

- **Frontend**: Modern responsive website with Bootstrap 5
- **Backend API**: RESTful API for enquiry submissions
- **Database**: MongoDB integration with Mongoose
- **Email**: Automated email notifications (client & admin)
- **Security**: Rate limiting, CORS, Helmet.js, input validation
- **Admin Panel**: Protected endpoints for managing enquiries

## Prerequisites

- Node.js 18.x or higher
- MongoDB database (MongoDB Atlas recommended)
- SMTP server for email notifications

## Environment Variables

Create a `.env` file in the root directory with the following variables (see `.env.example` for reference):

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGINS=https://yourdomain.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_TOKEN=your-secure-admin-token
ADMIN_PORTAL_URL=https://admin.yourdomain.com
```

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your configuration

3. Start the development server:
```bash
npm run dev
```

The server will start on http://localhost:5000

## Deployment to Railway

### Option 1: Deploy from GitHub

1. Push your code to GitHub
2. Go to [Railway](https://railway.app)
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Select this repository
6. Railway will automatically detect the Node.js app and deploy it

### Option 2: Deploy using Railway CLI

1. Install Railway CLI:
```bash
npm i -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```

3. Initialize and deploy:
```bash
railway init
railway up
```

### Environment Variables Setup on Railway

After deployment, configure the following environment variables in Railway:

1. Go to your project in Railway
2. Click on "Variables" tab
3. Add all the required environment variables from `.env.example`

**Important**: Make sure to set `NODE_ENV=production` for production deployment.

### MongoDB Setup

We recommend using MongoDB Atlas for production:

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Add it as `MONGODB_URI` environment variable in Railway

## API Endpoints

### Public Endpoints

- `POST /api/enquiries` - Submit a new enquiry
- `GET /api/health` - Health check endpoint

### Protected Endpoints (require Admin Token)

- `GET /api/enquiries` - Get all enquiries (with pagination)
- `GET /api/enquiries/:id` - Get single enquiry
- `PATCH /api/enquiries/:id/status` - Update enquiry status

## API Documentation

### Submit Enquiry

**Endpoint**: `POST /api/enquiries`

**Request Body**:
```json
{
  "basicInfo": {
    "fullName": "John Doe",
    "jobTitle": "Manager",
    "organization": "ABC Corp",
    "industry": "Technology",
    "organizationSize": "50-200",
    "organizationType": "Private"
  },
  "contactInfo": {
    "email": "john@example.com",
    "phone": "1234567890",
    "province": "Ontario",
    "city": "Toronto",
    "address": "123 Main St"
  },
  "serviceRequirements": {
    "services": ["Web Development", "Consulting"],
    "projectDetails": "Need a new website",
    "budgetRange": "$10,000-$25,000",
    "timeline": "3-6 months"
  },
  "additionalInfo": {
    "currentChallenges": "Old website not mobile-friendly",
    "expectedOutcomes": "Modern, responsive website",
    "referralSource": "Google Search",
    "marketingConsent": true
  }
}
```

**Response**:
```json
{
  "success": true,
  "referenceNumber": "ENQ-2512-123456",
  "message": "Enquiry submitted successfully"
}
```

## Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- Admin token authentication
- Request size limits (10kb)

## License

ISC
