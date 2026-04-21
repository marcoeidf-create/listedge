const { Resend } = require('resend');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, company, message } = req.body || {};

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (message.length > 5000 || name.length > 200) {
    return res.status(400).json({ error: 'Submission too long.' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const safe = (s) => String(s).replace(/[<>]/g, (c) => ({ '<': '&lt;', '>': '&gt;' }[c]));

  try {
    await resend.emails.send({
      from: 'ListEdge <noreply@listedge.co>',
      to: 'support@listedge.co',
      reply_to: email,
      subject: `New contact form submission — ${name}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #0f0f0e;">
          <h2 style="margin: 0 0 16px; font-size: 18px;">New contact form submission</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr><td style="padding: 8px 0; width: 100px; color: #8a8a82; font-size: 13px;">Name</td><td style="padding: 8px 0; font-size: 14px;">${safe(name)}</td></tr>
            <tr><td style="padding: 8px 0; color: #8a8a82; font-size: 13px;">Email</td><td style="padding: 8px 0; font-size: 14px;"><a href="mailto:${safe(email)}" style="color: #0f0f0e;">${safe(email)}</a></td></tr>
            ${company ? `<tr><td style="padding: 8px 0; color: #8a8a82; font-size: 13px;">Company</td><td style="padding: 8px 0; font-size: 14px;">${safe(company)}</td></tr>` : ''}
          </table>
          <div style="border-top: 1px solid #e2e2dc; padding-top: 20px;">
            <div style="color: #8a8a82; font-size: 13px; margin-bottom: 8px;">Message</div>
            <div style="font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${safe(message)}</div>
          </div>
          <p style="margin-top: 28px; color: #8a8a82; font-size: 12px;">Reply to this email to respond directly to ${safe(name)}.</p>
        </div>
      `,
      text: `New contact form submission\n\nName: ${name}\nEmail: ${email}${company ? `\nCompany: ${company}` : ''}\n\nMessage:\n${message}\n\n—\nReply to this email to respond directly.`
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Failed to send. Please try again or email support@listedge.co directly.' });
  }
};
