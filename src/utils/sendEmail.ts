interface SendEmailOptions {
  email: string;
  pdfBase64: string;
  fileName: string;
  reportType: string;
}

export async function sendPDFByEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      console.error('Email send failed:', await response.json());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}
