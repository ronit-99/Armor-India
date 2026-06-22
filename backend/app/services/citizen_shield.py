from typing import Any

from app.config import settings
from app.services.ai_service import chat_json
from app.services.scam_classifier import rule_based_scam_analysis

LANGUAGES = {
    "en": "English", "hi": "हिन्दी", "bn": "বাংলা", "te": "తెలుగు",
    "mr": "मराठी", "ta": "தமிழ்", "gu": "ગુજરાતી", "kn": "ಕನ್ನಡ",
    "ml": "മലയാളം", "pa": "ਪੰਜਾਬੀ", "or": "ଓଡ଼ିଆ", "as": "অসমীয়া",
}

FRAUD_SHIELD_RESPONSES = {
    "en": {
        "safe": "✅ This appears safe. No major fraud indicators were detected.",
        "suspicious": "⚠️ This activity is suspicious. Do not transfer money or share an OTP.",
        "danger": "🚨 High risk—this is likely a scam. Disconnect immediately and call 1930.",
        "report": "Report it at cybercrime.gov.in or call the National Cyber Crime Helpline at 1930.",
        "actions": ["Do not share an OTP, PIN, or UPI credentials", "Verify the caller through an official number", "If money was transferred, report it immediately"],
    },
    "hi": {
        "safe": "✅ यह सुरक्षित लगता है। धोखाधड़ी का कोई बड़ा संकेत नहीं मिला।",
        "suspicious": "⚠️ यह गतिविधि संदिग्ध है। पैसे न भेजें और OTP साझा न करें।",
        "danger": "🚨 उच्च जोखिम—यह संभवतः धोखाधड़ी है। तुरंत कॉल काटें और 1930 पर कॉल करें।",
        "report": "cybercrime.gov.in पर रिपोर्ट करें या राष्ट्रीय साइबर अपराध हेल्पलाइन 1930 पर कॉल करें।",
        "actions": ["OTP, PIN या UPI जानकारी साझा न करें", "आधिकारिक नंबर से कॉल करने वाले की पुष्टि करें", "पैसे भेजे हों तो तुरंत रिपोर्ट करें"],
    },
    "bn": {
        "safe": "✅ এটি নিরাপদ বলে মনে হচ্ছে। বড় কোনো প্রতারণার লক্ষণ পাওয়া যায়নি।",
        "suspicious": "⚠️ এই কার্যকলাপ সন্দেহজনক। টাকা পাঠাবেন না বা OTP শেয়ার করবেন না।",
        "danger": "🚨 উচ্চ ঝুঁকি—এটি সম্ভবত প্রতারণা। অবিলম্বে কল কেটে ১৯৩০ নম্বরে ফোন করুন।",
        "report": "cybercrime.gov.in-এ রিপোর্ট করুন বা জাতীয় সাইবার অপরাধ হেল্পলাইন ১৯৩০-এ ফোন করুন।",
        "actions": ["OTP, PIN বা UPI তথ্য শেয়ার করবেন না", "সরকারি নম্বরে যোগাযোগ করে পরিচয় যাচাই করুন", "টাকা পাঠিয়ে থাকলে অবিলম্বে রিপোর্ট করুন"],
    },
    "te": {
        "safe": "✅ ఇది సురక్షితంగా కనిపిస్తోంది. ప్రధాన మోసం సంకేతాలు కనబడలేదు.",
        "suspicious": "⚠️ ఈ చర్య అనుమానాస్పదంగా ఉంది. డబ్బు పంపవద్దు, OTP పంచుకోవద్దు.",
        "danger": "🚨 అధిక ప్రమాదం—ఇది మోసం కావచ్చు. వెంటనే కాల్ ముగించి 1930కు కాల్ చేయండి.",
        "report": "cybercrime.gov.inలో ఫిర్యాదు చేయండి లేదా జాతీయ సైబర్ క్రైమ్ హెల్ప్‌లైన్ 1930కు కాల్ చేయండి.",
        "actions": ["OTP, PIN లేదా UPI వివరాలు పంచుకోవద్దు", "అధికారిక నంబర్ ద్వారా కాలర్‌ను ధృవీకరించండి", "డబ్బు పంపితే వెంటనే ఫిర్యాదు చేయండి"],
    },
    "mr": {
        "safe": "✅ हे सुरक्षित दिसत आहे. फसवणुकीची मोठी चिन्हे आढळली नाहीत.",
        "suspicious": "⚠️ ही कृती संशयास्पद आहे. पैसे पाठवू नका किंवा OTP शेअर करू नका.",
        "danger": "🚨 उच्च धोका—ही फसवणूक असण्याची शक्यता आहे. कॉल त्वरित बंद करा आणि 1930 वर कॉल करा.",
        "report": "cybercrime.gov.in वर तक्रार करा किंवा राष्ट्रीय सायबर गुन्हे हेल्पलाइन 1930 वर कॉल करा.",
        "actions": ["OTP, PIN किंवा UPI माहिती शेअर करू नका", "अधिकृत क्रमांकावरून कॉलरची पडताळणी करा", "पैसे पाठवले असल्यास त्वरित तक्रार करा"],
    },
    "ta": {
        "safe": "✅ இது பாதுகாப்பானதாகத் தெரிகிறது. முக்கிய மோசடி அறிகுறிகள் இல்லை.",
        "suspicious": "⚠️ இந்தச் செயல் சந்தேகத்திற்குரியது. பணம் அனுப்பவோ OTP பகிரவோ வேண்டாம்.",
        "danger": "🚨 அதிக ஆபத்து—இது மோசடியாக இருக்கலாம். உடனே அழைப்பைத் துண்டித்து 1930-ஐ அழைக்கவும்.",
        "report": "cybercrime.gov.in-இல் புகாரளிக்கவும் அல்லது தேசிய சைபர் குற்ற உதவி எண் 1930-ஐ அழைக்கவும்.",
        "actions": ["OTP, PIN அல்லது UPI விவரங்களைப் பகிர வேண்டாம்", "அதிகாரப்பூர்வ எண்ணில் அழைப்பவரைச் சரிபார்க்கவும்", "பணம் அனுப்பியிருந்தால் உடனே புகாரளிக்கவும்"],
    },
    "gu": {
        "safe": "✅ આ સુરક્ષિત લાગે છે. છેતરપિંડીના કોઈ મોટા સંકેતો મળ્યા નથી.",
        "suspicious": "⚠️ આ પ્રવૃત્તિ શંકાસ્પદ છે. પૈસા મોકલશો નહીં અથવા OTP શેર કરશો નહીં.",
        "danger": "🚨 ઊંચું જોખમ—આ છેતરપિંડી હોઈ શકે છે. તરત કૉલ બંધ કરો અને 1930 પર કૉલ કરો.",
        "report": "cybercrime.gov.in પર ફરિયાદ કરો અથવા રાષ્ટ્રીય સાયબર ક્રાઇમ હેલ્પલાઇન 1930 પર કૉલ કરો.",
        "actions": ["OTP, PIN અથવા UPI વિગતો શેર ન કરો", "સત્તાવાર નંબરથી કૉલરની ચકાસણી કરો", "પૈસા મોકલ્યા હોય તો તરત ફરિયાદ કરો"],
    },
    "kn": {
        "safe": "✅ ಇದು ಸುರಕ್ಷಿತವಾಗಿ ಕಾಣುತ್ತದೆ. ಪ್ರಮುಖ ವಂಚನೆಯ ಸೂಚನೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
        "suspicious": "⚠️ ಈ ಚಟುವಟಿಕೆ ಅನುಮಾನಾಸ್ಪದವಾಗಿದೆ. ಹಣ ಕಳುಹಿಸಬೇಡಿ ಅಥವಾ OTP ಹಂಚಿಕೊಳ್ಳಬೇಡಿ.",
        "danger": "🚨 ಹೆಚ್ಚಿನ ಅಪಾಯ—ಇದು ವಂಚನೆಯಾಗಿರಬಹುದು. ತಕ್ಷಣ ಕರೆ ನಿಲ್ಲಿಸಿ 1930ಕ್ಕೆ ಕರೆ ಮಾಡಿ.",
        "report": "cybercrime.gov.in ನಲ್ಲಿ ದೂರು ನೀಡಿ ಅಥವಾ ರಾಷ್ಟ್ರೀಯ ಸೈಬರ್ ಅಪರಾಧ ಸಹಾಯವಾಣಿ 1930ಕ್ಕೆ ಕರೆ ಮಾಡಿ.",
        "actions": ["OTP, PIN ಅಥವಾ UPI ವಿವರಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಬೇಡಿ", "ಅಧಿಕೃತ ಸಂಖ್ಯೆಯ ಮೂಲಕ ಕರೆ ಮಾಡಿದವರನ್ನು ಪರಿಶೀಲಿಸಿ", "ಹಣ ಕಳುಹಿಸಿದ್ದರೆ ತಕ್ಷಣ ದೂರು ನೀಡಿ"],
    },
    "ml": {
        "safe": "✅ ഇത് സുരക്ഷിതമാണെന്ന് തോന്നുന്നു. പ്രധാന തട്ടിപ്പ് സൂചനകളൊന്നും കണ്ടെത്തിയില്ല.",
        "suspicious": "⚠️ ഈ പ്രവർത്തനം സംശയാസ്പദമാണ്. പണം അയയ്ക്കുകയോ OTP പങ്കിടുകയോ ചെയ്യരുത്.",
        "danger": "🚨 ഉയർന്ന അപകടസാധ്യത—ഇത് തട്ടിപ്പായിരിക്കാം. ഉടൻ കോൾ അവസാനിപ്പിച്ച് 1930-ൽ വിളിക്കുക.",
        "report": "cybercrime.gov.in-ൽ റിപ്പോർട്ട് ചെയ്യുക അല്ലെങ്കിൽ ദേശീയ സൈബർ ക്രൈം ഹെൽപ്‌ലൈൻ 1930-ൽ വിളിക്കുക.",
        "actions": ["OTP, PIN അല്ലെങ്കിൽ UPI വിവരങ്ങൾ പങ്കിടരുത്", "ഔദ്യോഗിക നമ്പർ വഴി വിളിച്ചയാളെ പരിശോധിക്കുക", "പണം അയച്ചെങ്കിൽ ഉടൻ റിപ്പോർട്ട് ചെയ്യുക"],
    },
    "pa": {
        "safe": "✅ ਇਹ ਸੁਰੱਖਿਅਤ ਲੱਗਦਾ ਹੈ। ਧੋਖਾਧੜੀ ਦਾ ਕੋਈ ਵੱਡਾ ਸੰਕੇਤ ਨਹੀਂ ਮਿਲਿਆ।",
        "suspicious": "⚠️ ਇਹ ਗਤੀਵਿਧੀ ਸ਼ੱਕੀ ਹੈ। ਪੈਸੇ ਨਾ ਭੇਜੋ ਅਤੇ OTP ਸਾਂਝਾ ਨਾ ਕਰੋ।",
        "danger": "🚨 ਉੱਚ ਜੋਖਮ—ਇਹ ਧੋਖਾਧੜੀ ਹੋ ਸਕਦੀ ਹੈ। ਤੁਰੰਤ ਕਾਲ ਕੱਟੋ ਅਤੇ 1930 'ਤੇ ਕਾਲ ਕਰੋ।",
        "report": "cybercrime.gov.in 'ਤੇ ਰਿਪੋਰਟ ਕਰੋ ਜਾਂ ਰਾਸ਼ਟਰੀ ਸਾਈਬਰ ਅਪਰਾਧ ਹੈਲਪਲਾਈਨ 1930 'ਤੇ ਕਾਲ ਕਰੋ।",
        "actions": ["OTP, PIN ਜਾਂ UPI ਜਾਣਕਾਰੀ ਸਾਂਝੀ ਨਾ ਕਰੋ", "ਅਧਿਕਾਰਤ ਨੰਬਰ ਰਾਹੀਂ ਕਾਲਰ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ", "ਪੈਸੇ ਭੇਜੇ ਹਨ ਤਾਂ ਤੁਰੰਤ ਰਿਪੋਰਟ ਕਰੋ"],
    },
    "or": {
        "safe": "✅ ଏହା ସୁରକ୍ଷିତ ମନେ ହେଉଛି। ବଡ଼ ଠକେଇ ସଙ୍କେତ ମିଳିନାହିଁ।",
        "suspicious": "⚠️ ଏହି କାର୍ଯ୍ୟକଳାପ ସନ୍ଦେହଜନକ। ଟଙ୍କା ପଠାନ୍ତୁ ନାହିଁ କିମ୍ବା OTP ସେୟାର କରନ୍ତୁ ନାହିଁ।",
        "danger": "🚨 ଉଚ୍ଚ ବିପଦ—ଏହା ଠକେଇ ହୋଇପାରେ। ତୁରନ୍ତ କଲ୍ କାଟି 1930କୁ କଲ୍ କରନ୍ତୁ।",
        "report": "cybercrime.gov.inରେ ରିପୋର୍ଟ କରନ୍ତୁ କିମ୍ବା ଜାତୀୟ ସାଇବର ଅପରାଧ ହେଲ୍ପଲାଇନ୍ 1930କୁ କଲ୍ କରନ୍ତୁ।",
        "actions": ["OTP, PIN କିମ୍ବା UPI ତଥ୍ୟ ସେୟାର କରନ୍ତୁ ନାହିଁ", "ସରକାରୀ ନମ୍ବର ମାଧ୍ୟମରେ କଲରଙ୍କୁ ଯାଞ୍ଚ କରନ୍ତୁ", "ଟଙ୍କା ପଠାଇଥିଲେ ତୁରନ୍ତ ରିପୋର୍ଟ କରନ୍ତୁ"],
    },
    "as": {
        "safe": "✅ এইটো সুৰক্ষিত যেন লাগিছে। ডাঙৰ জালিয়াতিৰ সংকেত পোৱা নাই।",
        "suspicious": "⚠️ এই কাৰ্যকলাপ সন্দেহজনক। টকা নপঠিয়াব আৰু OTP শ্বেয়াৰ নকৰিব।",
        "danger": "🚨 উচ্চ বিপদ—এইটো জালিয়াতি হ’ব পাৰে। লগে লগে কল কাটি ১৯৩০ নম্বৰত ফোন কৰক।",
        "report": "cybercrime.gov.in-ত ৰিপোৰ্ট কৰক বা ৰাষ্ট্ৰীয় চাইবাৰ অপৰাধ হেল্পলাইন ১৯৩০-ত ফোন কৰক।",
        "actions": ["OTP, PIN বা UPI তথ্য শ্বেয়াৰ নকৰিব", "চৰকাৰী নম্বৰৰ জৰিয়তে কলাৰক যাচাই কৰক", "টকা পঠিয়াই থাকিলে লগে লগে ৰিপোৰ্ট কৰক"],
    },
}


def assess_citizen_query(message: str, language: str = "en") -> dict[str, Any]:
    analysis = rule_based_scam_analysis(message)
    score = analysis["fraud_score"]
    verdict = "danger" if score >= 60 else "suspicious" if score >= 30 else "safe"
    lang = language if language in FRAUD_SHIELD_RESPONSES else "en"
    responses = FRAUD_SHIELD_RESPONSES[lang]
    return {
        "verdict": verdict, "fraud_score": score, "message": responses[verdict],
        "report_guidance": responses["report"], "matched_patterns": analysis.get("matched_patterns", []),
        "recommended_actions": responses["actions"], "ncrb_report_url": "https://cybercrime.gov.in",
        "helpline": "1930", "language": lang, "analysis_mode": "rule_based",
    }


async def citizen_fraud_shield_chat(message: str, language: str = "en", channel: str = "app") -> dict[str, Any]:
    language = language if language in LANGUAGES else "en"
    if settings.ai_enabled:
        try:
            lang_name = LANGUAGES[language]
            system = f"""You are Armor India Citizen Fraud Shield, a compassionate fraud advisor for Indian citizens.
Respond only in {lang_name}, using its native script. Channel: {channel}.
Analyze the user's message about suspicious calls, payments, or messages.
Return JSON with: verdict (safe|suspicious|danger), fraud_score (0-100), message (in {lang_name}),
report_guidance (in {lang_name}), recommended_actions (array in {lang_name}), matched_patterns (array),
confidence (0-1), false_positive_guard (boolean). Minimize false positives and use danger only with strong evidence."""
            result = await chat_json(system, message)
            result.update({"ncrb_report_url": "https://cybercrime.gov.in", "helpline": "1930", "language": language, "channel": channel, "analysis_mode": "ai"})
            result["fraud_score"] = float(result.get("fraud_score", 0))
            return result
        except Exception:
            pass
    return assess_citizen_query(message, language)
