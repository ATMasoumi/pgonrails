import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Subject options for validation
const VALID_SUBJECTS = ['general', 'support', 'feedback', 'partnership', 'billing', 'other'];

// Subject labels for display
const SUBJECT_LABELS: Record<string, string> = {
  general: 'General Inquiry',
  support: 'Technical Support',
  feedback: 'Feedback',
  partnership: 'Partnership',
  billing: 'Billing Question',
  other: 'Other',
};

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Send Telegram notification
async function sendTelegramNotification(data: ContactFormData & { id: string }) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.warn('Telegram credentials not configured. Skipping notification.');
    return;
  }

  const subjectLabel = SUBJECT_LABELS[data.subject] || data.subject;
  
  // Use HTML parse mode instead of MarkdownV2 for simpler escaping
  const message = `
📬 <b>New Contact Form Submission</b>

<b>From:</b> ${escapeHtml(data.name)}
<b>Email:</b> ${escapeHtml(data.email)}
<b>Subject:</b> ${escapeHtml(subjectLabel)}

<b>Message:</b>
${escapeHtml(data.message)}

<i>Submission ID: ${data.id}</i>
  `.trim();

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Telegram API error:', error);
    }
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
  }
}

// Escape special characters for Telegram HTML
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();
    const { name, email, subject, message } = body;

    // Server-side validation
    const errors: string[] = [];

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      errors.push('Name must be at least 2 characters');
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      errors.push('Valid email address is required');
    }

    if (!subject || !VALID_SUBJECTS.includes(subject)) {
      errors.push('Invalid subject selected');
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      errors.push('Message must be at least 10 characters');
    }

    if (message && message.length > 5000) {
      errors.push('Message must be less than 5000 characters');
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: errors.join(', ') },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject,
      message: message.trim(),
    };

    // Save to Supabase
    const supabase = await createAdminClient();
    const { data: submission, error: dbError } = await supabase
      .from('contact_submissions')
      .insert([sanitizedData])
      .select('id')
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save your message. Please try again later.' },
        { status: 500 }
      );
    }

    // Send Telegram notification (don't await to not block response)
    sendTelegramNotification({ ...sanitizedData, id: submission.id }).catch(
      (err) => console.error('Telegram notification failed:', err)
    );

    return NextResponse.json(
      { 
        success: true, 
        message: 'Thank you for your message. We will get back to you soon!' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}

// Handle other methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
