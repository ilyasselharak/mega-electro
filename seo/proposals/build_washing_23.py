# -*- coding: utf-8 -*-
# Batch "washing-23": washing machines + the oven and 2 TVs that still named Electro Darna.
# Facts only from the store database (backups/seo/after-fridges/wash-current.json). Contradicted values are left out and flagged.
import json, os
HERE = os.path.dirname(__file__)
cur = {p["slug"]: p for p in json.load(open(os.path.join(HERE, "../../backups/seo/after-fridges/wash-current.json"), encoding="utf-8"))}
P = []
ST = "Livraison partout au Maroc, paiement à la livraison."
STA = "توصيل لكل المغرب والدفع عند الاستلام."
def S(l, v): return {"label": l, "value": v}
def faq(q, a, qa, aa): return {"question": q, "answer": a, "questionAr": qa, "answerAr": aa}
def txt(intro, sections, specs, tail="", ar=False):
    b = intro + "\n\n" + "\n\n".join(f"### {h}\n{t}" for h, t in sections)
    if specs: b += ("\n\n### المواصفات\n" if ar else "\n\n### Caractéristiques\n") + "\n".join(f"- {l}" for l in specs)
    return b + ("\n\n" + tail if tail else "")
def add(slug, verify, c, alt, altAr, specs=None, note=None):
    keys = cur[slug]["imgs"]
    c["imageAlts"] = [{"key": k, "alt": alt if i == 0 else f"{alt}, vue {i + 1}", "altAr": altAr if i == 0 else f"{altAr}، صورة {i + 1}"} for i, k in enumerate(keys)]
    e = {"kind": "product", "slug": slug, "source": "washing-23", "sources": [], "verify": verify, "specsVerified": False, "changes": c}
    if specs:
        c["specs"] = specs; e["specsVerified"] = True
        e["sources"] = [note or "Valeurs de la fiche Mega Electro existante (lignes hors sujet retirées, aucune valeur ajoutée)"]
    P.append(e)

TWIN = faq("Comment fonctionne une machine semi-automatique à double bac ?", "On lave dans le premier bac, puis on transfère le linge à la main dans le second pour l'essorage. Le remplissage se fait au tuyau ou au seau, et la vidange par le tuyau d'évacuation.",
           "كيفاش كتخدم ماكينة التصبين بجوج بيدوات؟", "كتصبنو فالبيدو الأول، ومن بعد كتحولو الحوايج باليد للبيدو التاني باش يعصرهم. الما كيتعمر بالتيو ولا بالسطل وكيخرج من تيو الصرف.")
TOP = faq("Quel est l'avantage du chargement par le haut ?", "On charge et on ajoute du linge sans se baisser, et la machine prend peu de place au sol en largeur.",
          "شنو الفايدة ديال الحلان من الفوق؟", "كتحطو الحوايج بلا ما تحنيو، والماكينة ماكتاخدش بزاف ديال البلاصة.")
INST = faq("Quels branchements faut-il prévoir ?", "Une arrivée d'eau froide, une évacuation et une prise électrique avec terre, sur un sol plan.",
           "شنو خاصني نوجد للتركيب؟", "مدخل ديال الما البارد، مخرج ديال الصرف وبريز فيه الأرضي، على أرض مستوية.")
CAP = lambda kg, who, who_ar: faq(f"Pour combien de personnes convient {kg} kg ?", f"Une capacité de {kg} kg convient en général {who}.", f"{kg} كيلو مناسبة لشحال من شخص؟", f"سعة {kg} كيلو كتناسب عادة {who_ar}.")

def wm(slug, verify, name, nameAr, short, shortAr, intro, introAr, secs, secsAr, specs_fr, specs_ar, tail, tailAr, mt, md, tAr, mdAr, kw, kwAr, faqs, alt, altAr, specs=None, note=None):
    add(slug, verify, {"name": name, "nameAr": nameAr, "shortDescription": short,
        "description": txt(intro, secs, specs_fr, tail), "metaTitle": mt, "metaDescription": md + " " + ST,
        "seo": {"titleAr": tAr, "metaDescriptionAr": mdAr + " " + STA, "shortDescriptionAr": shortAr,
                "descriptionAr": txt(introAr, secsAr, specs_ar, tailAr, ar=True), "keywords": kw, "keywordsAr": kwAr},
        "faq": faqs}, alt, altAr, specs, note)

# ── Front-load / automatic ──────────────────────────────────────────────────
wm("machine-laver-8kg-1400tr-inox", ["Essorage : le nom indique 1400 tr, la fiche 1200 tr (non cité).", "Finition : « INOX » dans le nom, « SILVER » dans la fiche (non citée).", "Référence Samsung exacte absente ; garantie vide."],
   "Lave-linge Samsung 8 kg", "غسالة ملابس سامسونج 8 كيلو",
   "Lave-linge Samsung de 8 kg, une capacité familiale pour laver en une fois les draps, les serviettes ou le linge de la semaine.",
   "غسالة ملابس سامسونج بسعة 8 كيلو، سعة عائلية لغسل الأغطية والمناشف أو ملابس الأسبوع دفعة واحدة.",
   "Ce lave-linge Samsung de 8 kg s'adresse aux familles de trois à cinq personnes. Une capacité de 8 kg permet de regrouper les lessives et de laver une couette légère ou un lot de serviettes en un seul cycle.",
   "غسالة سامسونج بسعة 8 كيلو للعائلات من ثلاثة إلى خمسة أفراد، تسمح بجمع الغسيل وغسل غطاء خفيف أو مجموعة مناشف في دورة واحدة.",
   [("Avant de commander", "Demandez à notre équipe la référence exacte et la vitesse d'essorage du modèle disponible : nous vous les confirmons par téléphone ou sur WhatsApp.")],
   [("قبل الطلب", "اسألوا فريقنا عن المرجع الدقيق وسرعة العصر للموديل المتوفر، نؤكدها لكم بالهاتف أو واتساب.")],
   ["Marque : Samsung", "Capacité : 8 kg"], ["العلامة: سامسونج", "السعة: 8 كيلو"], "", "",
   "Machine à laver Samsung 8 kg – Prix Maroc", "Lave-linge Samsung 8 kg pour toute la famille, référence et essorage confirmés par notre équipe.",
   "غسالة ملابس سامسونج 8 كيلو بالمغرب", "غسالة ملابس سامسونج 8 كيلو للعائلة، المرجع وسرعة العصر يؤكدهما فريقنا.",
   "lave-linge Samsung 8 kg, machine à laver Samsung, lave-linge 8 kg Maroc, machine à laver familiale, prix machine à laver Samsung Maroc",
   "غسالة سامسونج 8 كيلو, ماكينة التصبين سامسونج, ماكينة الصابون, غسالة عائلية, ثمن ماكينة التصبين في المغرب",
   [CAP(8, "à un foyer de trois à cinq personnes", "عائلة من 3 حتى 5 أفراد"), INST],
   "Lave-linge Samsung 8 kg", "غسالة ملابس سامسونج 8 كيلو",
   specs=[S("Marque", "Samsung"), S("Capacité", "8 kg")], note="Valeurs de la fiche ; vitesse d'essorage et finition contradictoires retirées")

wm("machine-laver-7kg-venezia-t7000s", ["Garantie « 12 mois » dans les caractéristiques mais champ garantie vide."],
   "Lave-linge Venezia 7 kg T7000S A+++", "غسالة ملابس فينيزيا 7 كيلو T7000S فئة A+++",
   "Lave-linge automatique Venezia T7000S de 7 kg, classe A+++, 152 kWh/an, affichage LED et lavage rapide.",
   "غسالة أوتوماتيكية فينيزيا T7000S بسعة 7 كيلو، فئة A+++، 152 كيلوواط ساعة سنويا، شاشة LED وغسيل سريع.",
   "Le Venezia T7000S est un lave-linge automatique de 7 kg, adapté à un couple ou une famille de trois personnes. Avec 40 cm de profondeur, il se loge dans les salles de bain et buanderies étroites.",
   "فينيزيا T7000S غسالة أوتوماتيكية بسعة 7 كيلو لزوجين أو عائلة من ثلاثة أفراد. بعمق 40 سم فقط، تناسب الحمامات الضيقة.",
   [("Économe", "Classé A+++, il consomme 152 kWh par an selon sa fiche. Les fonctions économie d'énergie et Eau ECO réduisent encore la consommation sur les petites charges."),
    ("Pratique", "Affichage LED, départ automatique, lavage rapide et fonctionnement silencieux.")],
   [("اقتصادية", "فئة A+++ واستهلاك 152 كيلوواط ساعة في السنة، مع وظائف توفير الطاقة والماء."), ("عملية", "شاشة LED، تشغيل أوتوماتيكي، غسيل سريع وهدوء.")],
   ["Capacité : 7 kg", "Classe énergétique : A+++", "Consommation : 152 kWh/an", "Puissance de lavage : 1950 W", "Dimensions (L × P × H) : 60 × 40 × 87 cm", "Pression d'eau : 0,05–0,8 MPa"],
   ["السعة: 7 كيلو", "فئة الطاقة: A+++", "الاستهلاك: 152 كيلوواط ساعة في السنة", "الأبعاد: 60 × 40 × 87 سم"], "Garantie : 12 mois.", "الضمان: 12 شهرا.",
   "Lave-linge Venezia 7 kg T7000S A+++ – Prix Maroc", "Lave-linge Venezia T7000S 7 kg, classe A+++, 40 cm de profondeur, affichage LED.",
   "غسالة فينيزيا 7 كيلو T7000S بالمغرب", "غسالة فينيزيا T7000S بسعة 7 كيلو، فئة A+++، عمق 40 سم وشاشة LED.",
   "lave-linge Venezia 7 kg, Venezia T7000S, machine à laver A+++, lave-linge faible profondeur, prix machine à laver Venezia Maroc",
   "غسالة فينيزيا 7 كيلو, ماكينة التصبين فينيزيا, غسالة اقتصادية, ماكينة الصابون, ثمن غسالة فينيزيا في المغرب",
   [faq("Quelle est sa profondeur ?", "40 cm, pour 60 cm de large et 87 cm de haut.", "شحال العمق ديالها؟", "40 سم، و60 سم عرض و87 سم طول."), INST],
   "Lave-linge Venezia T7000S 7 kg", "غسالة فينيزيا T7000S سعة 7 كيلو",
   specs=[S("Type", "Lave-linge automatique"), S("Marque", "Venezia"), S("Modèle", "T7000S"), S("Capacité de lavage", "7 kg"), S("Dimensions (L × P × H)", "60 × 40 × 87 cm"), S("Classe énergétique", "A+++"), S("Tension nominale", "220–230 V"), S("Fréquence nominale", "50 Hz"), S("Puissance de lavage nominale", "1950 W"), S("Pression d'eau", "0,05–0,8 MPa"), S("Consommation d'énergie", "152 kWh/an"), S("Garantie", "12 mois")])

wm("machine-laver-automatique-8kg-a-inverter-16-programmes", ["Caractéristiques d'origine = catégories et étiquettes d'une autre boutique (retirées). « WI948MX98K » conservé comme référence fournisseur, à confirmer."],
   "Lave-linge Daiko 8 kg Inverter A+++ 16 programmes", "غسالة دايكو 8 كيلو إنفرتر A+++ بـ16 برنامجا",
   "Lave-linge automatique Daiko de 8 kg à moteur Inverter, classe A+++ et 16 programmes, pour adapter chaque lavage au textile.",
   "غسالة أوتوماتيكية دايكو بسعة 8 كيلو بمحرك إنفرتر، فئة A+++ و16 برنامجا.",
   "Ce lave-linge Daiko de 8 kg réunit un moteur Inverter et 16 programmes. C'est une capacité familiale, pour trois à cinq personnes.",
   "غسالة دايكو بسعة 8 كيلو بمحرك إنفرتر و16 برنامجا، سعة عائلية لثلاثة إلى خمسة أفراد.",
   [("Moteur Inverter", "Un moteur Inverter ajuste sa vitesse au besoin du programme au lieu de tourner toujours à fond : il est en général plus silencieux et plus sobre."),
    ("16 programmes", "De quoi traiter séparément le coton, le synthétique, les délicats ou les lavages rapides.")],
   [("محرك إنفرتر", "يعدل سرعته حسب البرنامج، فيكون عادة أهدأ وأقل استهلاكا."), ("16 برنامجا", "للقطن والأنسجة الاصطناعية والرقيقة والغسيل السريع.")],
   ["Capacité : 8 kg", "Moteur : Inverter", "Classe énergétique : A+++", "Programmes : 16"], ["السعة: 8 كيلو", "محرك إنفرتر", "فئة الطاقة: A+++", "16 برنامجا"], "Garantie : 12 mois.", "الضمان: 12 شهرا.",
   "Lave-linge Daiko 8 kg Inverter A+++ – Prix Maroc", "Lave-linge Daiko 8 kg à moteur Inverter, classe A+++, 16 programmes, garantie 12 mois.",
   "غسالة دايكو 8 كيلو إنفرتر بالمغرب", "غسالة دايكو 8 كيلو بمحرك إنفرتر، فئة A+++، 16 برنامجا، ضمان 12 شهرا.",
   "lave-linge Daiko 8 kg, machine à laver Daiko Inverter, lave-linge 16 programmes, machine à laver A+++, prix machine à laver Daiko Maroc",
   "غسالة دايكو 8 كيلو, ماكينة التصبين دايكو, غسالة إنفرتر, ماكينة الصابون, ثمن غسالة دايكو في المغرب",
   [faq("Qu'apporte un moteur Inverter ?", "Il adapte sa vitesse au programme, ce qui le rend généralement plus silencieux et plus économe.", "شنو كيزيد محرك الإنفرتر؟", "كيبدل السرعة حسب البرنامج، وكيكون عادة هادئ وكيستهلك قل."), INST],
   "Lave-linge Daiko 8 kg Inverter A+++", "غسالة دايكو 8 كيلو إنفرتر A+++",
   specs=[S("Marque", "Daiko"), S("Référence fournisseur", "WI948MX98K"), S("Capacité", "8 kg"), S("Moteur", "Inverter"), S("Classe énergétique", "A+++"), S("Programmes", "16")], note="Valeurs du nom et de la fiche ; catégories/étiquettes d'une autre boutique retirées")

wm("alaska-9kg-inverter-1200-tr", ["Caractéristiques d'origine = catégories d'une autre boutique (retirées). « ALK-8000-1 » (pour un 9 kg) à confirmer.", "Garantie vide."],
   "Lave-linge Alaska 9 kg Inverter 1200 tr/min", "غسالة ألاسكا 9 كيلو إنفرتر 1200 دورة",
   "Lave-linge Alaska de 9 kg à moteur Inverter avec essorage à 1200 tr/min, pour les grandes familles.",
   "غسالة ألاسكا بسعة 9 كيلو بمحرك إنفرتر وعصر 1200 دورة، للعائلات الكبيرة.",
   "Le lave-linge Alaska de 9 kg vise les grandes familles : une capacité qui accepte les couettes, les rideaux ou une grosse lessive hebdomadaire.",
   "غسالة ألاسكا بسعة 9 كيلو للعائلات الكبيرة: تكفي للأغطية والستائر أو غسيل الأسبوع.",
   [("Inverter et 1200 tr/min", "Le moteur Inverter module sa vitesse selon le programme ; l'essorage à 1200 tr/min sort un linge peu humide.")],
   [("إنفرتر و1200 دورة", "محرك يعدل سرعته، وعصر 1200 دورة يخرج الملابس شبه جافة.")],
   ["Capacité : 9 kg", "Moteur : Inverter", "Essorage : 1200 tr/min"], ["السعة: 9 كيلو", "محرك إنفرتر", "العصر: 1200 دورة"], "", "",
   "Lave-linge Alaska 9 kg Inverter – Prix Maroc", "Lave-linge Alaska 9 kg à moteur Inverter et essorage 1200 tr/min pour les grandes familles.",
   "غسالة ألاسكا 9 كيلو إنفرتر بالمغرب", "غسالة ألاسكا 9 كيلو بمحرك إنفرتر وعصر 1200 دورة للعائلات الكبيرة.",
   "lave-linge Alaska 9 kg, machine à laver 9 kg Inverter, lave-linge 1200 tours, grande machine à laver, prix machine à laver Alaska Maroc",
   "غسالة ألاسكا 9 كيلو, ماكينة التصبين 9 كيلو, غسالة إنفرتر, ماكينة الصابون كبيرة, ثمن غسالة ألاسكا في المغرب",
   [CAP(9, "à une famille de cinq personnes ou plus", "عائلة من 5 أفراد ولا كثر"), INST],
   "Lave-linge Alaska 9 kg Inverter", "غسالة ألاسكا 9 كيلو إنفرتر",
   specs=[S("Marque", "Alaska"), S("Référence fournisseur", "ALK-8000-1"), S("Capacité", "9 kg"), S("Moteur", "Inverter"), S("Vitesse d'essorage", "1200 tr/min")], note="Valeurs du nom et de la fiche ; catégories d'une autre boutique retirées")

wm("machine-a-laver-candy-8kg-smart-inverter-a", ["Classe énergétique : « A+++ » dans le nom, « A » dans la fiche (non citée).", "Référence Candy et garantie absentes."],
   "Lave-linge Candy 8 kg Smart Inverter", "غسالة كاندي 8 كيلو Smart Inverter",
   "Lave-linge Candy de 8 kg Smart Inverter avec essorage à 1200 tr/min, finition silver.",
   "غسالة كاندي بسعة 8 كيلو Smart Inverter بعصر 1200 دورة ولون فضي.",
   "Le lave-linge Candy Smart Inverter de 8 kg convient à une famille de trois à cinq personnes, dans une finition silver qui change du blanc habituel.",
   "غسالة كاندي Smart Inverter بسعة 8 كيلو لعائلة من ثلاثة إلى خمسة أفراد، بلون فضي.",
   [("Smart Inverter", "Le moteur Inverter ajuste sa vitesse au programme, avec un fonctionnement généralement plus discret."), ("Essorage 1200 tr/min", "Un bon niveau pour un linge qui sèche vite sur l'étendoir.")],
   [("Smart Inverter", "محرك يعدل سرعته حسب البرنامج."), ("عصر 1200 دورة", "ملابس تجف بسرعة.")],
   ["Capacité : 8 kg", "Essorage : 1200 tr/min", "Moteur : Inverter", "Couleur : silver"], ["السعة: 8 كيلو", "العصر: 1200 دورة", "اللون: فضي"], "", "",
   "Lave-linge Candy 8 kg Smart Inverter – Prix Maroc", "Lave-linge Candy Smart Inverter 8 kg, essorage 1200 tr/min, finition silver.",
   "غسالة كاندي 8 كيلو إنفرتر بالمغرب", "غسالة كاندي Smart Inverter بسعة 8 كيلو وعصر 1200 دورة ولون فضي.",
   "lave-linge Candy 8 kg, Candy Smart Inverter, machine à laver silver, lave-linge 1200 tours, prix machine à laver Candy Maroc",
   "غسالة كاندي 8 كيلو, ماكينة التصبين كاندي, غسالة إنفرتر, ماكينة الصابون فضية, ثمن غسالة كاندي في المغرب",
   [CAP(8, "à un foyer de trois à cinq personnes", "عائلة من 3 حتى 5 أفراد"), INST],
   "Lave-linge Candy 8 kg Smart Inverter silver", "غسالة كاندي 8 كيلو Smart Inverter فضية",
   specs=[S("Marque", "Candy"), S("Capacité", "8 kg"), S("Vitesse d'essorage", "1200 tr/min"), S("Couleur", "Silver")], note="Valeurs de la fiche ; classe énergétique contradictoire retirée")

wm("samsung-mal-ww80t3040bsmf-8kg-1400t-silver-samsung", ["Noise « facteur 4 » non repris. Vitesse 1400 tr/min issue du nom."],
   "Lave-linge Samsung WW80T3040BS 8 kg 1400 tr/min silver", "غسالة سامسونج WW80T3040BS سعة 8 كيلو 1400 دورة فضية",
   "Lave-linge Samsung WW80T3040BS de 8 kg, 1400 tr/min, 48 litres d'eau par cycle et 62 kWh pour 100 cycles.",
   "غسالة سامسونج WW80T3040BS بسعة 8 كيلو، 1400 دورة، 48 لترا من الماء في الدورة و62 كيلوواط ساعة لكل 100 دورة.",
   "Le Samsung WW80T3040BS est un lave-linge frontal de 8 kg en finition silver, avec un essorage à 1400 tr/min.",
   "سامسونج WW80T3040BS غسالة أمامية بسعة 8 كيلو بلون فضي وعصر 1400 دورة.",
   [("Lire l'étiquette énergie", "Sa fiche indique la classe C de la nouvelle étiquette européenne, 62 kWh pour 100 cycles et 48 litres d'eau par cycle. Depuis 2021, l'échelle va de A à G sans « + » : une classe C actuelle n'est pas comparable à l'ancien « A+++ »."),
    ("Essorage 1400 tr/min", "Le linge sort moins humide et sèche plus vite.")],
   [("بطاقة الطاقة", "فئة C في البطاقة الأوروبية الجديدة، 62 كيلوواط ساعة لكل 100 دورة و48 لترا من الماء. منذ 2021 السلم من A إلى G بدون إضافات."), ("عصر 1400 دورة", "الملابس تخرج أقل رطوبة.")],
   ["Référence : WW80T3040BS", "Capacité : 8 kg", "Essorage : 1400 tr/min", "Classe énergétique : C (étiquette 2021)", "Énergie : 62 kWh / 100 cycles", "Eau : 48 L par cycle", "Couleur : silver"],
   ["المرجع: WW80T3040BS", "السعة: 8 كيلو", "العصر: 1400 دورة", "فئة الطاقة: C", "الماء: 48 لترا في الدورة"], "Garantie : 12 mois.", "الضمان: 12 شهرا.",
   "Lave-linge Samsung WW80T3040BS 8 kg – Prix Maroc", "Lave-linge Samsung WW80T3040BS 8 kg, 1400 tr/min, 48 L d'eau par cycle, garantie 12 mois.",
   "غسالة سامسونج WW80T3040BS سعة 8 كيلو بالمغرب", "غسالة سامسونج WW80T3040BS بسعة 8 كيلو و1400 دورة و48 لترا من الماء، ضمان 12 شهرا.",
   "Samsung WW80T3040BS, lave-linge Samsung 8 kg 1400 tours, machine à laver Samsung silver, lave-linge frontal, prix lave-linge Samsung Maroc",
   "غسالة سامسونج 8 كيلو, ماكينة التصبين سامسونج, غسالة أمامية فضية, ماكينة الصابون, ثمن غسالة سامسونج في المغرب",
   [faq("Pourquoi la classe C ?", "C'est l'échelle de l'étiquette européenne de 2021 (A à G), plus exigeante que l'ancienne avec des « + ».", "علاش فئة C؟", "هادي البطاقة الأوروبية الجديدة ديال 2021 (من A حتى G)، وهي أصعب من القديمة."), INST],
   "Lave-linge Samsung WW80T3040BS 8 kg silver", "غسالة سامسونج WW80T3040BS سعة 8 كيلو فضية",
   specs=[S("Marque", "Samsung"), S("Référence", "WW80T3040BS"), S("Capacité nominale", "8 kg"), S("Vitesse d'essorage", "1400 tr/min"), S("Classe énergétique (étiquette 2021)", "C"), S("Consommation d'eau par cycle", "48 L"), S("Énergie pour 100 cycles", "62 kWh"), S("Couleur", "Silver")],
   note="Valeurs de l'ancienne description de la fiche et du nom")

# ── Top-load automatic ──────────────────────────────────────────────────────
wm("daiko-machine-laver-a-chargement-par-le-haut", ["Valeurs incohérentes non reprises : « Pression d'eau : IPX4 », « Puissance d'entrée maximale (ltr.) 51 », « 27,41 kWh » annuels.", "Garantie vide."],
   "Lave-linge Daiko 7 kg chargement par le haut WT933MX97K", "غسالة دايكو 7 كيلو تحميل علوي WT933MX97K",
   "Lave-linge Daiko WT933MX97K de 7 kg à chargement par le haut : essorage 1330 tr/min, 8 programmes, départ différé et sécurité enfant.",
   "غسالة دايكو WT933MX97K بسعة 7 كيلو وتحميل علوي: عصر 1330 دورة، 8 برامج، تشغيل مؤجل وقفل للأطفال.",
   "Le Daiko WT933MX97K est un lave-linge automatique à chargement par le haut, plus étroit qu'un frontal (52 cm de large), avec une cuve de 49 litres pour 7 kg de linge.",
   "دايكو WT933MX97K غسالة أوتوماتيكية بتحميل علوي، أضيق من الأمامية (52 سم)، بحوض 49 لترا لسبعة كيلو.",
   [("Bien équipé", "Huit programmes, dont trempage et lavage express, départ différé, verrouillage enfant, équilibrage automatique et mémoire en cas de coupure de courant."),
    ("Entretien", "Un filtre de nettoyage récupère peluches et fibres ; l'autodiagnostic signale les anomalies.")],
   [("تجهيز كامل", "8 برامج منها النقع والغسيل السريع، تشغيل مؤجل، قفل الأطفال وذاكرة عند انقطاع الكهرباء."), ("الصيانة", "فلتر للوبر وتشخيص ذاتي للأعطال.")],
   ["Capacité : 7 kg (cuve 49 L)", "Essorage : 1330 tr/min", "Programmes : 8", "Classe énergétique : A+++", "Bruit : 62–72 dB", "Dimensions : 520 × 530 × 900 mm", "Poids net : 30 kg", "Couleur : silver"],
   ["السعة: 7 كيلو", "العصر: 1330 دورة", "8 برامج", "فئة الطاقة: A+++", "الأبعاد: 520 × 530 × 900 مم"], "", "",
   "Lave-linge Daiko 7 kg top WT933MX97K – Prix Maroc", "Lave-linge Daiko WT933MX97K 7 kg chargement par le haut, 1330 tr/min, 8 programmes, sécurité enfant.",
   "غسالة دايكو 7 كيلو تحميل علوي بالمغرب", "غسالة دايكو WT933MX97K بسعة 7 كيلو وتحميل علوي، 1330 دورة و8 برامج وقفل الأطفال.",
   "lave-linge Daiko top 7 kg, Daiko WT933MX97K, machine à laver chargement par le haut, lave-linge 52 cm, prix machine à laver Daiko Maroc",
   "غسالة دايكو تحميل علوي, ماكينة التصبين من الفوق, غسالة 7 كيلو, ماكينة الصابون دايكو, ثمن غسالة دايكو في المغرب",
   [TOP, INST], "Lave-linge Daiko WT933MX97K 7 kg chargement par le haut", "غسالة دايكو WT933MX97K سعة 7 كيلو تحميل علوي",
   specs=[S("Référence", "WT933MX97K"), S("Capacité", "7 kg"), S("Volume de la cuve", "49 L"), S("Vitesse d'essorage", "1330 tr/min"), S("Programmes", "8"), S("Classe énergétique", "A+++"), S("Niveau sonore", "62–72 dB"), S("Dimensions", "520 × 530 × 900 mm"), S("Poids net", "30 kg"), S("Tension", "220–240 V, 50 Hz"), S("Couleur", "Silver")],
   note="Valeurs de la fiche et de l'ancienne description ; valeurs incohérentes écartées")

wm("machine-laver-azatech-7kg-automatique-chargement-par-le-haut-gris", ["Ancienne description : « Disponible chez Electro Darna » (retiré). Référence Azatech absente."],
   "Lave-linge Azatech 7 kg chargement par le haut gris", "غسالة أزاتيك 7 كيلو تحميل علوي رمادية",
   "Lave-linge automatique Azatech de 7 kg à chargement par le haut, commande électronique, réglage du niveau d'eau et nettoyage de cuve.",
   "غسالة أوتوماتيكية أزاتيك بسعة 7 كيلو وتحميل علوي، تحكم إلكتروني وتعديل مستوى الماء وتنظيف الحوض.",
   "La machine à laver Azatech de 7 kg se charge par le haut et se pilote par un panneau électronique simple. Elle convient à un couple ou une famille de trois personnes.",
   "غسالة أزاتيك بسعة 7 كيلو بتحميل علوي ولوحة تحكم إلكترونية بسيطة، لزوجين أو عائلة من ثلاثة أفراد.",
   [("Des programmes pour tout", "Normal, Heavy (intensif), Soft (délicat), Fast (rapide), lavage seul, rinçage-essorage, essorage seul, Water Recycle, Air Dry et Tub Clean pour nettoyer la cuve."),
    ("Moins d'eau gaspillée", "Le niveau d'eau se règle selon la quantité de linge.")],
   [("برامج متعددة", "عادي، مكثف، رقيق، سريع، غسيل فقط، شطف وعصر، عصر فقط، إعادة تدوير الماء، تجفيف بالهواء وتنظيف الحوض."), ("ماء أقل", "مستوى الماء قابل للتعديل.")],
   ["Capacité : 7 kg", "Chargement par le haut", "Commande électronique", "Réglage du niveau d'eau", "Couvercle transparent fumé", "Couleur : gris foncé"], ["السعة: 7 كيلو", "تحميل علوي", "تحكم إلكتروني", "اللون: رمادي غامق"], "Garantie : 12 mois.", "الضمان: 12 شهرا.",
   "Lave-linge Azatech 7 kg chargement haut – Prix Maroc", "Lave-linge Azatech 7 kg chargement par le haut, 10 programmes dont nettoyage de cuve, garantie 12 mois.",
   "غسالة أزاتيك 7 كيلو تحميل علوي بالمغرب", "غسالة أزاتيك 7 كيلو بتحميل علوي و10 برامج منها تنظيف الحوض، ضمان 12 شهرا.",
   "lave-linge Azatech 7 kg, machine à laver chargement par le haut, lave-linge top 7 kg gris, machine à laver automatique, prix machine à laver Azatech Maroc",
   "غسالة أزاتيك, ماكينة التصبين من الفوق, غسالة 7 كيلو, ماكينة الصابون أوتوماتيك, ثمن غسالة أزاتيك في المغرب",
   [TOP, faq("À quoi sert Tub Clean ?", "C'est un programme de nettoyage de la cuve, à lancer à vide de temps en temps pour limiter les odeurs et les résidus.", "شنو هو Tub Clean؟", "برنامج كينقي البيدو، كتشغلوه خاوي من وقت لوقت باش ما تبقاش الريحة.")],
   "Lave-linge Azatech 7 kg chargement par le haut gris foncé", "غسالة أزاتيك 7 كيلو تحميل علوي رمادي غامق",
   specs=[S("Marque", "Azatech"), S("Capacité", "7 kg"), S("Chargement", "Par le haut"), S("Commande", "Électronique"), S("Programmes", "Normal, Heavy, Soft, Fast, Wash Only, Spin Only, Rinse-Spin, Water Recycle, Air Dry, Tub Clean"), S("Niveau d'eau", "Réglable"), S("Couleur", "Gris foncé")], note="Valeurs de l'ancienne description de la fiche")

wm("machine-laver-azatech-10-kg-chargement-par-le-haut-gris-fonc", ["Ancienne description : « Commandez … chez Electro Darna » (retiré). Lignes de programme et marketing regroupées dans les caractéristiques."],
   "Lave-linge Azatech 10 kg chargement par le haut gris foncé", "غسالة أزاتيك 10 كيلو تحميل علوي رمادي غامق",
   "Lave-linge Azatech WMA-10KG1004 de 10 kg à chargement par le haut, 10 programmes, réglage du niveau d'eau et verrouillage enfant.",
   "غسالة أزاتيك WMA-10KG1004 بسعة 10 كيلو وتحميل علوي، 10 برامج، تعديل مستوى الماء وقفل الأطفال.",
   "L'Azatech WMA-10KG1004 est un lave-linge de 10 kg à chargement par le haut, pour les grandes familles et les grosses lessives : couettes, draps et linge de toute la semaine.",
   "أزاتيك WMA-10KG1004 غسالة بسعة 10 كيلو بتحميل علوي للعائلات الكبيرة: أغطية وملابس الأسبوع كله.",
   [("Commandes simples", "Quatre boutons : Power, Program, Water Level et Start/Pause. Le verrouillage enfant (Child Lock) évite les manipulations involontaires."),
    ("10 programmes", "Normal, Heavy, Soft, Fast, Wash Only, Rinse-Spin, Spin Only, Water Recycle, Air Dry et Tub Clean.")],
   [("تحكم بسيط", "أربعة أزرار، وقفل الأطفال يمنع التشغيل غير المقصود."), ("10 برامج", "من الغسيل العادي إلى المكثف والرقيق والسريع وتنظيف الحوض.")],
   ["Référence : WMA-10KG1004-TL.PLC", "Capacité : 10 kg", "Chargement par le haut", "Commande électronique", "Verrouillage enfant", "Couleur : gris foncé"], ["المرجع: WMA-10KG1004", "السعة: 10 كيلو", "تحميل علوي", "قفل الأطفال", "اللون: رمادي غامق"], "Garantie : 12 mois.", "الضمان: 12 شهرا.",
   "Lave-linge Azatech 10 kg chargement haut – Prix Maroc", "Lave-linge Azatech 10 kg chargement par le haut, 10 programmes, verrouillage enfant, garantie 12 mois.",
   "غسالة أزاتيك 10 كيلو تحميل علوي بالمغرب", "غسالة أزاتيك 10 كيلو بتحميل علوي و10 برامج وقفل الأطفال، ضمان 12 شهرا.",
   "lave-linge Azatech 10 kg, Azatech WMA-10KG1004, machine à laver 10 kg chargement par le haut, grande machine à laver, prix machine à laver 10 kg Maroc",
   "غسالة أزاتيك 10 كيلو, ماكينة التصبين 10 كيلو, غسالة كبيرة من الفوق, ماكينة الصابون, ثمن غسالة 10 كيلو في المغرب",
   [CAP(10, "aux grandes familles et aux grosses lessives", "العائلات الكبيرة والغسيل الكثير"), TOP],
   "Lave-linge Azatech 10 kg chargement par le haut gris foncé", "غسالة أزاتيك 10 كيلو تحميل علوي رمادي غامق",
   specs=[S("Marque", "AZATECH"), S("Modèle", "WMA-10KG1004-TL.PLC"), S("Capacité", "10 kg"), S("Type de chargement", "Par le haut"), S("Couleur", "Gris foncé"), S("Commandes", "Panneau de commande électronique"), S("Programmes", "Normal, Heavy, Soft, Fast, Wash Only, Rinse-Spin, Spin Only, Water Recycle, Air Dry, Tub Clean"), S("Fonction sécurité", "Child Lock (verrouillage enfant)")],
   note="Valeurs de la fiche existante (lignes descriptives regroupées)")

wm("machine-laver-automatique-golden-star-12kg-chargement-par-le-haut-noir", ["Ancienne description : « Commandez … chez Electro Darna » (retiré). Référence absente."],
   "Lave-linge Golden Star 12 kg chargement par le haut noir", "غسالة غولدن ستار 12 كيلو تحميل علوي سوداء",
   "Lave-linge automatique Golden Star de 12 kg à chargement par le haut, écran LED, commandes tactiles et réglage du niveau d'eau.",
   "غسالة أوتوماتيكية غولدن ستار بسعة 12 كيلو وتحميل علوي، شاشة LED وأزرار لمس وتعديل مستوى الماء.",
   "Avec 12 kg de capacité, ce lave-linge Golden Star fait partie des plus grands de notre catalogue : il s'adresse aux familles nombreuses et à ceux qui lavent couvertures et tapis légers à la maison.",
   "بسعة 12 كيلو، غسالة غولدن ستار من أكبر الغسالات عندنا: للعائلات الكبيرة ولغسل البطانيات والزرابي الخفيفة في البيت.",
   [("Commande digitale", "Écran LED et touches tactiles, plusieurs programmes, réglage du niveau d'eau et touche Start/Pause."),
    ("Finition", "Noir avec couvercle brillant.")],
   [("تحكم رقمي", "شاشة LED وأزرار لمس وعدة برامج وتعديل مستوى الماء."), ("اللون", "أسود بغطاء لامع.")],
   ["Capacité : 12 kg", "Chargement par le haut", "Écran LED, commandes tactiles", "Réglage du niveau d'eau", "Couleur : noir / gris foncé"], ["السعة: 12 كيلو", "تحميل علوي", "شاشة LED", "اللون: أسود"], "Garantie : 12 mois.", "الضمان: 12 شهرا.",
   "Lave-linge Golden Star 12 kg – Prix Maroc", "Lave-linge Golden Star 12 kg chargement par le haut, écran LED et commandes tactiles, garantie 12 mois.",
   "غسالة غولدن ستار 12 كيلو بالمغرب", "غسالة غولدن ستار 12 كيلو بتحميل علوي وشاشة LED وأزرار لمس، ضمان 12 شهرا.",
   "lave-linge Golden Star 12 kg, machine à laver 12 kg, grande machine à laver chargement par le haut, lave-linge noir, prix machine à laver 12 kg Maroc",
   "غسالة غولدن ستار 12 كيلو, ماكينة التصبين كبيرة, غسالة 12 كيلو, ماكينة الصابون سوداء, ثمن غسالة 12 كيلو في المغرب",
   [CAP(12, "aux familles nombreuses et aux gros volumes de linge", "العائلات الكبيرة والغسيل الكثير"), TOP],
   "Lave-linge Golden Star 12 kg chargement par le haut noir", "غسالة غولدن ستار 12 كيلو تحميل علوي سوداء")

wm("machine-laver-automatique-golden-star-9kg-chargement-par-le-haut", ["Garantie : 12 mois (champ). Nombre de programmes non renseigné."],
   "Lave-linge Golden Star 9 kg chargement par le haut XQB90-1690", "غسالة غولدن ستار 9 كيلو تحميل علوي XQB90-1690",
   "Lave-linge automatique Golden Star XQB90-1690 de 9 kg à chargement par le haut, affichage digital et fonction Air Dry.",
   "غسالة أوتوماتيكية غولدن ستار XQB90-1690 بسعة 9 كيلو وتحميل علوي، شاشة رقمية ووظيفة التجفيف بالهواء.",
   "Le Golden Star XQB90-1690 lave 9 kg de linge, une capacité adaptée à une famille de quatre à six personnes, avec un chargement par le haut pratique.",
   "غولدن ستار XQB90-1690 تغسل 9 كيلو، مناسبة لعائلة من أربعة إلى ستة أفراد، بتحميل علوي عملي.",
   [("Programmes", "Plusieurs programmes adaptent le lavage aux textiles ; la fonction Air Dry ventile le linge en fin de cycle.")],
   [("البرامج", "عدة برامج حسب نوع الملابس، ووظيفة Air Dry في آخر الدورة.")],
   ["Référence : XQB90-1690", "Capacité : 9 kg", "Chargement par le haut", "Affichage digital", "Fonction Air Dry"], ["المرجع: XQB90-1690", "السعة: 9 كيلو", "تحميل علوي", "شاشة رقمية"], "Garantie : 12 mois.", "الضمان: 12 شهرا.",
   "Lave-linge Golden Star 9 kg XQB90-1690 – Prix Maroc", "Lave-linge Golden Star XQB90-1690 9 kg chargement par le haut, affichage digital, garantie 12 mois.",
   "غسالة غولدن ستار 9 كيلو XQB90-1690 بالمغرب", "غسالة غولدن ستار XQB90-1690 بسعة 9 كيلو وتحميل علوي وشاشة رقمية، ضمان 12 شهرا.",
   "lave-linge Golden Star 9 kg, Golden Star XQB90-1690, machine à laver 9 kg chargement par le haut, lave-linge top, prix machine à laver Golden Star Maroc",
   "غسالة غولدن ستار 9 كيلو, ماكينة التصبين من الفوق, غسالة 9 كيلو, ماكينة الصابون, ثمن غسالة غولدن ستار في المغرب",
   [CAP(9, "à une famille de quatre à six personnes", "عائلة من 4 حتى 6 أفراد"), TOP],
   "Lave-linge Golden Star XQB90-1690 9 kg chargement par le haut", "غسالة غولدن ستار XQB90-1690 سعة 9 كيلو تحميل علوي")

# ── Semi-automatic / twin tub ───────────────────────────────────────────────
def twin(slug, verify, brand, brandAr, kg, model, extra_fr, extra_ar, specs_fr, specs_ar, alt_extra="", altAr_extra="", specs=None, note=None, garantie=None, name=None, nameAr=None):
    g = f"Garantie : {garantie}." if garantie else ""
    gAr = {"12 mois": "الضمان: 12 شهرا.", "6 mois": "الضمان: 6 أشهر.", "3 mois": "الضمان: 3 أشهر."}.get(garantie, "")
    m = f" {model}" if model else ""
    k = f" {kg} kg" if kg else ""          # capacity left out when the store has none
    kk = f" {str(kg).replace(',', '.')} kg" if kg else ""  # keyword lists are comma-separated: no decimal comma
    kA = f" {kg} كيلو" if kg else ""
    de = f" de {kg} kg" if kg else ""
    bi = f" بسعة {kg} كيلو" if kg else ""
    wm(slug, verify, name or f"Machine à laver semi-automatique {brand}{k}{m}", nameAr or f"ماكينة تصبين نصف أوتوماتيكية {brandAr}{kA}{m}",
       f"Machine à laver semi-automatique {brand}{de} à double bac : lavage et essorage séparés, commandes manuelles simples.",
       f"ماكينة تصبين نصف أوتوماتيكية {brandAr}{bi} بحوضين: غسيل وعصر منفصلان وتحكم يدوي بسيط.",
       f"La {brand}{m} est une machine à laver semi-automatique{de} à double bac. Économique à l'achat et à l'usage, elle n'a pas besoin d'arrivée d'eau fixe : c'est la solution de nombreux foyers, des maisons de campagne et des locations.",
       f"{brandAr}{m} ماكينة تصبين نصف أوتوماتيكية{bi} بحوضين. اقتصادية في الشراء والاستعمال ولا تحتاج مدخل ماء ثابت.",
       [("Double bac", "Le linge est lavé dans le premier bac, puis transféré dans le second pour l'essorage. Vous pouvez laver une charge pendant que la précédente s'essore.")] + extra_fr,
       [("بحوضين", "الغسيل في الحوض الأول ثم العصر في الثاني، ويمكن غسل دفعة بينما تُعصر الأخرى.")] + extra_ar,
       specs_fr, specs_ar, g, gAr,
       f"Machine à laver semi-auto {brand}{k or m} – Prix Maroc",
       f"Machine à laver semi-automatique {brand}{k}{m if not kg else ''} à double bac, lavage et essorage séparés.",
       f"ماكينة تصبين {brandAr}{kA or m} بحوضين بالمغرب",
       f"ماكينة تصبين نصف أوتوماتيكية {brandAr}{bi or m} بحوضين، غسيل وعصر منفصلان.",
       f"machine à laver semi-automatique {brand}{kk}, machine à laver double bac{kk}, lave-linge semi automatique, machine à laver pas chère, prix machine semi-automatique Maroc",
       f"ماكينة التصبين نص أوتوماتيك, ماكينة تصبين بجوج بيدوات, غسالة {brandAr}{kA}, ماكينة الصابون رخيصة, ثمن ماكينة التصبين نصف أوتوماتيك في المغرب",
       [TWIN], f"Machine à laver semi-automatique {brand}{k}{m} double bac{alt_extra}", f"ماكينة تصبين نصف أوتوماتيكية {brandAr}{kA}{m} بحوضين{altAr_extra}", specs, note)

twin("machine-a-laver-semiautomatique-techvision-11kg", ["Caractéristiques identiques mot pour mot à l'Innova 13 kg (minuteries, moteurs) : vérifier qu'elles ne viennent pas d'un copier-coller.", "Garantie vide."],
     "Techvision", "تيكفيجن", 11, "XPB-110",
     [("Minuteries", "Lavage jusqu'à 15 minutes, essorage jusqu'à 5 minutes.")], [("المؤقت", "غسيل حتى 15 دقيقة وعصر حتى 5 دقائق.")],
     ["Capacité de lavage : 11 kg", "Capacité d'essorage : 9 kg", "Minuterie lavage : 15 min", "Minuterie essorage : 5 min", "Moteur de lavage : 480 W", "Moteur d'essorage : 180 W"],
     ["سعة الغسيل: 11 كيلو", "سعة العصر: 9 كيلو", "محرك الغسيل: 480 واط", "محرك العصر: 180 واط"],
     specs=[S("Modèle", "XPB-110"), S("Capacité de lavage", "11 kg"), S("Capacité d'essorage", "9 kg"), S("Minuterie lavage", "15 minutes"), S("Minuterie essorage", "5 minutes"), S("Moteur de lavage", "480 W"), S("Moteur d'essorage", "180 W")],
     note="Valeurs de la fiche et de l'ancienne description")
twin("machine-a-laver-semiautomatique-innova-13kg", ["Caractéristiques identiques mot pour mot à la Techvision 11 kg (minuteries, moteurs) : à vérifier sur l'appareil."],
     "Innova", "إينوفا", 13, "IN-130EGB",
     [("Minuteries", "Lavage jusqu'à 15 minutes, essorage jusqu'à 5 minutes.")], [("المؤقت", "غسيل حتى 15 دقيقة وعصر حتى 5 دقائق.")],
     ["Capacité de lavage : 13 kg", "Capacité d'essorage : 9 kg", "Minuterie lavage : 15 min", "Minuterie essorage : 5 min"],
     ["سعة الغسيل: 13 كيلو", "سعة العصر: 9 كيلو"], garantie="6 mois",
     specs=[S("Modèle", "IN-130EGB"), S("Capacité de lavage", "13 kg"), S("Capacité d'essorage", "9 kg"), S("Minuterie lavage", "15 minutes"), S("Minuterie essorage", "5 minutes")],
     note="Valeurs de la fiche ; puissances moteur identiques à un autre produit non reprises")
twin("machine-laver-semi-automatique-goldenstar-11kg", ["Ancienne description : « Disponible chez Electro Darna » (retiré). Référence absente."],
     "Goldenstar", "غولدن ستار", 11, "",
     [("Robuste", "Corps en plastique qui ne rouille pas et couvercle en verre.")], [("متينة", "جسم بلاستيكي لا يصدأ وغطاء زجاجي.")],
     ["Capacité de lavage : 11 kg", "Double bac (lavage + essorage)", "Couvercle en verre", "Corps en plastique"], ["السعة: 11 كيلو", "حوضان", "غطاء زجاجي"], garantie="12 mois",
     specs=[S("Marque", "Goldenstar"), S("Capacité de lavage", "11 kg"), S("Configuration", "Double cuve : lavage et essorage"), S("Couvercle", "Verre"), S("Corps", "Plastique")], note="Valeurs de l'ancienne description ; lignes marketing retirées")
twin("machine-laver-semi-automatique-65kg-mlt302111ge", [], "Elegance", "إليغانس", "6,5", "MLT302111GE", [], [], ["Capacité : 6,5 kg", "Double bac (lavage + essorage)", "Commandes manuelles"], ["السعة: 6.5 كيلو", "حوضان", "تحكم يدوي"], garantie="12 mois",
     name="Machine à laver semi-automatique Elegance 6,5 kg MLT302111GE", nameAr="ماكينة تصبين نصف أوتوماتيكية إليغانس 6.5 كيلو MLT302111GE")
twin("machine-laver-semi-automatique-hst-14-est-double-bac", ["Ancienne description : « Disponible chez Electro Darna » (retiré).", "Capacité non renseignée."],
     "Hüst", "هوست", None, "14-EST", [], [], ["Modèle : 14-EST", "Double bac", "Commandes rotatives", "Chargement par le dessus", "Couleur : blanc et gris"], ["الموديل: 14-EST", "حوضان", "اللون: أبيض ورمادي"], garantie="12 mois",
     name="Machine à laver semi-automatique Hüst 14-EST double bac", nameAr="ماكينة تصبين نصف أوتوماتيكية هوست 14-EST بحوضين")
twin("machine-laver-semi-automatique-kglg-10kg-double-bac", ["Motif « floral rose » et couleurs à confirmer sur photo."], "KGLG", "KGLG", 10, "XPB100-110", [], [], ["Modèle : XPB100-110", "Capacité : 10 kg", "Double bac", "Commandes mécaniques (3 boutons)", "Couleur : blanc et noir, décor floral"], ["الموديل: XPB100-110", "السعة: 10 كيلو", "حوضان", "اللون: أبيض وأسود"], garantie="12 mois")
twin("machine-laver-semi-automatique-kraft-xpb60-8c-6-kg", [], "Kraft", "كرافت", 6, "XPB60-8C",
     [("Visible", "Le couvercle transparent permet de suivre le lavage.")], [("شفافة", "غطاء شفاف لمتابعة الغسيل.")],
     ["Capacité : 6 kg", "Puissance de lavage : 300 W", "Chargement par le dessus", "Commandes mécaniques", "Couleur : blanc et bleu"], ["السعة: 6 كيلو", "قوة الغسيل: 300 واط", "اللون: أبيض وأزرق"], garantie="12 mois")

# Mini twin / single tub
wm("mini-machine-laver-25-kg-semi-automatique-noir", ["Référence absente ; garantie 3 mois."],
   "Mini machine à laver semi-automatique Goldenstar 2,5 kg noire", "ماكينة تصبين صغيرة غولدن ستار 2.5 كيلو سوداء",
   "Mini machine à laver semi-automatique de 2,5 kg avec essorage, compacte et légère pour un studio, des étudiants ou le camping.",
   "ماكينة تصبين صغيرة نصف أوتوماتيكية 2.5 كيلو مع العصر، خفيفة للستوديو والطلبة والتخييم.",
   "Cette mini machine Goldenstar de 2,5 kg lave et essore de petites quantités : linge de bébé, sous-vêtements, tenues de sport ou lessive d'une personne seule. Légère, elle se range dans un placard.",
   "ماكينة غولدن ستار صغيرة 2.5 كيلو تغسل وتعصر كميات صغيرة: ملابس الرضيع والرياضة أو غسيل شخص واحد، وتُخزن بسهولة.",
   [("Pour qui ?", "Studios, chambres d'étudiants, maisons de vacances, camping, ou en appoint d'une grande machine.")],
   [("لمن؟", "للستوديو والطلبة والمصيف والتخييم أو كماكينة إضافية.")],
   ["Capacité : 2,5 kg", "Semi-automatique avec essorage", "Couleur : noir"], ["السعة: 2.5 كيلو", "مع العصر", "اللون: أسود"], "Garantie : 3 mois.", "الضمان: 3 أشهر.",
   "Mini machine à laver 2,5 kg – Prix Maroc", "Mini machine à laver semi-automatique Goldenstar 2,5 kg avec essorage, compacte pour studio et camping.",
   "ماكينة تصبين صغيرة 2.5 كيلو بالمغرب", "ماكينة تصبين صغيرة غولدن ستار 2.5 كيلو مع العصر، للستوديو والتخييم.",
   "mini machine à laver 2,5 kg, petite machine à laver, machine à laver studio, mini lave-linge camping, prix mini machine à laver Maroc",
   "ماكينة تصبين صغيرة, ميني ماكينة الصابون, غسالة صغيرة, ماكينة تصبين للتخييم, ثمن ماكينة تصبين صغيرة في المغرب",
   [faq("Que peut-on laver en 2,5 kg ?", "Une petite charge : linge de bébé, tenues de sport, sous-vêtements ou le linge d'une personne.", "شنو نقدر نصبن ف2.5 كيلو؟", "شوية ديال الحوايج: ديال الرضيع، الرياضة ولا ديال شخص واحد.")],
   "Mini machine à laver semi-automatique 2,5 kg noire", "ماكينة تصبين صغيرة 2.5 كيلو سوداء")

wm("machine-laver-semi-automatique-alaska-25-kg", [],
   "Mini machine à laver semi-automatique Alaska 2,5 kg ALK25-45", "ماكينة تصبين صغيرة ألاسكا 2.5 كيلو ALK25-45",
   "Mini machine à laver semi-automatique Alaska ALK25-45 de 2,5 kg, 140 W, protection IPX4, pour les petites lessives.",
   "ماكينة تصبين صغيرة ألاسكا ALK25-45 بسعة 2.5 كيلو وقوة 140 واط وحماية IPX4، للغسيل القليل.",
   "L'Alaska ALK25-45 est une mini machine de 2,5 kg pour les petites quantités de linge, idéale dans un studio ou en complément d'une grande machine.",
   "ألاسكا ALK25-45 ماكينة صغيرة بسعة 2.5 كيلو للغسيل القليل، مناسبة للستوديو أو كماكينة إضافية.",
   [("Sobre", "Avec 140 W, elle consomme peu ; l'indice IPX4 la protège des projections d'eau.")],
   [("اقتصادية", "140 واط فقط، وحماية IPX4 ضد رذاذ الماء.")],
   ["Modèle : ALK25-45", "Capacité : 2,5 kg", "Puissance de lavage : 140 W", "Tension : 220–240 V", "Protection : IPX4", "Couleur : blanc et bleu"], ["الموديل: ALK25-45", "السعة: 2.5 كيلو", "القوة: 140 واط", "اللون: أبيض وأزرق"], "Garantie : 12 mois.", "الضمان: 12 شهرا.",
   "Mini lave-linge Alaska 2,5 kg ALK25-45 – Prix Maroc", "Mini machine à laver semi-automatique Alaska ALK25-45 2,5 kg, 140 W, IPX4, garantie 12 mois.",
   "ماكينة تصبين صغيرة ألاسكا 2.5 كيلو بالمغرب", "ماكينة تصبين صغيرة ألاسكا ALK25-45 بسعة 2.5 كيلو و140 واط، ضمان 12 شهرا.",
   "mini machine à laver Alaska, Alaska ALK25-45, machine à laver 2,5 kg, petite machine à laver blanche, prix mini machine à laver Maroc",
   "ماكينة تصبين صغيرة ألاسكا, ميني ماكينة الصابون, غسالة 2.5 كيلو, ماكينة تصبين للستوديو, ثمن ماكينة تصبين صغيرة في المغرب",
   [faq("Que veut dire IPX4 ?", "L'appareil est protégé contre les projections d'eau venant de toutes les directions.", "شنو معنى IPX4؟", "الجهاز محمي من رشان الما من جميع الجهات.")],
   "Mini machine à laver Alaska ALK25-45 2,5 kg blanc et bleu", "ماكينة تصبين صغيرة ألاسكا ALK25-45 سعة 2.5 كيلو")

# ── Oven and TVs naming Electro Darna ───────────────────────────────────────
wm("four-lectrique-itimat-45-litres-four-de-cuisine", ["Ancienne description : « Commandez … chez Electro Darna » (retiré)."],
   "Four électrique Itimat 45 litres 1600 W", "فرن كهربائي إيتيمات 45 لترا 1600 واط",
   "Four électrique posable Itimat de 45 litres et 1600 W, thermostat réglable, trois modes de cuisson et minuterie 90 minutes.",
   "فرن كهربائي إيتيمات بسعة 45 لترا وقوة 1600 واط، ترموستات وثلاثة أوضاع للطهي ومؤقت 90 دقيقة.",
   "Le four électrique Itimat de 45 litres se pose sur le plan de travail : une alternative au four à gaz pour les pizzas, gratins, gâteaux, tartes ou poissons, sans installation.",
   "فرن إيتيمات الكهربائي بسعة 45 لترا يوضع على سطح المطبخ: بديل للفرن الغازي للبيتزا والغراتان والحلويات والسمك بدون تركيب.",
   [("Trois modes", "Résistance du haut, du bas, ou les deux ensemble, pour gratiner, cuire une pâte ou cuire uniformément."),
    ("Minuterie", "Réglable jusqu'à 90 minutes avec signal sonore en fin de cuisson.")],
   [("ثلاثة أوضاع", "التسخين من الأعلى أو الأسفل أو الاثنين معا."), ("المؤقت", "حتى 90 دقيقة مع جرس في النهاية.")],
   ["Capacité : 45 litres", "Puissance : 1600 W", "Thermostat réglable", "Modes : haut, bas, haut + bas", "Minuterie : 90 min avec signal sonore"], ["السعة: 45 لترا", "القوة: 1600 واط", "ترموستات", "مؤقت 90 دقيقة"], "Garantie : 12 mois.", "الضمان: 12 شهرا.",
   "Four électrique Itimat 45 L 1600 W – Prix Maroc", "Four électrique Itimat 45 litres, 1600 W, trois modes de cuisson et minuterie 90 min, garantie 12 mois.",
   "فرن كهربائي إيتيمات 45 لترا بالمغرب", "فرن كهربائي إيتيمات 45 لترا، 1600 واط، ثلاثة أوضاع ومؤقت 90 دقيقة، ضمان 12 شهرا.",
   "four électrique Itimat 45L, four posable 45 litres, mini four électrique, four 1600W, prix four électrique Itimat Maroc",
   "فرن كهربائي إيتيمات, فور كهربائي 45 لتر, فرن صغير, فور الضو, ثمن الفرن الكهربائي في المغرب",
   [faq("Faut-il l'encastrer ?", "Non, c'est un four posable : il se branche sur une prise et se pose sur le plan de travail.", "واش خاصو يتركب فالحيط؟", "لا، كيتحط على الكونطوار وكيتشعل فالبريز.")],
   "Four électrique Itimat 45 litres 1600 W", "فرن كهربائي إيتيمات 45 لترا 1600 واط",
   specs=[S("Marque", "ITIMAT"), S("Type", "Four électrique"), S("Capacité", "45 litres"), S("Puissance", "1600 W"), S("Modes de cuisson", "Haut, bas, haut + bas"), S("Minuterie", "90 minutes avec signal sonore")], note="Valeurs de la fiche et de l'ancienne description")

wm("tv-concord-32-pouces-smart-tv-hdr-led32sm345cr", ["Ancienne description : « Achetez … chez Electro Darna » (retiré). Résolution, système et connectique non renseignés."],
   "Téléviseur Concord Smart TV 32 pouces HDR LED32SM345CR", "تلفاز كونكورد سمارت 32 بوصة HDR LED32SM345CR",
   "Smart TV Concord de 32 pouces avec HDR et accès aux applications comme Netflix et YouTube, pour une chambre, une cuisine ou un bureau.",
   "تلفاز ذكي كونكورد 32 بوصة مع HDR وتطبيقات مثل نتفليكس ويوتيوب، لغرفة النوم أو المطبخ أو المكتب.",
   "La Concord LED32SM345CR est une Smart TV de 32 pouces : un format qui trouve sa place dans une chambre, une cuisine ou un petit salon, avec un accès direct aux applications de streaming.",
   "كونكورد LED32SM345CR تلفاز ذكي 32 بوصة يناسب غرفة النوم أو المطبخ أو صالونا صغيرا، مع تطبيقات البث مباشرة.",
   [("Smart TV", "Netflix, YouTube et d'autres applications sont accessibles depuis le téléviseur, sans boîtier supplémentaire."), ("HDR", "Le HDR améliore le rendu des scènes très claires et très sombres sur les contenus compatibles.")],
   [("تلفاز ذكي", "نتفليكس ويوتيوب وتطبيقات أخرى بدون جهاز إضافي."), ("HDR", "صورة أوضح في المشاهد الساطعة والمظلمة.")],
   ["Taille : 32 pouces", "Smart TV", "HDR", "Applications : Netflix, YouTube et autres"], ["المقاس: 32 بوصة", "تلفاز ذكي", "HDR"], "Garantie : 12 mois.", "الضمان: 12 شهرا.",
   "Smart TV Concord 32 pouces LED32SM345CR – Prix Maroc", "Smart TV Concord 32 pouces HDR avec Netflix et YouTube, idéale pour chambre ou cuisine, garantie 12 mois.",
   "تلفاز كونكورد 32 بوصة سمارت بالمغرب", "تلفاز ذكي كونكورد 32 بوصة HDR مع نتفليكس ويوتيوب، ضمان 12 شهرا.",
   "Smart TV Concord 32 pouces, Concord LED32SM345CR, TV 32 pouces chambre, petite Smart TV HDR, prix TV 32 pouces Maroc",
   "تلفاز كونكورد, تلفزيون 32 بوصة, تلفاز سمارت صغير, شاشة لبيت النعاس, ثمن تلفاز 32 بوصة في المغرب",
   [faq("Peut-on regarder Netflix et YouTube ?", "Oui, ce sont des applications disponibles sur cette Smart TV.", "واش فيه نتفليكس ويوتيوب؟", "إيه، كاينين فهاد التلفاز.")],
   "Smart TV Concord 32 pouces LED32SM345CR", "تلفاز ذكي كونكورد 32 بوصة LED32SM345CR")

wm("tv-daiko-43-pouces-smart-google-tv-fhd-gled43aq84dk", ["Ancienne description : mention d'Electro Darna retirée."],
   "Téléviseur Daiko 43 pouces Google TV Full HD GLED43AQ84DK", "تلفاز دايكو 43 بوصة Google TV Full HD GLED43AQ84DK",
   "Smart TV Daiko 43 pouces Full HD sous Google TV 5.0 (Android 14), HDR10/HLG, Google Cast et AirPlay, commande vocale, garantie 2 ans.",
   "تلفاز ذكي دايكو 43 بوصة Full HD بنظام Google TV 5.0 (أندرويد 14)، HDR10/HLG، Google Cast وAirPlay، أوامر صوتية، ضمان سنتين.",
   "La Daiko GLED43AQ84DK est une Smart TV de 43 pouces en Full HD qui fonctionne sous Google TV 5.0 (Android 14). Elle convient au salon d'un appartement ou à une grande chambre.",
   "دايكو GLED43AQ84DK تلفاز ذكي 43 بوصة Full HD بنظام Google TV 5.0 (أندرويد 14)، مناسب لصالون شقة أو غرفة كبيرة.",
   [("Partager depuis son téléphone", "Google Cast et AirPlay permettent d'envoyer vidéos et photos depuis un smartphone Android ou un iPhone ; la commande vocale facilite la recherche."),
    ("Connectique", "3 HDMI, 2 USB, LAN, sortie optique, sortie casque, et tuner DVB-T/T2/C/S/S2 intégré pour la réception satellite.")],
   [("المشاركة من الهاتف", "Google Cast وAirPlay لإرسال الفيديو من أندرويد أو آيفون، وأوامر صوتية للبحث."), ("التوصيلات", "3 HDMI و2 USB وLAN ومخرج بصري، مع مستقبل DVB-S/S2 مدمج للساتل.")],
   ["Taille : 43 pouces", "Résolution : Full HD 1920 × 1080", "Système : Google TV 5.0 / Android 14", "HDR10, HLG", "Wi-Fi 2,4 + 5 GHz, Bluetooth 5.1", "RAM 1 Go, stockage 8 Go", "Audio : Dolby Audio, 2 × 8 W", "VESA 200 × 200"],
   ["المقاس: 43 بوصة", "الدقة: Full HD", "النظام: Google TV 5.0", "HDR10 وHLG", "صوت Dolby Audio بقوة 2 × 8 واط"], "Garantie : 2 ans.", "الضمان: سنتان.",
   "TV Daiko 43 pouces Google TV GLED43AQ84DK – Prix Maroc", "Smart TV Daiko 43 pouces Full HD, Google TV 5.0, Google Cast, AirPlay et tuner satellite, garantie 2 ans.",
   "تلفاز دايكو 43 بوصة Google TV بالمغرب", "تلفاز ذكي دايكو 43 بوصة Full HD بنظام Google TV ومستقبل ساتل مدمج، ضمان سنتين.",
   "TV Daiko 43 pouces, Daiko GLED43AQ84DK, Smart TV Google TV 43 pouces, TV Full HD récepteur satellite, prix TV Daiko Maroc",
   "تلفاز دايكو 43 بوصة, تلفزيون Google TV, تلفاز سمارت بالديمو, شاشة دايكو, ثمن تلفاز دايكو في المغرب",
   [faq("A-t-elle un récepteur satellite intégré ?", "Oui, un tuner DVB-T/T2/C/S/S2 est intégré.", "واش فيه الديمو مدمج؟", "إيه، فيه مستقبل DVB-S/S2 مدمج."),
    faq("Peut-on envoyer une vidéo depuis un iPhone ?", "Oui, grâce à AirPlay ; et depuis Android avec Google Cast.", "واش نقدر نصيفط فيديو من آيفون؟", "إيه، بـ AirPlay، ومن أندرويد بـ Google Cast.")],
   "Smart TV Daiko 43 pouces Google TV GLED43AQ84DK", "تلفاز ذكي دايكو 43 بوصة Google TV GLED43AQ84DK")

assert len(P) == 23, len(P)
for e in P:
    assert "None" not in json.dumps(e["changes"], ensure_ascii=False), e["slug"]
json.dump(P, open(os.path.join(HERE, "washing-23.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(P), "entries")
