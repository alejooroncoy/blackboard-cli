export function secureServiceUrl(value: string, label: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} must be a valid absolute URL`);
  }

  const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '[::1]';
  if (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) {
    throw new Error(`${label} must use HTTPS (HTTP is allowed only for localhost development)`);
  }
  if (url.username || url.password) {
    throw new Error(`${label} must not contain embedded credentials`);
  }
  return url.toString().replace(/\/$/, '');
}
