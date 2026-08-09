"""
Run once to generate curriculum_seed.json.
Usage: cd backend/curriculum/fixtures && python generate_curriculum_seed.py
"""
import json, base64

def flashcard(text, bg="#6E85B7", text_color="#FBF8F1", font_size=90):
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" rx="24" fill="{bg}"/><text x="100" y="130" font-size="{font_size}" font-family="Georgia, serif" font-weight="bold" fill="{text_color}" text-anchor="middle">{text}</text></svg>'
    return "data:image/svg+xml;base64," + base64.b64encode(svg.encode('utf-8')).decode('ascii')

def icon(inner, bg="#EEF5F0"):
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" rx="24" fill="{bg}"/>{inner}</svg>'
    return "data:image/svg+xml;base64," + base64.b64encode(svg.encode('utf-8')).decode('ascii')

ICON_CHAIR = icon('<rect x="60" y="70" width="80" height="10" fill="#6E85B7"/><rect x="65" y="80" width="10" height="60" fill="#6E85B7"/><rect x="125" y="80" width="10" height="60" fill="#6E85B7"/><rect x="60" y="55" width="10" height="30" fill="#6E85B7"/>')
ICON_DOOR = icon('<rect x="70" y="40" width="60" height="120" rx="4" fill="#C1483D"/><circle cx="118" cy="100" r="4" fill="#FBF8F1"/>')
ICON_BOOK = icon('<rect x="50" y="60" width="100" height="80" rx="6" fill="#4F8566"/><line x1="100" y1="60" x2="100" y2="140" stroke="#FBF8F1" stroke-width="3"/>')
ICON_SPEECH = icon('<ellipse cx="100" cy="90" rx="60" ry="40" fill="#E0A94C"/><path d="M85 125 L75 145 L100 125 Z" fill="#E0A94C"/>')

data = []
def level(pk, name, order): data.append({"model": "curriculum.level", "pk": pk, "fields": {"name": name, "order": order}})
def category(pk, level_pk, name, order): data.append({"model": "curriculum.category", "pk": pk, "fields": {"level": level_pk, "name": name, "order": order}})
def lesson(pk, cat_pk, title, desc, order): data.append({"model": "curriculum.lesson", "pk": pk, "fields": {"category": cat_pk, "title": title, "description": desc, "order": order, "created_at": "2026-01-01T00:00:00Z"}})
def content(pk, lesson_pk, body): data.append({"model": "curriculum.lessoncontent", "pk": pk, "fields": {"lesson": lesson_pk, "language": "en", "body": body, "exercise": ""}})
def mcq(pk, lesson_pk, order, q, opts, correct, img=""):
    data.append({"model": "curriculum.lessonexercise", "pk": pk, "fields": {"lesson": lesson_pk, "language": "en", "order": order, "question_text": q, "image_url": img, "options": opts, "correct_answer": correct}})

level(1, "beginner", 1); level(2, "intermediate", 2); level(3, "advanced", 3)
category(1, 1, "Alphabet", 1); category(2, 1, "Basic Words", 2)
category(3, 2, "Vocabulary", 1); category(4, 2, "Grammar Basics", 2); category(5, 2, "Sentence Formation", 3)
category(6, 3, "Paragraph Writing", 1); category(7, 3, "Reading Comprehension", 2)

lp, cp = 1, 1
def add_lesson(cat, title, desc, body):
    global lp, cp
    this_lp = lp
    lesson(lp, cat, title, desc, lp)
    content(cp, lp, body)
    lp += 1; cp += 1
    return this_lp

l1 = add_lesson(1, "Learning the Alphabet", "Introduces all letters with sounds.", "The alphabet has 26 letters, from A to Z. Each letter has its own sound.")
mcq(1, l1, 1, "Which letter comes right after A?", ["B", "C", "D"], "B", flashcard("A", "#6E85B7"))
mcq(2, l1, 2, "Which letter comes right before Z?", ["W", "X", "Y"], "Y", flashcard("Z", "#6E85B7"))

l2 = add_lesson(1, "Vowels and Consonants", "Distinguishing vowels from consonants.", "Vowels are A, E, I, O, U. All other letters are consonants.")
mcq(3, l2, 1, "Which of these is a vowel?", ["B", "E", "K"], "E", flashcard("E", "#4F8566"))
mcq(4, l2, 2, "Which of these is a consonant?", ["A", "O", "T"], "T", flashcard("T", "#C1483D"))

l3 = add_lesson(1, "Uppercase and Lowercase", "Recognizing capital and small letters.", "Every letter has an uppercase (capital) form and a lowercase (small) form, like A and a.")
mcq(5, l3, 1, "What is the lowercase form of 'A'?", ["a", "b", "e"], "a", flashcard("A", "#6E85B7"))
mcq(6, l3, 2, "What is the uppercase form of 'm'?", ["N", "M", "W"], "M", flashcard("m", "#4F8566", font_size=100))

l4 = add_lesson(1, "Letter Sounds", "Connecting letters to the sounds they make.", "Each letter makes a sound when we say it. Practicing letter sounds helps with reading.")
mcq(7, l4, 1, "Which letter makes a 'buh' sound?", ["B", "S", "M"], "B", flashcard("B", "#E0A94C", "#232323"))
mcq(8, l4, 2, "Which letter makes a 'sss' sound?", ["S", "D", "R"], "S", flashcard("S", "#E0A94C", "#232323"))

l5 = add_lesson(2, "Everyday Words", "Common words used daily.", "Words like 'hello', 'thank you', and 'please' are used every day.")
mcq(9, l5, 1, "Which word do you say when you meet someone?", ["Hello", "Goodbye", "Sorry"], "Hello", ICON_SPEECH)
mcq(10, l5, 2, "Which word do you say to be polite when asking for something?", ["Please", "Now", "Mine"], "Please", ICON_SPEECH)

l6 = add_lesson(2, "Naming Objects", "Words for everyday objects around you.", "Objects around you have names: table, chair, door, window.")
mcq(11, l6, 1, "What do we call the thing we sit on?", ["Table", "Chair", "Door"], "Chair", ICON_CHAIR)
mcq(12, l6, 2, "What do we call the opening we walk through?", ["Window", "Door", "Table"], "Door", ICON_DOOR)

l7 = add_lesson(2, "Colors", "Learning the names of common colors.", "Colors help us describe the world around us: red, blue, green, and yellow.")
mcq(13, l7, 1, "What color is this?", ["Red", "Blue", "Green"], "Blue", flashcard("BLUE", "#3B5998", font_size=40))
mcq(14, l7, 2, "What color is this?", ["Yellow", "Red", "Purple"], "Red", flashcard("RED", "#C1483D", font_size=48))

l8 = add_lesson(2, "Numbers 1 to 10", "Counting and recognizing numbers.", "Numbers help us count things: one, two, three, up to ten.")
mcq(15, l8, 1, "What number is this?", ["3", "5", "7"], "5", flashcard("5", "#E0A94C", "#232323"))
mcq(16, l8, 2, "What number comes after 7?", ["6", "8", "9"], "8", flashcard("7", "#E0A94C", "#232323"))

l9 = add_lesson(3, "Building Your Vocabulary", "Learning new words through context.", "A strong vocabulary helps you express yourself clearly.")
mcq(17, l9, 1, "Which word means 'very happy'?", ["Joyful", "Tired", "Angry"], "Joyful", ICON_BOOK)
mcq(18, l9, 2, "Which word means 'to look at carefully'?", ["Observe", "Ignore", "Forget"], "Observe", ICON_BOOK)

l10 = add_lesson(3, "Synonyms and Antonyms", "Words with similar and opposite meanings.", "Synonyms mean the same thing, like 'happy' and 'glad'. Antonyms mean the opposite.")
mcq(19, l10, 1, "Which word is a synonym for 'big'?", ["Large", "Small", "Fast"], "Large", "")
mcq(20, l10, 2, "Which word is an antonym for 'hot'?", ["Warm", "Cold", "Bright"], "Cold", "")

l11 = add_lesson(3, "Common Idioms", "Everyday expressions that aren't literal.", "An idiom is a phrase that means something different from its literal words, like 'break the ice'.")
mcq(21, l11, 1, "What does 'break the ice' mean?", ["Start a conversation", "Damage something", "Get cold"], "Start a conversation", ICON_SPEECH)
mcq(22, l11, 2, "What does 'piece of cake' mean?", ["Very easy", "A dessert", "Very hard"], "Very easy", "")

l12 = add_lesson(4, "Nouns and Verbs", "Identifying the basic parts of a sentence.", "A noun names a person, place, or thing. A verb describes an action.")
mcq(23, l12, 1, "Which word is a noun in 'The dog runs'?", ["Dog", "Runs", "The"], "Dog", "")
mcq(24, l12, 2, "Which word is a verb in 'She sings loudly'?", ["She", "Sings", "Loudly"], "Sings", "")

l13 = add_lesson(4, "Simple Tenses", "Past, present, and future in simple form.", "Past tense already happened. Present tense is happening now. Future tense hasn't happened yet.")
mcq(25, l13, 1, "Which sentence is in the past tense?", ["I walk", "I walked", "I will walk"], "I walked", "")
mcq(26, l13, 2, "Which sentence is in the future tense?", ["I will walk", "I walked", "I walk"], "I will walk", "")

l14 = add_lesson(4, "Adjectives", "Words that describe nouns.", "An adjective describes a noun, like 'tall', 'red', or 'happy'.")
mcq(27, l14, 1, "Which word is an adjective in 'the tall tree'?", ["Tall", "Tree", "The"], "Tall", "")
mcq(28, l14, 2, "Which word best describes a lemon?", ["Sour", "Quiet", "Fast"], "Sour", flashcard("?", "#E0A94C", "#232323"))

l15 = add_lesson(5, "Building Simple Sentences", "Combining words into complete sentences.", "A simple sentence has a subject and a verb, like 'She reads.'")
mcq(29, l15, 1, "Which is a complete sentence?", ["She reads", "Reads book the", "Book she"], "She reads", ICON_BOOK)
mcq(30, l15, 2, "Which is a complete sentence?", ["Running fast", "The dog runs", "Dog the"], "The dog runs", "")

l16 = add_lesson(5, "Joining Sentences", "Using conjunctions to join ideas.", "Conjunctions like 'and', 'but', and 'because' join two sentences into one.")
mcq(31, l16, 1, "Which word joins 'I was tired' and 'I went to sleep'?", ["Because", "Or", "Not"], "Because", "")
mcq(32, l16, 2, "Which word means 'in contrast'?", ["And", "But", "So"], "But", "")

l17 = add_lesson(5, "Question Formation", "Turning statements into questions.", "Questions often start with words like 'What', 'Where', 'Why', or 'How'.")
mcq(33, l17, 1, "Which word would you use to ask about a place?", ["Where", "Why", "Who"], "Where", "")
mcq(34, l17, 2, "Which word would you use to ask about a reason?", ["What", "Why", "When"], "Why", "")

l18 = add_lesson(6, "Writing Your First Paragraph", "Structuring a paragraph with a main idea.", "A paragraph has one main idea, supported by a few sentences.")
mcq(35, l18, 1, "What should a paragraph have?", ["One main idea", "No structure", "Random facts"], "One main idea", ICON_BOOK)
mcq(36, l18, 2, "What is the first sentence of a paragraph usually called?", ["Topic sentence", "Ending sentence", "Random sentence"], "Topic sentence", "")

l19 = add_lesson(6, "Descriptive Writing", "Using detail to bring writing to life.", "Descriptive writing uses sensory details - what you see, hear, smell, taste, and touch.")
mcq(37, l19, 1, "Which sense would you use to describe a smell?", ["Smell", "Sight", "Sound"], "Smell", "")
mcq(38, l19, 2, "Which sentence uses descriptive detail?", ["The cake was sweet and warm", "The cake was there", "There was a cake"], "The cake was sweet and warm", "")

l20 = add_lesson(6, "Persuasive Writing", "Convincing the reader of your point of view.", "Persuasive writing gives reasons and evidence to convince the reader of an opinion.")
mcq(39, l20, 1, "What does persuasive writing try to do?", ["Convince the reader", "Confuse the reader", "Describe a scene"], "Convince the reader", ICON_SPEECH)
mcq(40, l20, 2, "Which is a persuasive sentence?", ["You should recycle to help the planet", "The sky is blue", "It rained yesterday"], "You should recycle to help the planet", "")

l21 = add_lesson(7, "Reading for Meaning", "Understanding the main idea of a passage.", "Reading for meaning means understanding what the writer is really saying, not just the words.")
mcq(41, l21, 1, "What does 'reading for meaning' focus on?", ["Understanding the message", "Counting words", "Reading fast"], "Understanding the message", ICON_BOOK)
mcq(42, l21, 2, "What should you look for in a passage?", ["The main idea", "The longest word", "The last letter"], "The main idea", ICON_BOOK)

l22 = add_lesson(7, "Making Inferences", "Reading between the lines of a story.", "Making inferences means using clues in the text to figure out something the writer didn't say directly.")
mcq(43, l22, 1, "An inference is based on what?", ["Clues in the text", "Random guessing", "The title only"], "Clues in the text", "")
mcq(44, l22, 2, "If a character is smiling and laughing, how do they likely feel?", ["Happy", "Sad", "Angry"], "Happy", "")

l23 = add_lesson(7, "Summarizing", "Retelling the main points briefly.", "A summary retells the most important parts of a text in your own words, briefly.")
mcq(45, l23, 1, "A good summary should be...", ["Short and clear", "As long as the original", "Full of new opinions"], "Short and clear", ICON_BOOK)
mcq(46, l23, 2, "A summary should be written in whose words?", ["Your own words", "The author's exact words", "Random words"], "Your own words", "")

with open("curriculum_seed.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print(f"Wrote curriculum_seed.json: {lp-1} lessons, {len(data)} total objects")