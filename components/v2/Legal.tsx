'use client';
import { SiteHeader,SiteFooter } from '@/components/v2/Brand';
import { useLanguage } from '@/components/v2/Language';
type Kind='privacy'|'terms'|'refunds';
export function LegalPage({kind}:{kind:Kind}){
 const {tr}=useLanguage();
 const title=kind==='privacy'?tr('Privacy Policy','गोपनीयता नीति'):
  kind==='terms'?tr('Terms of Use','उपयोग के नियम'):tr('Refunds & Support','रिफंड और सहायता');
 return <div className="site"><SiteHeader/><main className="legal-page shell" id="main-content">
  <span className="eyebrow">AREYOURARE / {tr('INFORMATION','जानकारी')}</span><h1>{title}</h1>
  {kind==='privacy'?<>
   <p>{tr('AREYOURARE shows historical events related to a birth date. The free search asks only for your birthday, not your name or account. Your month and day are used to retrieve archived events. Hosting systems may process standard request information.','AREYOURARE आपकी जन्मतिथि से जुड़ी ऐतिहासिक घटनाएँ दिखाता है। मुफ़्त खोज के लिए केवल जन्मतिथि चाहिए, नाम या अकाउंट नहीं। इतिहास खोजने के लिए तारीख और महीना इस्तेमाल होता है। होस्टिंग सेवा सामान्य तकनीकी जानकारी संसाधित कर सकती है।')}</p>
   <h2>{tr('Payments','भुगतान')}</h2>
   <p>{tr('Dodo Payments handles checkout and payment contact information. We do not receive card details. A signed, secure browser cookie may keep access for up to 180 days. A private recovery link can reopen a paid report, so keep it confidential.','Dodo Payments भुगतान और संपर्क जानकारी संभालता है। हमें आपका कार्ड विवरण नहीं मिलता। सुरक्षित कुकी से रिपोर्ट का एक्सेस अधिकतम 180 दिनों तक बना रह सकता है। निजी रिकवरी लिंक से खरीदी गई रिपोर्ट फिर खुल सकती है, इसलिए उसे गोपनीय रखें।')}</p>
   <h2>{tr('Translation and historical sources','अनुवाद और ऐतिहासिक स्रोत')}</h2>
   <p>{tr('Hindi historical text is translated server-side through a translation provider when enabled. Public historical records and media originate from Wikimedia projects; opening the linked sources is governed by those services’ terms.','हिंदी ऐतिहासिक सामग्री का अनुवाद उपलब्ध होने पर सर्वर के माध्यम से किया जाता है। सार्वजनिक ऐतिहासिक लेख और चित्र विकिमीडिया परियोजनाओं से आते हैं; मूल लिंक खोलने पर उनके नियम लागू होते हैं।')}</p>
   <h2>{tr('Your choices','आपके विकल्प')}</h2>
   <p>{tr('You can clear cookies to remove local access. Save your private recovery link first or contact support with your payment receipt. Never share your card details.','आप स्थानीय एक्सेस हटाने के लिए कुकी साफ़ कर सकते हैं। उससे पहले निजी रिकवरी लिंक सुरक्षित रखें, या भुगतान रसीद के साथ सहायता लें। अपना कार्ड विवरण साझा न करें।')}</p>
  </>:kind==='terms'?<>
   <p>{tr('AREYOURARE is an informational historical discovery product. Records may change or contain inaccuracies. Events shown on your calendar birthday may have happened in a different year. We do not promise an exact birth-year event for every date.','AREYOURARE एक ऐतिहासिक जानकारी देने वाली सेवा है। रिकॉर्ड बदल सकते हैं या उनमें त्रुटियाँ हो सकती हैं। आपकी जन्मतिथि पर दिखाई गई घटना किसी दूसरे वर्ष की हो सकती है। हर तारीख के लिए जन्म-वर्ष की घटना मिलने की गारंटी नहीं है।')}</p>
   <h2>{tr('Free and paid access','मुफ़्त और सशुल्क एक्सेस')}</h2>
   <p>{tr('Checking your date and viewing the sealed archive preview is free. Historical details and the full Time Capsule require a one-time $2 USD payment, excluding applicable tax or currency conversion. This is not a subscription. Access is verified against the payment provider and normally lasts up to 180 days in the checkout browser or through a private recovery link.','तारीख जाँचना और बंद संग्रह की झलक मुफ़्त है। असली ऐतिहासिक जानकारी और पूरी टाइम कैप्सूल खोलने के लिए एक बार $2 USD देने होते हैं; टैक्स या मुद्रा रूपांतरण अलग हो सकता है। यह सब्सक्रिप्शन नहीं है। सत्यापित भुगतान के बाद रिपोर्ट आम तौर पर 180 दिनों तक ब्राउज़र या निजी रिकवरी लिंक से उपलब्ध रहती है।')}</p>
   <h2>{tr('Original content and licenses','मूल सामग्री और लाइसेंस')}</h2>
   <p>{tr('Historical articles and images belong to their respective authors and license holders. Follow original links for attribution, source details and redistribution rights. No future predictions or personal guarantees are made.','ऐतिहासिक लेख और चित्र अपने लेखकों और लाइसेंस धारकों की संपत्ति हैं। श्रेय, स्रोत और पुनः उपयोग की जानकारी के लिए मूल लिंक खोलें। किसी भविष्यवाणी या निजी परिणाम की गारंटी नहीं दी जाती।')}</p>
   <h2>{tr('Availability','उपलब्धता')}</h2>
   <p>{tr('External sources, checkout and hosting may sometimes be unavailable. Applicable consumer rights are unaffected.','बाहरी स्रोत, भुगतान या होस्टिंग कभी-कभी अनुपलब्ध हो सकते हैं। लागू उपभोक्ता अधिकार बने रहेंगे।')}</p>
  </>:<>
   <p>{tr('A Birthday Time Capsule is a one-time digital purchase. Refund eligibility is governed by applicable consumer law and the payment provider’s policies; mandatory rights are not waived.','जन्मदिन की टाइम कैप्सूल एक बार खरीदी जाने वाली डिजिटल सेवा है। रिफंड के नियम लागू उपभोक्ता कानून और भुगतान सेवा की नीति के अनुसार होंगे। आपके अनिवार्य अधिकार बने रहेंगे।')}</p>
   <h2>{tr('Payment or report problems','भुगतान या रिपोर्ट की समस्या')}</h2>
   <p>{tr('If your payment succeeded but the report did not open, use your private recovery link or contact support with your checkout email and receipt. Never send passwords or card numbers.','अगर भुगतान सफल हुआ लेकिन रिपोर्ट नहीं खुली, तो निजी रिकवरी लिंक इस्तेमाल करें या भुगतान ईमेल और रसीद के साथ सहायता लें। पासवर्ड या कार्ड नंबर कभी न भेजें।')}</p>
  </>}
  <h2>{tr('Contact','संपर्क करें')}</h2>
  <p>{tr('Email','ईमेल')}: <a href="mailto:hello.skyorigin@gmail.com">hello.skyorigin@gmail.com</a></p>
 </main><SiteFooter/></div>;
}
