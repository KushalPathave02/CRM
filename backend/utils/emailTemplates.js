const getEmailVerificationTemplate = (name, verificationUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification - CRM App</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .container {
                background: #f9f9f9;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #6200ee;
                margin-bottom: 10px;
            }
            .content {
                background: white;
                padding: 30px;
                border-radius: 8px;
                margin-bottom: 20px;
            }
            .button {
                display: inline-block;
                background: #6200ee;
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                margin: 20px 0;
            }
            .button:hover {
                background: #5000d4;
            }
            .footer {
                text-align: center;
                color: #666;
                font-size: 14px;
            }
            .warning {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">📊 CRM App</div>
                <h1>Welcome to CRM App!</h1>
            </div>
            
            <div class="content">
                <h2>Hi ${name}! 👋</h2>
                <p>Thank you for registering with CRM App. To complete your registration and start using your account, please verify your email address.</p>
                
                <div style="text-align: center;">
                    <a href="${verificationUrl}" class="button">✅ Verify Email Address</a>
                </div>
                
                <p>Or copy and paste this link in your browser:</p>
                <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px;">
                    ${verificationUrl}
                </p>
                
                <div class="warning">
                    <strong>⚠️ Important:</strong> This verification link will expire in 24 hours. If you don't verify your email within this time, you'll need to register again.
                </div>
                
                <p>If you didn't create an account with us, please ignore this email.</p>
            </div>
            
            <div class="footer">
                <p>© 2024 CRM App. All rights reserved.</p>
                <p>This is an automated email, please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

const getWelcomeTemplate = (name) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to CRM App</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .container {
                background: #f9f9f9;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #6200ee;
                margin-bottom: 10px;
            }
            .content {
                background: white;
                padding: 30px;
                border-radius: 8px;
                margin-bottom: 20px;
            }
            .feature {
                display: flex;
                align-items: center;
                margin: 15px 0;
            }
            .feature-icon {
                font-size: 24px;
                margin-right: 15px;
            }
            .footer {
                text-align: center;
                color: #666;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">📊 CRM App</div>
                <h1>Welcome to CRM App! 🎉</h1>
            </div>
            
            <div class="content">
                <h2>Hi ${name}!</h2>
                <p>Congratulations! Your email has been successfully verified and your account is now active.</p>
                
                <p>You can now enjoy all the features of CRM App:</p>
                
                <div class="feature">
                    <span class="feature-icon">👥</span>
                    <span>Manage customers and their information</span>
                </div>
                <div class="feature">
                    <span class="feature-icon">💼</span>
                    <span>Track leads and opportunities</span>
                </div>
                <div class="feature">
                    <span class="feature-icon">📊</span>
                    <span>View analytics and reports</span>
                </div>
                <div class="feature">
                    <span class="feature-icon">🌙</span>
                    <span>Customize themes and preferences</span>
                </div>
                
                <p>Ready to get started? Open the CRM App and log in with your credentials!</p>
                
                <p>If you have any questions or need help, feel free to contact our support team.</p>
            </div>
            
            <div class="footer">
                <p>© 2024 CRM App. All rights reserved.</p>
                <p>Happy CRM-ing! 🚀</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

module.exports = {
  getEmailVerificationTemplate,
  getWelcomeTemplate,
};
