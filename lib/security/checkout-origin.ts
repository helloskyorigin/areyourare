/**
 * A Next.js request's URL may be the internal http origin behind Cloud Run or
 * AI Studio's trusted HTTPS reverse proxy. Compare against exact origins, not
 * substring host checks. This prevents a false 403 from our own origin guard.
 * Platform-generated 403 HTML responses still require deployment/IAM repairs.
 */
export function isTrustedCheckoutOrigin(origin: string, requestOrigin: string, headers: Headers, appUrl?: string): boolean {
  let supplied: URL;
  try { supplied = new URL(origin); }
  catch { return false; }
  if (!['https:','http:'].includes(supplied.protocol) ||
      supplied.username || supplied.password || supplied.pathname !== '/' || supplied.search || supplied.hash)
    return false;
  const allowed=new Set<string>([requestOrigin]);
  const add=(value?:string|null)=>{
    if(!value)return;
    try { const parsed=new URL(value); if(['https:','http:'].includes(parsed.protocol))allowed.add(parsed.origin); }
    catch { /* invalid host */ }
  };
  add(appUrl);
  const forwardedHost=headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  const forwardedProto=headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const host=headers.get('host');
  if (forwardedHost && /^(?:[a-z0-9-]+\.)*[a-z0-9-]+(?::\d{1,5})?$/i.test(forwardedHost)) {
    add((forwardedProto==='http'?'http':'https')+'://'+forwardedHost);
  }
  if (host && /^(?:[a-z0-9-]+\.)*[a-z0-9-]+(?::\d{1,5})?$/i.test(host))
    add('https://'+host);
  return allowed.has(supplied.origin);
}
