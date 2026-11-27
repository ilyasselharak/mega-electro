# -*- coding: utf-8 -*-
# Batch "pe-A": category "Petit électroménager" (renamed) + 28 food-preparation products.
# Facts only from the store database (backups/seo/after-cook/pe-current.json). Contradictions flagged, never published.
import json, os
HERE = os.path.dirname(__file__)
cur = {p["slug"]: p for p in json.load(open(os.path.join(HERE, "../../backups/seo/after-cook/pe-current.json"), encoding="utf-8"))}
P = []
ST = "Livraison partout au Maroc, paiement à la livraison."
STA = "توصيل لكل المغرب والدفع عند الاستلام."
def S(l, v): return {"label": l, "value": v}
def faq(q, a, qa, aa): return {"question": q, "answer": a, "questionAr": qa, "answerAr": aa}
def txt(intro, secs, specs, ar=False):
    b = intro + ("\n\n" + "\n\n".join(f"### {h}\n{t}" for h, t in secs) if secs else "")
    if specs: b += ("\n\n### المواصفات\n" if ar else "\n\n### Caractéristiques\n") + "\n".join(f"- {l}" for l in specs)
    return b

# ── Category (renamed from "Blender Professionnel VENEZIA") ─────────────────
P.append({"kind": "category", "slug": "petit-electromenager", "source": "pe-A", "sources": [],
  "verify": ["Image de partage (ogImageKey) = photo d'un blender Venezia : à remplacer dans Admin → SEO (hors champ des mises à jour groupées).", "Catégorie sans image : en ajouter une dans Admin → Catégories."],
  "specsVerified": False,
  "changes": {
    "description": "Blenders, robots pétrins, moulins à grains, paninis, friteuses sans huile, aspirateurs, fers à repasser et plus : les petits appareils qui simplifient la cuisine et la maison au quotidien.",
    "metaTitle": "Petit électroménager au Maroc – blenders, pétrins",
    "metaDescription": "Blenders, robots pétrins, moulins à grains, paninis, air fryers et aspirateurs chez Mega Electro. " + ST,
    "seo": {
      "h1": "Petit électroménager",
      "titleAr": "الأجهزة المنزلية الصغيرة في المغرب – خلاطات وعجانات",
      "metaDescriptionAr": "خلاطات، عجانات، مطاحن، باني، قلايات بدون زيت ومكانس كهربائية: الأجهزة المنزلية الصغيرة من ميغا إلكترو. " + STA,
      "keywords": "petit électroménager Maroc, blender Maroc, robot pétrin, moulin à grains, panini électrique, friteuse sans huile, aspirateur balai",
      "keywordsAr": "الأجهزة المنزلية الصغيرة, خلاط, مولينيكس, عجانة, بيتران, طحانة, باني, قلاية بدون زيت, سبيراتور",
      "ogTitle": "Petit électroménager – Mega Electro",
      "ogDescription": "Blenders, pétrins, moulins, paninis, air fryers et aspirateurs, livrés partout au Maroc avec paiement à la livraison.",
      "longDescription": "Le petit électroménager, ce sont les appareils que l'on sort tous les jours : le blender du jus du matin, le pétrin des pains et des msemen, le moulin pour le café et les épices, le panini du goûter.\n\n### Bien choisir son blender\nRegardez la capacité du bol (1,25 à 2 litres), le matériau (verre plus stable à la chaleur, plastique plus léger) et les accessoires : un moulin intégré sert pour le café et les épices. La puissance compte surtout pour les glaçons et les mélanges épais.\n\n### Robot pétrin : quelle taille ?\nUn bol de 5 à 7 litres suffit pour la plupart des familles ; 9 à 10 litres conviennent aux grandes familles et aux préparations des fêtes. Vérifiez les accessoires fournis : crochet pour la pâte, batteur plat et fouet.\n\n### Moulin à grains et épices\nLa capacité (de 100 g à plusieurs kilos) dépend de l'usage : petit moulin pour le café et les épices du quotidien, grand modèle pour moudre le blé, l'orge ou préparer la sellou.\n\n### Entretien\nDébranchez toujours l'appareil avant de le nettoyer, ne plongez jamais le bloc moteur dans l'eau, et séchez bien les lames.\n\nVoir aussi : [Cuisson](/categorie/cuisson) et [Climatisation & chauffage](/categorie/climatisation-chauffage).",
      "descriptionAr": "الأجهزة المنزلية الصغيرة هي التي نستعملها كل يوم: الخلاط لعصير الصباح، العجانة للخبز والمسمن، المطحنة للقهوة والتوابل، والباني للمسمن والكسكروط.\n\n### اختيار الخلاط\nانظروا إلى سعة الوعاء (من 1.25 إلى 2 لتر) ومادته (الزجاج يتحمل الحرارة، والبلاستيك أخف) والملحقات مثل مطحنة القهوة. القوة مهمة لتكسير الثلج والخلطات الكثيفة.\n\n### العجانة: أي حجم؟\nوعاء من 5 إلى 7 لترات يكفي لأغلب العائلات، ومن 9 إلى 10 لترات للعائلات الكبيرة والمناسبات.\n\n### مطحنة الحبوب والتوابل\nمطحنة صغيرة للقهوة والتوابل، وكبيرة لطحن القمح والشعير وتحضير السلو.\n\n### العناية\nافصلوا الجهاز قبل التنظيف ولا تضعوا المحرك في الماء أبدا.",
    }}})

def add(slug, verify, name, nameAr, short, shortAr, intro, introAr, secs, secsAr, sp_fr, sp_ar, mt, md, tAr, mdAr, kw, kwAr, faqs, alt, altAr, specs=None, warranty=None):
    keys = cur[slug]["imgs"]
    w = warranty if warranty is not None else cur[slug]["w"]
    tail = f"\n\nGarantie : {w} mois." if w else ""
    tailAr = f"\n\nالضمان: {w} شهرا." if w else ""
    c = {"name": name, "nameAr": nameAr, "shortDescription": short, "description": txt(intro, secs, sp_fr) + tail,
         "metaTitle": mt, "metaDescription": (md + " " + ST) if len(md + " " + ST) >= 120 else (md + " Commande en ligne ou sur WhatsApp. " + ST),
         "seo": {"titleAr": tAr, "metaDescriptionAr": (mdAr + " " + STA) if len(mdAr + " " + STA) >= 100 else (mdAr + " اطلبوا عبر الموقع أو واتساب. " + STA), "shortDescriptionAr": shortAr, "descriptionAr": txt(introAr, secsAr, sp_ar, ar=True) + tailAr, "keywords": kw, "keywordsAr": kwAr},
         "faq": faqs, "imageAlts": [{"key": k, "alt": alt if i == 0 else f"{alt}, vue {i + 1}", "altAr": altAr if i == 0 else f"{altAr}، صورة {i + 1}"} for i, k in enumerate(keys)]}
    e = {"kind": "product", "slug": slug, "source": "pe-A", "sources": [], "verify": verify, "specsVerified": False, "changes": c}
    if specs:
        c["specs"] = specs; e["specsVerified"] = True; e["sources"] = ["Valeurs de la fiche et de l'ancienne description Mega Electro (aucune valeur ajoutée)"]
    P.append(e)

CLEAN = faq("Comment le nettoyer ?", "Débranchez-le, rincez le bol et les lames, et essuyez le bloc moteur avec un chiffon humide sans jamais le plonger dans l'eau.", "كيفاش ننقيه؟", "فصلوه، غسلو الوعاء والشفرات، ومسحو المحرك بشيفون فازك بلا ما تغطسوه فالما.")
ICE = faq("Peut-il broyer des glaçons ?", "Oui, cette fonction est indiquée dans ses caractéristiques. Ajoutez un peu de liquide et utilisez les impulsions pour de meilleurs résultats.", "واش كيكسر الثلج؟", "إيه، هاد الوظيفة مذكورة فالمواصفات. زيدو شوية ديال السائل واستعملو النبض.")
DOUGH = faq("Quelle quantité de pâte peut-il pétrir ?", "Elle dépend de la recette et du bol. Pour une pâte à pain lourde, ne remplissez pas le bol au maximum et travaillez à vitesse basse.", "شحال من عجين كتعجن؟", "كيتبدل حسب الوصفة والوعاء. للخبز الثقيل ما تعمروش الوعاء كامل وخدمو بسرعة منخفضة.")
MILL = faq("Que peut-on moudre ?", "Café, épices, céréales sèches (blé, orge, maïs), graines et fruits secs. Ne moulez pas d'aliments humides ou huileux en grande quantité.", "شنو نقدر نطحن؟", "القهوة، التوابل، الحبوب الناشفة (القمح، الشعير، الذرة) والزريعة. ما تطحنوش الحوايج الفازكين ولا فيهم الزيت بزاف.")

# ── Blenders ────────────────────────────────────────────────────────────────
def blender(slug, verify, brand, brandAr, model, cap, power, feats_fr, feats_ar, specs_fr, specs_ar, name=None, nameAr=None, extra_faq=None, specs=None, angle=""):
    p = f" {power} W" if power else ""
    m = f" {model}" if model else ""
    mA = m.replace(" en ", " في ")
    name = name or f"Blender {brand}{m} {cap} L{p}"
    nameAr = nameAr or f"خلاط {brandAr}{mA} {cap} لتر" + (f" {power} واط" if power else "")
    add(slug, verify, name, nameAr,
        f"Blender {brand} avec bol de {cap} litres{(' et moteur de ' + str(power) + ' W') if power else ''} : {feats_fr[0].lower()}.",
        f"خلاط {brandAr} بوعاء {cap} لتر" + (f" ومحرك {power} واط" if power else "") + f": {feats_ar[0]}.",
        f"Le blender {brand}{m} a un bol de {cap} litres pour les jus, smoothies, soupes et sauces de la famille. {angle}".strip(),
        f"خلاط {brandAr}{mA} بوعاء {cap} لتر للعصائر والحساء والصلصات.",
        [("Points forts", "\n".join(f"- {f}" for f in feats_fr))], [("المميزات", "\n".join(f"- {f}" for f in feats_ar))],
        specs_fr, specs_ar,
        next(t for t in [f"Blender {brand}{m} {cap} L{p} – Prix Maroc", f"Blender {brand} {cap} L{p} – Prix Maroc", f"Blender {brand} {cap} L – Prix Maroc"] if len(t) <= 58),
        (f"Blender {brand}{m}, bol de {cap} L{(', ' + str(power) + ' W') if power else ''} : {feats_fr[0].lower()}." if len(feats_fr[0]) < 50 else f"Blender {brand}{m}, bol de {cap} L{(', ' + str(power) + ' W') if power else ''}, {len(feats_fr)} atouts pour la cuisine du quotidien."),
        f"خلاط كهربائي {brandAr} {cap} لتر" + (f" {power} واط" if power else "") + " بالمغرب",
        f"خلاط {brandAr}{mA} بوعاء {cap} لتر" + (f" وقوة {power} واط" if power else "") + f"، {feats_ar[0]}.",
        f"blender {brand} {cap}L, {('blender ' + brand + m + ', ') if model else ''}mixeur blender, blender jus et smoothie, prix blender {brand} Maroc",
        f"خلاط {brandAr}, مولينيكس, خلاط العصير, خلاط {cap} لتر, ثمن الخلاط في المغرب",
        [CLEAN] + ([extra_faq] if extra_faq else []), f"Blender {brand}{m} {cap} litres", f"خلاط {brandAr} {cap} لتر", specs)

blender("blender-kenz-moulin-multifonction-3-en-1-capacit-2-litres-2000w-6-lames-inoxydables", ["Puissance 2000 W indiquée par la fiche, à confirmer.", "Garantie non renseignée."],
        "Kenz", "كنز", "3 en 1", 2, 2000, ["Mixe fruits, légumes et glaçons", "6 lames en acier inoxydable", "Vitesse réglable", "Couvercle avec ouverture pour ajouter les ingrédients"],
        ["يخلط الفواكه والخضر والثلج", "6 شفرات من الإينوكس", "سرعة قابلة للتعديل", "غطاء بفتحة لإضافة المكونات"],
        ["Bol : 2 litres", "Puissance : 2000 W", "Lames : 6, acier inoxydable", "Vitesse réglable"], ["الوعاء: 2 لتر", "القوة: 2000 واط", "6 شفرات"],
        name="Blender Kenz 3 en 1 2 L 2000 W 6 lames", extra_faq=ICE)
blender("blender-lm2410lm241b-new-genuine-500w-moulinex", ["Garantie non renseignée."], "Moulinex", "مولينكس", "LM2410", "1,5", 500,
        ["Deux vitesses pour les jus, soupes et smoothies", "Marque Moulinex, pièces faciles à trouver"], ["سرعتان للعصائر والحساء", "علامة مولينكس"],
        ["Référence : LM2410", "Bol : 1,5 litre", "Puissance : 500 W", "Vitesses : 2"], ["المرجع: LM2410", "الوعاء: 1.5 لتر", "القوة: 500 واط"],
        name="Blender Moulinex Genuine LM2410 1,5 L 500 W", specs=[S("Marque", "Moulinex"), S("Référence", "LM2410"), S("Capacité du bol", "1,5 L"), S("Puissance", "500 W"), S("Vitesses", "2")])
blender("blender-inox-15l-1500w-fonction-ice-crush-moulin-caf", [], "Kenz", "كنز", "", "1,5", 1500,
        ["Fonction Ice Crush pour broyer les glaçons", "Moulin à café et à épices fourni", "5 vitesses et fonction Pulse", "6 lames en acier inoxydable, pieds antidérapants"],
        ["وظيفة تكسير الثلج", "مطحنة للقهوة والتوابل", "5 سرعات ونبض", "6 شفرات إينوكس"],
        ["Bol : 1,5 L gradué (ml et oz)", "Puissance : 1500 W", "Lames : 6, acier inoxydable", "Vitesses : 5 + Pulse", "Fonction Ice Crush", "Accessoire : moulin à café / épices"], ["الوعاء: 1.5 لتر", "القوة: 1500 واط", "5 سرعات", "مطحنة القهوة"],
        name="Blender Kenz inox 1,5 L 1500 W Ice Crush avec moulin à café", extra_faq=ICE,
        specs=[S("Capacité du bol", "1,5 L (gradué ml & oz)"), S("Puissance", "1500 W"), S("Lames", "6 lames en acier inoxydable"), S("Vitesses", "5 niveaux + fonction Pulse"), S("Fonction spéciale", "Ice Crush"), S("Accessoire", "Moulin à café / épices inclus"), S("Stabilité", "Pieds antidérapants")])
blender("blender-2en1-15l-multifonction-broyage-de-glaons-450w", ["Garantie non renseignée."], "Fitco", "فيتكو", "2 en 1", "1,5", 450,
        ["Mélangeur et broyeur, broyage des glaçons", "3 vitesses et impulsions", "Interrupteur de sécurité intégré", "Couvercle transparent"], ["خلاط ومطحنة وتكسير الثلج", "3 سرعات ونبض", "قاطع أمان", "غطاء شفاف"],
        ["Bol : 1,5 L", "Puissance : 450 W", "Vitesses : 3 + impulsions", "Broyage des glaçons", "Interrupteur de sécurité"], ["الوعاء: 1.5 لتر", "القوة: 450 واط", "3 سرعات"],
        name="Blender Fitco 2 en 1 1,5 L 450 W", extra_faq=ICE,
        specs=[S("Marque", "Fitco"), S("Type", "Blender 2 en 1 (mélangeur + broyeur)"), S("Capacité", "1,5 L"), S("Puissance", "450 W"), S("Vitesses", "3 + impulsions"), S("Fonction", "Broyage des glaçons"), S("Sécurité", "Interrupteur intégré"), S("Couvercle", "Transparent")])
blender("blender-2-en-1-bol-en-plastique-125l", ["Garantie non renseignée."], "Kenz", "كنز", "2 en 1", "1,25", 350,
        ["Blender et moulin de 200 g", "Bol en plastique léger", "Format compact et facile à ranger"], ["خلاط ومطحنة 200 غرام", "وعاء بلاستيك خفيف", "حجم صغير"],
        ["Bol blender : 1,25 L", "Moulin : 200 g", "Puissance : 350 W"], ["الوعاء: 1.25 لتر", "المطحنة: 200 غرام", "القوة: 350 واط"],
        name="Blender Kenz 2 en 1 bol plastique 1,25 L", specs=[S("Marque", "Kenz"), S("Capacité blender", "1,25 L"), S("Capacité moulin", "200 g"), S("Puissance", "350 W"), S("Bol", "Plastique")])
blender("professional-multifunctional-blender-15l", ["Ancienne fiche en anglais ; « verre glasses » non interprété (matériau du bol à confirmer).", "Puissance 1500 W à confirmer ; garantie non renseignée."],
        "Cuisi Max", "كويزي ماكس", "", "1,5", 1500, ["8 lames", "Fonction Pulse", "Bol de 1,5 litre"], ["8 شفرات", "وظيفة النبض", "وعاء 1.5 لتر"],
        ["Bol : 1,5 L", "Puissance : 1500 W", "Lames : 8", "Fonction Pulse"], ["الوعاء: 1.5 لتر", "8 شفرات"], name="Blender multifonction Cuisi Max 1,5 L",
        specs=[S("Marque", "Cuisi Max"), S("Capacité", "1,5 L"), S("Puissance", "1500 W"), S("Lames", "8"), S("Fonction", "Pulse")])
blender("blender-2-en-1-avec-bol-incassable-2l-puissance-5000-w", ["Puissance « 5000 W » non plausible pour un blender domestique 220 V (~23 A) : non publiée ; nom corrigé sans puissance."],
        "Venezia", "فينيزيا", "2 en 1", 2, None, ["Bol incassable, plus sûr qu'un bol en verre", "Fonctions impulsion et turbo", "Coloris rouge"], ["وعاء لا ينكسر، أكثر أمانا من الزجاج", "نبض وتربو", "لون أحمر"],
        ["Bol : 2 L incassable", "Fonction impulsion", "Fonction turbo", "Couleur : rouge"], ["الوعاء: 2 لتر", "نبض وتربو", "أحمر"],
        name="Blender Venezia 2 en 1 bol incassable 2 L rouge", nameAr="خلاط فينيزيا 2 في 1 بوعاء لا ينكسر 2 لتر أحمر",
        specs=[S("Marque", "Venezia"), S("Type", "Blender 2 en 1"), S("Capacité", "2 L"), S("Bol", "Incassable"), S("Fonctions", "Impulsion, turbo"), S("Couleur", "Rouge")])
blender("braun-blender-puissant-et-polyvalent-powerblend-3-mixage-parfait", ["Garantie non renseignée."], "Braun", "براون", "PowerBlend 3 JB 3150", "1,5", 800,
        ["Carafe en verre ThermoResist pour boissons chaudes et froides", "5 vitesses et fonction Pulse", "Lames en acier inoxydable", "Pièces amovibles compatibles lave-vaisselle"],
        ["إبريق زجاج ThermoResist للمشروبات الساخنة والباردة", "5 سرعات ونبض", "شفرات إينوكس", "قطع تغسل في غسالة الأواني"],
        ["Référence : JB 3150", "Carafe : verre ThermoResist 1,5 L", "Puissance : 800 W", "Vitesses : 5 + Pulse", "Couleur : blanc"], ["المرجع: JB 3150", "إبريق زجاج 1.5 لتر", "القوة: 800 واط", "أبيض"],
        name="Blender Braun PowerBlend 3 JB 3150 1,5 L verre 800 W",
        extra_faq=faq("Peut-on y verser une soupe chaude ?", "Oui, la carafe en verre ThermoResist est faite pour les boissons chaudes et froides. Ne la remplissez pas au maximum avec un liquide chaud.", "واش نقدر نحط فيه الحريرة سخونة؟", "إيه، الإبريق ديال الزجاج ThermoResist مصاوب للسخون والبارد. ما تعمروهش بزاف بالسائل السخون."),
        specs=[S("Marque", "Braun"), S("Référence", "PowerBlend 3 JB 3150"), S("Carafe", "Verre ThermoResist 1,5 L"), S("Puissance", "800 W"), S("Vitesses", "5 + Pulse"), S("Lave-vaisselle", "Pièces amovibles compatibles"), S("Couleur", "Blanc")])

# ── Hand blenders, whisk, chopper, mini-chopper, juicers ────────────────────
add("lamacom-mixeur-plongeant-300w-avec-fonction-anti-claboussures", ["Garantie non renseignée."],
    "Mixeur plongeant Lamacom 300 W anti-éclaboussures", "خلاط يدوي لاماكوم 300 واط",
    "Mixeur plongeant Lamacom de 300 W à 2 vitesses avec gobelet de 600 ml et pied anti-éclaboussures, pour soupes, sauces et purées.",
    "خلاط يدوي لاماكوم 300 واط بسرعتين وكأس 600 مل وتقنية ضد الرذاذ، للحساء والصلصات.",
    "Le mixeur plongeant Lamacom se plonge directement dans la casserole : idéal pour mixer la harira ou une soupe de légumes sans transvaser.",
    "خلاط لاماكوم اليدوي يوضع مباشرة في الطنجرة: مثالي لخلط الحريرة أو حساء الخضر بدون نقل.",
    [("Propre", "La technologie anti-éclaboussures limite les projections sur le plan de travail."), ("Simple", "Deux vitesses et une prise en main ergonomique.")],
    [("نظيف", "تقنية ضد الرذاذ."), ("بسيط", "سرعتان ومقبض مريح.")],
    ["Puissance : 300 W", "Vitesses : 2", "Gobelet : 600 ml", "Anti-éclaboussures", "Tension : 220–240 V"], ["القوة: 300 واط", "سرعتان", "كأس 600 مل"],
    "Mixeur plongeant Lamacom 300 W – Prix Maroc", "Mixeur plongeant Lamacom 300 W, 2 vitesses, gobelet 600 ml, anti-éclaboussures, pour soupes et purées.",
    "خلاط يدوي لاماكوم 300 واط بالمغرب", "خلاط يدوي لاماكوم 300 واط بسرعتين وكأس 600 مل، للحريرة والحساء.",
    "mixeur plongeant Lamacom, mixeur plongeant 300W, mixeur soupe, mixeur à main, prix mixeur plongeant Maroc",
    "خلاط يدوي, مولينيكس يدوي, خلاط الحريرة, خلاط لاماكوم, ثمن الخلاط اليدوي في المغرب",
    [faq("Peut-on mixer directement dans la casserole ?", "Oui, c'est l'intérêt d'un mixeur plongeant : retirez la casserole du feu avant de mixer.", "واش نقدر نخلط فالطنجرة؟", "إيه، هادي الفايدة ديالو. حيدو الطنجرة من العافية قبل.")],
    "Mixeur plongeant Lamacom 300 W", "خلاط يدوي لاماكوم 300 واط",
    specs=[S("Marque", "Lamacom"), S("Puissance", "300 W"), S("Vitesses", "2"), S("Gobelet", "600 ml"), S("Fonction", "Anti-éclaboussures"), S("Tension", "220–240 V, 50/60 Hz")])
add("mixeur-plongeant-350-w-dd121110-moulinex", ["Garantie non renseignée."],
    "Mixeur plongeant Moulinex DD121110 350 W", "خلاط يدوي مولينكس DD121110 بقوة 350 واط",
    "Mixeur plongeant Moulinex DD121110 de 350 W avec gobelet de 800 ml, blanc.",
    "خلاط يدوي مولينكس DD121110 بقوة 350 واط مع كأس 800 مل، أبيض.",
    "Le Moulinex DD121110 est un mixeur plongeant simple et léger pour les soupes, compotes et sauces, avec un gobelet de 800 ml pour les smoothies.",
    "مولينكس DD121110 خلاط يدوي بسيط وخفيف للحساء والكومبوت والصلصات، مع كأس 800 مل.",
    [("Au quotidien", "Moins encombrant qu'un blender, il se range dans un tiroir.")], [("يوميا", "أصغر من الخلاط ويوضع في الدرج.")],
    ["Référence : DD121110", "Puissance : 350 W", "Gobelet : 800 ml", "Couleur : blanc"], ["المرجع: DD121110", "القوة: 350 واط", "كأس 800 مل"],
    "Mixeur plongeant Moulinex DD121110 – Prix Maroc", "Mixeur plongeant Moulinex DD121110 350 W avec gobelet de 800 ml, pour soupes, compotes et smoothies.",
    "خلاط يدوي مولينكس DD121110 بالمغرب", "خلاط يدوي مولينكس DD121110 بقوة 350 واط مع كأس 800 مل للحساء والعصير.",
    "mixeur plongeant Moulinex, Moulinex DD121110, mixeur à main 350W, mixeur soupe Moulinex, prix mixeur Moulinex Maroc",
    "خلاط يدوي مولينكس, مولينيكس يدوي, خلاط الحريرة, خلاط صغير, ثمن خلاط مولينكس في المغرب",
    [CLEAN], "Mixeur plongeant Moulinex DD121110 blanc", "خلاط يدوي مولينكس DD121110 أبيض",
    specs=[S("Marque", "Moulinex"), S("Référence", "DD121110"), S("Puissance", "350 W"), S("Gobelet", "800 ml"), S("Couleur", "Blanc")])
add("prima-batteur-en-inox-hm-1560", ["Puissance et garantie non renseignées."],
    "Batteur électrique Prima HM-1560 inox 5 vitesses", "خفاقة كهربائية بريما HM-1560 إينوكس 5 سرعات",
    "Batteur à main Prima HM-1560 à 5 vitesses avec fouets amovibles en inox, pour crèmes, pâtes légères et blancs en neige.",
    "خفاقة يدوية بريما HM-1560 بخمس سرعات وخفاقات إينوكس قابلة للنزع، للكريمة والعجين الخفيف وبياض البيض.",
    "Le batteur Prima HM-1560 est l'outil des gâteaux : il monte les blancs en neige, fouette la crème et mélange les pâtes légères sans fatigue.",
    "خفاقة بريما HM-1560 أداة الحلويات: تخفق بياض البيض والكريمة وتخلط العجين الخفيف.",
    [("5 vitesses", "Commencez doucement pour éviter les projections, puis montez en vitesse.")], [("5 سرعات", "ابدؤوا ببطء ثم زيدوا السرعة.")],
    ["Vitesses : 5", "Fouets amovibles en acier inoxydable", "Prise en main ergonomique"], ["5 سرعات", "خفاقات إينوكس"],
    "Batteur électrique Prima HM-1560 – Prix Maroc", "Batteur électrique Prima HM-1560 à 5 vitesses, fouets inox amovibles, pour crèmes et blancs en neige.",
    "خفاقة كهربائية بريما HM-1560 بالمغرب", "خفاقة كهربائية بريما HM-1560 بخمس سرعات وخفاقات إينوكس للكريمة والحلويات.",
    "batteur électrique Prima, Prima HM-1560, batteur à main inox, fouet électrique, prix batteur électrique Maroc",
    "خفاقة كهربائية, باتور, خفاقة بريما, خفاقة البيض, ثمن الخفاقة الكهربائية في المغرب",
    [faq("Peut-il pétrir une pâte à pain ?", "Non, un batteur à main est fait pour les préparations légères ; pour le pain, choisissez un robot pétrin.", "واش كيعجن الخبز؟", "لا، الخفاقة للحوايج الخفاف، للخبز ختارو عجانة.")],
    "Batteur électrique Prima HM-1560 inox", "خفاقة كهربائية بريما HM-1560")
add("general-hachoir-lectrique-multifonction-capacit-5l", ["Puissance et garantie non renseignées."],
    "Hachoir électrique General 5 L multifonction", "فرامة كهربائية جنرال 5 لتر",
    "Hachoir électrique General avec bol de 5 litres et lames multiples en inox, pour viande, oignons, légumes, herbes et fruits secs.",
    "فرامة كهربائية جنرال بوعاء 5 لتر وشفرات إينوكس متعددة، للحم والبصل والخضر والأعشاب والمكسرات.",
    "Avec son grand bol de 5 litres, le hachoir General prépare d'un coup la viande hachée de la kefta, les oignons et les herbes pour une grande famille.",
    "بوعاء كبير 5 لتر، فرامة جنرال تحضر دفعة واحدة لحم الكفتة والبصل والأعشاب لعائلة كبيرة.",
    [("Pratique", "Couvercle sécurisé, poignée ergonomique et base antidérapante.")], [("عملية", "غطاء آمن ومقبض مريح وقاعدة ثابتة.")],
    ["Bol : 5 litres", "Lames multiples en acier inoxydable", "Pour viande, légumes, oignons, herbes, fruits, noix", "Tension : 220–240 V", "Couleur : argent / noir"], ["الوعاء: 5 لتر", "شفرات إينوكس"],
    "Hachoir électrique General 5 L – Prix Maroc", "Hachoir électrique General bol 5 L, lames inox, pour viande, oignons, herbes et fruits secs.",
    "فرامة كهربائية جنرال 5 لتر بالمغرب", "فرامة كهربائية جنرال بوعاء 5 لتر وشفرات إينوكس للحم والبصل والأعشاب.",
    "hachoir électrique General, hachoir 5 litres, hachoir viande oignon, hachoir multifonction, prix hachoir électrique Maroc",
    "فرامة كهربائية, فرامة اللحم, فرامة البصل, فرامة جنرال, ثمن الفرامة في المغرب",
    [CLEAN], "Hachoir électrique General 5 litres", "فرامة كهربائية جنرال 5 لتر",
    specs=[S("Type", "Hachoir électrique multifonction"), S("Capacité du bol", "5 L"), S("Marque", "General"), S("Lames", "Multiples, acier inoxydable"), S("Usage", "Viande, légumes, oignons, herbes, fruits, noix"), S("Tension", "220–240 V, 50/60 Hz")])
add("moulinette-ramadan-avec-bol-gratuit-1000-w", ["Nom d'origine « … RAMADAN AVEC BOL GRATUIT » : l'offre « bol gratuit » n'est plus citée ; si elle est toujours valable, l'indiquer dans la fiche.", "Référence Moulinex et garantie non renseignées."],
    "Moulinette Moulinex 1000 W lames Powelix", "مفرمة مولينكس 1000 واط بشفرات Powelix",
    "Moulinette Moulinex de 1000 W avec bol de 0,5 L, lames Powelix en inox et système de vitesses 1-2-3.",
    "مفرمة مولينكس بقوة 1000 واط بوعاء 0.5 لتر وشفرات Powelix من الإينوكس.",
    "La Moulinette Moulinex hache en quelques secondes la viande en petite quantité, les oignons, l'ail, le persil et la coriandre : l'aide de tous les jours pour les plats marocains.",
    "مفرمة مولينكس تفرم في ثوان اللحم بكمية صغيرة والبصل والثوم والمعدنوس والقزبر.",
    [("Lames Powelix", "Deux lames en acier inoxydable, système de vitesses 1-2-3."), ("Pratique", "Bol compatible lave-vaisselle, rangement du cordon et recettes incluses.")],
    [("شفرات Powelix", "شفرتان إينوكس."), ("عملية", "وعاء يغسل في غسالة الأواني.")],
    ["Puissance : 1000 W", "Bol : 0,5 L, plastique", "Lames : 2, Powelix inox", "Vitesses : système 1-2-3", "Compatible lave-vaisselle", "Couleur : noir"], ["القوة: 1000 واط", "الوعاء: 0.5 لتر", "شفرتان"],
    "Moulinette hachoir Moulinex 1000 W – Prix Maroc", "Moulinette Moulinex 1000 W, bol 0,5 L et lames Powelix, pour viande, oignons, ail et herbes.",
    "مفرمة مولينكس 1000 واط بالمغرب", "مفرمة مولينكس 1000 واط بوعاء 0.5 لتر وشفرات Powelix للحم والبصل والأعشاب.",
    "moulinette Moulinex, hachoir Moulinex 1000W, mini hachoir, moulinette lames Powelix, prix moulinette Moulinex Maroc",
    "مفرمة مولينكس, مولينيت, فرامة صغيرة, فرامة البصل, ثمن مفرمة مولينكس في المغرب",
    [CLEAN], "Moulinette Moulinex 1000 W noire", "مفرمة مولينكس 1000 واط سوداء")
add("presse-agrumes-general-je-630f-85w", ["Garantie non renseignée."],
    "Presse-agrumes électrique General JE-630F inox 85 W", "عصارة حوامض كهربائية جنرال JE-630F إينوكس 85 واط",
    "Presse-agrumes électrique General JE-630F en inox, 85 W et réservoir de 1,2 L, pour les jus d'orange de toute la famille.",
    "عصارة حوامض كهربائية جنرال JE-630F من الإينوكس، 85 واط وخزان 1.2 لتر.",
    "Le General JE-630F presse oranges, citrons et pamplemousses directement dans son réservoir de 1,2 litre : le jus d'orange frais du petit-déjeuner pour toute la famille.",
    "جنرال JE-630F تعصر البرتقال والليمون مباشرة في خزان 1.2 لتر: عصير البرتقال الطازج للعائلة.",
    [("Inox", "Boîtier en acier inoxydable, patins antidérapants et interrupteur marche/arrêt.")], [("إينوكس", "هيكل إينوكس وقاعدة ثابتة.")],
    ["Puissance : 85 W", "Capacité : 1,2 L", "Boîtier : acier inoxydable", "Patins antidérapants", "Couleur : gris"], ["القوة: 85 واط", "السعة: 1.2 لتر", "إينوكس"],
    "Presse-agrumes General JE-630F inox – Prix Maroc", "Presse-agrumes électrique General JE-630F en inox, 85 W, réservoir 1,2 L pour le jus d'orange.",
    "عصارة حوامض جنرال JE-630F بالمغرب", "عصارة حوامض كهربائية جنرال JE-630F إينوكس 85 واط وخزان 1.2 لتر.",
    "presse-agrumes électrique General, General JE-630F, presse orange inox, presse-agrumes 1,2 L, prix presse-agrumes Maroc",
    "عصارة البرتقال, عصارة كهربائية, عصارة الحوامض, عصارة جنرال, ثمن عصارة البرتقال في المغرب",
    [CLEAN], "Presse-agrumes électrique General JE-630F inox", "عصارة حوامض جنرال JE-630F",
    specs=[S("Marque", "General"), S("Référence", "JE-630F"), S("Type", "Presse-agrumes"), S("Boîtier", "Acier inoxydable"), S("Capacité", "1,2 L"), S("Puissance", "85 W"), S("Alimentation", "230 V, 50/60 Hz"), S("Patins antidérapants", "Oui"), S("Couleur", "Gris")])
add("presse-agrumes-lectrique-professionnel-bonana-bo-jc2018h", ["Garantie non renseignée."],
    "Presse-agrumes électrique Bonana BO-JC2018H 130 W", "عصارة حوامض كهربائية بونانا BO-JC2018H بقوة 130 واط",
    "Presse-agrumes électrique Bonana BO-JC2018H de 130 W avec réservoir de 0,5 L, compact pour les jus du matin.",
    "عصارة حوامض كهربائية بونانا BO-JC2018H بقوة 130 واط وخزان 0.5 لتر.",
    "Le Bonana BO-JC2018H est un presse-agrumes compact de 130 W : son réservoir de 0,5 litre convient aux jus pressés pour une à trois personnes.",
    "بونانا BO-JC2018H عصارة صغيرة بقوة 130 واط وخزان 0.5 لتر لشخص إلى ثلاثة.",
    [], [], ["Puissance : 130 W", "Capacité : 0,5 L", "Couleur : gris"], ["القوة: 130 واط", "السعة: 0.5 لتر"],
    "Presse-agrumes Bonana BO-JC2018H – Prix Maroc", "Presse-agrumes électrique Bonana BO-JC2018H 130 W, réservoir 0,5 L, compact pour le jus du matin.",
    "عصارة حوامض بونانا BO-JC2018H بالمغرب", "عصارة حوامض كهربائية بونانا BO-JC2018H بقوة 130 واط وخزان 0.5 لتر.",
    "presse-agrumes Bonana, Bonana BO-JC2018H, presse-agrumes compact, presse orange électrique, prix presse-agrumes Bonana Maroc",
    "عصارة بونانا, عصارة البرتقال, عصارة صغيرة, عصارة كهربائية, ثمن العصارة في المغرب",
    [CLEAN], "Presse-agrumes électrique Bonana BO-JC2018H", "عصارة حوامض بونانا BO-JC2018H",
    specs=[S("Marque", "Bonana"), S("Référence", "BO-JC2018H"), S("Type", "Presse-agrumes électrique"), S("Capacité", "0,5 L"), S("Puissance", "130 W"), S("Couleur", "Gris")])

# ── Grain and spice mills ───────────────────────────────────────────────────
def mill(slug, verify, brand, brandAr, cap, capAr, power, use_fr, use_ar, name=None):
    add(slug, verify, name or f"Moulin à grains {brand} {cap} {power} W", f"مطحنة حبوب {brandAr} {capAr} {power} واط",
        f"Moulin électrique {brand} en inox de {cap}, {power} W, pour café, épices et céréales sèches.",
        f"مطحنة كهربائية {brandAr} من الإينوكس سعة {capAr}، {power} واط، للقهوة والتوابل والحبوب.",
        f"Le moulin {brand} de {cap} broie café, épices et céréales sèches en quelques secondes. {use_fr}",
        f"مطحنة {brandAr} سعة {capAr} تطحن القهوة والتوابل والحبوب في ثوان. {use_ar}",
        [("Inox", "Cuve en acier inoxydable, plus facile à nettoyer et résistante aux épices.")], [("إينوكس", "وعاء من الإينوكس سهل التنظيف.")],
        [f"Capacité : {cap}", f"Puissance : {power} W", "Matériau : acier inoxydable", "Tension : 220–240 V"], [f"السعة: {capAr}", f"القوة: {power} واط", "إينوكس"],
        f"Moulin à grains électrique {brand} {cap} – Prix Maroc", f"Moulin électrique {brand} inox {cap}, {power} W, pour café, épices, blé et orge.",
        f"مطحنة الحبوب الكهربائية {brandAr} {capAr} بالمغرب", f"مطحنة كهربائية {brandAr} إينوكس سعة {capAr} بقوة {power} واط للقهوة والتوابل والقمح.",
        f"moulin à grains {brand} {cap}, moulin à épices électrique, moulin à café inox, moulin céréales, prix moulin {brand} Maroc",
        f"طحانة {brandAr}, مطحنة الحبوب, مطحنة القهوة, طحانة التوابل, ثمن المطحنة في المغرب",
        [MILL], f"Moulin à grains électrique {brand} {cap} inox", f"مطحنة حبوب {brandAr} {capAr} إينوكس",
        specs=[S("Type", "Moulin à grains"), S("Matériau", "Acier inoxydable"), S("Capacité", cap), S("Puissance", f"{power} W"), S("Tension", "220–240 V")])

mill("moulin-grains-kenz-100g", ["Garantie non renseignée."], "Kenz", "كنز", "100 g", "100 غرام", 700, "Le format compact du café et des épices du quotidien.", "حجم صغير للقهوة والتوابل اليومية.")
mill("moulin-grains-kenz-350g", ["Garantie non renseignée."], "Kenz", "كنز", "350 g", "350 غرام", 1600, "Un format intermédiaire pour les épices des tajines et les préparations de la semaine.", "حجم متوسط لتوابل الطاجين.")
mill("moulin-grains-kenz-400g", ["Garantie non renseignée."], "Kenz", "كنز", "400 g", "400 غرام", 1800, "Un bon volume pour moudre les mélanges d'épices et les graines en quantité.", "حجم جيد لخلطات التوابل.")
mill("moulin-grains-kenz-500g", ["Garantie non renseignée."], "Kenz", "كنز", "500 g", "500 غرام", 2300, "Le plus grand des moulins Kenz : pour l'orge, le blé ou la préparation de la sellou.", "أكبر مطحنة كنز: للشعير والقمح وتحضير السلو.")
mill("moulin-a-epices-tatch-25kg", ["Garantie non renseignée."], "Tatch", "تاتش", "2,5 kg", "2.5 كلغ", 3000, "Une capacité semi-professionnelle pour les grandes quantités : réserves de farine d'orge, préparations des fêtes, commerce.", "سعة شبه مهنية للكميات الكبيرة.",
     name="Moulin à grains et épices Tatch 2,5 kg 3000 W")
add("damai-moulin-pices-500g-acier-inoxydable", ["Ancienne description : « capacité de 500 kg » (coquille pour 500 g).", "Garantie non renseignée."],
    "Moulin à épices Damai 500 g inox 2000 W", "مطحنة توابل داماي 500 غرام إينوكس 2000 واط",
    "Moulin électrique Damai en acier inoxydable, 500 g et 2000 W, pour café, épices et herbes, avec un bouton unique.",
    "مطحنة كهربائية داماي من الإينوكس سعة 500 غرام وقوة 2000 واط للقهوة والتوابل.",
    "Le moulin Damai moud café, épices et herbes séchées d'une simple pression sur son bouton unique.",
    "مطحنة داماي تطحن القهوة والتوابل والأعشاب بضغطة زر واحد.",
    [("Simple", "Un seul bouton : maintenez-le jusqu'à la finesse voulue.")], [("بسيطة", "زر واحد حتى الحصول على النعومة المطلوبة.")],
    ["Capacité : 500 g", "Puissance : 2000 W", "Matériau : acier inoxydable"], ["السعة: 500 غرام", "القوة: 2000 واط", "إينوكس"],
    "Moulin à épices Damai 500 g inox – Prix Maroc", "Moulin à épices Damai 500 g en inox, 2000 W, pour café, épices et herbes, simple d'utilisation.",
    "مطحنة توابل داماي 500 غرام بالمغرب", "مطحنة توابل داماي إينوكس سعة 500 غرام بقوة 2000 واط للقهوة والتوابل.",
    "moulin à épices Damai, moulin électrique 500 g, moulin à café inox, moulin herbes, prix moulin à épices Maroc",
    "طحانة داماي, مطحنة التوابل, مطحنة القهوة, طحانة إينوكس, ثمن المطحنة في المغرب",
    [MILL], "Moulin à épices Damai 500 g acier inoxydable", "مطحنة توابل داماي 500 غرام",
    specs=[S("Marque", "Damai"), S("Capacité", "500 g"), S("Puissance", "2000 W"), S("Matériau", "Acier inoxydable")])

# ── Stand mixers / dough mixers ─────────────────────────────────────────────
def mixer(slug, verify, name, nameAr, short, shortAr, intro, introAr, secs, secsAr, sp_fr, sp_ar, mt, md, tAr, mdAr, kw_extra, alt, altAr, specs=None):
    tAr = tAr.replace(" بالمغرب", " للخبز والحلويات بالمغرب") if len(tAr) < 32 else tAr
    add(slug, verify, name, nameAr, short, shortAr, intro, introAr, secs, secsAr, sp_fr, sp_ar, mt, md, tAr, mdAr,
        f"{kw_extra}, robot pétrin, pétrin pâtisserie, robot pâtissier, prix pétrin Maroc",
        "عجانة, بيتران, عجانة الخبز, عجانة الحلويات, ثمن العجانة في المغرب", [DOUGH, CLEAN], alt, altAr, specs)

mixer("robot-ptrin-ptissier-multifonction-9l-1500w", ["Fiche très courte : nombre de vitesses, accessoires et garantie non renseignés."],
      "Robot pétrin pâtissier Tatch 9 L 1500 W", "عجانة تاتش 9 لتر 1500 واط",
      "Robot pétrin pâtissier Tatch avec bol de 9 litres et moteur de 1500 W, pour les grandes quantités de pâte.",
      "عجانة تاتش بوعاء 9 لترات ومحرك 1500 واط للكميات الكبيرة من العجين.",
      "Avec son bol de 9 litres, le robot Tatch s'adresse aux grandes familles et aux préparations des fêtes : pains, msemen, baghrir, gâteaux en quantité.",
      "بوعاء 9 لترات، عجانة تاتش للعائلات الكبيرة والمناسبات: الخبز والمسمن والبغرير والحلويات بكميات كبيرة.",
      [("Grande capacité", "9 litres, c'est l'un des plus grands bols de notre gamme.")], [("سعة كبيرة", "9 لترات من أكبر الأوعية عندنا.")],
      ["Bol : 9 litres", "Puissance : 1500 W"], ["الوعاء: 9 لترات", "القوة: 1500 واط"],
      "Robot pétrin Tatch 9 L 1500 W – Prix Maroc", "Robot pétrin pâtissier Tatch bol 9 L, 1500 W, pour pains, msemen et gâteaux en grande quantité.",
      "عجانة تاتش 9 لتر بالمغرب", "عجانة تاتش بوعاء 9 لترات وقوة 1500 واط للخبز والمسمن والحلويات.",
      "robot pétrin Tatch 9L", "Robot pétrin pâtissier Tatch 9 litres", "عجانة تاتش 9 لترات")
mixer("robot-ptrin-professionnel-itimat-75l", ["Puissance et garantie non renseignées. Référence IT-13007L citée dans l'ancienne description."],
      "Robot pétrin Itimat IT-13007L 7,5 L 6 vitesses", "عجانة إيتيمات IT-13007L سعة 7.5 لتر 6 سرعات",
      "Robot pétrin Itimat de 7,5 litres à mouvement planétaire, 6 vitesses et fonction Pulse, avec fouet, batteur et crochet.",
      "عجانة إيتيمات 7.5 لتر بحركة كوكبية و6 سرعات ونبض، مع خفاقة ومضرب وخطاف.",
      "Le robot Itimat IT-13007L pétrit, mélange et fouette dans un bol en inox de 7,5 litres. Son mouvement planétaire fait tourner l'outil tout autour du bol pour une pâte homogène.",
      "عجانة إيتيمات IT-13007L تعجن وتخلط وتخفق في وعاء إينوكس 7.5 لتر بحركة كوكبية لعجين متجانس.",
      [("Kit pâtisserie inclus", "Fouet en inox pour les crèmes, batteur pour les pâtes à gâteau, crochet pour la pâte à pain.")], [("ملحقات الحلويات", "خفاقة ومضرب وخطاف العجين.")],
      ["Bol : 7,5 L, acier inoxydable", "Vitesses : 6 + Pulse", "Mouvement planétaire", "Accessoires : fouet, batteur, crochet"], ["الوعاء: 7.5 لتر إينوكس", "6 سرعات", "حركة كوكبية"],
      "Robot pétrin Itimat 7,5 L 6 vitesses – Prix Maroc", "Robot pétrin Itimat IT-13007L bol inox 7,5 L, 6 vitesses, mouvement planétaire et kit pâtisserie.",
      "عجانة إيتيمات 7.5 لتر بالمغرب", "عجانة إيتيمات IT-13007L بوعاء إينوكس 7.5 لتر و6 سرعات وحركة كوكبية.",
      "robot pétrin Itimat 7,5L", "Robot pétrin Itimat IT-13007L 7,5 litres", "عجانة إيتيمات 7.5 لتر",
      specs=[S("Marque", "Itimat"), S("Référence", "IT-13007L"), S("Bol", "7,5 L, acier inoxydable"), S("Vitesses", "6 + Pulse"), S("Mouvement", "Planétaire"), S("Accessoires", "Fouet inox, batteur, crochet à pétrir")])
mixer("bomann-robot-ptrin-rouge-bomann-allemand-1000w", ["Référence Bomann et garantie non renseignées."],
      "Robot pétrin Bomann 1000 W bol 5 L rouge", "عجانة بومان 1000 واط وعاء 5 لتر حمراء",
      "Robot pétrin Bomann de 1000 W, bol en acier de 5 litres pour 2,5 à 3 kg de préparation, variateur électronique et fonction impulsion.",
      "عجانة بومان بقوة 1000 واط ووعاء فولاذي 5 لتر لـ2.5 إلى 3 كلغ، مع متغير سرعة إلكتروني.",
      "Le Bomann rouge pétrit jusqu'à 2,5 à 3 kg de préparation dans son bol de 5 litres. Ses crochets en aluminium moulé conviennent aux pâtes lourdes comme le pain.",
      "عجانة بومان الحمراء تعجن حتى 2.5 إلى 3 كلغ في وعاء 5 لتر، بخطافات ألومنيوم للعجين الثقيل.",
      [("Accessoires", "Crochet et mélangeur en aluminium moulé, fouet en inox pour les blancs et biscuits légers."),
       ("Sécurité", "Bras pivotant à 35° avec déverrouillage, circuit de sécurité, couvercle anti-éclaboussures avec ouverture de remplissage et pieds à ventouse.")],
      [("الملحقات", "خطاف وخلاط ألومنيوم وخفاقة إينوكس."), ("السلامة", "ذراع قابل للدوران وغطاء ضد الرذاذ وأرجل ثابتة.")],
      ["Puissance : 1000 W", "Bol : 5 L, acier", "Capacité de préparation : 2,5 à 3 kg", "Variateur électronique + impulsion", "Couleur : rouge"], ["القوة: 1000 واط", "الوعاء: 5 لتر", "2.5 إلى 3 كلغ"],
      "Robot pétrin Bomann 1000 W 5 L – Prix Maroc", "Robot pétrin Bomann 1000 W, bol 5 L pour 2,5 à 3 kg de pâte, variateur électronique, rouge.",
      "عجانة بومان 1000 واط بالمغرب", "عجانة بومان 1000 واط ووعاء 5 لتر لـ2.5 إلى 3 كلغ من العجين، حمراء.",
      "robot pétrin Bomann", "Robot pétrin Bomann 1000 W rouge", "عجانة بومان حمراء",
      specs=[S("Marque", "Bomann"), S("Puissance", "1000 W"), S("Bol", "5 L, acier"), S("Préparation max.", "2,5 à 3 kg"), S("Commande", "Variateur électronique + impulsion"), S("Bras", "Pivotant 35°"), S("Couleur", "Rouge")])
mixer("ptrin-7l-avec-blender-en-verre-de-15-l-daiko-rp8860k", ["Garantie non renseignée ; détail des 4 accessoires non renseigné."],
      "Robot pétrin Daiko RP8860K 7 L avec blender verre 1,5 L", "عجانة دايكو RP8860K سعة 7 لتر مع خلاط زجاجي 1.5 لتر",
      "Robot pétrin Daiko RP8860K de 1300 W avec bol inox de 7 litres, 10 vitesses et blender en verre de 1,5 litre.",
      "عجانة دايكو RP8860K بقوة 1300 واط ووعاء إينوكس 7 لترات و10 سرعات وخلاط زجاجي 1.5 لتر.",
      "Le Daiko RP8860K réunit deux appareils : un robot pétrin de 7 litres et un blender en verre de 1,5 litre pour les jus et soupes.",
      "دايكو RP8860K جهازان في واحد: عجانة 7 لترات وخلاط زجاجي 1.5 لتر.",
      [("10 vitesses", "Avec un bouton Pulse, pour passer du pétrissage lent au fouettage rapide.")], [("10 سرعات", "مع زر النبض.")],
      ["Référence : RP8860K", "Bol : 7 L, inox", "Puissance : 1300 W", "Vitesses : 10 + Pulse", "Blender en verre : 1,5 L", "Accessoires : 4"], ["المرجع: RP8860K", "الوعاء: 7 لتر", "القوة: 1300 واط", "خلاط زجاجي"],
      "Robot pétrin Daiko 7 L avec blender – Prix Maroc", "Robot pétrin Daiko RP8860K 1300 W, bol inox 7 L, 10 vitesses et blender en verre 1,5 L.",
      "عجانة دايكو 7 لتر مع خلاط بالمغرب", "عجانة دايكو RP8860K بقوة 1300 واط ووعاء 7 لترات وخلاط زجاجي 1.5 لتر.",
      "robot pétrin Daiko RP8860K, pétrin avec blender", "Robot pétrin Daiko RP8860K avec blender en verre", "عجانة دايكو RP8860K مع خلاط",
      specs=[S("Modèle", "RP8860K"), S("Capacité", "7 L"), S("Puissance", "1300 W"), S("Bol", "Acier inoxydable"), S("Vitesses", "10 + Pulse"), S("Blender", "Verre 1,5 L"), S("Accessoires", "4")])
mixer("petrin-75l-tatch", ["Référence « it-130075eldh » proche de l'Itimat IT-13007L : possible même produit sous deux marques (doublon), à vérifier.", "Puissance et garantie non renseignées."],
      "Robot pétrin Tatch 7,5 L 6 vitesses", "عجانة تاتش 7.5 لتر 6 سرعات",
      "Robot pétrin Tatch avec bol inox de 7,5 litres, 6 vitesses et kit pâtisserie.",
      "عجانة تاتش بوعاء إينوكس 7.5 لتر و6 سرعات وملحقات الحلويات.",
      "Le pétrin Tatch de 7,5 litres est un format familial pour le pain de la semaine, les msemen et les gâteaux.",
      "عجانة تاتش 7.5 لتر حجم عائلي لخبز الأسبوع والمسمن والحلويات.",
      [], [], ["Bol : 7,5 L, acier inoxydable", "Vitesses : 6", "Kit pâtisserie inclus"], ["الوعاء: 7.5 لتر", "6 سرعات"],
      "Robot pétrin Tatch 7,5 L 6 vitesses – Prix Maroc", "Robot pétrin Tatch bol inox 7,5 L, 6 vitesses et kit pâtisserie, pour pain, msemen et gâteaux.",
      "عجانة تاتش 7.5 لتر بالمغرب", "عجانة تاتش بوعاء إينوكس 7.5 لتر و6 سرعات للخبز والمسمن والحلويات.",
      "pétrin Tatch 7,5L", "Robot pétrin Tatch 7,5 litres", "عجانة تاتش 7.5 لتر")
mixer("petrin-prima-yd-3810t-10l", ["Puissance contradictoire (1800 W dans la fiche, 1000 W dans l'ancienne description) : non publiée.", "Garantie non renseignée."],
      "Robot pétrin Prima YD-3810T 10 L", "عجانة بريما YD-3810T سعة 10 لترات",
      "Robot pétrin Prima YD-3810T avec bol inox de 10 litres, mouvement planétaire, tête inclinable, crochet, batteur plat et fouet ballon.",
      "عجانة بريما YD-3810T بوعاء إينوكس 10 لترات وحركة كوكبية ورأس قابل للإمالة وثلاثة ملحقات.",
      "Avec 10 litres, le Prima YD-3810T est le plus grand pétrin de notre gamme : pour les familles nombreuses, les pâtissiers amateurs et un usage semi-professionnel.",
      "بـ10 لترات، بريما YD-3810T أكبر عجانة عندنا: للعائلات الكبيرة والاستعمال شبه المهني.",
      [("Pratique", "Tête inclinable pour changer d'accessoire et retirer le bol ; couvercle transparent avec ouverture pour ajouter les ingrédients en marche.")],
      [("عملية", "رأس قابل للإمالة وغطاء شفاف بفتحة.")],
      ["Bol : 10 L, acier inoxydable", "Mouvement planétaire", "Accessoires : crochet pétrisseur, batteur plat, fouet ballon", "Alimentation : 220–240 V, 50 Hz"], ["الوعاء: 10 لترات", "حركة كوكبية", "3 ملحقات"],
      "Robot pétrin Prima 10 L YD-3810T – Prix Maroc", "Robot pétrin Prima YD-3810T bol inox 10 L, mouvement planétaire, crochet, batteur et fouet.",
      "عجانة بريما 10 لترات بالمغرب", "عجانة بريما YD-3810T بوعاء إينوكس 10 لترات وحركة كوكبية وثلاثة ملحقات.",
      "robot pétrin Prima 10L, pétrin 10 litres", "Robot pétrin Prima YD-3810T 10 litres", "عجانة بريما 10 لترات",
      specs=[S("Capacité", "10 L"), S("Accessoires inclus", "Crochet pétrisseur, batteur plat et fouet ballon"), S("Alimentation", "220–240 V / 50 Hz"), S("Mouvement", "Planétaire"), S("Tête", "Inclinable")])
mixer("petrin-ou-6118-general-noir-7l", ["Garantie non renseignée."],
      "Robot pétrin General OU-6118 7 L 1500 W noir", "عجانة جنرال OU-6118 سعة 7 لتر 1500 واط سوداء",
      "Robot pétrin General OU-6118 de 1500 W avec bol inox de 7 litres, 5 vitesses et commande digitale, noir.",
      "عجانة جنرال OU-6118 بقوة 1500 واط ووعاء إينوكس 7 لترات و5 سرعات وتحكم رقمي، سوداء.",
      "Le General OU-6118 associe un moteur de 1500 W et une commande digitale dans une finition noire : un pétrin familial de 7 litres.",
      "جنرال OU-6118 تجمع محركا 1500 واط وتحكما رقميا بلون أسود: عجانة عائلية 7 لترات.",
      [], [], ["Bol : 7 L, acier inoxydable", "Puissance : 1500 W", "Vitesses : 5", "Commande digitale", "Couleur : noir"], ["الوعاء: 7 لترات", "القوة: 1500 واط", "5 سرعات", "أسود"],
      "Robot pétrin General OU-6118 7 L – Prix Maroc", "Robot pétrin General OU-6118 1500 W, bol inox 7 L, 5 vitesses et commande digitale, noir.",
      "عجانة جنرال OU-6118 بالمغرب", "عجانة جنرال OU-6118 بقوة 1500 واط ووعاء 7 لترات و5 سرعات، سوداء.",
      "robot pétrin General OU-6118", "Robot pétrin General OU-6118 noir", "عجانة جنرال OU-6118 سوداء",
      specs=[S("Marque", "General"), S("Référence", "OU-6118"), S("Capacité", "7 L"), S("Puissance", "1500 W"), S("Vitesses", "5"), S("Commande", "Digitale"), S("Bol", "Acier inoxydable"), S("Couleur", "Noir")])

TITLE_OVERRIDE = {
  "blender-inox-15l-1500w-fonction-ice-crush-moulin-caf": "Blender Kenz inox 1,5 L Ice Crush 1500 W – Prix Maroc",
  "blender-2-en-1-avec-bol-incassable-2l-puissance-5000-w": "Blender Venezia 2 en 1 bol incassable 2 L – Prix Maroc",
  "braun-blender-puissant-et-polyvalent-powerblend-3-mixage-parfait": "Blender Braun PowerBlend 3 verre 1,5 L – Prix Maroc",
}
for e in P:
    if e["slug"] in TITLE_OVERRIDE: e["changes"]["metaTitle"] = TITLE_OVERRIDE[e["slug"]]
prods = [e for e in P if e["kind"] == "product"]
assert len(prods) == 28, len(prods)
for e in P: assert "None" not in json.dumps(e["changes"], ensure_ascii=False), e["slug"]
json.dump(P, open(os.path.join(HERE, "pe-A.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(P), "entries (1 category + 28 products)")
