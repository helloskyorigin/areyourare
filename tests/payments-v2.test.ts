import test from 'node:test';
import assert from 'node:assert/strict';
import {
  checkoutReady, createCheckout, encodeReceipt, readReceipt, createRecoveryToken,
  readRecoveryToken, statusForReceipt, cookieNameForDate, remainingCookieSeconds,
  type Receipt,
} from '../lib/payments';

const originalFetch=globalThis.fetch;
const previous={
  DODO_PAYMENTS_API_KEY:process.env.DODO_PAYMENTS_API_KEY,
  DODO_PRODUCT_ID:process.env.DODO_PRODUCT_ID,
  PURCHASE_COOKIE_SECRET:process.env.PURCHASE_COOKIE_SECRET,
  DODO_MODE:process.env.DODO_MODE,
};
process.env.DODO_PAYMENTS_API_KEY='api_test_placeholder';
process.env.DODO_PRODUCT_ID='pdt_capsule_200_usd_test';
process.env.PURCHASE_COOKIE_SECRET='only-for-unit-testing-01234567890123456789012';
process.env.DODO_MODE='test_mode';
const receipt:Receipt={sessionId:'cks_0123456789verified',date:'2000-07-20',createdAt:Date.now()};

function withProvider(payment:Record<string,unknown>,status='succeeded') {
  globalThis.fetch=(async (input:RequestInfo|URL)=>{
    const url=String(input);
    if(url.endsWith('/checkouts/'+receipt.sessionId)){
      return new Response(JSON.stringify({id:receipt.sessionId,payment_id:'pay_01234567890test',payment_status:status}),{status:200});
    }
    if(url.endsWith('/payments/pay_01234567890test')){
      return new Response(JSON.stringify(payment),{status:200});
    }
    throw new Error('Unexpected provider URL: '+url);
  }) as typeof fetch;
}
const validPayment={
  status:'succeeded',checkout_session_id:receipt.sessionId,
  metadata:{product:'birthday_time_capsule_v2',birthday:receipt.date},
  product_cart:[{product_id:process.env.DODO_PRODUCT_ID,quantity:1}],
  refund_status:null,
};
test('payment config requires a strong secret and a configured Dodo product',()=>{
  assert.equal(checkoutReady(),true);
  assert.equal(cookieNameForDate(receipt.date),'ayr_purchase_20000720');
  assert.ok(remainingCookieSeconds(receipt)>0);
});
test('signed receipt is date-scoped, and tampering invalidates it',()=>{
  const token=encodeReceipt(receipt);
  const req={cookies:{get:(key:string)=> key===cookieNameForDate(receipt.date)?{value:token}:undefined}} as never;
  assert.deepEqual(readReceipt(req,receipt.date),receipt);
  assert.equal(readReceipt(req,'2001-07-20'),null);
  const forged={cookies:{get:()=>({value:token.slice(0,-2)+'aa'})}} as never;
  assert.equal(readReceipt(forged,receipt.date),null);
});
test('recovery tokens only work for their original verified receipt, and cannot be modified',()=>{
  const token=createRecoveryToken(receipt);
  assert.deepEqual(readRecoveryToken(token),receipt);
  assert.equal(readRecoveryToken(token+'corrupt'),null);
  assert.equal(readRecoveryToken(encodeReceipt(receipt)),null);
});
test('a fully verified completed purchase grants access',async()=>{
  withProvider(validPayment);
  assert.deepEqual(await statusForReceipt(receipt,receipt.date),{state:'paid',paid:true});
});
test('fake or incomplete provider responses never unlock premium',async()=>{
  withProvider(validPayment,'processing');
  assert.deepEqual(await statusForReceipt(receipt,receipt.date),{state:'pending',paid:false});
  withProvider(validPayment,'failed');
  assert.deepEqual(await statusForReceipt(receipt,receipt.date),{state:'failed',paid:false});
  withProvider(validPayment,'cancelled');
  assert.deepEqual(await statusForReceipt(receipt,receipt.date),{state:'cancelled',paid:false});
  withProvider({...validPayment,metadata:{birthday:'1999-07-20',product:'birthday_time_capsule_v2'}});
  assert.equal((await statusForReceipt(receipt,receipt.date)).paid,false);
  withProvider({...validPayment,product_cart:[{product_id:'pdt_another_product',quantity:1}]});
  assert.equal((await statusForReceipt(receipt,receipt.date)).paid,false);
  withProvider({...validPayment,checkout_session_id:'cks_suspicious_other'});
  assert.equal((await statusForReceipt(receipt,receipt.date)).paid,false);
  withProvider({...validPayment,refund_status:'full'});
  assert.deepEqual(await statusForReceipt(receipt,receipt.date),{state:'refunded',paid:false});
  withProvider({...validPayment,refund_status:'partial'});
  assert.equal((await statusForReceipt(receipt,receipt.date)).paid,false);
});
test('checkout redirects to our provider-confirmed return route',async()=>{
  globalThis.fetch=(async (_input:RequestInfo|URL,init?:RequestInit)=>{
    assert.equal(init?.method,'POST');
    const body=JSON.parse(String(init?.body));
    assert.equal(body.product_cart[0].product_id,process.env.DODO_PRODUCT_ID);
    assert.equal(body.return_url,'https://areyourare.ai.studio/payment/return?date=2000-07-20');
    return new Response(JSON.stringify({
      session_id:'cks_0123456789verified',
      checkout_url:'https://test.checkout.dodopayments.com/session/cks_0123456789verified',
    }),{status:200});
  }) as typeof fetch;
  const session=await createCheckout(receipt.date,'https://areyourare.ai.studio');
  assert.equal(session.sessionId,receipt.sessionId);
  assert.ok(session.checkoutUrl.startsWith('https://test.checkout.dodopayments.com/'));
});
test.after(()=>{
  globalThis.fetch=originalFetch;
  for(const [key,val] of Object.entries(previous)){
    if(val===undefined)delete process.env[key];
    else process.env[key]=val;
  }
});
