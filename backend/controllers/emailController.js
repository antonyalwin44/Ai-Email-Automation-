const nodemailer = require('nodemailer');
const pool = require('../config/db');
require('dotenv').config();

// Smart template fallback generator
const generateSmartTemplate = ({ employee_name, department, event_name, event_type, formattedDate, formattedTime, venue, description }) => {
  const subject = `Invitation: ${event_name} - ${formattedDate}`;
  const timeText = formattedTime ? ` at ${formattedTime}` : '';
  const descText = description ? `\n\nAbout the Event:\n${description}` : '';

  const body = `Dear ${employee_name},

We are delighted to invite you and the ${department || 'team'} to our upcoming company ${event_type || 'event'}, "${event_name}".

Event Details:
📅 Date: ${formattedDate}${timeText}
📍 Venue: ${venue || 'Company Main Hall'}
🎉 Occasion: ${event_type || 'Company Celebration'}${descText}

Your presence and active participation make these events truly special for our whole team. We look forward to celebrating and connecting together!

If you have any questions or require any special accommodations, please feel free to reach out to the HR department.

Warm regards,
HR Operations Team
AI Email Automation`;

  return { subject, body };
};

// Helper to generate text using Ollama (with smart template fallback)
const generateWithAI = async (prompt) => {
  try {
    const baseUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
    const model = process.env.OLLAMA_MODEL || 'qwen2.5:0.5b';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12-second timeout

    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.response && data.response.trim().length > 0) {
        console.log(`✅ Email generated via Ollama (${model})`);
        return data.response;
      }
    } else {
      const errText = await response.text();
      console.warn(`Ollama responded with error (${response.status}):`, errText);
    }
  } catch (err) {
    console.warn('Ollama connection/generation failed:', err.message);
  }

  // Return null so it gracefully falls back to the smart HR template engine
  return null;
};

// POST /api/email/generate-email
const generateEmail = async (req, res) => {
  try {
    const { employee_name, department, event_name, event_type, event_date, event_time, venue, description } = req.body;

    if (!employee_name || !event_name || !event_date) {
      return res.status(400).json({ success: false, message: 'Employee name, event name, and date are required.' });
    }

    // Format date nicely
    const formattedDate = new Date(event_date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    // Format time nicely
    const formattedTime = event_time
      ? new Date(`2000-01-01T${event_time}`).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      : '';

    const prompt = `You are an HR professional writing a formal and warm event invitation email.

Write a professional event invitation email with the following details:
- Recipient Name: ${employee_name}
- Department: ${department || 'All Departments'}
- Event Name: ${event_name}
- Event Type: ${event_type || 'Company Event'}
- Event Date: ${formattedDate}
- Event Time: ${formattedTime}
- Venue: ${venue}
- Event Description: ${description || 'A special company event'}

Requirements:
1. Write a catchy and relevant subject line starting with "Subject: "
2. Start with "Dear ${employee_name},"
3. Write 2-3 warm and professional paragraphs
4. Mention the date, time, and venue clearly
5. End with: "Regards,\nHR Team\n[Company Name]"
6. Keep it concise, warm, and professional
7. Do NOT include any markdown formatting like ** or ##

Provide ONLY the email content starting with "Subject:" followed by the email body. No extra commentary.`;

    let subject = '';
    let body = '';
    let fullEmail = '';

    const emailText = await generateWithAI(prompt);

    if (emailText) {
      // Parse subject and body from AI output
      const lines = emailText.trim().split('\n');
      let bodyLines = [];

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().startsWith('subject:')) {
          subject = lines[i].replace(/^subject:\s*/i, '').trim();
          bodyLines = lines.slice(i + 1).filter((l) => l.trim() !== '' || bodyLines.length > 0);
          break;
        }
      }

      // Remove leading blank lines
      while (bodyLines.length > 0 && bodyLines[0].trim() === '') {
        bodyLines.shift();
      }

      body = bodyLines.length > 0 ? bodyLines.join('\n') : emailText;
      fullEmail = emailText;
    } else {
      // Graceful fallback to smart personalized template
      console.log(`ℹ️ Using smart HR template engine for ${employee_name} - ${event_name}`);
      const fallback = generateSmartTemplate({
        employee_name,
        department,
        event_name,
        event_type,
        formattedDate,
        formattedTime,
        venue,
        description,
      });
      subject = fallback.subject;
      body = fallback.body;
      fullEmail = `Subject: ${subject}\n\n${body}`;
    }

    return res.status(200).json({
      success: true,
      subject: subject || `Invitation to ${event_name}`,
      body: body,
      fullEmail: fullEmail,
      aiGenerated: !!emailText,
    });
  } catch (error) {
    console.error('GenerateEmail error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unexpected error during email generation.',
    });
  }
};

// POST /api/email/send-email
const sendEmail = async (req, res) => {
  try {
    const { employee_ids, event_id, subject, body } = req.body;

    if (!employee_ids || !Array.isArray(employee_ids) || employee_ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one employee.' });
    }
    if (!event_id || !subject || !body) {
      return res.status(400).json({ success: false, message: 'Event, subject, and body are required.' });
    }

    // Get employees
    const placeholders = employee_ids.map(() => '?').join(',');
    const [employees] = await pool.query(
      `SELECT id, full_name, email FROM employees WHERE id IN (${placeholders}) AND status = 'Active'`,
      employee_ids
    );

    if (employees.length === 0) {
      return res.status(404).json({ success: false, message: 'No active employees found with the given IDs.' });
    }

    // Configure high-performance Gmail SMTP transporter (direct SSL port 465)
    const cleanPassword = process.env.GMAIL_APP_PASSWORD ? process.env.GMAIL_APP_PASSWORD.replace(/\s+/g, '') : '';
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: cleanPassword,
      },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000,
    });

    const results = { sent: 0, failed: 0, errors: [] };

    // Process all recipient emails in parallel for maximum speed
    await Promise.all(
      employees.map(async (emp) => {
        // Insert pending log
        let logId = null;
        try {
          const [insertRes] = await pool.query(
            'INSERT INTO email_logs (employee_id, event_id, email_subject, email_body, recipient_email, status) VALUES (?, ?, ?, ?, ?, ?)',
            [emp.id, event_id, subject, body, emp.email, 'Pending']
          );
          logId = insertRes.insertId;
        } catch (dbErr) {
          console.warn(`Failed to insert pending log for ${emp.email}:`, dbErr.message);
        }

        const personalizedBody = body.replace(/Dear\s+[^\n,]+/g, `Dear ${emp.full_name}`);

        try {
          await transporter.sendMail({
            from: `"HR Operations" <${process.env.GMAIL_USER}>`,
            to: emp.email,
            subject: subject,
            text: personalizedBody,
            html: personalizedBody.replace(/\n/g, '<br>'),
          });

          if (logId) {
            await pool.query('UPDATE email_logs SET status = ?, sent_time = NOW() WHERE id = ?', ['Sent', logId]);
          }
          results.sent++;
        } catch (mailError) {
          console.error(`Failed to send email to ${emp.email}:`, mailError.message);
          if (logId) {
            await pool.query('UPDATE email_logs SET status = ?, error_message = ? WHERE id = ?', [
              'Failed',
              mailError.message,
              logId,
            ]);
          }
          results.failed++;
          results.errors.push({ email: emp.email, error: mailError.message });
        }
      })
    );

    return res.status(200).json({
      success: true,
      message: `Emails processed: ${results.sent} sent, ${results.failed} failed.`,
      results,
    });
  } catch (error) {
    console.error('SendEmail error:', error);
    return res.status(500).json({ success: false, message: 'Server error while sending emails.' });
  }
};

module.exports = { generateEmail, sendEmail };
