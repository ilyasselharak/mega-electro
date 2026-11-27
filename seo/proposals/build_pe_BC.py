# -*- coding: utf-8 -*-
# Batches "pe-B" (cooking, 15) and "pe-C" (home, 10) of the Petit électroménager category.
# Facts only from the store database (backups/seo/after-cook/pe-current.json). Contradictions, wrong brands,
# health claims and unconfirmed offers are flagged and never published.
import json, os
HERE = os.path.dirname(__file__)
cur = {p["slug"]: p for p in json.load(open(os.path.join(HERE, "../../backups/seo/after-cook/pe-current.json"), encoding="utf-8"))}
B, C = [], []
ST = "Livraison partout au Maroc, paiement à la livraison."
STA = "توصيل لكل المغرب والدفع عند الاستلام."
def S(l, v): return {"label": l, "value": v}
def faq(q, a, qa, aa): return {"question": q, "answer": a, "questionAr": qa, "answerAr": aa}
def txt(intro, secs, specs, ar=False):
    b = intro + ("\n\n" + "\n\n".join(f"### {h}\n{t}" for h, t in secs) if secs else "")
    if specs: b += ("\n\n### المواصفات\n" if ar else "\n\n### Caractéristiques\n") + "\n".join(f"- {l}" for l in specs)
    return b
def fitmd(md, end, extra, lo):
    s = f"{md} {end}"
    return s if len(s) >= lo else f"{md} {extra} {end}"

def item(batch, slug, verify, d, specs=None):
    """d: name,nameAr,short,shortAr,intro,introAr,secs,secsAr,sp,spAr,mt,md,tAr,mdAr,kw,kwAr,faq,alt,altAr"""
    keys = cur[slug]["imgs"]; w = cur[slug]["w"]
    c = {"name": d["name"], "nameAr": d["nameAr"], "shortDescription": d["short"],
         "description": txt(d["intro"], d["secs"], d["sp"]) + (f"\n\nGarantie : {w} mois." if w else ""),
         "metaTitle": d["mt"], "metaDescription": fitmd(d["md"], ST, "Commande en ligne ou sur WhatsApp.", 120),
         "seo": {"titleAr": d["tAr"], "metaDescriptionAr": fitmd(d["mdAr"], STA, "اطلبوا عبر الموقع أو واتساب.", 100), "shortDescriptionAr": d["shortAr"],
                 "descriptionAr": txt(d["introAr"], d["secsAr"], d["spAr"], ar=True) + (f"\n\nالضمان: {w} شهرا." if w else ""), "keywords": d["kw"], "keywordsAr": d["kwAr"]},
         **({"faq": d["faq"]} if d["faq"] else {}), "imageAlts": [{"key": k, "alt": d["alt"] if i == 0 else f'{d["alt"]}, vue {i + 1}', "altAr": d["altAr"] if i == 0 else f'{d["altAr"]}، صورة {i + 1}'} for i, k in enumerate(keys)]}
    e = {"kind": "product", "slug": slug, "source": batch, "sources": [], "verify": verify, "specsVerified": False, "changes": c}
    if specs: c["specs"] = specs; e["specsVerified"] = True; e["sources"] = ["Valeurs de la fiche et de l'ancienne description Mega Electro (aucune valeur ajoutée)"]
    (B if batch == "pe-B" else C).append(e)

AIRFRY = faq("Faut-il ajouter de l'huile ?", "Pas nécessairement : l'air chaud cuit et dore les aliments. Une cuillère d'huile peut rendre les frites plus croustillantes.", "واش خاص نزيد الزيت؟", "ماشي ضروري، الهوا السخون كيطيب وكيحمر. معلقة ديال الزيت كتخلي البطاطا مقرمشة كثر.")
PANINI = faq("Comment nettoyer les plaques ?", "Débranchez et laissez tiédir, puis essuyez avec un papier absorbant ou une éponge douce humide. Évitez les ustensiles métalliques sur le revêtement.", "كيفاش ننقي البلاكات؟", "فصلوه وخليوه يبرد شوية، ومسحوه بكلينكس ولا إسفنجة فازكة. ما تستعملوش الحديد على الطلاء.")
PRESSURE = faq("Peut-on l'utiliser sur une plaque à induction ?", "Ce n'est pas indiqué dans la fiche : demandez-nous confirmation avant de commander si vous cuisinez sur induction.", "واش كتخدم على البلاك ديال الأندكسيون؟", "ماشي مذكور فالبطاقة، سولونا قبل الطلب.")
VAC = faq("Avec ou sans sac ?", "Sans sac : la poussière est collectée dans un réservoir que l'on vide directement à la poubelle.", "واش بالساك ولا بلا؟", "بلا ساك، الغبرة كتجمع فخزان وكتخويه مباشرة.")

# ═════════════ Batch B: cooking ═════════════
item("pe-B", "friteuse-air-digitale-multifonctions-9l", ["Garantie non renseignée."], dict(
  name="Friteuse sans huile Daiko 9 L 1700 W FSH-9874EDK", nameAr="قلاية بدون زيت دايكو 9 لتر 1700 واط FSH-9874EDK",
  short="Friteuse à air chaud Daiko FSH-9874EDK de 9 litres et 1700 W, écran tactile, thermostat 80–200 °C et minuterie 60 minutes.",
  shortAr="قلاية بالهواء الساخن دايكو FSH-9874EDK سعة 9 لترات وقوة 1700 واط، شاشة لمس وحرارة من 80 إلى 200 درجة.",
  intro="Avec 9 litres, la Daiko FSH-9874EDK est une friteuse à air chaud familiale : frites, poulet, poisson ou légumes pour toute la tablée en une seule cuisson.",
  introAr="بسعة 9 لترات، دايكو FSH-9874EDK قلاية عائلية: البطاطا والدجاج والسمك والخضر للعائلة كلها دفعة واحدة.",
  secs=[("Réglages", "Écran tactile, programmes de cuisson, thermostat de 80 à 200 °C et minuterie jusqu'à 60 minutes."), ("Entretien", "Panier amovible facile à nettoyer ; matériaux sans BPA ni PFOA selon la fiche.")],
  secsAr=[("التعديلات", "شاشة لمس وبرامج وحرارة من 80 إلى 200 درجة ومؤقت 60 دقيقة."), ("العناية", "سلة قابلة للنزع وبدون BPA وPFOA.")],
  sp=["Capacité : 9 L", "Puissance : 1700 W", "Thermostat : 80–200 °C", "Minuterie : 60 min", "Écran tactile digital", "Dimensions : 414 × 310 × 348 mm", "Poids net : 6 kg"],
  spAr=["السعة: 9 لترات", "القوة: 1700 واط", "الحرارة: 80–200 درجة", "مؤقت 60 دقيقة"],
  mt="Friteuse sans huile Daiko 9 L 1700 W – Prix Maroc", md="Friteuse à air Daiko FSH-9874EDK 9 L, 1700 W, écran tactile, 80–200 °C et minuterie 60 min.",
  tAr="قلاية بدون زيت دايكو 9 لتر بالمغرب", mdAr="قلاية بدون زيت دايكو FSH-9874EDK سعة 9 لترات وقوة 1700 واط مع شاشة لمس.",
  kw="friteuse sans huile Daiko 9L, air fryer 9 litres, friteuse à air chaud familiale, Daiko FSH-9874EDK, prix air fryer Maroc",
  kwAr="قلاية بدون زيت, إير فراير, مقلاة هوائية, قلاية دايكو 9 لتر, ثمن القلاية بدون زيت في المغرب",
  faq=[AIRFRY], alt="Friteuse sans huile Daiko FSH-9874EDK 9 litres", altAr="قلاية بدون زيت دايكو 9 لترات"),
  specs=[S("Modèle", "FSH-9874EDK"), S("Capacité", "9 L"), S("Puissance", "1700 W"), S("Tension", "220–240 V, 50/60 Hz"), S("Interface", "Écran tactile digital"), S("Température", "80–200 °C"), S("Minuterie", "60 min"), S("Dimensions", "414 × 310 × 348 mm"), S("Poids net", "6 kg"), S("Matériaux", "Sans BPA, sans PFOA")])

item("pe-B", "air-fryer-friteuse-sans-huile-6-litres-2400-w-6-fonctions-tactiles", ["Ancienne description : marque « silver crest » (marque d'une autre enseigne) pour un produit vendu sous la marque Stillo — à vérifier.", "Nombre de fonctions : 6 (nom) contre 10 (ancienne description) — non publié.", "Allégations santé de l'ancienne description (diabète, perte de poids) retirées.", "Garantie non renseignée."], dict(
  name="Friteuse sans huile Stillo 6 L 2400 W", nameAr="قلاية بدون زيت ستيلو 6 لتر 2400 واط",
  short="Friteuse à air chaud Stillo de 6 litres et 2400 W avec commandes tactiles, jusqu'à 200 °C.",
  shortAr="قلاية بالهواء الساخن ستيلو سعة 6 لترات وقوة 2400 واط بأزرار لمس، حتى 200 درجة.",
  intro="La friteuse Stillo de 6 litres cuit frites, viande, poisson, poulet ou légumes à l'air chaud, jusqu'à 200 °C, avec peu ou pas d'huile.",
  introAr="قلاية ستيلو 6 لترات تطهو البطاطا واللحم والسمك والدجاج بالهواء الساخن حتى 200 درجة، بقليل من الزيت أو بدونه.",
  secs=[("Pour qui ?", "6 litres conviennent à une famille de trois à cinq personnes."), ("Commandes", "Panneau électronique tactile avec programmes préréglés.")],
  secsAr=[("لمن؟", "6 لترات لعائلة من 3 إلى 5 أفراد."), ("التحكم", "لوحة لمس ببرامج جاهزة.")],
  sp=["Capacité : 6 L", "Puissance : 2400 W", "Température max. : 200 °C", "Commandes tactiles"], spAr=["السعة: 6 لترات", "القوة: 2400 واط", "حتى 200 درجة"],
  mt="Friteuse sans huile Stillo 6 L 2400 W – Prix Maroc", md="Friteuse à air chaud Stillo 6 L, 2400 W, commandes tactiles, jusqu'à 200 °C pour frites, viande et poisson.",
  tAr="قلاية بدون زيت ستيلو 6 لتر بالمغرب", mdAr="قلاية بالهواء الساخن ستيلو سعة 6 لترات و2400 واط بأزرار لمس حتى 200 درجة.",
  kw="friteuse sans huile Stillo, air fryer 6 litres, friteuse à air 2400W, friteuse tactile, prix air fryer 6L Maroc",
  kwAr="قلاية بدون زيت ستيلو, إير فراير 6 لتر, مقلاة هوائية, قلاية بلا زيت, ثمن القلاية بدون زيت في المغرب",
  faq=[AIRFRY], alt="Friteuse sans huile Stillo 6 litres", altAr="قلاية بدون زيت ستيلو 6 لترات"))

def panini(slug, verify, brand, brandAr, model, power, plates, feats, featsAr, sp, spAr, name=None, nameAr=None, specs=None):
    m = f" {model}" if model else ""
    mA = {" 3 en 1": " 3 في 1", " granit": " غرانيت"}.get(m, m)   # Arabic label for Arabic sentences
    p = f" {power} W" if power else ""
    item("pe-B", slug, verify, dict(
      name=name or f"Panini grill {brand}{m}{p}", nameAr=nameAr or f"باني غريل {brandAr}{mA}" + (f" {power} واط" if power else ""),
      short=f"Panini grill {brand}{p} à plaques {plates} : sandwichs, toasts, viande et légumes grillés en quelques minutes.",
      shortAr=f"باني غريل {brandAr}" + (f" {power} واط" if power else "") + " لتحضير الكسكروط والتوست وشوي اللحم والخضر في دقائق.",
      intro=f"Le panini {brand}{m} prépare sandwichs chauds, msemen farcis, toasts, viandes et légumes grillés. {feats[0]}",
      introAr=f"باني {brandAr}{mA} يحضر الكسكروط الساخن والمسمن المحشو والتوست واللحم والخضر المشوية. {featsAr[0]}",
      secs=[("Points forts", "\n".join(f"- {f}" for f in feats[1:]))] if len(feats) > 1 else [], secsAr=[("المميزات", "\n".join(f"- {f}" for f in featsAr[1:]))] if len(featsAr) > 1 else [],
      sp=sp, spAr=spAr, mt=f"Panini grill {brand}{m}{p} – Prix Maroc" if len(f"Panini grill {brand}{m}{p} – Prix Maroc") <= 58 else f"Panini grill {brand}{p} – Prix Maroc",
      md=f"Panini grill {brand}{m}{p}, plaques {plates}, pour sandwichs, toasts et grillades.",
      tAr=f"باني غريل {brandAr}" + (f" {power} واط" if power else "") + " بالمغرب", mdAr=f"باني غريل {brandAr}{mA}" + (f" بقوة {power} واط" if power else "") + " للكسكروط والتوست والشواء.",
      kw=f"panini {brand}, panini grill{p}, appareil à panini, grill viande sandwich, prix panini Maroc",
      kwAr=f"باني {brandAr}, آلة الباني, شواية كهربائية, آلة الكسكروط, ثمن الباني في المغرب",
      faq=[PANINI], alt=f"Panini grill {brand}{m}", altAr=f"باني غريل {brandAr}"), specs)

panini("panini-grill-toast-3-en-1-sandwich-maker-antiadhsif-grille-pain-grill-barbecue-ouverture-180", ["Ancienne description au nom d'une autre marque (« SUZANDECO ») pour un produit vendu sous la marque Tatch — à vérifier.", "Puissance et garantie non renseignées."],
       "Tatch", "تاتش", "3 en 1", None, "antiadhésives larges",
       ["Il remplace trois appareils : grille-pain, grill barbecue et presse à panini.", "Ouverture à 180° pour doubler la surface de cuisson", "Montée rapide en température", "Plaques antiadhésives larges, faciles à nettoyer"],
       ["يعوض ثلاثة أجهزة: محمصة خبز وشواية وآلة باني.", "فتح 180 درجة لمضاعفة سطح الطهي", "تسخين سريع", "بلاكات عريضة مانعة للالتصاق"],
       ["Fonctions : grille-pain, grill barbecue, panini", "Ouverture : 180°", "Plaques antiadhésives"], ["3 وظائف", "فتح 180 درجة"],
       name="Panini grill Tatch 3 en 1 ouverture 180°", nameAr="باني غريل تاتش 3 في 1 بفتح 180 درجة")
panini("kenz-panini-en-granit-1800w", ["Garantie non renseignée."], "Kenz", "كنز", "granit", 1800, "en granit antiadhésif",
       ["La plaque supérieure flottante s'adapte à l'épaisseur des aliments.", "Ouverture à 90° ou à plat (180°) pour doubler la surface de grill", "Revêtement granit : pas besoin d'huile", "Voyant de fonctionnement et poignée résistante à la chaleur"],
       ["البلاكة العليا تتكيف مع سمك الطعام.", "فتح 90 أو 180 درجة", "طلاء غرانيت بدون زيت", "ضوء التشغيل ومقبض مقاوم للحرارة"],
       ["Puissance : 1800 W", "Ouverture : 90° et 180°", "Plaques en granit antiadhésif", "Voyant lumineux"], ["القوة: 1800 واط", "فتح 90 و180 درجة", "غرانيت"],
       name="Panini grill Kenz granit 1800 W", nameAr="باني غريل كنز غرانيت 1800 واط", specs=[S("Puissance", "1800 W"), S("Ouverture", "180°, 90°"), S("Plaques", "Granit antiadhésif")])
panini("panini-2800w-sandwich-maker-jmk2032-black", ["Puissance « 2800 W » peu plausible pour un appareil à panini : non publiée, nom corrigé.", "Garantie non renseignée."],
       "Jamaky", "جاماكي", "JMK2032", None, "antiadhésives",
       ["Plaques antiadhésives, voyants de fonctionnement et protection contre la surchauffe.", "Base antidérapante et poignée qui reste froide", "Coloris noir"],
       ["بلاكات مانعة للالتصاق وأضواء التشغيل وحماية من الحرارة.", "قاعدة ثابتة ومقبض بارد", "أسود"],
       ["Référence : JMK2032", "Plaques antiadhésives", "Voyants lumineux", "Protection contre la surchauffe", "Couleur : noir"], ["المرجع: JMK2032", "حماية من الحرارة", "أسود"],
       name="Appareil à panini Jamaky JMK2032 noir", nameAr="آلة باني جاماكي JMK2032 سوداء",
       specs=[S("Modèle", "JMK2032"), S("Type", "Appareil à sandwich / panini"), S("Matériaux", "Inox, plastique, plaques antiadhésives"), S("Voyants", "Oui"), S("Protection surchauffe", "Oui"), S("Base", "Antidérapante, poignée froide au toucher"), S("Couleur", "Noir")])
panini("presse-panini-grill-en-granit-plaque-antiadhsive", ["Garantie non renseignée."], "Elite", "إيليت", "granit", 2000, "en granit antiadhésif",
       ["Un grand presse-panini de 2000 W pour les familles et les snacks à la maison.", "Plaques en granit antiadhésif", "Coloris gris"], ["باني كبير 2000 واط للعائلة.", "بلاكات غرانيت", "رمادي"],
       ["Puissance : 2000 W", "Plaques en granit antiadhésif", "Couleur : gris"], ["القوة: 2000 واط", "غرانيت"],
       name="Presse panini Elite granit 2000 W", nameAr="باني إيليت غرانيت 2000 واط", specs=[S("Marque", "Elite"), S("Type", "Presse panini grill en granit"), S("Puissance", "2000 W"), S("Couleur", "Gris")])
panini("panini-granit-tatch", ["Puissance et garantie non renseignées."], "Tatch", "تاتش", "granit", None, "antiadhésives",
       ["Contrôle automatique de la température et finition Soft Touch mate.", "Plaques antiadhésives faciles à nettoyer", "Se range debout pour gagner de la place"],
       ["تحكم أوتوماتيكي في الحرارة وملمس ناعم.", "بلاكات سهلة التنظيف", "يُخزن واقفا"],
       ["Plaques antiadhésives", "Contrôle automatique de la température", "Rangement vertical"], ["بلاكات مانعة للالتصاق", "تحكم أوتوماتيكي"],
       name="Panini grill Tatch granit", nameAr="باني غريل تاتش غرانيت")

item("pe-B", "planche-electrique-prima-1800w-antiadhsive", ["Garantie non renseignée."], dict(
  name="Plancha électrique Prima 1800 W bambou antiadhésive", nameAr="بلانشا كهربائية بريما 1800 واط بالخشب",
  short="Plancha électrique Prima de 1800 W sur support bambou, plaque antiadhésive et thermostat réglable, pour jusqu'à 4 personnes.",
  shortAr="بلانشا كهربائية بريما 1800 واط على قاعدة خشب بامبو، سطح مانع للالتصاق وترموستات، حتى 4 أشخاص.",
  intro="La plancha Prima se pose au milieu de la table : viande, poisson, légumes ou crêpes cuisent devant les convives, jusqu'à 4 personnes.",
  introAr="بلانشا بريما توضع وسط المائدة: اللحم والسمك والخضر والكريب تُطهى أمام الضيوف، حتى 4 أشخاص.",
  secs=[("Pratique", "Plaque antiadhésive en acier, thermostat réglable et support en bambou.")], secsAr=[("عملية", "سطح فولاذي مانع للالتصاق وترموستات وقاعدة بامبو.")],
  sp=["Puissance : 1800 W", "Plaque antiadhésive", "Thermostat réglable", "Matériaux : acier, bambou", "Jusqu'à 4 personnes"], spAr=["القوة: 1800 واط", "مانعة للالتصاق", "ترموستات"],
  mt="Plancha électrique Prima 1800 W – Prix Maroc", md="Plancha électrique Prima 1800 W sur bambou, antiadhésive, thermostat réglable, pour 4 personnes.",
  tAr="بلانشا كهربائية بريما 1800 واط بالمغرب", mdAr="بلانشا كهربائية بريما 1800 واط مانعة للالتصاق مع ترموستات، حتى 4 أشخاص.",
  kw="plancha électrique Prima, plancha 1800W, plancha de table, grill électrique antiadhésif, prix plancha Maroc",
  kwAr="بلانشا كهربائية, شواية الطاولة, بلانشا بريما, شواية كهربائية, ثمن البلانشا في المغرب",
  faq=[PANINI], alt="Plancha électrique Prima 1800 W sur bambou", altAr="بلانشا كهربائية بريما"),
  specs=[S("Marque", "Prima"), S("Puissance", "1800 W"), S("Matériaux", "Acier, bambou"), S("Plaque", "Antiadhésive"), S("Thermostat", "Réglable"), S("Capacité", "Jusqu'à 4 personnes"), S("Couleur", "Gris, marron")])

item("pe-B", "rechaud-electrique-1-feux-1500w", ["Garantie non renseignée."], dict(
  name="Réchaud électrique Tatch 1 feu 1500 W", nameAr="طباخة كهربائية تاتش عين واحدة 1500 واط",
  short="Réchaud électrique Tatch à 1 feu de 1500 W, pour cuisiner sans gaz dans un studio, un bureau ou en appoint.",
  shortAr="طباخة كهربائية تاتش بعين واحدة 1500 واط للطبخ بدون غاز.",
  intro="Le réchaud Tatch de 1500 W remplace une plaque à gaz là où il n'y en a pas : studio, chambre d'étudiant, bureau, ou feu supplémentaire pour les grandes occasions.",
  introAr="طباخة تاتش 1500 واط تعوض الغاز حيث لا يوجد: ستوديو، غرفة طالب، مكتب، أو عين إضافية في المناسبات.",
  secs=[], secsAr=[], sp=["Feux : 1", "Puissance : 1500 W", "Référence : 5822"], spAr=["عين واحدة", "القوة: 1500 واط"],
  mt="Réchaud électrique Tatch 1 feu 1500 W – Prix Maroc", md="Réchaud électrique Tatch 1 feu 1500 W pour cuisiner sans gaz : studio, bureau ou feu d'appoint.",
  tAr="طباخة كهربائية تاتش 1500 واط بالمغرب", mdAr="طباخة كهربائية تاتش بعين واحدة 1500 واط للطبخ بدون غاز.",
  kw="réchaud électrique Tatch, réchaud 1 feu 1500W, plaque chauffante électrique, réchaud sans gaz, prix réchaud électrique Maroc",
  kwAr="ريشو كهربائي, طباخة كهربائية, طباخة عين وحدة, بلاكة الضو, ثمن الطباخة الكهربائية في المغرب",
  faq=[faq("Quelle prise faut-il ?", "Une prise standard en bon état. Avec 1500 W, évitez de brancher un autre gros appareil sur la même multiprise.", "شنو البريز اللي خاص؟", "بريز عادي سليم، وما تزيدوش جهاز كبير آخر فنفس المشترك.")],
  alt="Réchaud électrique Tatch 1 feu 1500 W", altAr="طباخة كهربائية تاتش"),
  specs=[S("Type", "Plaque chauffante"), S("Puissance", "1500 W"), S("Marque", "Tatch"), S("Référence", "5822")])

item("pe-B", "cocotte-hatch-6l", ["Ancienne description en anglais ; matériau, compatibilité induction et garantie non renseignés."], dict(
  name="Cocotte-minute Hatch 6 L", nameAr="طنجرة الضغط هاتش 6 لتر",
  short="Cocotte-minute Hatch de 6 litres avec système de sécurité à 5 niveaux et ouverture sécurisée sous pression.",
  shortAr="طنجرة ضغط هاتش 6 لترات بنظام أمان من 5 مستويات وفتح آمن.",
  intro="La cocotte Hatch de 6 litres cuit plus vite les légumineuses, les viandes et les plats mijotés de tous les jours : pois chiches, lentilles, tajine de viande.",
  introAr="طنجرة هاتش 6 لترات تطهو بسرعة القطاني واللحم: الحمص والعدس وطاجين اللحم.",
  secs=[("Sécurité", "Cinq systèmes de sécurité et un couvercle qui ne s'ouvre pas tant que la pression est présente.")], secsAr=[("السلامة", "خمسة أنظمة أمان وغطاء لا يفتح تحت الضغط.")],
  sp=["Capacité : 6 L", "5 systèmes de sécurité", "Ouverture sécurisée sous pression"], spAr=["السعة: 6 لترات", "5 أنظمة أمان"],
  mt="Cocotte-minute Hatch 6 litres – Prix Maroc", md="Cocotte-minute Hatch 6 L avec 5 systèmes de sécurité, pour légumineuses, viandes et plats mijotés.",
  tAr="طنجرة الضغط هاتش 6 لتر بالمغرب", mdAr="طنجرة ضغط هاتش 6 لترات بخمسة أنظمة أمان للقطاني واللحم.",
  kw="cocotte-minute Hatch 6L, autocuiseur 6 litres, cocotte pression, cocotte sécurité, prix cocotte-minute Maroc",
  kwAr="كوكوت, طنجرة الضغط, كوكوت مينوت, طنجرة 6 لتر, ثمن طنجرة الضغط في المغرب",
  faq=[PRESSURE], alt="Cocotte-minute Hatch 6 litres", altAr="طنجرة الضغط هاتش 6 لتر"))
item("pe-B", "cocotte-express-aluminium", ["« Panier offert » : offre à confirmer avant de la mentionner.", "Capacité du modèle vendu non indiquée dans le nom (l'ancienne description cite le 3 L : Ø 195 mm, H 105 mm)."], dict(
  name="Cocotte-minute Express aluminium", nameAr="طنجرة الضغط إكسبريس ألومنيوم",
  short="Cocotte-minute Express traditionnelle en aluminium, triple sécurité, anses en bakélite et pièces détachées disponibles.",
  shortAr="طنجرة ضغط إكسبريس تقليدية من الألومنيوم، أمان ثلاثي ومقابض بكاليت وقطع غيار متوفرة.",
  intro="La cocotte Express en aluminium est le modèle traditionnel que l'on retrouve dans de nombreuses cuisines marocaines : simple, durable et rapide pour les légumineuses et les viandes.",
  introAr="طنجرة إكسبريس من الألومنيوم هي النموذج التقليدي في المطابخ المغربية: بسيطة ومتينة وسريعة.",
  secs=[("Durable", "Aluminium, triple sécurité, bouton de serrage et anses en bakélite très résistants. Les pièces détachées (joint, soupape) sont disponibles.")],
  secsAr=[("متينة", "ألومنيوم وأمان ثلاثي ومقابض بكاليت، وقطع الغيار متوفرة.")],
  sp=["Matériau : aluminium", "Triple sécurité", "Anses et bouton en bakélite", "Pièces détachées disponibles"], spAr=["ألومنيوم", "أمان ثلاثي", "قطع غيار"],
  mt="Cocotte-minute Express aluminium – Prix Maroc", md="Cocotte-minute Express en aluminium, triple sécurité et anses en bakélite, pièces détachées disponibles.",
  tAr="طنجرة الضغط إكسبريس ألومنيوم بالمغرب", mdAr="طنجرة ضغط إكسبريس من الألومنيوم بأمان ثلاثي وقطع غيار متوفرة.",
  kw="cocotte Express aluminium, cocotte-minute traditionnelle, autocuiseur aluminium, cocotte pression Maroc, prix cocotte Express Maroc",
  kwAr="كوكوت إكسبريس, طنجرة الضغط, كوكوت ألومنيوم, كوكوت مينوت, ثمن الكوكوت في المغرب",
  faq=[PRESSURE, faq("Trouve-t-on les pièces détachées ?", "Oui, joint et soupape sont disponibles pour ce modèle.", "واش كاينين قطع الغيار؟", "إيه، الجوان والصوباب كاينين.")],
  alt="Cocotte-minute Express aluminium", altAr="طنجرة الضغط إكسبريس"))

item("pe-B", "machine-ptes-manuelle-appareil-prparer-des-ptes-en-acier-inoxydable", ["Nombre de réglages d'épaisseur et garantie non renseignés."], dict(
  name="Machine à pâtes manuelle Elite inox", nameAr="آلة العجين اليدوية إيليت إينوكس",
  short="Machine à pâtes manuelle Elite en acier inoxydable, sans électricité, avec réglage de l'épaisseur.",
  shortAr="آلة عجين يدوية إيليت من الإينوكس بدون كهرباء مع تعديل السمك.",
  intro="La machine Elite lamine la pâte à la manivelle, sans électricité : pâtes fraîches, mais aussi feuilles fines pour la pastilla ou les briouates.",
  introAr="آلة إيليت تفرد العجين باليد بدون كهرباء: للمعكرونة الطرية والأوراق الرقيقة للبسطيلة والبريوات.",
  secs=[("Simple", "Insérez la pâte entre les rouleaux, tournez la manivelle et réglez l'épaisseur.")], secsAr=[("بسيطة", "أدخلوا العجين وأديروا المقبض وعدلوا السمك.")],
  sp=["Matériau : acier inoxydable", "Fonctionnement manuel (manivelle)", "Épaisseur réglable"], spAr=["إينوكس", "يدوية", "سمك قابل للتعديل"],
  mt="Machine à pâtes manuelle Elite inox – Prix Maroc", md="Machine à pâtes manuelle Elite en inox, sans électricité, pour pâtes fraîches et feuilles fines.",
  tAr="آلة العجين اليدوية إيليت بالمغرب", mdAr="آلة عجين يدوية إيليت إينوكس بدون كهرباء للمعكرونة والأوراق الرقيقة.",
  kw="machine à pâtes manuelle, machine à pâtes inox Elite, laminoir pâte, pâtes fraîches maison, prix machine à pâtes Maroc",
  kwAr="آلة العجين, آلة المعكرونة, آلة فرد العجين, آلة إيليت, ثمن آلة العجين في المغرب",
  faq=[faq("Faut-il la laver à l'eau ?", "Mieux vaut la nettoyer à sec avec une brosse et un chiffon : l'eau peut abîmer les rouleaux.", "واش نغسلها بالما؟", "حسن تنقيوها ناشفة بالشيتة والشيفون.")],
  alt="Machine à pâtes manuelle Elite en inox", altAr="آلة العجين اليدوية إيليت"))
item("pe-B", "machine-ptes-multifonctions", ["Compatibilité lave-vaisselle contradictoire dans la fiche (oui et non) : non publiée.", "Mode de fonctionnement (manuel/électrique) et garantie non renseignés."], dict(
  name="Machine à pâtes multifonction Lamacom inox", nameAr="آلة العجين متعددة الوظائف لاماكوم إينوكس",
  short="Machine à pâtes multifonction Lamacom en acier inoxydable, grise, pour un usage domestique.",
  shortAr="آلة عجين متعددة الوظائف لاماكوم من الإينوكس، رمادية، للاستعمال المنزلي.",
  intro="La machine Lamacom en acier inoxydable aide à préparer pâtes fraîches et feuilles de pâte à la maison.",
  introAr="آلة لاماكوم من الإينوكس لتحضير المعكرونة والأوراق في البيت.",
  secs=[], secsAr=[], sp=["Matériau : acier inoxydable", "Usage domestique", "Couleur : gris"], spAr=["إينوكس", "رمادي"],
  mt="Machine à pâtes multifonction Lamacom – Prix Maroc", md="Machine à pâtes multifonction Lamacom en acier inoxydable, pour pâtes fraîches et feuilles de pâte maison.",
  tAr="آلة العجين لاماكوم بالمغرب", mdAr="آلة عجين متعددة الوظائف لاماكوم من الإينوكس للمعكرونة والأوراق في البيت.",
  kw="machine à pâtes Lamacom, machine à pâtes multifonction, machine à pâtes inox, pâtes fraîches, prix machine à pâtes Maroc",
  kwAr="آلة العجين لاماكوم, آلة المعكرونة, آلة فرد العجين, آلة عجين إينوكس, ثمن آلة العجين في المغرب",
  faq=[], alt="Machine à pâtes multifonction Lamacom inox", altAr="آلة العجين لاماكوم"))

item("pe-B", "machine-caf-systme-5-en-1", ["Garantie non renseignée."], dict(
  name="Machine à café multi-capsules Daiko CF8193K 5 en 1 19 bars", nameAr="آلة قهوة دايكو CF8193K متعددة الكبسولات 5 في 1",
  short="Machine à café Daiko CF8193K 5 en 1 : capsules Nespresso, Dolce Gusto, Lavazza Blue, dosettes ESE et café moulu, pompe 19 bars, 11,5 cm de large.",
  shortAr="آلة قهوة دايكو CF8193K تقبل كبسولات نسبريسو ودولتشي غوستو ولافاتسا والقهوة المطحونة، ضغط 19 بار.",
  intro="La Daiko CF8193K évite de choisir une marque de capsules : elle accepte Nespresso, Dolce Gusto, Lavazza Blue, les dosettes ESE et le café moulu.",
  introAr="دايكو CF8193K تقبل عدة أنواع من الكبسولات: نسبريسو، دولتشي غوستو، لافاتسا، ESE والقهوة المطحونة.",
  secs=[("19 bars", "La pompe de 19 bars extrait l'espresso ; deux boutons règlent la longueur du café."), ("Format slim", "11,5 cm de large seulement, avec un réservoir amovible de 0,6 L.")],
  secsAr=[("19 بار", "مضخة 19 بار وزران لطول القهوة."), ("حجم نحيف", "عرض 11.5 سم وخزان 0.6 لتر.")],
  sp=["Compatibilité : Nespresso, Dolce Gusto, Lavazza Blue, ESE, café moulu", "Pression : 19 bars", "Réservoir : 0,6 L amovible", "Largeur : 11,5 cm", "Couleur : noir"], spAr=["5 أنواع من القهوة", "19 بار", "خزان 0.6 لتر", "أسود"],
  mt="Machine à café 5 en 1 Daiko CF8193K – Prix Maroc", md="Machine à café Daiko CF8193K multi-capsules : Nespresso, Dolce Gusto, Lavazza, ESE et moulu, 19 bars.",
  tAr="آلة قهوة دايكو 5 في 1 بالمغرب", mdAr="آلة قهوة دايكو CF8193K لكبسولات نسبريسو ودولتشي غوستو ولافاتسا والقهوة المطحونة.",
  kw="machine à café Daiko 5 en 1, machine multi-capsules, compatible Nespresso Dolce Gusto, machine espresso 19 bars, prix machine à café Maroc",
  kwAr="آلة القهوة, ماكينة القهوة بالكبسولات, آلة نسبريسو, آلة قهوة دايكو, ثمن آلة القهوة في المغرب",
  faq=[faq("Quelles capsules accepte-t-elle ?", "Nespresso, Dolce Gusto, Lavazza Blue, les dosettes ESE et le café moulu.", "شنو الكبسولات اللي كتقبل؟", "نسبريسو، دولتشي غوستو، لافاتسا بلو، ESE والقهوة المطحونة.")],
  alt="Machine à café multi-capsules Daiko CF8193K noire", altAr="آلة قهوة دايكو CF8193K"),
  specs=[S("Modèle", "CF8193K"), S("Compatibilité", "Nespresso, Dolce Gusto, Lavazza Blue, dosettes ESE, café moulu"), S("Pression", "19 bars"), S("Réservoir", "0,6 L amovible"), S("Largeur", "11,5 cm"), S("Couleur", "Noir")])
item("pe-B", "tatch-cafetiere-electrique-6tasses", ["Puissance, type (filtre) et garantie non renseignés."], dict(
  name="Cafetière électrique Tatch CM102 6 tasses", nameAr="آلة قهوة كهربائية تاتش CM102 لـ6 فناجين",
  short="Cafetière électrique Tatch CM102 de 6 tasses, pour le café du matin ou des invités.",
  shortAr="آلة قهوة كهربائية تاتش CM102 لستة فناجين.",
  intro="La cafetière Tatch CM102 prépare jusqu'à 6 tasses : le café du petit-déjeuner en famille ou pour recevoir.",
  introAr="آلة تاتش CM102 تحضر حتى 6 فناجين لقهوة الصباح أو للضيوف.",
  secs=[], secsAr=[], sp=["Référence : CM102", "Capacité : 6 tasses"], spAr=["المرجع: CM102", "6 فناجين"],
  mt="Cafetière électrique Tatch 6 tasses – Prix Maroc", md="Cafetière électrique Tatch CM102 de 6 tasses pour le café du matin en famille ou pour les invités.",
  tAr="آلة قهوة تاتش 6 فناجين بالمغرب", mdAr="آلة قهوة كهربائية تاتش CM102 لستة فناجين لقهوة الصباح والضيوف.",
  kw="cafetière électrique Tatch, cafetière 6 tasses, Tatch CM102, machine à café simple, prix cafetière Maroc",
  kwAr="آلة القهوة الكهربائية, كافتيرة, آلة قهوة 6 فناجين, آلة تاتش, ثمن آلة القهوة في المغرب",
  faq=[], alt="Cafetière électrique Tatch CM102 6 tasses", altAr="آلة قهوة تاتش CM102"),
  specs=[S("Marque", "Tatch"), S("Référence", "CM102"), S("Capacité", "6 tasses")])

# ═════════════ Batch C: home ═════════════
item("pe-C", "bowen-aspirateur-balai-multifonctions-4-en-1-2-vitesses-16kpa2400w", ["Garantie non renseignée."], dict(
  name="Aspirateur balai Bowen 4 en 1 2400 W sans sac", nameAr="مكنسة كهربائية بوين 4 في 1 بقوة 2400 واط بدون كيس",
  short="Aspirateur balai Bowen 4 en 1 de 2400 W et 16 kPa, cyclonique sans sac, réservoir de 1 litre et 2 vitesses.",
  shortAr="مكنسة بوين 4 في 1 بقوة 2400 واط و16 كيلوباسكال، بدون كيس، خزان 1 لتر وسرعتان.",
  intro="L'aspirateur Bowen se transforme selon l'usage : balai pour les sols, aspirateur à main pour les meubles et les coins. Il fonctionne sur secteur, avec une puissance de 2400 W.",
  introAr="مكنسة بوين تتحول حسب الاستعمال: مكنسة للأرض أو يدوية للأثاث والزوايا، تعمل بالكهرباء بقوة 2400 واط.",
  secs=[("Sans sac", "La technologie cyclonique sépare la poussière de l'air ; le réservoir de 1 litre se vide directement."), ("Usage", "Nettoyage à sec : tapis, sols durs et meubles.")],
  secsAr=[("بدون كيس", "تقنية حلزونية وخزان 1 لتر يفرغ مباشرة."), ("الاستعمال", "تنظيف جاف للزرابي والأرضيات والأثاث.")],
  sp=["Puissance : 2400 W", "Aspiration : 16 kPa", "Réservoir : 1 L", "Vitesses : 2", "4 en 1 (balai / main)", "Alimentation : 220–240 V"], spAr=["القوة: 2400 واط", "16 كيلوباسكال", "خزان 1 لتر", "سرعتان"],
  mt="Aspirateur balai Bowen 4 en 1 2400 W – Prix Maroc", md="Aspirateur balai Bowen 4 en 1 sur secteur, 2400 W, 16 kPa, sans sac, réservoir 1 L et 2 vitesses.",
  tAr="مكنسة كهربائية بوين 4 في 1 بالمغرب", mdAr="مكنسة كهربائية بوين 4 في 1 بقوة 2400 واط بدون كيس وخزان 1 لتر.",
  kw="aspirateur balai Bowen, aspirateur 4 en 1, aspirateur sans sac 2400W, aspirateur à main, prix aspirateur balai Maroc",
  kwAr="سبيراتور, مكنسة كهربائية, سبيراتور بلا ساك, مكنسة بوين, ثمن المكنسة الكهربائية في المغرب",
  faq=[VAC], alt="Aspirateur balai Bowen 4 en 1 2400 W", altAr="مكنسة كهربائية بوين 4 في 1"),
  specs=[S("Puissance", "2400 W"), S("Aspiration", "16 kPa"), S("Réservoir à poussière", "1 L"), S("Vitesses", "2"), S("Technologie", "Cyclonique sans sac"), S("Tension", "220–240 V, 50/60 Hz"), S("Nettoyage", "À sec")])
item("pe-C", "aspirateur-sans-fil-rechargeable-1500-w", ["Puissance « 1500 W » du nom à confirmer pour un aspirateur sur batterie 22,2 V (non publiée)."], dict(
  name="Aspirateur sans fil rechargeable Prima", nameAr="مكنسة كهربائية لاسلكية بريما قابلة للشحن",
  short="Aspirateur sans fil Prima : batterie lithium-ion 22,2 V, 25 à 40 minutes d'autonomie, cyclonique sans sac, éclairage LED et 2 niveaux de puissance.",
  shortAr="مكنسة لاسلكية بريما: بطارية ليثيوم 22.2 فولت، 25 إلى 40 دقيقة، بدون كيس، إضاءة LED وقوتان.",
  intro="Sans fil, l'aspirateur Prima se prend pour un coup de propre rapide dans toute la maison, sans chercher de prise.",
  introAr="مكنسة بريما اللاسلكية لتنظيف سريع في كل البيت بدون البحث عن مقبس.",
  secs=[("Autonomie", "Batterie lithium-ion 22,2 V : 25 à 40 minutes selon le niveau de puissance."), ("Maniable", "Double pivot avec rotation à 180° et éclairage LED pour voir la poussière sous les meubles.")],
  secsAr=[("البطارية", "25 إلى 40 دقيقة حسب القوة."), ("سهلة", "رأس يدور 180 درجة وإضاءة LED.")],
  sp=["Batterie : lithium-ion 22,2 V", "Autonomie : 25 à 40 min", "Technologie : cyclonique sans sac", "Double pivot 180°", "Éclairage LED", "2 niveaux de puissance"], spAr=["بطارية 22.2 فولت", "25–40 دقيقة", "بدون كيس", "LED"],
  mt="Aspirateur sans fil rechargeable Prima – Prix Maroc", md="Aspirateur sans fil Prima, batterie 22,2 V, 25 à 40 min d'autonomie, sans sac, éclairage LED.",
  tAr="مكنسة لاسلكية بريما بالمغرب", mdAr="مكنسة لاسلكية بريما ببطارية 22.2 فولت و25 إلى 40 دقيقة وإضاءة LED.",
  kw="aspirateur sans fil Prima, aspirateur rechargeable, aspirateur balai sans fil, aspirateur LED, prix aspirateur sans fil Maroc",
  kwAr="سبيراتور بلا خيط, مكنسة لاسلكية, سبيراتور بالشارج, مكنسة بريما, ثمن المكنسة اللاسلكية في المغرب",
  faq=[VAC], alt="Aspirateur sans fil rechargeable Prima", altAr="مكنسة لاسلكية بريما"),
  specs=[S("Technologie", "Cyclonique sans sac (Eco-Cyclon Double Spin)"), S("Batterie", "Lithium-ion 22,2 V"), S("Autonomie", "25 à 40 minutes"), S("Mobilité", "Double pivot, rotation 180°"), S("Éclairage", "LED"), S("Niveaux de puissance", "2")])
item("pe-C", "aspirateur-balai-sans-fil-brosse-lectrique-avec-lumire-led", [], dict(
  name="Aspirateur balai sans fil Daiko RABS-7755DK brosse LED", nameAr="مكنسة لاسلكية دايكو RABS-7755DK بفرشاة LED",
  short="Aspirateur balai sans fil Daiko RABS-7755DK : 11,5 kPa, batterie amovible 22,2 V 2600 mAh, brosse motorisée avec LED, se transforme en aspirateur à main.",
  shortAr="مكنسة لاسلكية دايكو RABS-7755DK: 11.5 كيلوباسكال، بطارية قابلة للنزع، فرشاة بإضاءة LED وتتحول إلى مكنسة يدوية.",
  intro="Le Daiko RABS-7755DK est un balai sans fil léger qui devient aspirateur à main en un clic, pour le canapé ou la voiture.",
  introAr="دايكو RABS-7755DK مكنسة لاسلكية خفيفة تتحول إلى مكنسة يدوية للكنبة أو السيارة.",
  secs=[("Batterie amovible", "Li-ion 22,2 V, 2600 mAh : elle se retire pour être rechargée ou remplacée."), ("Fourni avec", "Suceur plat, brosse 2 en 1 et support mural.")],
  secsAr=[("بطارية قابلة للنزع", "22.2 فولت و2600 مللي أمبير."), ("الملحقات", "رأس مسطح وفرشاة 2 في 1 وحامل حائطي.")],
  sp=["Moteur : 180 W", "Aspiration : 11,5 kPa", "Batterie : Li-ion 22,2 V, 2600 mAh, amovible", "Brosse motorisée avec LED", "Accessoires : suceur plat, brosse 2 en 1, support mural"], spAr=["180 واط", "11.5 كيلوباسكال", "بطارية 2600 مللي أمبير", "LED"],
  mt="Aspirateur balai sans fil Daiko RABS-7755DK – Prix Maroc", md="Aspirateur balai sans fil Daiko 11,5 kPa, batterie amovible 22,2 V, brosse LED, devient aspirateur à main.",
  tAr="مكنسة لاسلكية دايكو RABS-7755DK بالمغرب", mdAr="مكنسة لاسلكية دايكو 11.5 كيلوباسكال ببطارية قابلة للنزع وفرشاة LED وتتحول إلى يدوية.",
  kw="aspirateur balai sans fil Daiko, Daiko RABS-7755DK, aspirateur LED, aspirateur à main voiture, prix aspirateur Daiko Maroc",
  kwAr="سبيراتور دايكو بلا خيط, مكنسة لاسلكية, سبيراتور للطوموبيل, مكنسة بإضاءة, ثمن المكنسة اللاسلكية في المغرب",
  faq=[VAC], alt="Aspirateur balai sans fil Daiko RABS-7755DK", altAr="مكنسة لاسلكية دايكو RABS-7755DK"),
  specs=[S("Modèle", "RABS-7755DK"), S("Moteur", "180 W"), S("Aspiration", "11,5 kPa"), S("Batterie", "Li-ion 22,2 V, 2600 mAh, amovible"), S("Brosse", "Motorisée avec éclairage LED"), S("Accessoires", "Suceur plat, brosse 2 en 1, support mural")])
item("pe-C", "fer-repasser-general-2200-w", ["Garantie non renseignée."], dict(
  name="Fer à repasser vapeur General DM-2268B 2200 W", nameAr="مكواة بخار جنرال DM-2268B بقوة 2200 واط",
  short="Fer à repasser General DM-2268B de 2200 W : sec, vapeur et pulvérisation, réservoir de 350 ml et semelle antiadhésive.",
  shortAr="مكواة جنرال DM-2268B بقوة 2200 واط: جاف وبخار ورش، خزان 350 مل ونعل مانع للالتصاق.",
  intro="Le fer General DM-2268B repasse à sec ou à la vapeur, et la pulvérisation aide à défroisser les plis tenaces.",
  introAr="مكواة جنرال DM-2268B تكوي جافة أو بالبخار، والرش يساعد على إزالة التجاعيد الصعبة.",
  secs=[], secsAr=[], sp=["Puissance : 2200 W", "Fonctions : sec, vapeur, pulvérisation", "Réservoir : 350 ml transparent", "Semelle antiadhésive", "Molette de température"], spAr=["2200 واط", "جاف وبخار ورش", "خزان 350 مل"],
  mt="Fer à repasser General 2200 W DM-2268B – Prix Maroc", md="Fer à repasser vapeur General DM-2268B 2200 W, sec, vapeur et pulvérisation, réservoir 350 ml.",
  tAr="مكواة بخار جنرال 2200 واط بالمغرب", mdAr="مكواة بخار جنرال DM-2268B بقوة 2200 واط وخزان 350 مل ونعل مانع للالتصاق.",
  kw="fer à repasser General, fer vapeur 2200W, General DM-2268B, fer à repasser antiadhésif, prix fer à repasser Maroc",
  kwAr="مكواة, مكواة البخار, حديدة الصبين, مكواة جنرال, ثمن المكواة في المغرب",
  faq=[faq("Quelle eau utiliser ?", "Dans les régions où l'eau est calcaire, une eau déminéralisée ou mélangée limite le calcaire dans le fer.", "شمن ما نستعمل؟", "إلا كان الما فيه الجير بزاف، ستعملو الما المقطر ولا مخلط.")],
  alt="Fer à repasser vapeur General DM-2268B 2200 W", altAr="مكواة بخار جنرال DM-2268B"),
  specs=[S("Référence", "DM-2268B"), S("Puissance", "2200 W"), S("Fonctions", "Sec, vapeur, pulvérisation"), S("Réservoir", "350 ml, transparent"), S("Semelle", "Antiadhésive"), S("Tension", "220–240 V, 50–60 Hz")])

def dispenser(slug, model, extra_fr, extra_ar, gas):
    item("pe-C", slug, ["« Bouteille 18,9 L incluse » : à confirmer avant de la mentionner.", "Garantie, consommation et dimensions non renseignées."], dict(
      name=f"Fontaine à eau Daiko {model} 3 robinets chaud, froid, ambiant", nameAr=f"موزع الماء دايكو {model} بثلاثة صنابير ساخن وبارد وعادي",
      short=f"Fontaine à eau sur pied Daiko {model} à 3 robinets (chaud, froid, ambiant), refroidissement par compresseur, cuve inox et armoire de rangement.",
      shortAr=f"موزع ماء دايكو {model} بثلاثة صنابير (ساخن، بارد، عادي)، تبريد بالضاغط وخزان إينوكس وخزانة.",
      intro=f"La fontaine Daiko {model} sert de l'eau fraîche, chaude ou à température ambiante. {extra_fr}",
      introAr=f"موزع دايكو {model} يقدم الماء البارد والساخن والعادي. {extra_ar}",
      secs=[("Compresseur", "Le refroidissement par compresseur" + (f" (gaz {gas})" if gas else "") + " garde l'eau bien fraîche, même en été."), ("Pratique", "Cuve en acier inoxydable et armoire de rangement en bas pour les gobelets.")],
      secsAr=[("ضاغط", "تبريد بالضاغط يبقي الماء باردا حتى في الصيف."), ("عملي", "خزان إينوكس وخزانة في الأسفل.")],
      sp=["Robinets : 3 (chaud, froid, ambiant)", "Refroidissement par compresseur" + (f", gaz {gas}" if gas else ""), "Cuve : acier inoxydable", "Armoire de rangement"], spAr=["3 صنابير", "تبريد بالضاغط", "خزان إينوكس"],
      mt=f"Fontaine à eau Daiko {model} – Prix Maroc", md=f"Fontaine à eau Daiko {model} à 3 robinets, refroidissement par compresseur, cuve inox et armoire de rangement.",
      tAr=f"موزع الماء دايكو {model} بالمغرب", mdAr=f"موزع ماء دايكو {model} بثلاثة صنابير وتبريد بالضاغط وخزان إينوكس.",
      kw=f"fontaine à eau Daiko, Daiko {model}, distributeur d'eau chaud froid, fontaine à eau bureau, prix fontaine à eau Maroc",
      kwAr="موزع الماء, فونتين الما, موزع ماء ساخن وبارد, موزع دايكو, ثمن موزع الماء في المغرب",
      faq=[faq("Faut-il un raccordement à l'eau ?", "Non, elle fonctionne avec une bouteille posée sur le dessus ; il suffit d'une prise électrique.", "واش خاصها توصيل بالما؟", "لا، كتخدم بالقرعة اللي كتحط فوق، غير البريز.")],
      alt=f"Fontaine à eau Daiko {model} à 3 robinets", altAr=f"موزع الماء دايكو {model}"))
dispenser("distributeur-deau-avec-robinet-deau-chaude-normale-froide", "DDE-5102DK", "L'eau chaude est pratique pour le thé et les infusions.", "الماء الساخن مفيد للأتاي.", "R134a")
dispenser("distributeur-deau-avec-3-robinets-rservoir-de-stockage", "DDE-5103DK", "Une solution tout-en-un pour le bureau comme pour la maison.", "حل متكامل للمكتب والبيت.", None)

item("pe-C", "leader-insectifuge-insecticide-electrique-tue-mouche-raid-ultra-violet", ["Garantie non renseignée."], dict(
  name="Destructeur d'insectes UV Leader 2 × 15 W", nameAr="جهاز قتل الحشرات بالأشعة فوق البنفسجية ليدر 2 × 15 واط",
  short="Destructeur d'insectes électrique Leader à 2 lampes UV de 15 W, pour des pièces jusqu'à 90 m², sans produit chimique.",
  shortAr="جهاز قتل الحشرات ليدر بمصباحين فوق بنفسجيين 15 واط، لغرف حتى 90 متر مربع، بدون مواد كيميائية.",
  intro="Les lampes UV attirent mouches et moustiques vers une grille électrique. Sans produit chimique ni odeur, le Leader convient aux cuisines, commerces, bureaux et entrepôts.",
  introAr="المصابيح فوق البنفسجية تجذب الذباب والناموس نحو شبكة كهربائية، بدون مواد كيميائية ولا رائحة.",
  secs=[("Installation", "À suspendre, à poser ou à fixer au mur, en intérieur uniquement. Le plateau inférieur se retire pour le vider.")], secsAr=[("التركيب", "يعلق أو يوضع أو يثبت على الحائط، داخل البيت فقط.")],
  sp=["Lampes : 2 × 15 W UV", "Surface : jusqu'à 90 m²", "Tension : 220–240 V", "Durée de vie des tubes : 5000 à 8000 h environ", "Usage intérieur"], spAr=["مصباحان 15 واط", "حتى 90 متر مربع", "داخلي فقط"],
  mt="Destructeur d'insectes UV Leader 2 × 15 W – Prix Maroc", md="Destructeur d'insectes Leader à 2 lampes UV 15 W, jusqu'à 90 m², sans produit chimique, à suspendre ou poser.",
  tAr="جهاز قتل الحشرات ليدر بالمغرب", mdAr="جهاز قتل الذباب والناموس ليدر بمصباحين 15 واط حتى 90 متر مربع بدون مواد كيميائية.",
  kw="destructeur d'insectes UV, tue-mouche électrique Leader, lampe anti-moustique, tue-mouche commerce, prix tue-mouche électrique Maroc",
  kwAr="قاتل الذبان, جهاز قتل الناموس, لامبة الذبان, قاتل الحشرات الكهربائي, ثمن قاتل الحشرات في المغرب",
  faq=[faq("Peut-on l'utiliser dehors ?", "Non, il est prévu pour un usage intérieur uniquement.", "واش نقدر نستعملو برا؟", "لا، غير للداخل.")],
  alt="Destructeur d'insectes UV Leader 2 × 15 W", altAr="جهاز قتل الحشرات ليدر"),
  specs=[S("Lampes", "2 × 15 W ultraviolet"), S("Surface couverte", "Jusqu'à 90 m²"), S("Tension", "220–240 V, 50/60 Hz"), S("Tension de grille", "2200–2500 V"), S("Durée de vie des tubes", "5000 à 8000 h environ"), S("Usage", "Intérieur uniquement")])
for slug, tag in [("insecticide-lectronique-antimoustique-tue-mouche-electric", ""), ("general-insecticide-lectronique-antimoustique-tue-mouche", " General")]:
    item("pe-C", slug, ["Doublon : deux fiches identiques (149 DH) — fusion + 301 recommandée.", "Ancienne description contradictoire (lampe UV et « technologie ultrasonique ») et « efficacité garantie » : mécanisme non publié.", "Garantie non renseignée."], dict(
      name=f"Anti-moustique électrique{tag} 4 W à brancher" if tag else "Anti-moustique électrique 4 W à brancher",
      nameAr=f"جهاز طرد الناموس الكهربائي{(' جنرال') if tag else ''} 4 واط",
      short="Petit anti-moustique électrique à brancher sur une prise, très faible consommation (4 W), pour chambre, cuisine ou bureau.",
      shortAr="جهاز صغير ضد الناموس يركب في المقبس، استهلاك ضعيف جدا (4 واط)، لغرفة النوم أو المطبخ.",
      intro="Compact et léger, cet appareil se branche directement sur une prise et consomme seulement 4 W : il peut rester en marche toute la nuit dans une chambre.",
      introAr="جهاز صغير وخفيف يركب مباشرة في المقبس ويستهلك 4 واط فقط، يمكن تشغيله طوال الليل.",
      secs=[], secsAr=[], sp=["Consommation : 4 W", "Tension : 220–240 V", "À brancher directement sur une prise"], spAr=["4 واط", "يركب في المقبس"],
      mt=f"Anti-moustique électrique{tag} 4 W – Prix Maroc", md=f"Anti-moustique électrique{tag} à brancher, 4 W seulement, pour chambre, cuisine ou bureau.",
      tAr=f"جهاز طرد الناموس الكهربائي{(' جنرال') if tag else ''} بالمغرب", mdAr="جهاز ضد الناموس يركب في المقبس، 4 واط فقط، لغرفة النوم والمطبخ والمكتب.",
      kw=f"anti-moustique électrique{tag.lower()}, anti-moustique prise, anti-moustique chambre, appareil anti-insectes, prix anti-moustique Maroc",
      kwAr="ضد الناموس, جهاز الناموس, ناموسية كهربائية, طارد الحشرات, ثمن جهاز الناموس في المغرب",
      faq=[], alt=f"Anti-moustique électrique{tag} à brancher", altAr="جهاز طرد الناموس الكهربائي"))

item("pe-C", "glacire-fresh-22-l", ["Durée de conservation « jusqu'à 24 h au moins » non reprise (dépend des conditions).", "Couleur selon disponibilité (bleu ou rouge)."], dict(
  name="Glacière Fresh 22 L", nameAr="ثلاجة محمولة فريش 22 لتر",
  short="Glacière Fresh de 22 litres avec couvercle étanche et isolation épaisse, pour la plage, le camping et les voyages.",
  shortAr="ثلاجة محمولة فريش 22 لترا بغطاء محكم وعزل سميك، للشاطئ والتخييم والسفر.",
  intro="La glacière Fresh de 22 litres garde boissons et repas au frais pour une journée à la plage, un pique-nique ou un long trajet en voiture.",
  introAr="ثلاجة فريش 22 لترا تحافظ على برودة المشروبات والأكل ليوم في الشاطئ أو رحلة طويلة.",
  secs=[("Conseil", "Ajoutez des pains de glace ou des bouteilles congelées et ouvrez-la le moins souvent possible pour garder le froid plus longtemps.")], secsAr=[("نصيحة", "أضيفوا قوالب الثلج وافتحوها أقل ما يمكن.")],
  sp=["Capacité brute : environ 22 L", "Couvercle étanche", "Isolation épaisse", "Couleur : bleu ou rouge selon disponibilité"], spAr=["السعة: 22 لترا", "غطاء محكم", "عزل سميك"],
  mt="Glacière Fresh 22 litres – Prix Maroc", md="Glacière Fresh 22 L avec couvercle étanche et isolation épaisse, pour plage, camping et voyages.",
  tAr="ثلاجة محمولة فريش 22 لتر بالمغرب", mdAr="ثلاجة محمولة فريش 22 لترا بغطاء محكم وعزل سميك للشاطئ والتخييم.",
  kw="glacière Fresh 22L, glacière plage, glacière camping, glacière isotherme, prix glacière Maroc",
  kwAr="غلاسيير, ثلاجة محمولة, صندوق التبريد, غلاسيير البحر, ثمن الغلاسيير في المغرب",
  faq=[faq("Est-elle électrique ?", "Non, c'est une glacière isotherme : elle garde le froid avec de la glace ou des pains de glace.", "واش كهربائية؟", "لا، كتحافظ على البرودة بالثلج.")],
  alt="Glacière Fresh 22 litres", altAr="ثلاجة محمولة فريش 22 لتر"))

# Distinct, fuller titles where the templates were too short or collided.
OVR = {
  "panini-grill-toast-3-en-1-sandwich-maker-antiadhsif-grille-pain-grill-barbecue-ouverture-180": {"metaTitle": "Panini grill Tatch 3 en 1 ouverture 180° – Prix Maroc", "titleAr": "باني غريل تاتش 3 في 1 بفتح 180 درجة بالمغرب"},
  "panini-granit-tatch": {"metaTitle": "Panini grill Tatch revêtement granit – Prix Maroc", "titleAr": "باني غريل تاتش بطلاء الغرانيت بالمغرب"},
  "panini-2800w-sandwich-maker-jmk2032-black": {"titleAr": "آلة باني جاماكي JMK2032 سوداء بالمغرب"},
  "machine-ptes-multifonctions": {"titleAr": "آلة العجين متعددة الوظائف لاماكوم بالمغرب"},
  "machine-caf-systme-5-en-1": {"titleAr": "آلة قهوة دايكو متعددة الكبسولات بالمغرب"},
  "aspirateur-sans-fil-rechargeable-1500-w": {"titleAr": "مكنسة كهربائية لاسلكية بريما بالمغرب"},
  "aspirateur-balai-sans-fil-brosse-lectrique-avec-lumire-led": {"metaTitle": "Aspirateur sans fil Daiko RABS-7755DK – Prix Maroc"},
  "leader-insectifuge-insecticide-electrique-tue-mouche-raid-ultra-violet": {"titleAr": "جهاز قتل الحشرات بالأشعة ليدر بالمغرب",
      "metaDescription": "Destructeur d'insectes Leader à 2 lampes UV 15 W, jusqu'à 90 m², sans produit chimique. Livraison partout au Maroc, paiement à la livraison."},
  "glacire-fresh-22-l": {"metaTitle": "Glacière Fresh 22 litres isotherme – Prix Maroc"},
  "distributeur-deau-avec-robinet-deau-chaude-normale-froide": {"metaDescription": "Fontaine à eau Daiko DDE-5102DK, 3 robinets chaud, froid, ambiant, compresseur et cuve inox. Livraison partout au Maroc, paiement à la livraison."},
  "distributeur-deau-avec-3-robinets-rservoir-de-stockage": {"metaDescription": "Fontaine à eau Daiko DDE-5103DK, 3 robinets, compresseur, cuve inox et armoire de rangement. Livraison partout au Maroc, paiement à la livraison."},
}
for e in B + C:
    for k, v in OVR.get(e["slug"], {}).items():
        (e["changes"]["seo"] if k == "titleAr" else e["changes"])[k] = v
assert len(B) == 15 and len(C) == 10, (len(B), len(C))
for e in B + C: assert "None" not in json.dumps(e["changes"], ensure_ascii=False), e["slug"]
json.dump(B, open(os.path.join(HERE, "pe-B.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
json.dump(C, open(os.path.join(HERE, "pe-C.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("pe-B:", len(B), "| pe-C:", len(C))
