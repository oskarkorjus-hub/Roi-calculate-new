export const config = {
  runtime: 'edge',
};

export default async function handler() {
  const hasPostmarkToken = !!process.env.POSTMARK_API_TOKEN;
  const hasPostmarkFrom = !!process.env.POSTMARK_FROM_EMAIL;
  const hasContactEmail = !!process.env.CONTACT_EMAIL;

  // Show first/last few chars of token for verification (safe to expose)
  const tokenPreview = process.env.POSTMARK_API_TOKEN
    ? `${process.env.POSTMARK_API_TOKEN.slice(0, 4)}...${process.env.POSTMARK_API_TOKEN.slice(-4)}`
    : 'not set';

  return new Response(JSON.stringify({
    hasPostmarkToken,
    hasPostmarkFrom,
    hasContactEmail,
    tokenPreview,
    fromEmail: process.env.POSTMARK_FROM_EMAIL || 'not set',
    contactEmail: process.env.CONTACT_EMAIL || 'not set',
  }, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
