"""
Generates all 4 Voice Lab fixture files (en/hi/kn/ta), 54 phrases each
(18 per level), matching content across all languages.
Usage: cd backend/curriculum/fixtures && python generate_voice_lab.py
"""
import json


def item(pk, level, lang, text, order):
    return {"model": "curriculum.voicepracticeitem", "pk": pk,
            "fields": {"level": level, "language": lang, "text": text, "image_url": "", "order": order}}


def write(filename, entries):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)
    print(f"wrote {filename} ({len(entries)} items)")


# ==================== ENGLISH ====================
en_beginner = [
    "Hello", "Thank you", "Please", "Sorry", "Good morning", "Good night",
    "My dog is big", "The sky is blue", "I have a red apple",
    "I am happy", "This is my house", "I like tea",
    "The cat is small", "We eat rice", "She is my friend",
    "It is raining today", "I want water", "The book is on the table",
]
en_intermediate = [
    "She reads every day", "The dog runs fast", "I was tired so I went to sleep",
    "Where do you live", "Why did you go there", "He works in the city",
    "We are going to the market", "Can you help me with this",
    "I have been learning English for a year", "They play cricket on weekends",
    "My sister is studying medicine", "The train arrives at nine o'clock",
    "I forgot my umbrella at home", "She sings beautifully",
    "We should leave before it gets dark", "He always arrives on time",
    "I need to finish my homework", "The weather is quite pleasant today",
]
en_advanced = [
    "The sun rises in the east every morning", "Reading helps you understand the world better",
    "I want to learn a new skill this year", "Water is very important for life",
    "Education is the key to a better future", "We must protect our environment for future generations",
    "Success comes from consistent effort over time", "Technology has changed the way we communicate",
    "It is important to listen carefully before responding", "A balanced diet contributes to good health",
    "Traveling broadens your understanding of different cultures", "Honesty is the foundation of trust in any relationship",
    "The library was quiet except for the sound of turning pages", "Scientists continue to discover new information about the universe",
    "Good communication skills are valuable in every profession", "Community support can make a significant difference during hard times",
    "Practice and patience are essential for mastering any skill", "The economy depends on both production and consumption",
]

# ==================== HINDI ====================
hi_beginner = [
    "नमस्ते", "धन्यवाद", "कृपया", "माफ़ कीजिए", "सुप्रभात", "शुभ रात्रि",
    "मेरा कुत्ता बड़ा है", "आसमान नीला है", "मेरे पास एक लाल सेब है",
    "मैं खुश हूँ", "यह मेरा घर है", "मुझे चाय पसंद है",
    "बिल्ली छोटी है", "हम चावल खाते हैं", "वह मेरी सहेली है",
    "आज बारिश हो रही है", "मुझे पानी चाहिए", "किताब मेज़ पर है",
]
hi_intermediate = [
    "वह हर दिन पढ़ती है", "कुत्ता तेज़ दौड़ता है", "मैं थका था इसलिए मैं सो गया",
    "आप कहाँ रहते हैं", "आप वहाँ क्यों गए", "वह शहर में काम करता है",
    "हम बाज़ार जा रहे हैं", "क्या आप इसमें मेरी मदद कर सकते हैं",
    "मैं एक साल से अंग्रेज़ी सीख रहा हूँ", "वे सप्ताहांत में क्रिकेट खेलते हैं",
    "मेरी बहन चिकित्सा पढ़ रही है", "ट्रेन नौ बजे आती है",
    "मैं अपना छाता घर पर भूल गया", "वह खूबसूरती से गाती है",
    "हमें अंधेरा होने से पहले निकलना चाहिए", "वह हमेशा समय पर आता है",
    "मुझे अपना होमवर्क खत्म करना है", "आज मौसम काफ़ी सुहावना है",
]
hi_advanced = [
    "सूरज हर सुबह पूर्व में उगता है", "पढ़ना आपको दुनिया को बेहतर समझने में मदद करता है",
    "मैं इस साल एक नया कौशल सीखना चाहता हूँ", "पानी जीवन के लिए बहुत महत्वपूर्ण है",
    "शिक्षा एक बेहतर भविष्य की कुंजी है", "हमें भावी पीढ़ियों के लिए पर्यावरण की रक्षा करनी चाहिए",
    "सफलता समय के साथ निरंतर प्रयास से आती है", "प्रौद्योगिकी ने हमारे संवाद करने के तरीके को बदल दिया है",
    "जवाब देने से पहले ध्यान से सुनना महत्वपूर्ण है", "संतुलित आहार अच्छे स्वास्थ्य में योगदान देता है",
    "यात्रा करने से विभिन्न संस्कृतियों की समझ बढ़ती है", "ईमानदारी किसी भी रिश्ते में विश्वास की नींव है",
    "पुस्तकालय शांत था सिवाय पन्ने पलटने की आवाज़ के", "वैज्ञानिक ब्रह्मांड के बारे में नई जानकारी खोजते रहते हैं",
    "अच्छे संचार कौशल हर पेशे में मूल्यवान होते हैं", "सामुदायिक सहयोग कठिन समय में बड़ा अंतर ला सकता है",
    "किसी भी कौशल में महारत के लिए अभ्यास और धैर्य ज़रूरी है", "अर्थव्यवस्था उत्पादन और उपभोग दोनों पर निर्भर करती है",
]

# ==================== KANNADA ====================
kn_beginner = [
    "ನಮಸ್ಕಾರ", "ಧನ್ಯವಾದ", "ದಯವಿಟ್ಟು", "ಕ್ಷಮಿಸಿ", "ಶುಭೋದಯ", "ಶುಭ ರಾತ್ರಿ",
    "ನನ್ನ ನಾಯಿ ದೊಡ್ಡದು", "ಆಕಾಶ ನೀಲಿಯಾಗಿದೆ", "ನನ್ನ ಬಳಿ ಒಂದು ಕೆಂಪು ಸೇಬು ಇದೆ",
    "ನಾನು ಸಂತೋಷವಾಗಿದ್ದೇನೆ", "ಇದು ನನ್ನ ಮನೆ", "ನನಗೆ ಚಹಾ ಇಷ್ಟ",
    "ಬೆಕ್ಕು ಚಿಕ್ಕದು", "ನಾವು ಅನ್ನ ತಿನ್ನುತ್ತೇವೆ", "ಅವಳು ನನ್ನ ಸ್ನೇಹಿತೆ",
    "ಇಂದು ಮಳೆ ಬರುತ್ತಿದೆ", "ನನಗೆ ನೀರು ಬೇಕು", "ಪುಸ್ತಕ ಮೇಜಿನ ಮೇಲಿದೆ",
]
kn_intermediate = [
    "ಅವಳು ಪ್ರತಿದಿನ ಓದುತ್ತಾಳೆ", "ನಾಯಿ ವೇಗವಾಗಿ ಓಡುತ್ತದೆ", "ನಾನು ದಣಿದಿದ್ದೆ ಆದ್ದರಿಂದ ಮಲಗಿದೆ",
    "ನೀವು ಎಲ್ಲಿ ವಾಸಿಸುತ್ತೀರಿ", "ನೀವು ಅಲ್ಲಿಗೆ ಏಕೆ ಹೋದಿರಿ", "ಅವನು ನಗರದಲ್ಲಿ ಕೆಲಸ ಮಾಡುತ್ತಾನೆ",
    "ನಾವು ಮಾರುಕಟ್ಟೆಗೆ ಹೋಗುತ್ತಿದ್ದೇವೆ", "ನೀವು ಇದರಲ್ಲಿ ನನಗೆ ಸಹಾಯ ಮಾಡಬಹುದೇ",
    "ನಾನು ಒಂದು ವರ್ಷದಿಂದ ಇಂಗ್ಲಿಷ್ ಕಲಿಯುತ್ತಿದ್ದೇನೆ", "ಅವರು ವಾರಾಂತ್ಯದಲ್ಲಿ ಕ್ರಿಕೆಟ್ ಆಡುತ್ತಾರೆ",
    "ನನ್ನ ಸಹೋದರಿ ವೈದ್ಯಕೀಯ ಓದುತ್ತಿದ್ದಾಳೆ", "ರೈಲು ಒಂಬತ್ತು ಗಂಟೆಗೆ ಬರುತ್ತದೆ",
    "ನಾನು ನನ್ನ ಛತ್ರಿಯನ್ನು ಮನೆಯಲ್ಲಿ ಮರೆತಿದ್ದೇನೆ", "ಅವಳು ಸುಂದರವಾಗಿ ಹಾಡುತ್ತಾಳೆ",
    "ಕತ್ತಲಾಗುವ ಮೊದಲು ನಾವು ಹೊರಡಬೇಕು", "ಅವನು ಯಾವಾಗಲೂ ಸಮಯಕ್ಕೆ ಬರುತ್ತಾನೆ",
    "ನಾನು ನನ್ನ ಮನೆಕೆಲಸ ಮುಗಿಸಬೇಕು", "ಇಂದು ಹವಾಮಾನ ಸಾಕಷ್ಟು ಆಹ್ಲಾದಕರವಾಗಿದೆ",
]
kn_advanced = [
    "ಸೂರ್ಯ ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ಪೂರ್ವದಲ್ಲಿ ಉದಯಿಸುತ್ತಾನೆ", "ಓದುವಿಕೆ ಪ್ರಪಂಚವನ್ನು ಚೆನ್ನಾಗಿ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ",
    "ಈ ವರ್ಷ ನಾನು ಹೊಸ ಕೌಶಲ್ಯವನ್ನು ಕಲಿಯಲು ಬಯಸುತ್ತೇನೆ", "ನೀರು ಜೀವನಕ್ಕೆ ಬಹಳ ಮುಖ್ಯ",
    "ಶಿಕ್ಷಣವು ಉತ್ತಮ ಭವಿಷ್ಯದ ಕೀಲಿಯಾಗಿದೆ", "ಭವಿಷ್ಯದ ಪೀಳಿಗೆಗಾಗಿ ನಾವು ಪರಿಸರವನ್ನು ರಕ್ಷಿಸಬೇಕು",
    "ಯಶಸ್ಸು ಸಮಯದೊಂದಿಗೆ ನಿರಂತರ ಪ್ರಯತ್ನದಿಂದ ಬರುತ್ತದೆ", "ತಂತ್ರಜ್ಞಾನವು ನಾವು ಸಂವಹನ ಮಾಡುವ ವಿಧಾನವನ್ನು ಬದಲಾಯಿಸಿದೆ",
    "ಪ್ರತಿಕ್ರಿಯಿಸುವ ಮೊದಲು ಎಚ್ಚರಿಕೆಯಿಂದ ಕೇಳುವುದು ಮುಖ್ಯ", "ಸಮತೋಲಿತ ಆಹಾರವು ಉತ್ತಮ ಆರೋಗ್ಯಕ್ಕೆ ಕೊಡುಗೆ ನೀಡುತ್ತದೆ",
    "ಪ್ರಯಾಣವು ವಿವಿಧ ಸಂಸ್ಕೃತಿಗಳ ತಿಳುವಳಿಕೆಯನ್ನು ವಿಸ್ತರಿಸುತ್ತದೆ", "ಪ್ರಾಮಾಣಿಕತೆಯು ಯಾವುದೇ ಸಂಬಂಧದಲ್ಲಿ ನಂಬಿಕೆಯ ಅಡಿಪಾಯವಾಗಿದೆ",
    "ಪುಟಗಳನ್ನು ತಿರುಗಿಸುವ ಶಬ್ದವನ್ನು ಹೊರತುಪಡಿಸಿ ಗ್ರಂಥಾಲಯ ಶಾಂತವಾಗಿತ್ತು", "ವಿಜ್ಞಾನಿಗಳು ಬ್ರಹ್ಮಾಂಡದ ಬಗ್ಗೆ ಹೊಸ ಮಾಹಿತಿಯನ್ನು ಕಂಡುಹಿಡಿಯುತ್ತಲೇ ಇದ್ದಾರೆ",
    "ಉತ್ತಮ ಸಂವಹನ ಕೌಶಲ್ಯಗಳು ಪ್ರತಿಯೊಂದು ವೃತ್ತಿಯಲ್ಲಿ ಮೌಲ್ಯಯುತವಾಗಿವೆ", "ಕಷ್ಟದ ಸಮಯದಲ್ಲಿ ಸಮುದಾಯ ಬೆಂಬಲವು ಗಮನಾರ್ಹ ವ್ಯತ್ಯಾಸವನ್ನು ಮಾಡಬಹುದು",
    "ಯಾವುದೇ ಕೌಶಲ್ಯವನ್ನು ಕರಗತ ಮಾಡಿಕೊಳ್ಳಲು ಅಭ್ಯಾಸ ಮತ್ತು ತಾಳ್ಮೆ ಅಗತ್ಯ", "ಆರ್ಥಿಕತೆಯು ಉತ್ಪಾದನೆ ಮತ್ತು ಬಳಕೆ ಎರಡರ ಮೇಲೆ ಅವಲಂಬಿತವಾಗಿದೆ",
]

# ==================== TAMIL ====================
ta_beginner = [
    "வணக்கம்", "நன்றி", "தயவுசெய்து", "மன்னிக்கவும்", "காலை வணக்கம்", "இனிய இரவு",
    "என் நாய் பெரியது", "வானம் நீலமாக உள்ளது", "என்னிடம் ஒரு சிவப்பு ஆப்பிள் உள்ளது",
    "நான் மகிழ்ச்சியாக இருக்கிறேன்", "இது என் வீடு", "எனக்கு தேநீர் பிடிக்கும்",
    "பூனை சிறியது", "நாங்கள் சாதம் சாப்பிடுகிறோம்", "அவள் என் தோழி",
    "இன்று மழை பெய்கிறது", "எனக்கு தண்ணீர் வேண்டும்", "புத்தகம் மேசையில் உள்ளது",
]
ta_intermediate = [
    "அவள் ஒவ்வொரு நாளும் படிக்கிறாள்", "நாய் வேகமாக ஓடுகிறது", "நான் சோர்வாக இருந்தேன் அதனால் தூங்கச் சென்றேன்",
    "நீங்கள் எங்கே வசிக்கிறீர்கள்", "நீங்கள் ஏன் அங்கே சென்றீர்கள்", "அவன் நகரத்தில் வேலை செய்கிறான்",
    "நாங்கள் சந்தைக்கு செல்கிறோம்", "இதில் நீங்கள் எனக்கு உதவ முடியுமா",
    "நான் ஒரு வருடமாக ஆங்கிலம் கற்றுக்கொண்டிருக்கிறேன்", "அவர்கள் வார இறுதியில் கிரிக்கெட் விளையாடுகிறார்கள்",
    "என் சகோதரி மருத்துவம் படிக்கிறாள்", "ரயில் ஒன்பது மணிக்கு வருகிறது",
    "நான் என் குடையை வீட்டில் மறந்துவிட்டேன்", "அவள் அழகாக பாடுகிறாள்",
    "இருட்டுவதற்கு முன் நாம் கிளம்ப வேண்டும்", "அவன் எப்போதும் சரியான நேரத்தில் வருகிறான்",
    "நான் என் வீட்டுப்பாடத்தை முடிக்க வேண்டும்", "இன்று வானிலை மிகவும் இதமாக உள்ளது",
]
ta_advanced = [
    "சூரியன் ஒவ்வொரு நாளும் காலையில் கிழக்கில் உதிக்கிறது", "படிப்பது உலகைப் புரிந்துகொள்ள உதவுகிறது",
    "இந்த ஆண்டு நான் ஒரு புதிய திறனைக் கற்க விரும்புகிறேன்", "தண்ணீர் வாழ்க்கைக்கு மிகவும் முக்கியமானது",
    "கல்வி ஒரு சிறந்த எதிர்காலத்திற்கான திறவுகோல்", "எதிர்கால சந்ததியினருக்காக நாம் சுற்றுச்சூழலைப் பாதுகாக்க வேண்டும்",
    "வெற்றி காலப்போக்கில் தொடர்ச்சியான முயற்சியிலிருந்து வருகிறது", "தொழில்நுட்பம் நாம் தொடர்பு கொள்ளும் விதத்தை மாற்றியுள்ளது",
    "பதிலளிப்பதற்கு முன் கவனமாகக் கேட்பது முக்கியம்", "சமச்சீரான உணவு நல்ல ஆரோக்கியத்திற்கு பங்களிக்கிறது",
    "பயணம் பல்வேறு கலாச்சாரங்களைப் புரிந்துகொள்வதை விரிவுபடுத்துகிறது", "நேர்மை எந்தவொரு உறவிலும் நம்பிக்கையின் அடித்தளமாகும்",
    "பக்கங்களைப் புரட்டும் சத்தத்தைத் தவிர நூலகம் அமைதியாக இருந்தது", "விஞ்ஞானிகள் பிரபஞ்சத்தைப் பற்றிய புதிய தகவல்களைக் கண்டறிந்து கொண்டே இருக்கிறார்கள்",
    "நல்ல தொடர்பாடல் திறன்கள் ஒவ்வொரு தொழிலிலும் மதிப்புமிக்கவை", "கடினமான காலங்களில் சமூக ஆதரவு குறிப்பிடத்தக்க மாற்றத்தை ஏற்படுத்தும்",
    "எந்தவொரு திறனிலும் தேர்ச்சி பெற பயிற்சியும் பொறுமையும் அவசியம்", "பொருளாதாரம் உற்பத்தி மற்றும் நுகர்வு இரண்டையும் சார்ந்துள்ளது",
]


def build(pk_start, lang, beginner, intermediate, advanced):
    entries = []
    pk = pk_start
    for i, t in enumerate(beginner, 1):
        entries.append(item(pk, "beginner", lang, t, i)); pk += 1
    for i, t in enumerate(intermediate, 1):
        entries.append(item(pk, "intermediate", lang, t, i)); pk += 1
    for i, t in enumerate(advanced, 1):
        entries.append(item(pk, "advanced", lang, t, i)); pk += 1
    return entries


write("voice_practice_en.json", build(1, "en", en_beginner, en_intermediate, en_advanced))
write("voice_practice_hi.json", build(100, "hi", hi_beginner, hi_intermediate, hi_advanced))
write("voice_practice_kn.json", build(200, "kn", kn_beginner, kn_intermediate, kn_advanced))
write("voice_practice_ta.json", build(300, "ta", ta_beginner, ta_intermediate, ta_advanced))

print("Done: 4 languages x 54 phrases = 216 total Voice Lab items")