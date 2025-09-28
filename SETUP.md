# Mini CRM Setup Guide

This guide will help you set up and run the Mini CRM application on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** - [Download here](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Expo CLI** - Install globally: `npm install -g expo-cli`
- **Git** - [Download here](https://git-scm.com/)

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd mini-crm
```

### 2. Install Dependencies

Install dependencies for both frontend and backend:

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

Or use the convenience scripts:

```bash
npm run install-all
```

### 3. Database Setup

#### Option A: Local MongoDB

1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS (with Homebrew)
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

#### Option B: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Replace the `MONGODB_URI` in your `.env` file

### 4. Environment Configuration

Create a `.env` file in the `backend` directory:

```bash
cd backend
touch .env  # On Windows: type nul > .env
```

Add the following content to `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mini-crm
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
NODE_ENV=development

# Email Configuration (Required for email verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_NAME=CRM App
FROM_EMAIL=your-email@gmail.com

```bash
npm run dev
```

This will start both the backend API server and the React Native development server.

#### Option 2: Run Servers Separately

**Terminal 1 - Backend:**
```bash
npm run backend
# or
cd backend && npm start
```

**Terminal 2 - Frontend:**
```bash
npm run frontend
# or
cd frontend && npm start
```

### 6. Access the Application

- **Backend API**: http://localhost:5000
- **Frontend**: 
  - Install the Expo Go app on your mobile device
  - Scan the QR code displayed in the terminal
  - Or use an iOS/Android simulator

## Verification

### Test Backend API

Visit http://localhost:5000/api/health in your browser. You should see:

```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

### Test Frontend

1. Open the Expo app on your device
2. You should see the login screen
3. Try registering a new account

## Troubleshooting

### Common Issues

#### MongoDB Connection Error

**Error**: `MongoNetworkError: failed to connect to server`

**Solutions**:
1. Ensure MongoDB is running: `mongod --version`
2. Check if the port 27017 is available
3. Verify the `MONGODB_URI` in your `.env` file
4. For Atlas, ensure your IP is whitelisted

#### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solutions**:
1. Kill the process using port 5000:
   ```bash
   # Find the process
   lsof -i :5000  # macOS/Linux
   netstat -ano | findstr :5000  # Windows
   
   # Kill the process
   kill -9 <PID>  # macOS/Linux
   taskkill /PID <PID> /F  # Windows
   ```
2. Or change the port in `backend/.env`

#### Expo/React Native Issues

**Error**: `Unable to resolve module`

**Solutions**:
1. Clear Expo cache: `expo start -c`
2. Delete `node_modules` and reinstall:
   ```bash
   cd frontend
   rm -rf node_modules
   npm install
   ```

#### Network Issues

**Error**: `Network request failed`

**Solutions**:
1. Ensure backend is running on port 5000
2. Check if your device and computer are on the same network
3. Update the API base URL in `frontend/src/services/api.js` if needed

### Development Tips

1. **Hot Reloading**: Both frontend and backend support hot reloading
2. **Debugging**: Use React Native Debugger or Expo DevTools
3. **API Testing**: Use Postman or curl to test API endpoints
4. **Database **Important**: Change the `JWT_SECRET` to a secure random string in production!

### 4.1. Email Configuration Setup

For email verification to work, you need to configure email settings:

#### Using Gmail:

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. Use the app password in `SMTP_PASSWORD`

#### Using Other Email Providers:

- **Outlook**: Use `smtp-mail.outlook.com` port 587
- **Yahoo**: Use `smtp.mail.yahoo.com` port 587
- **Custom SMTP**: Configure according to your provider

**Note**: Without email configuration, users won't be able to verify their accounts and login.

### Deployment

### Backend Deployment

1. **Environment Variables**: Set production environment variables
2. **Database**: Use MongoDB Atlas for production

### Frontend Deployment

1. **Build**: Create production build with `expo build`
2. **Distribution**: Publish to App Store/Google Play or distribute internally

## Additional Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)

## Support

If you encounter any issues:

1. Check this troubleshooting guide
2. Review the error messages carefully
3. Check the GitHub issues
4. Contact support: support@devinnovationslabs.com

---

Happy coding! 🚀
