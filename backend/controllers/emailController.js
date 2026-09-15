const { GoogleGenerativeAI } = require('@google/generative-ai');
const nodemailer = require('nodemailer');
const pool = require('../config/db');
require('dotenv').config();

// Helper to generate text using Ollama or Gemini
const generateWithAI = async (prompt) => {
  const provider = (process.env.AI_PROVIDER || 'ollama').toLowerCase();

  if (provider === 'ollama') {
    const baseUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
    const model = process.env.OLLAMA_MODEL || 'llama3.2:3b';

    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Ollama error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return data.response;
  }

  // Fallback to Google Gemini AI
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('your_gemini')) {
    throw new Error('Gemini API key is not configured. Set AI_PROVIDER=ollama to use local Ollama.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
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

    const emailText = await generateWithAI(prompt);

    // Parse subject and body
    const lines = emailText.trim().split('\n');
    let subject = '';
    let bodyLines = [];

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('Subject:')) {
        subject = lines[i].replace('Subject:', '').trim();
        bodyLines = lines.slice(i + 1).filter((l) => l.trim() !== '' || bodyLines.length > 0);
        break;
      }
    }

    // Remove leading blank lines
    while (bodyLines.length > 0 && bodyLines[0].trim() === '') {
      bodyLines.shift();
    }

    const body = bodyLines.join('\n');

    return res.status(200).json({
      success: true,
      subject: subject || `Invitation to ${event_name}`,
      body: body || emailText,
      fullEmail: emailText,
    });
  } catch (error) {
    console.error('GenerateEmail error:', error);
    let message = 'Failed to generate email. Try again.';
    if (error.message?.includes('Ollama')) {
      message = 'Failed to connect to Ollama. Make sure Ollama is running on localhost:11434.';
    } else if (error.message?.includes('API key') || error.message?.includes('API_KEY')) {
      message = error.message;
    }
    return res.status(500).json({
      success: false,
      message,
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

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Verify SMTP connection
    try {
      await transporter.verify();
    } catch (smtpError) {
      console.error('SMTP connection error:', smtpError);
      return res.status(500).json({ success: false, message: 'Gmail SMTP connection failed. Check your credentials.' });
    }

    const results = { sent: 0, failed: 0, errors: [] };

    // Insert pending logs first
    for (const emp of employees) {
      await pool.query(
        'INSERT INTO email_logs (employee_id, event_id, email_subject, email_body, recipient_email, status) VALUES (?, ?, ?, ?, ?, ?)',
        [emp.id, event_id, subject, body, emp.email, 'Pending']
      );
    }

    // Get the log IDs we just created
    const [logs] = await pool.query(
      `SELECT id, employee_id FROM email_logs WHERE event_id = ? AND status = 'Pending' AND employee_id IN (${placeholders})`,
      [event_id, ...employee_ids]
    );

    // Send emails
    for (const emp of employees) {
      const log = logs.find((l) => l.employee_id === emp.id);
      // Personalize the body — replace generic name placeholder
      const personalizedBody = body.replace(/Dear\s+\w+/g, `Dear ${emp.full_name}`);

      try {
        await transporter.sendMail({
          from: `"HR Team" <${process.env.GMAIL_USER}>`,
          to: emp.email,
          subject: subject,
          text: personalizedBody,
          html: personalizedBody.replace(/\n/g, '<br>'),
        });

        // Update log to Sent
        if (log) {
          await pool.query('UPDATE email_logs SET status = ?, sent_time = NOW() WHERE id = ?', ['Sent', log.id]);
        }
        results.sent++;
      } catch (mailError) {
        console.error(`Failed to send to ${emp.email}:`, mailError.message);
        // Update log to Failed
        if (log) {
          await pool.query('UPDATE email_logs SET status = ?, error_message = ? WHERE id = ?', [
            'Failed',
            mailError.message,
            log.id,
          ]);
        }
        results.failed++;
        results.errors.push({ email: emp.email, error: mailError.message });
      }
    }

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
