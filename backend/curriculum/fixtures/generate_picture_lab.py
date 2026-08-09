"""
Generates picture_lab_en.json - 28 real picture items for Picture Lab
(8 real Pexels photos + 15 custom object/animal icon illustrations),
deliberately separate from the lesson flashcards (which are mostly
letter/color-word/number tiles, not actual pictures).

Usage: cd backend/curriculum/fixtures && python generate_picture_lab.py
"""
import json
import base64


def icon(paths, bg="#EEF5F0"):
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" rx="24" fill="{bg}"/>{paths}</svg>'
    return "data:image/svg+xml;base64," + base64.b64encode(svg.encode('utf-8')).decode('ascii')


# ---- Real object/animal icon illustrations ----
ICON_TREE = icon('<rect x="90" y="120" width="20" height="50" fill="#8B5A2B"/><circle cx="100" cy="90" r="50" fill="#4F8566"/>')
ICON_SUN = icon('<circle cx="100" cy="100" r="40" fill="#E0A94C"/><g stroke="#E0A94C" stroke-width="6"><line x1="100" y1="20" x2="100" y2="40"/><line x1="100" y1="160" x2="100" y2="180"/><line x1="20" y1="100" x2="40" y2="100"/><line x1="160" y1="100" x2="180" y2="100"/></g>')
ICON_MOON = icon('<path d="M120 40 A60 60 0 1 0 120 160 A48 48 0 1 1 120 40 Z" fill="#6E85B7"/>')
ICON_STAR = icon('<path d="M100 30 L115 75 L163 75 L124 103 L139 148 L100 120 L61 148 L76 103 L37 75 L85 75 Z" fill="#E0A94C"/>')
ICON_BALL = icon('<circle cx="100" cy="100" r="55" fill="#C1483D"/><path d="M60 70 Q100 100 140 70 M60 130 Q100 100 140 130" stroke="#FBF8F1" stroke-width="4" fill="none"/>')
ICON_CUP = icon('<path d="M60 70 L60 130 Q60 150 100 150 Q140 150 140 130 L140 70 Z" fill="#6E85B7"/><path d="M140 85 Q165 85 165 105 Q165 125 140 120" stroke="#6E85B7" stroke-width="8" fill="none"/>')
ICON_FISH = icon('<ellipse cx="90" cy="100" rx="50" ry="28" fill="#4F8566"/><path d="M140 100 L165 80 L165 120 Z" fill="#4F8566"/><circle cx="65" cy="95" r="4" fill="#FBF8F1"/>')
ICON_FLOWER = icon('<circle cx="100" cy="90" r="14" fill="#E0A94C"/><circle cx="80" cy="70" r="16" fill="#C1483D"/><circle cx="120" cy="70" r="16" fill="#C1483D"/><circle cx="80" cy="110" r="16" fill="#C1483D"/><circle cx="120" cy="110" r="16" fill="#C1483D"/><rect x="96" y="104" width="8" height="60" fill="#4F8566"/>')
ICON_UMBRELLA = icon('<path d="M40 100 A60 60 0 0 1 160 100 Z" fill="#6E85B7"/><line x1="100" y1="100" x2="100" y2="165" stroke="#232323" stroke-width="5"/><path d="M100 165 Q100 178 88 178" stroke="#232323" stroke-width="5" fill="none"/>')
ICON_BIRD = icon('<ellipse cx="100" cy="105" rx="45" ry="30" fill="#E0A94C"/><circle cx="140" cy="85" r="16" fill="#E0A94C"/><path d="M155 85 L172 90 L155 95 Z" fill="#C1483D"/>')
ICON_HOUSE = icon('<rect x="60" y="100" width="80" height="60" fill="#C1483D"/><path d="M50 100 L100 60 L150 100 Z" fill="#8B5A2B"/><rect x="90" y="125" width="20" height="35" fill="#FBF8F1"/>')
ICON_BICYCLE = icon('<circle cx="60" cy="130" r="28" fill="none" stroke="#232323" stroke-width="6"/><circle cx="140" cy="130" r="28" fill="none" stroke="#232323" stroke-width="6"/><path d="M60 130 L100 80 L140 130 M100 80 L85 130" stroke="#6E85B7" stroke-width="5" fill="none"/>')
ICON_KEY = icon('<circle cx="65" cy="100" r="25" fill="none" stroke="#E0A94C" stroke-width="10"/><rect x="88" y="93" width="75" height="14" fill="#E0A94C"/><rect x="140" y="107" width="10" height="18" fill="#E0A94C"/><rect x="155" y="107" width="10" height="14" fill="#E0A94C"/>')
ICON_CLOCK = icon('<circle cx="100" cy="100" r="55" fill="#FBF8F1" stroke="#232323" stroke-width="6"/><line x1="100" y1="100" x2="100" y2="65" stroke="#232323" stroke-width="6"/><line x1="100" y1="100" x2="125" y2="110" stroke="#232323" stroke-width="6"/>')
ICON_SHOE = icon('<path d="M40 130 Q40 110 70 110 L110 100 Q140 95 160 110 Q170 120 165 135 L45 140 Z" fill="#6E85B7"/>')
ICON_HAT = icon('<ellipse cx="100" cy="140" rx="70" ry="14" fill="#8B5A2B"/><path d="M75 140 L80 80 Q100 65 120 80 L125 140 Z" fill="#C1483D"/>')
ICON_PHONE = icon('<rect x="65" y="45" width="70" height="110" rx="12" fill="#232323"/><rect x="72" y="55" width="56" height="85" fill="#6E85B7"/><circle cx="100" cy="148" r="4" fill="#FBF8F1"/>')

# ---- Real photos (Pexels - already verified working in your assessment) ----
IMG_APPLE = "https://images.pexels.com/photos/1630588/pexels-photo-1630588.jpeg?auto=compress&cs=tinysrgb&w=800"
IMG_BILLIARD = "https://images.pexels.com/photos/7403773/pexels-photo-7403773.jpeg?auto=compress&cs=tinysrgb&w=800"
IMG_DOGCAT = "https://images.pexels.com/photos/16395150/pexels-photo-16395150.jpeg?auto=compress&cs=tinysrgb&w=800"
IMG_FOOD = "https://images.pexels.com/photos/19856566/pexels-photo-19856566.jpeg?auto=compress&cs=tinysrgb&w=800"
IMG_SUNRISE = "https://images.pexels.com/photos/15871304/pexels-photo-15871304.jpeg?auto=compress&cs=tinysrgb&w=800"
IMG_ELEPHANTS = "https://images.pexels.com/photos/321526/pexels-photo-321526.jpeg?auto=compress&cs=tinysrgb&w=800"
IMG_NEST = "https://images.pexels.com/photos/5268869/pexels-photo-5268869.jpeg?auto=compress&cs=tinysrgb&w=800"
IMG_TRAIL = "https://images.pexels.com/photos/733192/pexels-photo-733192.jpeg?auto=compress&cs=tinysrgb&w=800"

data = []


def entry(pk, level, lang, image_url, correct_answer, order):
    data.append({
        "model": "curriculum.picturelabitem",
        "pk": pk,
        "fields": {
            "level": level, "language": lang, "image_url": image_url,
            "correct_answer": correct_answer, "order": order,
        },
    })


beginner_items = [
    (IMG_APPLE, "Apple"), (IMG_DOGCAT, "Dog and cat"),
    (ICON_TREE, "Tree"), (ICON_SUN, "Sun"), (ICON_BALL, "Ball"),
    (ICON_CUP, "Cup"), (ICON_FISH, "Fish"), (ICON_FLOWER, "Flower"),
    (ICON_BIRD, "Bird"), (ICON_HOUSE, "House"), (ICON_MOON, "Moon"), (ICON_STAR, "Star"),
]
intermediate_items = [
    (IMG_BILLIARD, "Billiard balls"), (IMG_FOOD, "Plate of food"),
    (ICON_UMBRELLA, "Umbrella"), (ICON_BICYCLE, "Bicycle"), (ICON_KEY, "Key"),
    (ICON_CLOCK, "Clock"), (ICON_SHOE, "Shoe"), (ICON_HAT, "Hat"), (ICON_PHONE, "Phone"),
]
advanced_items = [
    (IMG_SUNRISE, "Sunrise"), (IMG_ELEPHANTS, "Elephants walking"),
    (IMG_NEST, "Bird's nest"), (IMG_TRAIL, "Hiking trail"),
    (ICON_TREE, "Tree"), (ICON_HOUSE, "House"), (ICON_CLOCK, "Clock"),
]

pk = 1
for i, (img, ans) in enumerate(beginner_items, 1):
    entry(pk, "beginner", "en", img, ans, i); pk += 1
for i, (img, ans) in enumerate(intermediate_items, 1):
    entry(pk, "intermediate", "en", img, ans, i); pk += 1
for i, (img, ans) in enumerate(advanced_items, 1):
    entry(pk, "advanced", "en", img, ans, i); pk += 1

with open("picture_lab_en.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Picture Lab: wrote {len(data)} real picture items "
      f"({len(beginner_items)} beginner, {len(intermediate_items)} intermediate, {len(advanced_items)} advanced)")