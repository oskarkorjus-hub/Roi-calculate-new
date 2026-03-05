export const config = {
  runtime: 'edge',
};

// Simple in-memory rate limiter for edge runtime
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 5; // 5 contact form submissions per minute

  const entry = rateLimitStore.get(ip);

  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count };
}

// Security headers for all responses
const securityHeaders = {
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

// Sanitize user input to prevent XSS
function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: securityHeaders,
    });
  }

  // Rate limiting
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                   request.headers.get('x-real-ip') ||
                   'unknown';

  const rateCheck = checkRateLimit(clientIp);
  if (!rateCheck.allowed) {
    return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
      status: 429,
      headers: {
        ...securityHeaders,
        'Retry-After': '60',
        'X-RateLimit-Remaining': '0',
      },
    });
  }

  const apiToken = process.env.POSTMARK_API_TOKEN;
  const fromAddress = process.env.POSTMARK_FROM_EMAIL || 'reports@investlandgroup.com';
  const toAddress = process.env.CONTACT_EMAIL || 'hello@roicalculate.com';

  if (!apiToken) {
    return new Response(JSON.stringify({ error: 'Email service not configured' }), {
      status: 500,
      headers: securityHeaders,
    });
  }

  try {
    const body = await request.json();
    const { name, email, company, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: securityHeaders,
      });
    }

    // Validate email
    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400,
        headers: securityHeaders,
      });
    }

    // Validate field lengths
    if (name.length > 100 || email.length > 254 || (company && company.length > 100) || message.length > 5000) {
      return new Response(JSON.stringify({ error: 'Field length exceeds limit' }), {
        status: 400,
        headers: securityHeaders,
      });
    }

    // Validate subject
    const validSubjects = ['general', 'sales', 'support', 'enterprise', 'feedback', 'partnership'];
    if (!validSubjects.includes(subject)) {
      return new Response(JSON.stringify({ error: 'Invalid subject' }), {
        status: 400,
        headers: securityHeaders,
      });
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedCompany = company ? sanitizeInput(company) : '';
    const sanitizedMessage = sanitizeInput(message);

    const subjectMap: Record<string, string> = {
      general: 'General Inquiry',
      sales: 'Sales / Pricing',
      support: 'Technical Support',
      enterprise: 'Enterprise Plans',
      feedback: 'Feedback',
      partnership: 'Partnership',
    };

    const response = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': apiToken,
      },
      body: JSON.stringify({
        From: fromAddress,
        To: toAddress,
        ReplyTo: email,
        Subject: `[ROI Calculate] ${subjectMap[subject]}: ${sanitizedName}`,
        HtmlBody: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <h2 style="color: #0f172a; font-size: 20px; margin: 0 0 16px 0;">New Contact Form Submission</h2>

              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; width: 100px;">Name:</td>
                  <td style="padding: 8px 0; color: #0f172a; font-weight: 500;">${sanitizedName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Email:</td>
                  <td style="padding: 8px 0; color: #0f172a;"><a href="mailto:${email}" style="color: #10b981;">${email}</a></td>
                </tr>
                ${sanitizedCompany ? `
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Company:</td>
                  <td style="padding: 8px 0; color: #0f172a;">${sanitizedCompany}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; color: #64748b;">Subject:</td>
                  <td style="padding: 8px 0; color: #0f172a;">${subjectMap[subject]}</td>
                </tr>
              </table>
            </div>

            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
              <h3 style="color: #0f172a; font-size: 16px; margin: 0 0 12px 0;">Message:</h3>
              <p style="color: #334155; font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${sanitizedMessage}</p>
            </div>

            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">
              Sent from ROI Calculate Contact Form
            </p>
          </div>
        `,
        TextBody: `
New Contact Form Submission

Name: ${sanitizedName}
Email: ${email}
${sanitizedCompany ? `Company: ${sanitizedCompany}` : ''}
Subject: ${subjectMap[subject]}

Message:
${sanitizedMessage}
        `,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: securityHeaders,
      });
    } else {
      console.error('Postmark error:', data);
      return new Response(JSON.stringify({ error: 'Failed to send message' }), {
        status: 500,
        headers: securityHeaders,
      });
    }
  } catch (err) {
    console.error('Contact form error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: securityHeaders,
    });
  }
}
