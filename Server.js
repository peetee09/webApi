require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const path = require('path');
const morgan = require('morgan');

// Initialize Express app
const app = express();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for inline scripts in HTML
        "https://cdn.jsdelivr.net",
        "https://unpkg.com",
        "https://cdnjs.cloudflare.com"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for inline styles
        "https://cdn.jsdelivr.net",
        "https://fonts.googleapis.com",
        "https://cdnjs.cloudflare.com",
        "https://unpkg.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "https://images.unsplash.com"
      ],
      connectSrc: ["'self'", "https://wa.me"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Additional security headers
app.use((req, res, next) => {
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Static files
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Database Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Database Models
const enquirySchema = new mongoose.Schema({
  basicInfo: {
    fullName: { type: String, required: [true, 'Full name is required'] },
    jobTitle: String,
    organization: { type: String, required: [true, 'Organization is required'] },
    industry: { type: String, required: [true, 'Industry is required'] },
    organizationSize: { type: String, required: [true, 'Organization size is required'] },
    organizationType: { type: String, required: [true, 'Organization type is required'] }
  },
  contactInfo: {
    email: { 
      type: String, 
      required: [true, 'Email is required'],
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    phone: { 
      type: String, 
      required: [true, 'Phone number is required'],
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
    },
    province: { type: String, required: [true, 'Province is required'] },
    city: { type: String, required: [true, 'City is required'] },
    address: String
  },
  serviceRequirements: {
    services: { 
      type: [String], 
      required: [true, 'At least one service must be selected'],
      validate: {
        validator: v => v.length > 0,
        message: 'At least one service must be selected'
      }
    },
    otherServiceDetails: String,
    projectDetails: { type: String, required: [true, 'Project details are required'] },
    budgetRange: String,
    timeline: String
  },
  additionalInfo: {
    currentChallenges: String,
    expectedOutcomes: String,
    referralSource: String,
    existingSystems: String,
    marketingConsent: { type: Boolean, default: false }
  },
  metadata: {
    submissionDate: { type: Date, default: Date.now },
    userAgent: String,
    ipAddress: String,
    status: { 
      type: String, 
      enum: ['new', 'in-progress', 'completed', 'archived'], 
      default: 'new' 
    }
  },
  referenceNumber: { type: String, unique: true }
});

// Add indexes for better query performance
enquirySchema.index({ referenceNumber: 1 });
enquirySchema.index({ 'metadata.status': 1 });
enquirySchema.index({ 'metadata.submissionDate': -1 });

const Enquiry = mongoose.model('Enquiry', enquirySchema);

// Email Configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: process.env.NODE_ENV === 'production'
  }
});

// Verify email connection
transporter.verify()
  .then(() => console.log('✅ Email server connection verified'))
  .catch(err => console.error('❌ Email server connection failed:', err));

// Utility Functions
const generateReferenceNumber = () => {
  const prefix = 'ENQ';
  const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  const datePart = new Date().getFullYear().toString().slice(-2) + 
                   (new Date().getMonth() + 1).toString().padStart(2, '0');
  return `${prefix}-${datePart}-${randomNum}`;
};

const sendEmail = async (options) => {
  try {
    await transporter.sendMail({
      from: `"SABI Enquiries" <${process.env.EMAIL_FROM}>`,
      ...options
    });
    console.log(`Email sent to ${options.to}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// API Routes

// Submit Enquiry
app.post('/api/enquiries', [
  body('basicInfo.fullName').notEmpty().trim().escape(),
  body('basicInfo.organization').notEmpty().trim().escape(),
  body('contactInfo.email').isEmail().normalizeEmail(),
  body('contactInfo.phone').matches(/^[0-9]{10}$/),
  body('serviceRequirements.services').isArray({ min: 1 }),
  body('serviceRequirements.projectDetails').notEmpty().trim().escape()
], async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  try {
    // Generate reference number
    const refNumber = generateReferenceNumber();
    
    // Create enquiry
    const enquiryData = {
      ...req.body,
      metadata: {
        ...req.body.metadata,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      },
      referenceNumber: refNumber
    };

    const enquiry = new Enquiry(enquiryData);
    await enquiry.save();

    // Send confirmation email to client
    const clientEmailSent = await sendEmail({
      to: enquiry.contactInfo.email,
      subject: 'Thank you for your enquiry - SABI',
      html: `
        <h2>Thank you for your enquiry</h2>
        <p>We've received your submission and will contact you within 24-48 hours.</p>
        <p><strong>Reference Number:</strong> ${refNumber}</p>
        <p><strong>Summary of your enquiry:</strong></p>
        <ul>
          <li>Name: ${enquiry.basicInfo.fullName}</li>
          <li>Organization: ${enquiry.basicInfo.organization}</li>
          <li>Services: ${enquiry.serviceRequirements.services.join(', ')}</li>
        </ul>
        <p>If you have any questions, please reply to this email.</p>
        <p>Best regards,<br>The SABI Team</p>
      `
    });

    // Send notification to admin
    const adminEmailSent = await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `New Enquiry Received - ${refNumber}`,
      html: `
        <h2>New Enquiry (${refNumber})</h2>
        <p><strong>From:</strong> ${enquiry.basicInfo.fullName} (${enquiry.contactInfo.email})</p>
        <p><strong>Organization:</strong> ${enquiry.basicInfo.organization}</p>
        <p><strong>Services:</strong> ${enquiry.serviceRequirements.services.join(', ')}</p>
        <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        <p><a href="${process.env.ADMIN_PORTAL_URL}/enquiries/${enquiry._id}">View full details</a></p>
      `
    });

    res.status(201).json({
      success: true,
      referenceNumber: refNumber,
      message: 'Enquiry submitted successfully',
      emailsSent: {
        client: clientEmailSent,
        admin: adminEmailSent
      }
    });

  } catch (error) {
    console.error('Error submitting enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your enquiry',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Protected Admin Routes
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ 
      success: false,
      message: 'Unauthorized' 
    });
  }
  next();
};

// Get all enquiries (protected)
app.get('/api/enquiries', authenticateAdmin, async (req, res) => {
  try {
    const { status, sort = '-metadata.submissionDate', limit = 50, page = 1 } = req.query;
    
    const query = {};
    if (status) query['metadata.status'] = status;

    const options = {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      sort
    };

    const [enquiries, total] = await Promise.all([
      Enquiry.find(query, null, options),
      Enquiry.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: enquiries,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching enquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching enquiries'
    });
  }
});

// Get single enquiry (protected)
app.get('/api/enquiries/:id', authenticateAdmin, async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }
    res.json({
      success: true,
      data: enquiry
    });
  } catch (error) {
    console.error('Error fetching enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching enquiry'
    });
  }
});

// Update enquiry status (protected)
app.patch('/api/enquiries/:id/status', authenticateAdmin, [
  body('status').isIn(['new', 'in-progress', 'completed', 'archived'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { 'metadata.status': req.body.status },
      { new: true, runValidators: true }
    );

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    res.json({
      success: true,
      data: enquiry
    });

  } catch (error) {
    console.error('Error updating enquiry status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating enquiry status'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Resource not found'
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});
