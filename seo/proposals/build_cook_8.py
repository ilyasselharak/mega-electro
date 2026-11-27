# -*- coding: utf-8 -*-
# Batch "cook-8": ovens and hobs. Facts only from the store database (backups/seo/after-tv/cook-current.json).
import json, os
HERE = os.path.dirname(__file__)
cur = {p["slug"]: p for p in json.load(open(os.path.join(HERE, "../../backups/seo/after-tv/cook-current.json"), encoding="utf-8"))}
P = []
ST = "Livraison partout au Maroc, paiement à la livraison."
STA = "توصيل لكل المغرب والدفع عند الاستلام."
def S(l, v): return {"label": l, "value": v}
def faq(q, a, qa, aa): return {"question": q, "answer": a, "questionAr": qa, "answerAr": aa}
def txt(intro, sections, specs, ar=False):
    b = intro + "\n\n" + "\n\n".join(f"### {h}\n{t}" for h, t in sections)
    if specs: b += ("\n\n### المواصفات\n" if ar else "\n\n### Caractéristiques\n") + "\n".join(f"- {l}" for l in specs)
    return b
def item(slug, verify, name, nameAr, short, shortAr, intro, introAr, secs, secsAr, sp_fr, sp_ar, mt, md, tAr, mdAr, kw, kwAr, faqs, alt, altAr, specs=None):
    keys = cur[slug]["imgs"]
    c = {"name": name, "nameAr": nameAr, "shortDescription": short, "description": txt(intro, secs, sp_fr),
         "metaTitle": mt, "metaDescription": md + " " + ST,
         "seo": {"titleAr": tAr, "metaDescriptionAr": mdAr + " " + STA, "shortDescriptionAr": shortAr, "descriptionAr": txt(introAr, secsAr, sp_ar, ar=True), "keywords": kw, "keywordsAr": kwAr},
         "faq": faqs, "imageAlts": [{"key": k, "alt": alt, "altAr": altAr} for k in keys]}
    e = {"kind": "product", "slug": slug, "source": "cook-8", "sources": [], "verify": verify, "specsVerified": False, "changes": c}
    if specs:
        c["specs"] = specs; e["specsVerified"] = True; e["sources"] = ["Valeurs de la fiche et de l'ancienne description Mega Electro (aucune valeur ajoutée)"]
    P.append(e)

POSABLE = faq("Faut-il l'encastrer ?", "Non, c'est un four posable : il se pose sur le plan de travail et se branche sur une prise. Laissez de l'espace autour pour la ventilation.", "واش خاصو يتركب فالحيط؟", "لا، فرن كيتحط على الكونطوار وكيتشعل فالبريز. خليو شوية ديال البلاصة داير بيه.")
DOUBLE = faq("À quoi sert la double vitre ?", "Elle limite la chaleur de la porte et les pertes de chaleur : la porte reste moins chaude au toucher et le four garde mieux sa température.", "شنو فايدة الزجاج المزدوج؟", "كينقص السخانة ديال الباب وكيحافظ على حرارة الفرن.")
GAS = faq("Qui doit raccorder la plaque au gaz ?", "Un professionnel, avec un flexible conforme et en bon état. Vérifiez aussi la découpe du plan de travail avant de commander.", "شكون خاصو يوصل البلاكة بالغاز؟", "مختص، بخرطوم سليم ومطابق. وقيسو الفتحة ديال الكونطوار قبل الطلب.")

# ── Itimat ovens ────────────────────────────────────────────────────────────
ANGLE = {
  "four-50l-itimat-double-vitrage": ("Format intermédiaire", "50 litres, c'est le bon compromis pour une famille de quatre : plus grand qu'un mini-four de 45 litres, moins encombrant qu'un 60 litres.", "حجم متوسط", "50 لترا حل وسط لعائلة من أربعة أفراد."),
  "four-60l-itimat-double-glasse": ("Grande capacité, porte isolée", "60 litres pour les grandes familles, avec une porte double vitrage qui reste moins chaude au toucher : un plus avec des enfants dans la cuisine.", "سعة كبيرة وباب معزول", "60 لترا للعائلات الكبيرة، وباب بزجاج مزدوج يبقى أقل حرارة."),
  "four-60l-itimat": ("Grand volume, version essentielle", "La version 60 litres sans double vitrage : le même volume pour cuire en grande quantité, à un prix plus doux que la version double vitrage.", "أكبر سعة بثمن أقل", "نسخة 60 لترا بدون زجاج مزدوج: نفس السعة بثمن أقل."),
}
for slug, cap, dbl, model_word in [("four-50l-itimat-double-vitrage", 50, True, "50 L double vitrage"), ("four-60l-itimat-double-glasse", 60, True, "60 L double vitrage"), ("four-60l-itimat", 60, False, "60 L")]:
    ah, at, aha, ata = ANGLE[slug]
    item(slug, ["Fiche limitée à la capacité : puissance, modes de cuisson, minuterie et garantie à renseigner (ne pas reprendre les valeurs du modèle Itimat 45 L)."],
         f"Four électrique Itimat {model_word}", f"فرن كهربائي إيتيمات {cap} لترا" + (" بزجاج مزدوج" if dbl else ""),
         f"Four électrique posable Itimat de {cap} litres" + (" à porte double vitrage" if dbl else "") + ", pour cuire en grande quantité sans four encastré.",
         f"فرن كهربائي إيتيمات بسعة {cap} لترا" + (" بباب زجاج مزدوج" if dbl else "") + "، للطهي بكميات كبيرة بدون فرن مدمج.",
         f"Le four Itimat de {cap} litres est un grand four posable : assez spacieux pour un plat familial, un poulet entier ou plusieurs plaques de pâtisserie à l'approche des fêtes." + (" Sa porte double vitrage garde mieux la chaleur." if dbl else ""),
         f"فرن إيتيمات بسعة {cap} لترا كبير ويوضع على السطح: يتسع لطبق عائلي أو دجاجة كاملة أو صواني الحلويات." + (" بابه بزجاج مزدوج يحافظ على الحرارة." if dbl else ""),
         [(ah, at),
          ("Avant de commander", "Prévoyez une prise adaptée et un emplacement stable avec un peu d'espace autour. Notre équipe vous confirme la puissance et les fonctions par téléphone ou sur WhatsApp.")],
         [(aha, ata), ("قبل الطلب", "وفروا مقبسا مناسبا ومكانا ثابتا. فريقنا يؤكد لكم القوة والوظائف.")],
         [f"Capacité : {cap} litres", "Type : four électrique posable"] + (["Porte double vitrage"] if dbl else []), [f"السعة: {cap} لترا", "فرن كهربائي"] + (["زجاج مزدوج"] if dbl else []),
         f"Four électrique Itimat {cap} L{' double vitrage' if dbl else ''} – Prix Maroc",
         f"Four électrique posable Itimat {cap} litres{', porte double vitrage' if dbl else ''}, pour pain, gâteaux et plats familiaux.",
         f"فرن كهربائي إيتيمات {cap} لترا{' زجاج مزدوج' if dbl else ''} بالمغرب",
         f"فرن كهربائي إيتيمات بسعة {cap} لترا{' بزجاج مزدوج' if dbl else ''} للخبز والحلويات والأطباق العائلية.",
         f"four électrique Itimat {cap}L, four posable {cap} litres, grand four électrique{', four double vitrage' if dbl else ''}, prix four Itimat Maroc",
         f"فرن كهربائي إيتيمات, فور كهربائي {cap} لتر, فرن كبير, فور الضو, ثمن الفرن الكهربائي في المغرب",
         [POSABLE] + ([DOUBLE] if dbl else []),
         f"Four électrique Itimat {cap} litres" + (" double vitrage" if dbl else ""), f"فرن كهربائي إيتيمات {cap} لترا",
         specs=[S("Marque", "Itimat"), S("Capacité", f"{cap} L"), S("Type", "Four électrique posable")] + ([S("Porte", "Double vitrage")] if dbl else []))

item("four-lectrique-maclay-45l-inox-300c-double-rsistance", ["Puissance et garantie non renseignées."],
     "Four électrique Maclay 45 L inox 300 °C", "فرن كهربائي ماكلاي 45 لترا إينوكس 300 درجة",
     "Four électrique posable Maclay de 45 litres en inox, jusqu'à 300 °C, résistances haut et bas réglables séparément et minuterie 90 minutes.",
     "فرن كهربائي ماكلاي بسعة 45 لترا من الإينوكس، حتى 300 درجة، مقاومتان علوية وسفلية بتحكم منفصل ومؤقت 90 دقيقة.",
     "Le four Maclay de 45 litres monte jusqu'à 300 °C, une température utile pour les pizzas et les pâtes qui demandent une chaleur vive.",
     "فرن ماكلاي بسعة 45 لترا يصل إلى 300 درجة، حرارة مفيدة للبيتزا والعجين الذي يحتاج نارا قوية.",
     [("Haut et bas séparés", "Les résistances du haut et du bas se règlent séparément : dessus pour gratiner, dessous pour la pâte, ou les deux pour une cuisson homogène."),
      ("Minuterie", "Jusqu'à 90 minutes, pour lancer une cuisson longue sans surveiller l'horloge.")],
     [("أعلى وأسفل", "المقاومتان العلوية والسفلية تعدلان بشكل منفصل."), ("المؤقت", "حتى 90 دقيقة.")],
     ["Capacité : 45 litres", "Température maximale : 300 °C", "Résistances haut et bas contrôlées séparément", "Minuterie : 90 minutes", "Finition : inox"],
     ["السعة: 45 لترا", "الحرارة القصوى: 300 درجة", "مؤقت 90 دقيقة", "إينوكس"],
     "Four électrique Maclay 45 L inox 300 °C – Prix Maroc", "Four électrique Maclay 45 L inox jusqu'à 300 °C, résistances haut et bas séparées, minuterie 90 minutes.",
     "فرن كهربائي ماكلاي 45 لترا بالمغرب", "فرن كهربائي ماكلاي 45 لترا إينوكس حتى 300 درجة، مقاومتان منفصلتان ومؤقت 90 دقيقة.",
     "four électrique Maclay 45L, four 300°C, four posable inox, four pizza électrique, prix four Maclay Maroc",
     "فرن كهربائي ماكلاي, فور 45 لتر, فرن البيتزا, فور إينوكس, ثمن الفرن الكهربائي في المغرب",
     [POSABLE], "Four électrique Maclay 45 litres inox", "فرن كهربائي ماكلاي 45 لترا إينوكس",
     specs=[S("Marque", "MACLAY"), S("Capacité", "45 litres"), S("Température max", "300 °C"), S("Minuterie", "90 minutes"), S("Résistances", "Haut et bas contrôlées séparément"), S("Finition", "Inox")])

item("four-lectrique-dehuse-capacit-de-70-l-67cm50cm43cm", ["Ancienne description en anglais approximatif ; « Box İnner : 1 pcs » retiré des caractéristiques.", "Garantie non renseignée."],
     "Four électrique DeHäuse 70 L chaleur tournante 2200 W", "فرن كهربائي ديهاوس 70 لترا بمروحة 2200 واط",
     "Four électrique posable DeHäuse de 70 litres et 2200 W avec chaleur tournante (turbo), éclairage intérieur, décongélation et porte double vitrage.",
     "فرن كهربائي ديهاوس بسعة 70 لترا وقوة 2200 واط مع مروحة تدوير الحرارة وإضاءة داخلية وإذابة الثلج وباب بزجاج مزدوج.",
     "Le DeHäuse 70 litres est le plus grand four posable de notre gamme. Avec 2200 W et une chaleur tournante, il cuit de façon homogène sur plusieurs niveaux, comme un four encastrable, sans travaux.",
     "ديهاوس 70 لترا أكبر فرن يوضع على السطح عندنا. بقوة 2200 واط ومروحة لتدوير الحرارة، يطهو بشكل متساو على عدة مستويات.",
     [("Chaleur tournante", "Le ventilateur (turbo) répartit la chaleur : idéal pour cuire deux plaques de gâteaux en même temps."),
      ("Bien équipé", "Thermostat, minuterie, éclairage intérieur, fonction décongélation, grille inox, plateau carré et plateau rond."),
      ("Encombrement", "67 × 50 × 43 cm : vérifiez la place sur votre plan de travail.")],
     [("مروحة الحرارة", "توزع الحرارة لطهي صينيتين في نفس الوقت."), ("تجهيز كامل", "ترموستات ومؤقت وإضاءة وإذابة الثلج وشبكة إينوكس وصينيتان."), ("الحجم", "67 × 50 × 43 سم.")],
     ["Capacité : 70 litres", "Puissance : 2200 W", "Chaleur tournante (turbo)", "Thermostat et minuterie", "Éclairage intérieur", "Décongélation", "Porte double vitrage", "Accessoires : grille inox, plateau carré, plateau rond", "Dimensions : 67 × 50 × 43 cm", "Couleur : gris foncé"],
     ["السعة: 70 لترا", "القوة: 2200 واط", "مروحة تدوير الحرارة", "زجاج مزدوج", "الأبعاد: 67 × 50 × 43 سم"],
     "Four électrique DeHäuse 70 L 2200 W – Prix Maroc", "Four électrique DeHäuse 70 litres 2200 W, chaleur tournante, éclairage, décongélation et double vitrage.",
     "فرن كهربائي ديهاوس 70 لترا بالمغرب", "فرن كهربائي ديهاوس 70 لترا بقوة 2200 واط مع مروحة الحرارة والإضاءة والزجاج المزدوج.",
     "four électrique DeHäuse 70L, four posable 70 litres, four chaleur tournante, grand four électrique 2200W, prix four DeHäuse Maroc",
     "فرن كهربائي ديهاوس, فور 70 لتر, فرن بالمروحة, فرن كبير, ثمن الفرن الكهربائي في المغرب",
     [POSABLE, DOUBLE], "Four électrique DeHäuse 70 litres gris foncé", "فرن كهربائي ديهاوس 70 لترا رمادي غامق",
     specs=[S("Capacité", "70 L"), S("Puissance", "2200 W"), S("Fonctions", "Thermostat, minuterie, chaleur tournante (turbo), décongélation"), S("Éclairage intérieur", "Oui"), S("Porte", "Double vitrage"),
            S("Accessoires", "Grille inox, plateau carré, plateau rond"), S("Dimensions", "67 × 50 × 43 cm"), S("Couleur", "Gris foncé")])

# ── Hobs ────────────────────────────────────────────────────────────────────
item("active-chef-plaque-de-cuisson-gaz-encastrable-inox-4-feux-60cm", ["Ancienne description avec emoji et liste « Mots-clés SEO » visible (retirées).", "Type d'allumage, sécurité thermocouple et garantie non renseignés."],
     "Plaque de cuisson gaz encastrable Active Chef 4 feux 60 cm inox", "طباخة غاز مدمجة أكتيف شيف 4 عيون 60 سم إينوكس",
     "Plaque de cuisson à gaz encastrable Active Chef en inox, 4 feux sur 60 cm, le format standard des cuisines équipées.",
     "طباخة غاز مدمجة أكتيف شيف من الإينوكس، 4 عيون على 60 سم، المقاس المعتاد للمطابخ المجهزة.",
     "La plaque Active Chef 4 feux de 60 cm est la taille standard des cuisines équipées marocaines : assez de place pour le tajine, la marmite et la théière en même temps.",
     "طباخة أكتيف شيف بأربع عيون و60 سم هي المقاس المعتاد: مكان للطاجين والطنجرة والبراد في نفس الوقت.",
     [("Inox", "La surface en inox se nettoie à l'eau savonneuse avec une éponge douce ; séchez-la pour éviter les traces de calcaire."),
      ("Remplacement facile", "Le format 60 cm correspond à la plupart des découpes existantes : utile pour remplacer une ancienne plaque.")],
     [("إينوكس", "تنظف بالماء والصابون وإسفنجة لينة."), ("استبدال سهل", "مقاس 60 سم يناسب أغلب الفتحات الموجودة.")],
     ["Type : plaque gaz encastrable", "Feux : 4", "Largeur : 60 cm", "Finition : inox"], ["طباخة غاز مدمجة", "4 عيون", "60 سم", "إينوكس"],
     "Plaque gaz 4 feux 60 cm Active Chef – Prix Maroc", "Plaque de cuisson à gaz encastrable Active Chef 4 feux, 60 cm, en inox facile à entretenir.",
     "طباخة غاز 4 عيون 60 سم أكتيف شيف بالمغرب", "طباخة غاز مدمجة أكتيف شيف بأربع عيون و60 سم من الإينوكس سهل التنظيف.",
     "plaque de cuisson gaz 4 feux, Active Chef 60 cm, plaque gaz encastrable inox, table de cuisson 60 cm, prix plaque gaz Maroc",
     "طباخة غاز 4 عيون, بلاكة الغاز, طباخة مدمجة 60 سم, فوكو إينوكس, ثمن طباخة الغاز في المغرب",
     [GAS], "Plaque de cuisson gaz encastrable Active Chef 4 feux 60 cm inox", "طباخة غاز مدمجة أكتيف شيف 4 عيون 60 سم",
     specs=[S("Marque", "Active Chef"), S("Type", "Plaque de cuisson à gaz encastrable"), S("Feux", "4"), S("Largeur", "60 cm"), S("Finition", "Inox")])

item("plaque-de-cuisson-gaz-encastre-uniontech-4-brleurs", ["Ancienne description illisible (« Grile font… Frontalesdimensions LPG ») : seuls l'allumage électrique et le gaz GPL sont repris. « Grilles en fonte » probable, à confirmer.", "Dimensions, finition et garantie non renseignées."],
     "Plaque de cuisson gaz encastrable UnionTech 4 brûleurs", "طباخة غاز مدمجة يونيون تيك 4 عيون",
     "Plaque de cuisson à gaz encastrable UnionTech à 4 brûleurs, allumage électrique, pour gaz GPL (butane).",
     "طباخة غاز مدمجة يونيون تيك بأربع عيون وإشعال كهربائي، للغاز البوتان.",
     "La plaque UnionTech compte 4 brûleurs et s'allume d'un geste grâce à l'allumage électrique, sans briquet ni allumettes. Elle fonctionne au GPL, le gaz des bouteilles domestiques.",
     "طباخة يونيون تيك بأربع عيون وإشعال كهربائي بدون ولاعة، تعمل بغاز البوتان.",
     [("Avant de commander", "Mesurez la découpe de votre plan de travail et demandez-nous les dimensions exactes : nous vous les confirmons par téléphone ou sur WhatsApp.")],
     [("قبل الطلب", "قيسوا فتحة السطح واطلبوا منا الأبعاد بالضبط.")],
     ["Type : plaque gaz encastrable", "Brûleurs : 4", "Allumage électrique", "Gaz : GPL"], ["طباخة مدمجة", "4 عيون", "إشعال كهربائي", "غاز البوتان"],
     "Plaque gaz UnionTech 4 brûleurs – Prix Maroc", "Plaque de cuisson à gaz encastrable UnionTech 4 brûleurs avec allumage électrique, pour gaz butane.",
     "طباخة غاز مدمجة يونيون تيك 4 عيون بالمغرب", "طباخة غاز مدمجة يونيون تيك بأربع عيون وإشعال كهربائي لغاز البوتان.",
     "plaque gaz UnionTech, plaque de cuisson 4 brûleurs, plaque gaz allumage électrique, table de cuisson encastrable, prix plaque gaz UnionTech Maroc",
     "طباخة يونيون تيك, بلاكة الغاز 4 عيون, طباخة بالإشعال الكهربائي, فوكو مدمج, ثمن طباخة الغاز في المغرب",
     [GAS], "Plaque de cuisson gaz encastrable UnionTech 4 brûleurs", "طباخة غاز مدمجة يونيون تيك 4 عيون",
     specs=[S("Marque", "UnionTech"), S("Type", "Plaque de cuisson à gaz encastrable"), S("Brûleurs", "4"), S("Allumage", "Électrique"), S("Gaz", "GPL")])

item("plaque-de-cuisson-inox-1-feu-lectrique-500w", ["Diamètre du foyer et garantie non renseignés."],
     "Plaque de cuisson électrique General 1 feu 500 W inox", "طباخة كهربائية جنرال بعين واحدة 500 واط إينوكس",
     "Plaque électrique General à 1 feu de 500 W en inox, avec thermostat, voyant de fonctionnement et protection contre la surchauffe.",
     "طباخة كهربائية جنرال بعين واحدة 500 واط من الإينوكس، مع ترموستات وضوء التشغيل وحماية من ارتفاع الحرارة.",
     "Cette petite plaque électrique General de 500 W dépanne partout où il n'y a pas de gaz : studio, chambre d'étudiant, bureau ou pour garder un plat au chaud à table.",
     "طباخة جنرال صغيرة بقوة 500 واط تفيد حيث لا يوجد غاز: الستوديو، غرفة الطالب أو المكتب.",
     [("Simple et sûre", "Un thermostat automatique régule la chaleur, un voyant indique qu'elle est allumée, et une protection coupe en cas de surchauffe.")],
     [("بسيطة وآمنة", "ترموستات أوتوماتيكي وضوء التشغيل وحماية من الحرارة الزائدة.")],
     ["Foyers : 1", "Puissance : 500 W", "Tension : 220–230 V", "Thermostat automatique", "Voyant marche/arrêt", "Protection contre la surchauffe", "Finition : inox"],
     ["عين واحدة", "القوة: 500 واط", "ترموستات", "حماية من الحرارة"],
     "Plaque électrique General 1 feu 500 W – Prix Maroc", "Plaque électrique General 1 feu 500 W inox, thermostat et protection surchauffe, pour studio ou bureau.",
     "طباخة كهربائية جنرال عين واحدة بالمغرب", "طباخة كهربائية جنرال بعين واحدة 500 واط إينوكس مع ترموستات وحماية، للستوديو أو المكتب.",
     "plaque électrique 1 feu, plaque de cuisson 500W, réchaud électrique, plaque électrique inox General, prix plaque électrique Maroc",
     "طباخة كهربائية صغيرة, ريشو كهربائي, طباخة عين وحدة, بلاكة الضو, ثمن الطباخة الكهربائية في المغرب",
     [faq("Convient-elle à un studio sans gaz ?", "Oui, elle se branche sur une simple prise ; avec 500 W, elle sert surtout à réchauffer et à cuire des petites quantités.", "واش مناسبة لستوديو بلا غاز؟", "إيه، كتشعل فالبريز، و500 واط كتصلح للتسخين والطبخ الخفيف.")],
     "Plaque de cuisson électrique General 1 feu 500 W inox", "طباخة كهربائية جنرال بعين واحدة 500 واط",
     specs=[S("Foyers", "1"), S("Puissance", "500 W"), S("Tension", "220–230 V"), S("Thermostat", "Automatique"), S("Voyant", "Marche/arrêt"), S("Sécurité", "Protection contre la surchauffe"), S("Finition", "Inox")])

assert len(P) == 8
for e in P: assert "None" not in json.dumps(e["changes"], ensure_ascii=False), e["slug"]
json.dump(P, open(os.path.join(HERE, "cook-8.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(P), "entries")
