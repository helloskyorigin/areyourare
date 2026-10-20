/** Only a JSON checkout session returned by our own Next.js API can open Dodo. */
export async function parseCheckoutResponse(response: Response): Promise<string> {
  const type=response.headers.get('content-type')?.toLowerCase()||'';
  if(!type.includes('application/json')){
    // A Next.js error page, static-host fallback or AI Studio preview often returns HTML.
    // Never display HTML (or its raw stack traces) in the payment UI.
    throw new Error(
      'Payment API returned a web page instead of checkout data (HTTP '+response.status+
      '). The /api/checkout server route must be deployed and available.'
    );
  }
  let raw:unknown;
  try {raw=await response.json();}
  catch {throw new Error('Payment API returned invalid JSON (HTTP '+response.status+').');}
  if(!raw||typeof raw!=='object'){
    throw new Error('Payment API returned an invalid checkout response.');
  }
  const data=raw as {checkoutUrl?:unknown;error?:unknown};
  if(!response.ok){
    throw new Error(typeof data.error==='string'?data.error:'Checkout unavailable (HTTP '+response.status+').');
  }
  if(typeof data.checkoutUrl!=='string'){
    throw new Error('Payment API did not return a checkout link.');
  }
  return data.checkoutUrl;
}
