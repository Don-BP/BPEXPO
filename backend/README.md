# BP LABO Server-Side Authentication System

A complete Node.js/Express server with MongoDB for centralized user management and authentication.

## 🚀 Features

- **JWT Authentication** - Secure token-based authentication
- **Centralized User Management** - Manage all users from one admin dashboard
- **License Code System** - One-time use license codes per employee
- **Role-Based Access Control** - Admin and regular user roles
- **Password Security** - bcrypt hashing with salt rounds
- **Rate Limiting** - Protection against brute force attacks
- **Account Lockout** - Automatic lockout after failed login attempts
- **Email Validation** - Proper email format validation
- **Audit Logging** - Track admin actions (ready for implementation)

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## 🛠️ Installation

1. **Clone and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/bplabo
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-very-long-and-secure
   FRONTEND_URL=https://bplabo.jp
   ```

4. **Start MongoDB:**
   ```bash
   # If using local MongoDB
   mongod

   # Or use MongoDB Atlas (cloud) and update MONGODB_URI
   ```

5. **Start the server:**
   ```bash
   npm start
   ```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/logout` - Logout user

### Admin (Requires Admin Role)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get specific user
- `PUT /api/admin/users/:id/status` - Activate/deactivate user
- `DELETE /api/admin/users/:id` - Delete user account
- `GET /api/admin/stats` - Get system statistics
- `GET /api/admin/license-codes` - Get all license codes
- `POST /api/admin/license-codes/generate` - Generate license codes

### User (Requires Authentication)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password

## 👥 User Roles

### Admin Users
- **Employee IDs**: `BPDON`, `BPJOE`
- **License Codes**:
  - BPDON: `BP-3541-2721`
  - BPJOE: `BP-9298-3081`
- **Capabilities**: Full user management, system statistics

### Regular Users
- Any whitelisted Employee ID
- Standard user permissions
- Can update own profile and password

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  employeeId: String,
  password: String (hashed),
  licenseCode: String,
  role: String (user/admin),
  isActive: Boolean,
  createdAt: Date,
  lastLogin: Date,
  loginAttempts: Number,
  lockUntil: Date
}
```

### LicenseCodes Collection
```javascript
{
  _id: ObjectId,
  code: String (unique),
  employeeId: String,
  isUsed: Boolean,
  usedBy: ObjectId (user reference),
  usedAt: Date,
  createdAt: Date
}
```

## 🔐 Security Features

- **JWT Tokens** with configurable expiration
- **Password Hashing** using bcrypt with salt rounds
- **Rate Limiting** on authentication endpoints
- **Account Lockout** after 5 failed login attempts
- **Input Validation** using express-validator
- **CORS Protection** with configurable origins
- **Helmet.js** for security headers

## 🚀 Deployment

### 1. Server Setup
```bash
# Install PM2 for production
npm install -g pm2

# Start with PM2
pm2 start server.js --name "bplabo-auth"

# Save PM2 configuration
pm2 save
pm2 startup
```

### 2. Environment Setup
- Set `NODE_ENV=production`
- Use strong JWT secrets
- Configure MongoDB connection string
- Set up SSL certificate

### 3. Nginx Configuration (Optional)
```nginx
server {
    listen 80;
    server_name bplabo.jp;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 🧪 Testing

### Manual Testing
1. **Register Admin:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "username": "admin_test",
       "email": "admin@test.com",
       "employeeId": "BPDON",
       "licenseCode": "BP-3541-2721",
       "password": "password123"
     }'
   ```

2. **Login:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "username": "admin_test",
       "password": "password123"
     }'
   ```

3. **Access Admin Routes:**
   ```bash
   curl -X GET http://localhost:5000/api/admin/users \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

## 📈 Monitoring

- **Health Check**: `GET /api/health`
- **Logs**: Check server console output
- **Database**: Monitor MongoDB performance
- **Rate Limiting**: Monitor failed authentication attempts

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check MongoDB is running
   - Verify connection string in `.env`
   - Check network connectivity

2. **JWT Token Errors**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Ensure token is sent in Authorization header

3. **CORS Errors**
   - Verify FRONTEND_URL in `.env`
   - Check if frontend is running on correct port

4. **License Code Errors**
   - Ensure employee ID is in whitelist
   - Verify license code format (BP-XXXX-XXXX)
   - Check if license code was already used

## 📚 File Structure

```
backend/
├── server.js              # Main server file
├── package.json           # Dependencies
├── .env.example           # Environment variables template
├── models/
│   ├── User.js           # User model
│   └── LicenseCode.js    # License code model
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── admin.js          # Admin-only routes
│   └── users.js          # User management routes
├── middleware/
│   ├── auth.js           # JWT authentication middleware
│   └── errorHandler.js   # Error handling middleware
└── README.md             # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support, please check the server logs and ensure all environment variables are properly configured.
