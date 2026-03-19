const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'zain.ali.cs.dev@gmail.com',
    pass: 'wvzcziqrsdxjmdkr',
  },
});

async function testEmail() {
  try {
    console.log('🔄 Testing SMTP connection...');
    
    const info = await transporter.sendMail({
      from: 'ChatNova <zain.ali.cs.dev@gmail.com>',
      to: 'zain.ali.cs.dev@gmail.com',
      subject: 'Test Email - AI Teacher',
      html: '<h1>Test Email</h1><p>If you receive this, SMTP is working!</p>',
    });

    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📬 Check your inbox at: zain.ali.cs.dev@gmail.com');
  } catch (error) {
    console.error('❌ Failed to send email:');
    console.error(error);
  }
}

testEmail();
