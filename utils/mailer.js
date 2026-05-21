const nodemailer = require('nodemailer');

// create a fresh transporter each time so env vars are always loaded
function getTransporter() {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
}

async function sendContactEmail({ name, email, phone, subject, message }) {
    await getTransporter().sendMail({
        from:    `"Bhoond Aesthetic Clinic" <${process.env.EMAIL_USER}>`,
        to:      process.env.EMAIL_TO,
        replyTo: email,
        subject: `[Contact Form] ${subject || 'Website Enquiry'}`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
                <div style="background:#D4A5A0;padding:20px 24px;">
                    <h2 style="color:#fff;margin:0;">New Message — Bhoond Aesthetic Clinic</h2>
                </div>
                <div style="padding:24px;background:#fff;">
                    <table style="width:100%;border-collapse:collapse;font-size:15px;">
                        <tr><td style="padding:8px 0;color:#555;width:110px;"><strong>Name</strong></td><td style="color:#222;">${name}</td></tr>
                        <tr style="background:#f9f9f9;"><td style="padding:8px 0;color:#555;"><strong>Email</strong></td><td><a href="mailto:${email}" style="color:#D4A5A0;">${email}</a></td></tr>
                        <tr><td style="padding:8px 0;color:#555;"><strong>Phone</strong></td><td style="color:#222;">${phone || '—'}</td></tr>
                        <tr style="background:#f9f9f9;"><td style="padding:8px 0;color:#555;"><strong>Subject</strong></td><td style="color:#222;">${subject || 'Website Enquiry'}</td></tr>
                    </table>
                    <div style="margin-top:20px;">
                        <strong style="color:#555;">Message:</strong>
                        <div style="margin-top:8px;padding:16px;background:#f4f4f4;border-radius:6px;color:#222;line-height:1.6;white-space:pre-wrap;">${message}</div>
                    </div>
                    <p style="margin-top:20px;font-size:12px;color:#aaa;">Hit Reply to respond directly to ${name}.</p>
                </div>
            </div>`,
    });
}

async function sendWelcomeEmail({ name, email }) {
    await getTransporter().sendMail({
        from:    `"Bhoond Aesthetic Clinic" <${process.env.EMAIL_USER}>`,
        to:      email,
        subject: 'Welcome to Bhoond Aesthetic Clinic',
        html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
                <div style="background:#D4A5A0;padding:20px 24px;">
                    <h2 style="color:#fff;margin:0;">Welcome to Bhoond Aesthetic Clinic</h2>
                </div>
                <div style="padding:24px;background:#fff;">
                    <p style="font-size:16px;color:#222;">Hi <strong>${name}</strong>,</p>
                    <p style="color:#444;line-height:1.6;">Your account has been created. You can now log in to manage your consultations and connect with your surgeon.</p>
                    <div style="margin:24px 0;padding:16px;background:#FAF8F5;border-radius:6px;border:1px solid #E8E0D8;">
                        <p style="margin:0;color:#555;font-size:14px;"><strong>Registered email:</strong> ${email}</p>
                    </div>
                    <p style="color:#444;line-height:1.6;">If you didn't create this account, contact us immediately.</p>
                    <p style="margin-top:24px;color:#888;font-size:13px;">— Bhoond Aesthetic Clinic</p>
                </div>
            </div>`,
    });
}

module.exports = { sendContactEmail, sendWelcomeEmail };
