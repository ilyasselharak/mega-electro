# -*- coding: utf-8 -*-
# Batch "heating-16": space heaters (Chauffage) and water heaters (Chauffe-eau).
# Facts come only from the store database (backups/seo/after-pilot/heating-current.json).
# Spec lists are CLEANED (wrong price rows, marketing sentences, marketplace SKUs removed); no value is added.
import json, os
HERE = os.path.dirname(__file__)
cur = {p["slug"]: p for p in json.load(open(os.path.join(HERE, "../../backups/seo/after-pilot/heating-current.json")))}
P = []
STORE = "Livraison partout au Maroc, paiement à la livraison."
STORE_AR = "توصيل لكل المغرب والدفع عند الاستلام."

def spec_subset(slug, labels):
    """Keep existing rows whose label is listed, in that order (never invents values)."""
    rows = {s["label"]: s for s in cur[slug]["specs"]}
    missing = [l for l in labels if l not in rows]
    assert not missing, (slug, missing)
    return [rows[l] for l in labels]

def add(slug, verify, c, alts, specs_from=None):
    keys = cur[slug]["imgs"]
    assert len(alts) == len(keys), (slug, len(alts), len(keys))
    c["imageAlts"] = [{"key": k, "alt": a, "altAr": b} for k, (a, b) in zip(keys, alts)]
    entry = {"kind": "product", "slug": slug, "source": "heating-16", "sources": [], "verify": verify, "specsVerified": False, "changes": c}
    if specs_from:
        c["specs"] = spec_subset(slug, specs_from)
        entry["specsVerified"] = True
        entry["sources"] = ["Fiche produit Mega Electro existante (lignes techniques conservées, lignes erronées retirées)"]
    P.append(entry)

def faq(q, a, qa, aa):
    return {"question": q, "answer": a, "questionAr": qa, "answerAr": aa}

GAS_SAFETY = faq("Où installer un chauffe-eau à gaz ?", "Dans un local bien ventilé, par un professionnel qualifié. Ne l'installez jamais dans une salle de bain fermée sans aération.",
                 "فين نركب شوفو الغاز؟", "فبلاصة فيها التهوية، وخاص يركبو مختص. ما تركبوهش فحمام مسدود بلا تهوية.")
HEATER_NIGHT = faq("Peut-on le laisser allumé la nuit ?", "Non. Éteignez-le avant de dormir ou en quittant la pièce, et gardez-le loin des rideaux et des couvertures.",
                   "واش نخليه شاعل فالليل؟", "لا، طفيوه قبل النعاس أو منين تخرجو من البيت، وبعدوه على الريدو والغطا.")

# ── Water heaters: gas ────────────────────────────────────────────────────────
add("chauffe-eau-gaz-gnial-6-litres-avec-changeur-en-cuivre",
    ["Type de gaz, type d'allumage et dimensions non renseignés."],
    {
     "name": "Chauffe-eau à gaz Génial 6 litres échangeur en cuivre",
     "nameAr": "سخان الماء بالغاز جنيال 6 لتر بمبادل نحاسي",
     "shortDescription": "Chauffe-eau à gaz Génial de 6 litres par minute avec échangeur thermique en cuivre, deux commandes rotatives et affichage en façade.",
     "description": "Le chauffe-eau à gaz Génial produit de l'eau chaude instantanément, avec un débit de 6 litres par minute : de quoi alimenter une douche dans un appartement ou une petite maison.\n\n### Un échangeur en cuivre\nC'est dans l'échangeur que la chaleur de la flamme passe à l'eau. Le cuivre conduit très bien la chaleur, ce qui explique qu'on le retrouve sur de nombreux chauffe-eau à gaz.\n\n### Commandes simples\nDeux boutons rotatifs en façade permettent de régler l'appareil, et un affichage frontal donne une indication de fonctionnement.\n\n### Les points clés\n- Débit : 6 litres par minute\n- Fonctionnement au gaz\n- Échangeur thermique en cuivre\n- Deux commandes rotatives\n- Affichage en façade\n\n### Installation\nFaites-le installer par un professionnel, dans un local ventilé et conforme aux règles de sécurité des appareils à gaz.\n\nGarantie : 12 mois.",
     "metaTitle": "Chauffe-eau à gaz Génial 6 L cuivre – Prix Maroc",
     "metaDescription": "Chauffe-eau à gaz Génial 6 L/min, échangeur en cuivre et deux commandes rotatives, garantie 12 mois. " + STORE,
     "seo": {
       "titleAr": "سخان الماء بالغاز جنيال 6 لتر نحاسي – الثمن في المغرب",
       "metaDescriptionAr": "سخان ماء بالغاز جنيال 6 لتر في الدقيقة بمبادل حراري من النحاس وزرين للتحكم، ضمان 12 شهرا. " + STORE_AR,
       "shortDescriptionAr": "سخان ماء بالغاز جنيال بصبيب 6 لتر في الدقيقة، مع مبادل حراري من النحاس وزرين للتحكم وشاشة أمامية.",
       "descriptionAr": "سخان الماء بالغاز جنيال يعطي الماء الساخن مباشرة بصبيب 6 لتر في الدقيقة، وهذا يكفي لدوش في شقة أو منزل صغير.\n\n### مبادل من النحاس\nفي المبادل تنتقل حرارة اللهب إلى الماء، والنحاس ينقل الحرارة بشكل جيد.\n\n### تحكم بسيط\nزران دوارين في الواجهة للتعديل، مع شاشة أمامية.\n\n### أهم المميزات\n- الصبيب: 6 لتر في الدقيقة\n- يعمل بالغاز\n- مبادل حراري من النحاس\n- زران للتحكم\n- شاشة أمامية\n\n### التركيب\nيجب أن يركبه مختص في مكان جيد التهوية.\n\nالضمان: 12 شهرا.",
       "keywords": "chauffe-eau gaz Génial 6L, chauffe-eau échangeur cuivre, chauffe-bain gaz 6 litres, chauffe-eau à gaz instantané, prix chauffe-eau Génial Maroc",
       "keywordsAr": "شوفو الغاز جنيال, سخان الماء بالغاز, شوفو 6 لتر, سخان ماء نحاسي, ثمن شوفو الغاز في المغرب"
     },
     "faq": [faq("Que signifie 6 litres ?", "C'est le débit d'eau chaude : environ 6 litres par minute, adapté à un point d'eau à la fois, comme une douche.", "شنو معنى 6 لتر؟", "هو الصبيب ديال الما السخون: تقريبا 6 لتر فالدقيقة، كيكفي لنقطة ما وحدة بحال الدوش."), GAS_SAFETY]
    },
    [("Chauffe-eau à gaz Génial 6 litres avec échangeur en cuivre", "سخان الماء بالغاز جنيال 6 لتر بمبادل نحاسي"),
     ("Chauffe-eau à gaz Génial 6 L, commandes en façade", "سخان الماء بالغاز جنيال 6 لتر، أزرار التحكم")])

add("regal-chauffe-eau-gaz-automatique-6l",
    ["Fiche quasi vide : type de gaz, allumage, puissance, dimensions et garantie à renseigner."],
    {
     "name": "Chauffe-eau à gaz automatique Regal 6 litres",
     "nameAr": "سخان الماء بالغاز الأوتوماتيكي ريغال 6 لتر",
     "shortDescription": "Chauffe-eau à gaz automatique Regal de 6 litres : eau chaude instantanée pour la douche ou la cuisine d'un petit foyer.",
     "description": "Le chauffe-eau Regal est un modèle à gaz automatique de 6 litres. Il chauffe l'eau à la demande, au moment où vous ouvrez le robinet, sans réservoir à remplir ni temps d'attente de chauffe.\n\n### Pour quel foyer ?\nUn chauffe-eau de 6 litres convient en général à un point d'eau utilisé à la fois : la douche d'un appartement, ou la cuisine. Si vous avez besoin d'eau chaude à plusieurs robinets en même temps, préférez une capacité supérieure.\n\n### Avant l'achat\nVérifiez le type de bouteille ou d'alimentation en gaz dont vous disposez et l'emplacement prévu : il doit être ventilé et accessible pour l'entretien.\n\n### Installation\nL'installation d'un appareil à gaz doit être confiée à un professionnel qualifié. Notre équipe peut répondre à vos questions par téléphone ou sur WhatsApp avant la commande.",
     "metaTitle": "Chauffe-eau à gaz automatique Regal 6 L – Prix Maroc",
     "metaDescription": "Chauffe-eau à gaz automatique Regal 6 litres pour une eau chaude instantanée à la maison. " + STORE,
     "seo": {
       "titleAr": "شوفو الغاز ريغال 6 لتر أوتوماتيكي بالمغرب",
       "metaDescriptionAr": "سخان ماء بالغاز أوتوماتيكي ريغال 6 لتر للماء الساخن المباشر في البيت. " + STORE_AR,
       "shortDescriptionAr": "سخان ماء بالغاز أوتوماتيكي ريغال 6 لتر: ماء ساخن مباشر للدوش أو المطبخ في بيت صغير.",
       "descriptionAr": "سخان ريغال أوتوماتيكي بالغاز بسعة 6 لتر، يسخن الماء عند فتح الصنبور مباشرة، بدون خزان وبدون انتظار.\n\n### لأي بيت؟\nسخان 6 لتر يناسب عادة نقطة ماء واحدة في نفس الوقت، مثل دوش الشقة أو المطبخ. إذا كنتم تحتاجون الماء الساخن في عدة صنابير في نفس الوقت، اختاروا سعة أكبر.\n\n### قبل الشراء\nتأكدوا من نوع قنينة الغاز المتوفرة لديكم ومن المكان: يجب أن يكون جيد التهوية.\n\n### التركيب\nيجب أن يركبه مختص. فريقنا يجيب على أسئلتكم بالهاتف أو واتساب قبل الطلب.",
       "keywords": "chauffe-eau gaz Regal, chauffe-eau automatique 6 litres, chauffe-bain gaz Maroc, chauffe-eau à gaz instantané, prix chauffe-eau Regal Maroc",
       "keywordsAr": "شوفو ريغال, شوفو الغاز, سخان الماء بالغاز, شوفو أوتوماتيك 6 لتر, ثمن شوفو الغاز في المغرب"
     },
     "faq": [GAS_SAFETY]
    },
    [("Chauffe-eau à gaz automatique Regal 6 litres", "سخان الماء بالغاز الأوتوماتيكي ريغال 6 لتر")])

add("chauffe-eau-gaz-daiko-6l-automatique-ceg-652ek",
    [],
    {
     "shortDescription": "Chauffe-eau à gaz automatique Daiko CEG-652EK de 6 L/min, allumage électrique, écran LED de température, butane ou propane, garantie 2 ans.",
     "description": "Le Daiko CEG-652EK est un chauffe-eau à gaz automatique : l'allumage se fait seul à l'ouverture du robinet d'eau chaude, sans bouton à presser. Son débit de 6 litres par minute convient à une douche dans un appartement ou une petite maison.\n\n### Voir la température de l'eau\nUn écran LED affiche la température, et le thermostat permet de la régler. Le mode multi-saisons adapte le fonctionnement entre l'hiver, où l'eau du réseau arrive froide, et l'été.\n\n### Sécurité\nL'appareil intègre plusieurs protections : surchauffe, coupure de gaz et combustion à sec.\n\n### Caractéristiques\n- Débit : 6 L/min\n- Gaz : butane G30 ou propane G31\n- Puissance utile nominale : 11 kW\n- Pression d'eau : 0,2 à 10 bar\n- Dimensions : 310 × 475 × 119 mm\n- Poids net : 5,6 kg\n\n### Installation\nÀ confier à un professionnel, dans un local ventilé.\n\nGarantie : 2 ans.",
     "metaTitle": "Chauffe-eau à gaz Daiko 6L CEG-652EK – Prix Maroc",
     "metaDescription": "Chauffe-eau à gaz automatique Daiko CEG-652EK 6 L/min, écran LED, butane ou propane, garantie 2 ans. " + STORE,
     "seo": {
       "titleAr": "شوفو الغاز دايكو 6 لتر CEG-652EK بالمغرب",
       "metaDescriptionAr": "سخان ماء بالغاز أوتوماتيكي دايكو CEG-652EK بصبيب 6 لتر وشاشة LED، بوتان أو بروبان، ضمان سنتين. " + STORE_AR,
       "shortDescriptionAr": "سخان ماء بالغاز أوتوماتيكي دايكو CEG-652EK بصبيب 6 لتر في الدقيقة، إشعال كهربائي وشاشة LED لدرجة الحرارة، ضمان سنتين.",
       "descriptionAr": "دايكو CEG-652EK سخان ماء بالغاز أوتوماتيكي: يشتعل وحده عند فتح صنبور الماء الساخن. صبيبه 6 لتر في الدقيقة يناسب دوشا في شقة أو منزل صغير.\n\n### رؤية درجة الحرارة\nشاشة LED تعرض درجة حرارة الماء، والترموستات يسمح بتعديلها. ووضع متعدد الفصول يكيف التشغيل بين الشتاء والصيف.\n\n### السلامة\nحماية من ارتفاع الحرارة ومن انقطاع الغاز ومن الاشتعال بدون ماء.\n\n### المواصفات\n- الصبيب: 6 لتر في الدقيقة\n- الغاز: بوتان G30 أو بروبان G31\n- القوة الاسمية: 11 كيلوواط\n- ضغط الماء: من 0.2 إلى 10 بار\n- الأبعاد: 310 × 475 × 119 مم\n- الوزن: 5.6 كلغ\n\n### التركيب\nيجب أن يركبه مختص في مكان جيد التهوية.\n\nالضمان: سنتان.",
       "keywords": "chauffe-eau gaz Daiko CEG-652EK, chauffe-eau automatique 6 litres, chauffe-eau gaz écran LED, chauffe-bain Daiko, prix chauffe-eau Daiko Maroc",
       "keywordsAr": "شوفو دايكو, سخان الماء بالغاز دايكو, شوفو أوتوماتيك, شوفو الغاز 6 لتر, ثمن شوفو دايكو في المغرب"
     },
     "faq": [faq("Fonctionne-t-il au butane ou au propane ?", "Les deux : butane G30 ou propane G31.", "واش كيخدم بالبوتان ولا البروبان؟", "بجوج: بوتان G30 أو بروبان G31."),
             faq("Faut-il appuyer sur un bouton pour l'allumer ?", "Non, l'allumage électrique est automatique à l'ouverture du robinet d'eau chaude.", "واش خاص نضغط على شي زر باش يشعل؟", "لا، كيشعل بوحدو منين كتحلو الروبيني ديال الما السخون."), GAS_SAFETY]
    },
    [("Chauffe-eau à gaz automatique Daiko CEG-652EK 6 litres avec écran LED", "سخان الماء بالغاز دايكو CEG-652EK بسعة 6 لتر مع شاشة LED")])

add("chauffe-eau-gaz-automatique-daiko-6l-ceg-664k-volcano",
    [],
    {
     "shortDescription": "Chauffe-eau à gaz automatique Daiko Volcano CEG-664K, 6 L/min, butane ou propane, démarrage à faible pression d'eau, garantie 2 ans.",
     "description": "Le Daiko Volcano CEG-664K est un chauffe-eau à gaz automatique homologué pour le Maroc (catégorie I3+). Il démarre même lorsque la pression d'eau est faible, un avantage dans les immeubles où l'eau arrive avec peu de pression.\n\n### Utilisation au quotidien\nL'allumage est automatique, la température se règle et le mode multi-saisons ajuste la chauffe entre l'hiver et l'été. La consommation de gaz peut aussi être réglée.\n\n### Protections\n- Surchauffe\n- Coupure de gaz\n- Combustion à sec\n\n### Caractéristiques\n- Débit : 6 L/min\n- Gaz : butane G30 (28–30 mbar) ou propane G31 (37 mbar)\n- Pression d'eau : 0,25 à 8 bar\n- Puissance utile nominale : 10,2 kW\n- Dimensions : 440 × 300 × 138 mm\n- Poids net : 4,8 kg\n\n### Installation\nL'appareil est de type B11 : il doit être installé par un professionnel dans un local suffisamment ventilé.\n\nGarantie : 2 ans.",
     "metaTitle": "Chauffe-eau gaz Daiko Volcano CEG-664K 6L – Prix Maroc",
     "metaDescription": "Chauffe-eau à gaz Daiko Volcano CEG-664K 6 L/min, butane ou propane, démarre à faible pression. " + STORE,
     "seo": {
       "titleAr": "شوفو الغاز دايكو فولكانو CEG-664K بالمغرب",
       "metaDescriptionAr": "سخان ماء بالغاز أوتوماتيكي دايكو فولكانو CEG-664K بصبيب 6 لتر، بوتان أو بروبان، يشتغل بضغط ماء ضعيف، ضمان سنتين. " + STORE_AR,
       "shortDescriptionAr": "سخان ماء بالغاز أوتوماتيكي دايكو فولكانو CEG-664K بصبيب 6 لتر، بوتان أو بروبان، يشتغل حتى بضغط ماء ضعيف، ضمان سنتين.",
       "descriptionAr": "دايكو فولكانو CEG-664K سخان ماء بالغاز أوتوماتيكي مطابق للمغرب (فئة I3+). يشتغل حتى عندما يكون ضغط الماء ضعيفا، وهذا مفيد في العمارات.\n\n### الاستعمال اليومي\nإشعال أوتوماتيكي، تعديل درجة الحرارة، ووضع متعدد الفصول بين الشتاء والصيف، مع إمكانية تعديل استهلاك الغاز.\n\n### الحماية\n- من ارتفاع الحرارة\n- من انقطاع الغاز\n- من الاشتعال بدون ماء\n\n### المواصفات\n- الصبيب: 6 لتر في الدقيقة\n- الغاز: بوتان G30 أو بروبان G31\n- ضغط الماء: من 0.25 إلى 8 بار\n- القوة الاسمية: 10.2 كيلوواط\n- الأبعاد: 440 × 300 × 138 مم\n- الوزن: 4.8 كلغ\n\n### التركيب\nيجب أن يركبه مختص في مكان جيد التهوية.\n\nالضمان: سنتان.",
       "keywords": "chauffe-eau gaz Daiko Volcano, Daiko CEG-664K, chauffe-eau automatique faible pression, chauffe-bain gaz 6 litres, prix chauffe-eau Daiko Volcano Maroc",
       "keywordsAr": "شوفو دايكو فولكانو, شوفو الغاز, سخان الماء بالغاز, شوفو كيخدم بضغط ضعيف, ثمن شوفو دايكو في المغرب"
     },
     "faq": [faq("Fonctionne-t-il avec une faible pression d'eau ?", "Oui, il démarre à faible pression ; sa plage de fonctionnement va de 0,25 à 8 bar.", "واش كيخدم إلا كان الضغط ديال الما ضعيف؟", "إيه، كيبدا حتى بضغط ضعيف، من 0.25 حتى 8 بار."), GAS_SAFETY]
    },
    [("Chauffe-eau à gaz automatique Daiko Volcano CEG-664K 6 litres", "سخان الماء بالغاز دايكو فولكانو CEG-664K بسعة 6 لتر"),
     ("Chauffe-eau Daiko Volcano CEG-664K, façade et commandes", "سخان دايكو فولكانو CEG-664K، الواجهة وأزرار التحكم")])

add("chauffe-eau-gaz-koln-6-litres",
    ["Type d'allumage et garantie fabricant à confirmer (champ garantie : 12 mois)."],
    {
     "name": "Chauffe-eau à gaz KOLN 6 litres butane",
     "nameAr": "سخان الماء بالغاز كولن 6 لتر بالبوتان",
     "shortDescription": "Chauffe-eau à gaz instantané KOLN de 6 L/min au butane (GPL), deux commandes de réglage et une plage de pression d'eau de 0,07 à 10 bar.",
     "description": "Le KOLN 6 litres est un chauffe-eau à gaz instantané qui fonctionne au butane (GPL, G30), le gaz des bouteilles domestiques. C'est l'un des chauffe-eau les plus abordables de notre gamme, pour équiper une salle de bain ou une cuisine.\n\n### Démarre avec peu de pression\nSa plage de pression d'eau commence à 0,07 bar : un point utile si l'eau arrive avec peu de pression chez vous.\n\n### Caractéristiques\n- Débit nominal : 6 litres par minute\n- Gaz : GPL / butane G30, 28 mbar\n- Puissance nominale : 10,2 kW\n- Pression d'eau : 0,07 à 10 bar\n- Catégorie : I3+\n- Deux boutons de réglage\n\n### Installation\nL'étiquette de l'appareil impose une utilisation dans un espace bien ventilé. Faites-le installer par un professionnel.\n\nGarantie : 12 mois.",
     "metaTitle": "Chauffe-eau à gaz KOLN 6 litres butane – Prix Maroc",
     "metaDescription": "Chauffe-eau à gaz KOLN 6 L/min au butane, 10,2 kW, démarre dès 0,07 bar, garantie 12 mois. " + STORE,
     "seo": {
       "titleAr": "سخان الماء بالغاز كولن 6 لتر بوتان – الثمن في المغرب",
       "metaDescriptionAr": "سخان ماء بالغاز كولن 6 لتر بالبوتان، قوة 10.2 كيلوواط، يشتغل من ضغط ماء 0.07 بار، ضمان 12 شهرا. " + STORE_AR,
       "shortDescriptionAr": "سخان ماء بالغاز كولن بصبيب 6 لتر بالبوتان، زران للتحكم ويشتغل بضغط ماء من 0.07 إلى 10 بار.",
       "descriptionAr": "سخان كولن 6 لتر بالغاز يعمل بالبوتان (G30)، غاز القنينات المنزلية، وهو من أرخص السخانات عندنا لتجهيز الحمام أو المطبخ.\n\n### يشتغل بضغط ضعيف\nيبدأ من ضغط ماء 0.07 بار، وهذا مفيد إذا كان الماء يصل بضغط ضعيف.\n\n### المواصفات\n- الصبيب: 6 لتر في الدقيقة\n- الغاز: بوتان G30، 28 ملي بار\n- القوة: 10.2 كيلوواط\n- ضغط الماء: من 0.07 إلى 10 بار\n- الفئة: I3+\n- زران للتعديل\n\n### التركيب\nيجب استعماله في مكان جيد التهوية، وأن يركبه مختص.\n\nالضمان: 12 شهرا.",
       "keywords": "chauffe-eau gaz KOLN 6L, chauffe-eau butane 6 litres, chauffe-bain gaz pas cher, chauffe-eau gaz instantané, prix chauffe-eau KOLN Maroc",
       "keywordsAr": "شوفو كولن, شوفو البوطة, سخان الماء بالغاز, شوفو 6 لتر رخيص, ثمن شوفو كولن في المغرب"
     },
     "faq": [faq("Avec quel gaz fonctionne-t-il ?", "Au butane (GPL, G30) à 28 mbar, le gaz des bouteilles domestiques.", "بأي غاز كيخدم؟", "بالبوتان G30 ديال البوطة، 28 ملي بار."), GAS_SAFETY]
    },
    [("Chauffe-eau à gaz KOLN 6 litres au butane", "سخان الماء بالغاز كولن 6 لتر بالبوتان"),
     ("Chauffe-eau à gaz KOLN 6 L, boutons de réglage", "سخان الماء بالغاز كولن 6 لتر، أزرار التعديل")])

# ── Water heaters: electric ─────────────────────────────────────────────────
add("chauffe-eau-lectrique-30l-junkers-bosch",
    ["Puissance (W), dimensions et référence exacte non renseignées ; la ligne « SKU » venait d'une place de marché et a été retirée.",
     "« Pays de production : Germany » conservé tel qu'il figure dans la fiche, à confirmer."],
    {
     "name": "Chauffe-eau électrique Junkers Bosch 30 litres",
     "nameAr": "سخان الماء الكهربائي يونكرز بوش 30 لتر",
     "shortDescription": "Chauffe-eau électrique Junkers Bosch de 30 litres, isolation en polyuréthane sans CFC pour garder l'eau chaude plus longtemps.",
     "description": "Le chauffe-eau électrique Junkers Bosch de 30 litres stocke et maintient l'eau au chaud : c'est la bonne taille pour un studio, un petit appartement ou une cuisine qui a besoin d'eau chaude sans installation au gaz.\n\n### Isolation en polyuréthane\nLa cuve est isolée par une mousse de polyuréthane sans CFC, qui limite les pertes de chaleur : l'eau reste chaude plus longtemps entre deux utilisations.\n\n### 30 litres, pour qui ?\nUne capacité de 30 litres couvre en général une douche courte ou la vaisselle. Pour une famille, ou plusieurs douches à la suite, une capacité de 50 litres ou plus sera plus confortable.\n\n### Caractéristiques\n- Capacité : 30 litres\n- Isolation : polyuréthane sans CFC\n- Poids : 11,6 kg\n- Couleur : blanc\n\n### Installation\nFixez-le sur un mur porteur, raccordé par un électricien à une prise protégée.\n\nGarantie : 12 mois.",
     "metaTitle": "Chauffe-eau électrique Junkers Bosch 30 L – Prix Maroc",
     "metaDescription": "Chauffe-eau électrique Junkers Bosch 30 litres, isolation polyuréthane sans CFC, garantie 12 mois. " + STORE,
     "seo": {
       "titleAr": "شوفو كهربائي يونكرز بوش 30 لتر بالمغرب",
       "metaDescriptionAr": "سخان ماء كهربائي يونكرز بوش بسعة 30 لترا، عزل بالبولي يوريثان بدون CFC، ضمان 12 شهرا. " + STORE_AR,
       "shortDescriptionAr": "سخان ماء كهربائي يونكرز بوش بسعة 30 لترا، بعزل من البولي يوريثان يحافظ على حرارة الماء مدة أطول.",
       "descriptionAr": "سخان الماء الكهربائي يونكرز بوش بسعة 30 لترا يخزن الماء ويحافظ على حرارته، وهو مناسب لستوديو أو شقة صغيرة أو مطبخ بدون تركيب الغاز.\n\n### عزل بالبولي يوريثان\nالخزان معزول برغوة البولي يوريثان بدون CFC، فيبقى الماء ساخنا مدة أطول.\n\n### 30 لترا لمن؟\nتكفي عادة لدوش قصير أو لغسل الأواني. لعائلة أو لعدة دوشات متتالية، اختاروا 50 لترا أو أكثر.\n\n### المواصفات\n- السعة: 30 لترا\n- العزل: بولي يوريثان بدون CFC\n- الوزن: 11.6 كلغ\n- اللون: أبيض\n\n### التركيب\nيثبت على حائط صلب ويوصله كهربائي بمقبس محمي.\n\nالضمان: 12 شهرا.",
       "keywords": "chauffe-eau électrique Junkers Bosch, chauffe-eau électrique 30 litres, ballon eau chaude 30L, chauffe-eau Bosch, prix chauffe-eau électrique 30L Maroc",
       "keywordsAr": "شوفو كهربائي, شوفو بوش, سخان الماء الكهربائي 30 لتر, شوفو الضو, ثمن سخان الماء الكهربائي في المغرب"
     },
     "faq": [faq("Un chauffe-eau de 30 litres suffit-il pour une famille ?", "Il convient plutôt à une ou deux personnes. Pour une famille, choisissez 50 litres ou plus.", "واش شوفو 30 لتر كيكفي لعائلة؟", "كيكفي لشخص ولا جوج. للعائلة ختارو 50 لتر ولا كثر.")]
    },
    [("Chauffe-eau électrique Junkers Bosch 30 litres blanc", "سخان الماء الكهربائي يونكرز بوش 30 لتر أبيض")],
    specs_from=["Pays de production", "Poids (kg)", "Couleur", "Matière principale"])

add("chauffe-eau-lectrique-bosch-cbe50-50l-vertical-1500w",
    ["Dimensions et classe énergétique non renseignées."],
    {
     "name": "Chauffe-eau électrique Bosch CBE50 50 litres 1500 W vertical",
     "nameAr": "سخان الماء الكهربائي بوش CBE50 سعة 50 لترا 1500 واط عمودي",
     "shortDescription": "Chauffe-eau électrique Bosch CBE50 de 50 litres et 1500 W, à installation murale verticale : une réserve d'eau chaude pour toute la famille.",
     "description": "Le Bosch CBE50 est un chauffe-eau électrique à accumulation de 50 litres, une capacité qui convient à un foyer de deux à quatre personnes. Il se fixe verticalement au mur, dans la salle de bain, la cuisine ou un placard technique.\n\n### 50 litres, le format familial\nAvec 50 litres d'eau chaude en réserve, plusieurs douches à la suite deviennent possibles, ce qui n'est pas le cas avec un petit 30 litres.\n\n### Une résistance de 1500 W\nLa puissance de 1500 W chauffe l'eau de la cuve. Comme tout chauffe-eau à accumulation, il faut compter un temps de chauffe après la première mise en eau ou après une forte consommation.\n\n### Caractéristiques\n- Référence : CBE50\n- Capacité : 50 litres\n- Puissance : 1500 W\n- Installation : murale verticale\n- Couleur : blanc\n\n### Installation\nUn mur porteur et un raccordement électrique protégé sont nécessaires : confiez la pose à un plombier ou un électricien.\n\nGarantie : 12 mois.",
     "metaTitle": "Chauffe-eau électrique Bosch CBE50 50 L – Prix Maroc",
     "metaDescription": "Chauffe-eau électrique Bosch CBE50 50 litres, 1500 W, installation murale verticale, garantie 12 mois. " + STORE,
     "seo": {
       "titleAr": "شوفو كهربائي بوش CBE50 سعة 50 لترا بالمغرب",
       "metaDescriptionAr": "سخان ماء كهربائي بوش CBE50 بسعة 50 لترا وقوة 1500 واط، تركيب حائطي عمودي، ضمان 12 شهرا. " + STORE_AR,
       "shortDescriptionAr": "سخان ماء كهربائي بوش CBE50 بسعة 50 لترا وقوة 1500 واط، يركب على الحائط عموديا: مخزون ماء ساخن للعائلة كلها.",
       "descriptionAr": "بوش CBE50 سخان ماء كهربائي بالتخزين بسعة 50 لترا، مناسب لعائلة من شخصين إلى أربعة. يركب عموديا على الحائط في الحمام أو المطبخ.\n\n### 50 لترا للعائلة\nمع 50 لترا من الماء الساخن، يمكن أخذ عدة دوشات متتالية.\n\n### مقاومة 1500 واط\nتسخن الماء داخل الخزان. يجب انتظار وقت التسخين بعد أول ملء أو بعد استهلاك كبير.\n\n### المواصفات\n- المرجع: CBE50\n- السعة: 50 لترا\n- القوة: 1500 واط\n- التركيب: حائطي عمودي\n- اللون: أبيض\n\n### التركيب\nيحتاج حائطا صلبا وتوصيلا كهربائيا محميا، ويركبه مختص.\n\nالضمان: 12 شهرا.",
       "keywords": "chauffe-eau électrique Bosch 50L, Bosch CBE50, chauffe-eau vertical 50 litres, ballon eau chaude 1500W, prix chauffe-eau Bosch Maroc",
       "keywordsAr": "شوفو بوش 50 لتر, سخان الماء الكهربائي بوش, شوفو الضو, شوفو كهربائي للعائلة, ثمن شوفو بوش في المغرب"
     },
     "faq": [faq("Pour combien de personnes ?", "Un 50 litres convient généralement à un foyer de deux à quatre personnes.", "لشحال من شخص كيكفي؟", "50 لتر كتكفي عادة لعائلة من 2 حتى 4 أفراد."),
             faq("Combien de temps pour chauffer ?", "Comptez un temps de chauffe après la première mise en eau ou une forte consommation ; il dépend de la température de l'eau d'arrivée.", "شحال كياخد باش يسخن؟", "خاصو وقت باش يسخن من بعد أول تعمار ولا من بعد استهلاك كبير، وكيتبدل حسب برودة الما.")]
    },
    [("Chauffe-eau électrique Bosch CBE50 50 litres vertical", "سخان الماء الكهربائي بوش CBE50 سعة 50 لترا عمودي")])

add("chauffe-eau-lectrique-roch-35-litres-rwh-35l-h-1500w",
    ["Garantie indiquée « 1 an, à confirmer selon le fournisseur »."],
    {
     "name": "Chauffe-eau électrique ROCH 35 litres RWH-35L-H 1500 W",
     "nameAr": "سخان الماء الكهربائي روش 35 لترا RWH-35L-H بقوة 1500 واط",
     "shortDescription": "Chauffe-eau électrique ROCH RWH-35L-H de 35 litres et 1500 W, thermostat réglable, voyant de chauffe et installation verticale.",
     "description": "Le ROCH RWH-35L-H est un chauffe-eau électrique à accumulation de 35 litres, une taille intermédiaire entre les petits 30 litres et les modèles familiaux de 50 litres. Il convient à un couple ou à une petite salle de bain.\n\n### Simple à régler\nLa commande est mécanique : un thermostat intégré règle la température, et un voyant lumineux indique quand l'appareil chauffe.\n\n### Caractéristiques\n- Référence : RWH-35L-H\n- Capacité : 35 litres\n- Puissance : 1500 W\n- Tension : 220–240 V\n- Thermostat intégré réglable\n- Voyant lumineux de chauffe\n- Installation verticale\n\n### Conseil\nRéglez le thermostat sur une température modérée : l'eau reste assez chaude pour la douche, avec moins de pertes de chaleur.\n\n### Installation\nÀ fixer sur un mur porteur et à raccorder par un professionnel.\n\nGarantie : 12 mois.",
     "metaTitle": "Chauffe-eau électrique ROCH 35 L RWH-35L-H – Prix Maroc",
     "metaDescription": "Chauffe-eau électrique ROCH RWH-35L-H 35 litres, 1500 W, thermostat réglable et voyant de chauffe. " + STORE,
     "seo": {
       "titleAr": "شوفو كهربائي روش 35 لترا RWH-35L-H بالمغرب",
       "metaDescriptionAr": "سخان ماء كهربائي روش RWH-35L-H بسعة 35 لترا وقوة 1500 واط، ترموستات قابل للتعديل وضوء التسخين. " + STORE_AR,
       "shortDescriptionAr": "سخان ماء كهربائي روش RWH-35L-H بسعة 35 لترا وقوة 1500 واط، ترموستات قابل للتعديل وضوء يبين التسخين، تركيب عمودي.",
       "descriptionAr": "روش RWH-35L-H سخان ماء كهربائي بالتخزين بسعة 35 لترا، حجم متوسط بين 30 و50 لترا، مناسب لزوجين أو لحمام صغير.\n\n### تحكم بسيط\nتحكم ميكانيكي: ترموستات مدمج لتعديل الحرارة، وضوء يبين أن الجهاز يسخن.\n\n### المواصفات\n- المرجع: RWH-35L-H\n- السعة: 35 لترا\n- القوة: 1500 واط\n- الجهد: 220–240 فولت\n- ترموستات قابل للتعديل\n- ضوء التسخين\n- تركيب عمودي\n\n### نصيحة\nاضبطوا الترموستات على حرارة متوسطة: الماء يبقى ساخنا بما يكفي للدوش مع ضياع أقل للحرارة.\n\n### التركيب\nيثبت على حائط صلب ويوصله مختص.\n\nالضمان: 12 شهرا.",
       "keywords": "chauffe-eau électrique ROCH 35L, ROCH RWH-35L-H, chauffe-eau 35 litres 1500W, ballon eau chaude 35L, prix chauffe-eau ROCH Maroc",
       "keywordsAr": "شوفو روش, سخان الماء الكهربائي 35 لتر, شوفو الضو, شوفو كهربائي, ثمن شوفو روش في المغرب"
     },
     "faq": [faq("À quoi sert le voyant lumineux ?", "Il s'allume quand la résistance chauffe l'eau, pour savoir si le chauffe-eau est en fonctionnement.", "علاش كاين الضو؟", "كيشعل منين كتسخن المقاومة الما، باش تعرفو واش الشوفو خدام.")]
    },
    [("Chauffe-eau électrique ROCH RWH-35L-H 35 litres", "سخان الماء الكهربائي روش RWH-35L-H بسعة 35 لترا"),
     ("Chauffe-eau ROCH 35 L, thermostat et voyant de chauffe", "سخان روش 35 لترا، الترموستات وضوء التسخين")],
    specs_from=["Marque", "Référence", "Type", "Capacité", "Puissance", "Tension", "Commande", "Réglage", "Installation", "Indicateur"])

add("chauffe-eau-lectrique-daiko-35-litres-1500w-cae-372sdk-silver-edition",
    [],
    {
     "shortDescription": "Chauffe-eau électrique Daiko CAE-372SDK Silver Edition de 35 litres : 1500 W, de 10 à 65 °C en 65 minutes, résistance inox 316L, garantie 12 mois.",
     "description": "Le Daiko CAE-372SDK Silver Edition est un chauffe-eau électrique de 35 litres à la finition silver, conçu pour durer : résistance en acier inoxydable 316L, cuve émaillée « Saphir Bleu » et anode en magnésium qui protège la cuve de la corrosion.\n\n### Chauffe annoncée\nSelon sa fiche, il porte l'eau de 10 °C à 65 °C en 65 minutes. Le thermostat se règle de 25 °C à 75 °C.\n\n### Conçu pour la salle de bain\nSon indice de protection IP24 le protège contre les projections d'eau, et son niveau sonore annoncé est de 15 dB.\n\n### Caractéristiques\n- Capacité : 35 litres\n- Puissance : 1500 W (220–240 V)\n- Résistance : inox 316L\n- Isolation : polyuréthane\n- Anode : magnésium\n- Dimensions : 420 × 484 mm\n- Poids net : 15 kg\n- Raccordement : G 1/2\"\n\n### Entretien\nFaites contrôler l'anode régulièrement : c'est elle qui s'use à la place de la cuve.\n\nGarantie : 12 mois.",
     "metaTitle": "Chauffe-eau Daiko 35 L CAE-372SDK – Prix Maroc",
     "metaDescription": "Chauffe-eau électrique Daiko CAE-372SDK 35 L, 1500 W, de 10 à 65 °C en 65 min, garantie 12 mois. " + STORE,
     "seo": {
       "titleAr": "شوفو كهربائي دايكو 35 لترا CAE-372SDK بالمغرب",
       "metaDescriptionAr": "سخان ماء كهربائي دايكو CAE-372SDK بسعة 35 لترا وقوة 1500 واط، من 10 إلى 65 درجة في 65 دقيقة، ضمان 12 شهرا. " + STORE_AR,
       "shortDescriptionAr": "سخان ماء كهربائي دايكو CAE-372SDK فضي بسعة 35 لترا: 1500 واط، من 10 إلى 65 درجة في 65 دقيقة، مقاومة من الإينوكس 316L.",
       "descriptionAr": "دايكو CAE-372SDK Silver Edition سخان ماء كهربائي بسعة 35 لترا بلون فضي، مصمم ليدوم: مقاومة من الإينوكس 316L، خزان مطلي بالمينا وأنود من المغنيزيوم يحمي الخزان من الصدأ.\n\n### مدة التسخين\nحسب بطاقته، يسخن الماء من 10 إلى 65 درجة في 65 دقيقة، والترموستات من 25 إلى 75 درجة.\n\n### للحمام\nدرجة الحماية IP24 ضد رذاذ الماء، ومستوى صوت 15 ديسيبل.\n\n### المواصفات\n- السعة: 35 لترا\n- القوة: 1500 واط (220–240 فولت)\n- المقاومة: إينوكس 316L\n- العزل: بولي يوريثان\n- الأنود: مغنيزيوم\n- الأبعاد: 420 × 484 مم\n- الوزن: 15 كلغ\n\n### الصيانة\nراقبوا الأنود بانتظام، فهو الذي يتآكل بدل الخزان.\n\nالضمان: 12 شهرا.",
       "keywords": "chauffe-eau électrique Daiko 35L, Daiko CAE-372SDK, chauffe-eau Silver Edition, chauffe-eau inox 316L, prix chauffe-eau Daiko Maroc",
       "keywordsAr": "شوفو دايكو 35 لتر, سخان الماء الكهربائي دايكو, شوفو الضو, شوفو فضي, ثمن شوفو دايكو في المغرب"
     },
     "faq": [faq("Combien de temps pour chauffer l'eau ?", "Selon sa fiche, 65 minutes pour passer de 10 °C à 65 °C.", "شحال كياخد باش يسخن الما؟", "حسب البطاقة، 65 دقيقة باش يطلع من 10 حتى 65 درجة."),
             faq("Peut-il être installé dans la salle de bain ?", "Oui, il est protégé IP24 contre les projections d'eau ; respectez les distances de sécurité électrique autour de la douche.", "واش نقدر نركبو فالحمام؟", "إيه، عندو حماية IP24 ضد رشان الما، ولكن احترمو المسافة ديال السلامة على الدوش.")]
    },
    [("Chauffe-eau électrique Daiko CAE-372SDK 35 litres finition silver", "سخان الماء الكهربائي دايكو CAE-372SDK سعة 35 لترا لون فضي"),
     ("Chauffe-eau Daiko Silver Edition 35 L, vue de côté", "سخان دايكو فضي 35 لترا، صورة جانبية")])

# ── Space heaters ───────────────────────────────────────────────────────────
add("chauffage-lectrique-quartz-sonic-800w-2-niveaux-de-puissance",
    ["Ancienne description : mentionnait « Electro Darna » et un prix de 120 DH (prix du site : 279 DH). Ligne « Prix : 120 DH » retirée des caractéristiques."],
    {
     "name": "Chauffage électrique quartz SONIC 800 W 2 niveaux",
     "nameAr": "مدفأة كهربائية كوارتز سونيك 800 واط بدرجتين",
     "shortDescription": "Petit chauffage d'appoint SONIC à deux tubes quartz, 800 W, deux niveaux de puissance et arrêt automatique en cas de chute.",
     "description": "Le SONIC CEQ-826GSC est un chauffage d'appoint compact à deux tubes quartz. Avec 800 W au maximum, il vise les petites pièces : une chambre, un bureau, ou le coin où vous vous installez le soir.\n\n### Deux niveaux\nAllumez un tube pour une chaleur douce, ou les deux pour la puissance maximale.\n\n### Chaleur immédiate\nLe quartz chauffe dès l'allumage et la chaleur est renvoyée vers l'avant par un réflecteur : vous la sentez tout de suite face à l'appareil.\n\n### Sécurité\nL'appareil s'arrête automatiquement s'il tombe, une sécurité utile avec des enfants ou des animaux.\n\n### Caractéristiques\n- Modèle : CEQ-826GSC\n- Puissance maximale : 800 W\n- Éléments chauffants : 2 tubes quartz\n- Niveaux de puissance : 2\n- Arrêt automatique en cas de chute\n\nGarantie : 12 mois.",
     "metaTitle": "Chauffage quartz SONIC 800 W 2 niveaux – Prix Maroc",
     "metaDescription": "Chauffage d'appoint SONIC quartz 800 W, 2 tubes, 2 niveaux et arrêt en cas de chute, garantie 12 mois. " + STORE,
     "seo": {
       "titleAr": "مدفأة كوارتز سونيك 800 واط بدرجتين – الثمن في المغرب",
       "metaDescriptionAr": "مدفأة كهربائية سونيك كوارتز 800 واط بأنبوبين ودرجتين وتتوقف إذا سقطت، ضمان 12 شهرا. " + STORE_AR,
       "shortDescriptionAr": "مدفأة صغيرة سونيك بأنبوبين من الكوارتز، 800 واط، درجتان للقوة وتتوقف أوتوماتيكيا إذا سقطت.",
       "descriptionAr": "سونيك CEQ-826GSC مدفأة صغيرة بأنبوبين من الكوارتز. بقوة قصوى 800 واط، مناسبة للغرف الصغيرة: غرفة النوم أو المكتب.\n\n### درجتان\nأنبوب واحد لحرارة خفيفة، أو الاثنان للقوة القصوى.\n\n### حرارة مباشرة\nالكوارتز يسخن مباشرة بعد التشغيل، والعاكس يوجه الحرارة إلى الأمام.\n\n### السلامة\nتتوقف أوتوماتيكيا إذا سقطت، وهذا مهم مع الأطفال.\n\n### المواصفات\n- الموديل: CEQ-826GSC\n- القوة القصوى: 800 واط\n- عناصر التسخين: أنبوبان كوارتز\n- عدد الدرجات: 2\n- توقف أوتوماتيكي عند السقوط\n\nالضمان: 12 شهرا.",
       "keywords": "chauffage SONIC 800W, SONIC CEQ-826GSC, chauffage quartz 2 tubes, petit chauffage d'appoint, prix chauffage SONIC Maroc",
       "keywordsAr": "شوفاج سونيك 800 واط, مدفأة كوارتز صغيرة, شوفاج الضو, دفاية كهربائية, ثمن شوفاج سونيك في المغرب"
     },
     "faq": [faq("Pour quelle pièce ?", "800 W conviennent à une petite pièce : chambre, bureau ou coin salon.", "لأي بيت مناسبة؟", "800 واط كتكفي لبيت صغيرة: بيت النعاس، المكتب ولا قنت فالصالون."), HEATER_NIGHT]
    },
    [("Chauffage électrique quartz SONIC CEQ-826GSC 800 W", "مدفأة كهربائية كوارتز سونيك CEQ-826GSC بقوة 800 واط"),
     ("Chauffage SONIC 800 W, deux tubes quartz", "مدفأة سونيك 800 واط بأنبوبين من الكوارتز")],
    specs_from=["Marque", "Modèle", "Type", "Puissance maximale", "Éléments chauffants", "Niveaux de puissance", "Sécurité", "Réflecteur", "Garantie"])

add("chauffage-lectrique-quartz-sonic-1200w-avec-rotation-3-niveaux-de-puissance",
    ["Ancienne description : mentionnait « Electro Darna ». Ligne « Prix » retirée des caractéristiques."],
    {
     "name": "Chauffage électrique quartz SONIC 1200 W rotatif CEQ-1232GSC",
     "nameAr": "مدفأة كهربائية كوارتز سونيك 1200 واط دوارة CEQ-1232GSC",
     "shortDescription": "Chauffage quartz SONIC CEQ-1232GSC de 1200 W : trois tubes, trois niveaux, rotation, poignée de transport et arrêt automatique en cas de chute.",
     "description": "Le SONIC CEQ-1232GSC réunit trois tubes quartz et une fonction de rotation : il balaie la pièce au lieu de chauffer un seul point, ce qui le rend plus agréable dans un salon où plusieurs personnes sont assises.\n\n### Trois niveaux\nAllumez un, deux ou trois tubes selon le froid. La poignée intégrée permet de le déplacer d'une pièce à l'autre.\n\n### Sécurité\nL'appareil s'arrête automatiquement en cas de chute.\n\n### Caractéristiques\n- Modèle : CEQ-1232GSC\n- Puissance : 1200 W\n- Éléments chauffants : 3 tubes quartz\n- Niveaux de puissance : 3\n- Rotation\n- Arrêt automatique en cas de chute\n- Réflecteur de chaleur\n\n### Bon usage\nPlacez-le sur un sol plat, à distance des rideaux et des meubles, et ne le couvrez jamais pour faire sécher du linge.\n\nGarantie : 12 mois.",
     "metaTitle": "Chauffage SONIC 1200 W rotatif CEQ-1232GSC – Prix Maroc",
     "metaDescription": "Chauffage quartz SONIC CEQ-1232GSC 1200 W, 3 niveaux, rotation et arrêt en cas de chute. " + STORE,
     "seo": {
       "titleAr": "شوفاج سونيك 1200 واط دوار CEQ-1232GSC بالمغرب",
       "metaDescriptionAr": "مدفأة كوارتز سونيك CEQ-1232GSC بقوة 1200 واط، 3 أنابيب و3 درجات مع الدوران، تتوقف عند السقوط، ضمان 12 شهرا. " + STORE_AR,
       "shortDescriptionAr": "مدفأة كوارتز سونيك CEQ-1232GSC بقوة 1200 واط: 3 أنابيب و3 درجات مع الدوران، مقبض للنقل وتتوقف إذا سقطت.",
       "descriptionAr": "سونيك CEQ-1232GSC تجمع ثلاثة أنابيب كوارتز مع خاصية الدوران: توزع الحرارة في الغرفة بدل نقطة واحدة، وهذا مريح في الصالون.\n\n### ثلاث درجات\nأنبوب أو اثنان أو ثلاثة حسب البرد، ومقبض مدمج لنقلها بين الغرف.\n\n### السلامة\nتتوقف أوتوماتيكيا إذا سقطت.\n\n### المواصفات\n- الموديل: CEQ-1232GSC\n- القوة: 1200 واط\n- 3 أنابيب كوارتز\n- 3 درجات\n- الدوران\n- توقف عند السقوط\n\n### الاستعمال\nضعوها على أرض مستوية بعيدا عن الستائر، ولا تغطوها أبدا لتجفيف الملابس.\n\nالضمان: 12 شهرا.",
       "keywords": "chauffage SONIC 1200W rotatif, SONIC CEQ-1232GSC, chauffage quartz 3 tubes, chauffage d'appoint rotation, prix chauffage SONIC 1200W Maroc",
       "keywordsAr": "شوفاج سونيك كيدور, مدفأة سونيك 1200 واط, شوفاج كوارتز, دفاية كهربائية, ثمن شوفاج سونيك في المغرب"
     },
     "faq": [faq("À quoi sert la rotation ?", "Le chauffage pivote pour répartir la chaleur dans la pièce au lieu de chauffer un seul point.", "شنو فايدة الدوران؟", "كيدور باش يفرق السخانة فالبيت كاملة ماشي غير فبلاصة وحدة."), HEATER_NIGHT]
    },
    [("Chauffage électrique quartz SONIC CEQ-1232GSC 1200 W rotatif", "مدفأة كهربائية كوارتز سونيك CEQ-1232GSC بقوة 1200 واط دوارة"),
     ("Chauffage SONIC 1200 W, trois tubes quartz", "مدفأة سونيك 1200 واط بثلاثة أنابيب كوارتز")],
    specs_from=["Marque", "Modèle", "Type", "Puissance", "Éléments chauffants", "Niveaux de puissance", "Fonction", "Sécurité", "Réflecteur", "Garantie"])

add("chauffage-lectrique-sonic-quartz-avec-rotation-4-tubes-chauffants",
    ["Nombre de tubes : le nom indique 4 tubes, la fiche et l'ancienne description 3 tubes. Le nombre n'est plus cité ; à vérifier sur l'appareil."],
    {
     "name": "Chauffage électrique quartz SONIC 1200 W rotatif avec télécommande",
     "nameAr": "مدفأة كهربائية كوارتز سونيك 1200 واط دوارة مع جهاز التحكم",
     "shortDescription": "Chauffage quartz SONIC CEQR-1254GSC de 1200 W avec télécommande, minuterie, rotation, trois niveaux (400/800/1200 W) et sécurité anti-chute.",
     "description": "Le SONIC CEQR-1254GSC est le modèle le plus équipé de notre gamme de chauffages quartz : en plus de la rotation et des trois niveaux de puissance, il se pilote à distance et s'éteint tout seul grâce à sa minuterie.\n\n### Télécommande et minuterie\nChangez la puissance depuis le canapé ou le lit, et programmez l'arrêt pour ne pas le laisser tourner inutilement.\n\n### Trois niveaux\n400 W pour garder une chambre tempérée, 800 W pour une pièce moyenne, 1200 W pour réchauffer vite en début de soirée.\n\n### Caractéristiques\n- Modèle : CEQR-1254GSC\n- Puissance : 400 / 800 / 1200 W\n- Rotation\n- Télécommande\n- Minuterie\n- Sécurité anti-chute\n\n### Sécurité\nGardez-le à distance des tissus et éteignez-le avant de dormir : la minuterie est faite pour ça.\n\nGarantie : 12 mois.",
     "metaTitle": "Chauffage SONIC télécommande CEQR-1254GSC – Prix Maroc",
     "metaDescription": "Chauffage quartz SONIC CEQR-1254GSC 1200 W, télécommande, minuterie et rotation. " + STORE,
     "seo": {
       "titleAr": "شوفاج سونيك بالتيليكوموند CEQR-1254GSC بالمغرب",
       "metaDescriptionAr": "مدفأة كوارتز سونيك CEQR-1254GSC بقوة 1200 واط مع جهاز تحكم ومؤقت ودوران و3 درجات، ضمان 12 شهرا. " + STORE_AR,
       "shortDescriptionAr": "مدفأة كوارتز سونيك CEQR-1254GSC بقوة 1200 واط مع جهاز التحكم عن بعد ومؤقت ودوران وثلاث درجات (400/800/1200 واط).",
       "descriptionAr": "سونيك CEQR-1254GSC أكثر مدفأة كوارتز تجهيزا عندنا: إضافة إلى الدوران والدرجات الثلاث، يتم التحكم فيها عن بعد وتنطفئ وحدها بفضل المؤقت.\n\n### جهاز التحكم والمؤقت\nغيروا القوة من الكنبة أو السرير، وبرمجوا وقت التوقف.\n\n### ثلاث درجات\n400 واط لغرفة النوم، 800 واط لغرفة متوسطة، 1200 واط لتسخين سريع.\n\n### المواصفات\n- الموديل: CEQR-1254GSC\n- القوة: 400 / 800 / 1200 واط\n- الدوران\n- جهاز التحكم عن بعد\n- مؤقت\n- حماية عند السقوط\n\n### السلامة\nأبعدوها عن الثوب وأطفئوها قبل النوم، والمؤقت مفيد لهذا.\n\nالضمان: 12 شهرا.",
       "keywords": "chauffage SONIC télécommande, SONIC CEQR-1254GSC, chauffage quartz minuterie, chauffage rotatif 1200W, prix chauffage SONIC télécommande Maroc",
       "keywordsAr": "شوفاج سونيك بالتيليكوموند, مدفأة بجهاز التحكم, شوفاج كيدور, دفاية كهربائية 1200 واط, ثمن شوفاج سونيك في المغرب"
     },
     "faq": [faq("La minuterie éteint-elle le chauffage seule ?", "Oui, programmez la durée et l'appareil s'arrête automatiquement.", "واش المؤقت كيطفي الشوفاج بوحدو؟", "إيه، كتبرمجو الوقت وكيطفى بوحدو."), HEATER_NIGHT]
    },
    [("Chauffage électrique quartz SONIC CEQR-1254GSC 1200 W avec télécommande", "مدفأة كهربائية كوارتز سونيك CEQR-1254GSC بقوة 1200 واط مع جهاز التحكم"),
     ("Chauffage SONIC CEQR-1254GSC et sa télécommande", "مدفأة سونيك CEQR-1254GSC وجهاز التحكم")],
    specs_from=["Marque", "Modèle", "Type", "Puissance maximale", "Niveaux de puissance", "Fonction de rotation", "Télécommande", "Minuterie", "Sécurité anti-chute", "Garantie"])

add("chauffage-lectrique-general-800w-chauffage-dappoint-pour-la-maison",
    ["Puissance « 800W (selon les informations fournies) » : à confirmer sur l'étiquette. Garantie non renseignée."],
    {
     "name": "Chauffage électrique d'appoint GENERAL 800 W",
     "nameAr": "مدفأة كهربائية جنرال 800 واط",
     "shortDescription": "Chauffage d'appoint GENERAL de 800 W avec grille de protection et poignée de transport, pour réchauffer une petite pièce.",
     "description": "Le chauffage GENERAL est un appareil d'appoint simple de 800 W, pensé pour réchauffer une petite pièce : la chambre d'un enfant, un bureau ou une salle de bain avant la douche (à bonne distance de l'eau).\n\n### Pratique à déplacer\nSa poignée intégrée permet de le porter d'une pièce à l'autre selon le moment de la journée.\n\n### Grille de protection\nUne grille frontale empêche l'accès direct aux éléments chauffants.\n\n### Caractéristiques\n- Puissance : 800 W\n- Usage : chauffage d'appoint\n- Poignée de transport intégrée\n- Grille de protection frontale\n\n### Bon usage\nPosez-le sur un sol plat, loin des rideaux, des couvertures et des points d'eau, et débranchez-le après usage.",
     "metaTitle": "Chauffage d'appoint GENERAL 800 W – Prix Maroc",
     "metaDescription": "Chauffage d'appoint GENERAL 800 W avec grille de protection et poignée, pour chambre ou bureau. " + STORE,
     "seo": {
       "titleAr": "مدفأة كهربائية جنرال 800 واط – الثمن في المغرب",
       "metaDescriptionAr": "مدفأة كهربائية جنرال بقوة 800 واط مع شبكة حماية ومقبض للنقل، لغرفة النوم أو المكتب. " + STORE_AR,
       "shortDescriptionAr": "مدفأة كهربائية جنرال بقوة 800 واط مع شبكة حماية ومقبض للنقل، لتدفئة غرفة صغيرة.",
       "descriptionAr": "مدفأة جنرال جهاز بسيط بقوة 800 واط لتدفئة غرفة صغيرة: غرفة الطفل أو المكتب.\n\n### سهلة النقل\nمقبض مدمج لنقلها بين الغرف.\n\n### شبكة حماية\nشبكة أمامية تمنع لمس عناصر التسخين مباشرة.\n\n### المواصفات\n- القوة: 800 واط\n- الاستعمال: تدفئة إضافية\n- مقبض للنقل\n- شبكة حماية أمامية\n\n### الاستعمال\nضعوها على أرض مستوية بعيدا عن الستائر والأغطية والماء، وافصلوها بعد الاستعمال.",
       "keywords": "chauffage GENERAL 800W, chauffage d'appoint 800W, petit chauffage électrique, chauffage chambre, prix chauffage GENERAL Maroc",
       "keywordsAr": "شوفاج جنرال, مدفأة كهربائية 800 واط, شوفاج صغير, دفاية كهربائية, ثمن شوفاج جنرال في المغرب"
     },
     "faq": [HEATER_NIGHT]
    },
    [("Chauffage électrique d'appoint GENERAL 800 W", "مدفأة كهربائية جنرال بقوة 800 واط"),
     ("Chauffage GENERAL 800 W, grille et poignée", "مدفأة جنرال 800 واط، الشبكة والمقبض")],
    specs_from=["Marque", "Type", "Puissance", "Utilisation", "Transport", "Protection"])

add("chauffage-lectrique-quartz-venezia-1200w-3-tubes-chauffants",
    ["Nombre de niveaux et sécurités anti-chute non renseignés."],
    {
     "name": "Chauffage électrique quartz VENEZIA 1200 W 3 tubes",
     "nameAr": "مدفأة كهربائية كوارتز فينيزيا 1200 واط بثلاثة أنابيب",
     "shortDescription": "Chauffage quartz VENEZIA de 1200 W à trois tubes, interrupteurs indépendants, base circulaire stable et finition noir et gris.",
     "description": "Le chauffage VENEZIA à trois tubes quartz se distingue par sa base circulaire, plus stable au sol, et sa finition noir et gris qui se fond dans un salon moderne.\n\n### Choisir sa chaleur\nDes interrupteurs indépendants allument les tubes un par un : vous adaptez la chaleur à la pièce et au moment, jusqu'à 1200 W.\n\n### Chaleur par rayonnement\nLe quartz chauffe par rayonnement : la chaleur se sent immédiatement face à l'appareil, sans attendre que l'air de la pièce se réchauffe.\n\n### Caractéristiques\n- Puissance maximale : 1200 W\n- Éléments chauffants : 3 tubes quartz\n- Commande : interrupteurs\n- Grille de protection\n- Couleur : noir et gris\n\n### Bon usage\nPlacez-le à distance des tissus et éteignez-le en quittant la pièce.\n\nGarantie : 12 mois.",
     "metaTitle": "Chauffage quartz VENEZIA 1200 W 3 tubes – Prix Maroc",
     "metaDescription": "Chauffage quartz VENEZIA 1200 W, 3 tubes, base circulaire stable, garantie 12 mois. " + STORE,
     "seo": {
       "titleAr": "شوفاج كوارتز فينيزيا 1200 واط بالمغرب",
       "metaDescriptionAr": "مدفأة كهربائية كوارتز فينيزيا 1200 واط بثلاثة أنابيب وقاعدة دائرية ثابتة، أسود ورمادي، ضمان 12 شهرا. " + STORE_AR,
       "shortDescriptionAr": "مدفأة كوارتز فينيزيا بقوة 1200 واط وثلاثة أنابيب، أزرار مستقلة وقاعدة دائرية ثابتة، بلون أسود ورمادي.",
       "descriptionAr": "مدفأة فينيزيا بثلاثة أنابيب كوارتز، تتميز بقاعدة دائرية أكثر ثباتا ولون أسود ورمادي يناسب الصالون العصري.\n\n### اختيار الحرارة\nأزرار مستقلة تشغل الأنابيب واحدا واحدا حتى 1200 واط.\n\n### حرارة بالإشعاع\nالكوارتز يسخن بالإشعاع: تحسون بالحرارة مباشرة أمام الجهاز.\n\n### المواصفات\n- القوة القصوى: 1200 واط\n- 3 أنابيب كوارتز\n- التحكم: أزرار\n- شبكة حماية\n- اللون: أسود ورمادي\n\n### الاستعمال\nأبعدوها عن الثوب وأطفئوها عند الخروج من الغرفة.\n\nالضمان: 12 شهرا.",
       "keywords": "chauffage VENEZIA 1200W, chauffage quartz 3 tubes, chauffage électrique noir, chauffage d'appoint salon, prix chauffage VENEZIA Maroc",
       "keywordsAr": "شوفاج فينيزيا, مدفأة كوارتز 1200 واط, شوفاج الضو, دفاية كهربائية, ثمن شوفاج فينيزيا في المغرب"
     },
     "faq": [faq("Comment régler la puissance ?", "Chaque tube a son interrupteur : allumez-en un, deux ou trois selon la chaleur souhaitée.", "كيفاش نبدل القوة؟", "كل أنبوب عندو زر ديالو: شعلو واحد، جوج ولا تلاتة حسب السخانة اللي بغيتو."), HEATER_NIGHT]
    },
    [("Chauffage électrique quartz VENEZIA 1200 W à 3 tubes, noir et gris", "مدفأة كهربائية كوارتز فينيزيا 1200 واط بثلاثة أنابيب، أسود ورمادي"),
     ("Chauffage VENEZIA 1200 W, base circulaire", "مدفأة فينيزيا 1200 واط، القاعدة الدائرية")],
    specs_from=["Marque", "Type", "Puissance maximale", "Éléments chauffants", "Couleur", "Commande", "Alimentation"])

# ── Mis-categorised kitchen items (frying pans filed under Chauffage) ─────────
add("tatch-pole-20cm-granit",
    ["Catégorie : c'est une poêle à frire, rangée dans « Chauffage ». À déplacer vers une catégorie cuisine dans l'admin."],
    {
     "name": "Poêle Tatch 20 cm revêtement granit",
     "nameAr": "مقلاة تاتش 20 سم بطلاء الغرانيت",
     "shortDescription": "Poêle Tatch de 20 cm à revêtement antiadhésif effet granit, pour les œufs, les crêpes et les petites cuissons du quotidien.",
     "description": "La poêle Tatch de 20 cm est le petit format de la cuisine de tous les jours : œufs au plat, omelette, crêpes, légumes sautés pour une ou deux personnes.\n\n### Revêtement effet granit\nLe revêtement antiadhésif limite l'adhérence des aliments, permet de cuisiner avec peu de matière grasse et facilite le nettoyage.\n\n### Entretien\nLavez-la à l'eau chaude avec une éponge douce, et utilisez des ustensiles en bois ou en silicone pour préserver le revêtement. Évitez de la chauffer à vide à feu vif.",
     "metaTitle": "Poêle Tatch 20 cm revêtement granit – Prix Maroc",
     "metaDescription": "Poêle Tatch 20 cm à revêtement antiadhésif effet granit, pour œufs, crêpes et cuissons rapides. " + STORE,
     "seo": {
       "titleAr": "مقلاة تاتش 20 سم بطلاء الغرانيت – الثمن في المغرب",
       "metaDescriptionAr": "مقلاة تاتش 20 سم بطلاء غرانيت مانع للالتصاق، للبيض والكريب والطبخ السريع. " + STORE_AR,
       "shortDescriptionAr": "مقلاة تاتش 20 سم بطلاء غرانيت مانع للالتصاق، للبيض والكريب والطبخ اليومي السريع.",
       "descriptionAr": "مقلاة تاتش 20 سم هي الحجم الصغير للطبخ اليومي: بيض، أومليت، كريب أو خضر مقلية لشخص أو شخصين.\n\n### طلاء الغرانيت\nالطلاء المانع للالتصاق يقلل التصاق الطعام ويسمح بالطبخ بقليل من الزيت ويسهل التنظيف.\n\n### العناية\nاغسلوها بالماء الساخن وإسفنجة لينة، واستعملوا ملاعق من الخشب أو السيليكون.",
       "keywords": "poêle Tatch 20 cm, poêle granit, poêle antiadhésive, petite poêle à frire, prix poêle Tatch Maroc",
       "keywordsAr": "مقلاة تاتش, مقلاة غرانيت, طاوة, مقلاة 20 سم, ثمن المقلاة في المغرب"
     }
    },
    [("Poêle Tatch 20 cm revêtement granit", "مقلاة تاتش 20 سم بطلاء الغرانيت")])

add("tatch-pole-20cm-en-granit",
    ["Catégorie : poêle à frire rangée dans « Chauffage ».",
     "Taille : le nom indique 20 cm, l'ancienne description 28 cm, et le prix (249 DH) diffère de la poêle 20 cm à 199 DH. Vérifier la taille réelle ; le texte ne cite pas de diamètre."],
    {
     "nameAr": "مقلاة تاتش بطلاء الغرانيت",
     "shortDescription": "Poêle Tatch à revêtement antiadhésif effet granit, pour saisir, dorer et sauter avec peu de matière grasse.",
     "description": "Cette poêle Tatch à revêtement effet granit est faite pour les cuissons du quotidien : viande et poisson saisis, légumes sautés, œufs ou crêpes.\n\n### Antiadhésif effet granit\nLe revêtement limite l'adhérence des aliments, permet de cuisiner avec peu de matière grasse et se nettoie facilement.\n\n### Entretien\nLavez-la à l'eau chaude avec une éponge douce, utilisez des ustensiles en bois ou en silicone, et évitez de la chauffer à vide à feu vif pour préserver le revêtement.",
     "metaTitle": "Poêle Tatch antiadhésive effet granit – Prix Maroc",
     "metaDescription": "Poêle Tatch à revêtement antiadhésif effet granit, pour saisir et sauter avec peu de matière grasse. " + STORE,
     "seo": {
       "titleAr": "مقلاة تاتش غرانيت مانعة للالتصاق بالمغرب",
       "metaDescriptionAr": "مقلاة تاتش بطلاء غرانيت مانع للالتصاق، للقلي والتحمير بقليل من الزيت. " + STORE_AR,
       "shortDescriptionAr": "مقلاة تاتش بطلاء غرانيت مانع للالتصاق، للقلي والتحمير بقليل من الزيت.",
       "descriptionAr": "مقلاة تاتش بطلاء الغرانيت للطبخ اليومي: لحم وسمك، خضر مقلية، بيض أو كريب.\n\n### مانعة للالتصاق\nالطلاء يقلل التصاق الطعام ويسمح بالطبخ بقليل من الزيت ويسهل التنظيف.\n\n### العناية\nاغسلوها بالماء الساخن وإسفنجة لينة، واستعملوا ملاعق من الخشب أو السيليكون، ولا تسخنوها فارغة على نار قوية.",
       "keywords": "poêle Tatch granit, poêle antiadhésive, poêle effet granit, poêle à frire, prix poêle Tatch Maroc",
       "keywordsAr": "مقلاة تاتش, مقلاة غرانيت, طاوة مانعة للالتصاق, مقلاة, ثمن مقلاة تاتش في المغرب"
     }
    },
    [("Poêle Tatch à revêtement antiadhésif effet granit", "مقلاة تاتش بطلاء غرانيت مانع للالتصاق")])

out = os.path.join(HERE, "heating-16.json")
json.dump(P, open(out, "w"), ensure_ascii=False, indent=1)
for p in P:
    c = p["changes"]; s = c["seo"]
    print(f'{p["slug"][:52]:52} t{len(c["metaTitle"]):3} d{len(c["metaDescription"]):4} tAr{len(s["titleAr"]):3} dAr{len(s["metaDescriptionAr"]):4} w{len(c["description"].split()):4}')
