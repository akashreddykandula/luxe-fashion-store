// const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST || 'smtp.gmail.com',
//   port: Number(process.env.EMAIL_PORT) || 587,
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });
const {Resend} = require ('resend');

const resend = new Resend (process.env.RESEND_API_KEY);


const templates = {
  welcome: ({ name }) => ({
    subject: 'Welcome to LUXE Fashion',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
        <div style="background:#0a0a0a;padding:30px;text-align:center;">
          <h1 style="color:#fff;font-size:28px;letter-spacing:4px;margin:0;">LUXE</h1>
        </div>
        <div style="padding:40px 30px;">
          <h2 style="color:#0a0a0a;">Welcome, ${name}!</h2>
          <p style="color:#555;line-height:1.6;">Thank you for joining LUXE. Your account has been created successfully.</p>
          <p style="color:#555;line-height:1.6;">Explore our latest collections and enjoy exclusive member benefits.</p>
          <a href="${process.env.CLIENT_URL}/shop" style="display:inline-block;background:#0a0a0a;color:#fff;padding:14px 32px;text-decoration:none;margin-top:20px;letter-spacing:2px;font-size:12px;">SHOP NOW</a>
        </div>
        <div style="background:#f5f5f5;padding:20px 30px;text-align:center;">
          <p style="color:#888;font-size:12px;margin:0;">© ${new Date().getFullYear()} LUXE Fashion. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  resetPassword: ({ name, resetUrl }) => ({
    subject: 'Reset Your LUXE Password',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
        <div style="background:#0a0a0a;padding:30px;text-align:center;">
          <h1 style="color:#fff;font-size:28px;letter-spacing:4px;margin:0;">LUXE</h1>
        </div>
        <div style="padding:40px 30px;">
          <h2 style="color:#0a0a0a;">Password Reset Request</h2>
          <p style="color:#555;line-height:1.6;">Hello ${name},</p>
          <p style="color:#555;line-height:1.6;">You requested a password reset. Click the button below to create a new password. This link expires in <strong>15 minutes</strong>.</p>
          <a href="${resetUrl}" style="display:inline-block;background:#0a0a0a;color:#fff;padding:14px 32px;text-decoration:none;margin-top:20px;letter-spacing:2px;font-size:12px;">RESET PASSWORD</a>
          <p style="color:#888;font-size:12px;margin-top:30px;">If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `,
  }),

  orderConfirmation: ({ order, name }) => ({
    subject: `Order Confirmed — ${order.orderNumber}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;">
        <div style="background:#0a0a0a;padding:30px;text-align:center;">
          <h1 style="color:#fff;font-size:28px;letter-spacing:4px;margin:0;">LUXE</h1>
        </div>
        <div style="padding:40px 30px;">
          <h2 style="color:#0a0a0a;">Order Confirmed ✓</h2>
          <p style="color:#555;">Hello ${name}, your order <strong>${order.orderNumber}</strong> has been placed successfully.</p>
          <div style="background:#f9f9f9;padding:20px;border-radius:4px;margin:20px 0;">
            <h3 style="margin:0 0 15px;">Order Summary</h3>
            ${order.items.map(item => `
              <div style="display:flex;justify-content:space-between;margin-bottom:10px;font-size:14px;">
                <span>${item.name} × ${item.quantity}${item.size ? ` (${item.size})` : ''}</span>
                <span>₹${(item.price * item.quantity).toLocaleString()}</span>
              </div>
            `).join('')}
            <hr style="border:1px solid #eee;margin:10px 0;">
            <div style="display:flex;justify-content:space-between;font-weight:bold;">
              <span>Total</span>
              <span>₹${order.pricing.total.toLocaleString()}</span>
            </div>
          </div>
          <p style="color:#555;font-size:14px;">Payment Method: <strong>${order.payment.method.toUpperCase()}</strong></p>
          <a href="${process.env.CLIENT_URL}/orders/${order._id}" style="display:inline-block;background:#0a0a0a;color:#fff;padding:14px 32px;text-decoration:none;letter-spacing:2px;font-size:12px;">TRACK ORDER</a>
        </div>
      </div>
    `,
  }),

  orderStatusUpdate: ({ name, order }) => ({
    subject: `Order Update — ${order.orderNumber}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <div style="background:#0a0a0a;padding:30px;text-align:center;">
          <h1 style="color:#fff;font-size:28px;letter-spacing:4px;margin:0;">LUXE</h1>
        </div>
        <div style="padding:40px 30px;">
          <h2 style="color:#0a0a0a;">Order Status Updated</h2>
          <p style="color:#555;">Hello ${name}, your order <strong>${order.orderNumber}</strong> status has been updated to <strong>${order.status.replace(/_/g, ' ').toUpperCase()}</strong>.</p>
          ${order.tracking?.trackingNumber ? `<p style="color:#555;">Tracking Number: <strong>${order.tracking.trackingNumber}</strong></p>` : ''}
          <a href="${process.env.CLIENT_URL}/orders/${order._id}" style="display:inline-block;background:#0a0a0a;color:#fff;padding:14px 32px;text-decoration:none;letter-spacing:2px;font-size:12px;">VIEW ORDER</a>
        </div>
      </div>
    `,
  }),

  contact: ({ name, email, phone, message, subject }) => ({
    subject: `Contact Form: ${subject || 'New Inquiry'} — from ${name}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:30px;">
        <h2>New Contact Form Submission</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Name</td><td style="padding:8px;border-bottom:1px solid #eee;">${name}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;">${email}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Phone</td><td style="padding:8px;border-bottom:1px solid #eee;">${phone || 'N/A'}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Subject</td><td style="padding:8px;border-bottom:1px solid #eee;">${subject || 'N/A'}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;vertical-align:top;">Message</td><td style="padding:8px;">${message}</td></tr>
        </table>
      </div>
    `,
  }),
};

// const sendEmail = async ({ to, subject, template, data, html }) => {
//   let emailHtml = html;
//   let emailSubject = subject;

//   if (template && templates[template]) {
//     const rendered = templates[template](data || {});
//     emailHtml = rendered.html;
//     emailSubject = rendered.subject || subject;
//   }

//   const mailOptions = {
//     from: `"LUXE Fashion" <${process.env.EMAIL_USER}>`,
//     to,
//     subject: emailSubject,
//     html: emailHtml,
//   };

//   await transporter.sendMail(mailOptions);
// };

// const sendEmail = async ({to, subject, template, data, html}) => {
//   console.log ('EMAIL_USER:', process.env.EMAIL_USER);
//   console.log ('Sending email to:', to);

//   let emailHtml = html;
//   let emailSubject = subject;

//   if (template && templates[template]) {
//     const rendered = templates[template] (data || {});
//     emailHtml = rendered.html;
//     emailSubject = rendered.subject || subject;
//   }

//   const mailOptions = {
//     from: `"LUXE Fashion" <${process.env.EMAIL_USER}>`,
//     to,
//     subject: emailSubject,
//     html: emailHtml,
//   };

//   try {
//     const info = await transporter.sendMail (mailOptions);
//     console.log ('Email sent:', info.messageId);
//   } catch (error) {
//     console.error ('EMAIL ERROR:', error);
//     throw error;
//   }
// };

const sendEmail = async ({to, subject, template, data, html}) => {
  console.log ('Sending email to:', to);

  let emailHtml = html;
  let emailSubject = subject;

  if (template && templates[template]) {
    const rendered = templates[template] (data || {});
    emailHtml = rendered.html;
    emailSubject = rendered.subject || subject;
  }

  try {
    const response = await resend.emails.send ({
      from: `LUXE Fashion <${process.env.EMAIL_FROM}>`,
      to,
      subject: emailSubject,
      html: emailHtml,
    });

    console.log ('Email sent:', response);
    return response;
  } catch (error) {
    console.error ('EMAIL ERROR:', error);
    throw error;
  }
};

module.exports = sendEmail;
