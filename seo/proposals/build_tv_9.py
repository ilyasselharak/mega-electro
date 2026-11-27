# -*- coding: utf-8 -*-
# Batch "tv-9": televisions + 2 fans filed under TV & Image. Facts only from the store database
# (backups/seo/after-clim/tv-current.json). Contradictions flagged, never published.
import json, os
HERE = os.path.dirname(__file__)
cur = {p["slug"]: p for p in json.load(open(os.path.join(HERE, "../../backups/seo/after-clim/tv-current.json"), encoding="utf-8"))}
P = []
ST = "Livraison partout au Maroc, paiement à la livraison."
STA = "توصيل لكل المغرب والدفع عند الاستلام."
def S(l, v): return {"label": l, "value": v}
def faq(q, a, qa, aa): return {"question": q, "answer": a, "questionAr": qa, "answerAr": aa}
def txt(intro, sections, specs, tail="", ar=False):
    b = intro + "\n\n" + "\n\n".join(f"### {h}\n{t}" for h, t in sections)
    if specs: b += ("\n\n### المواصفات\n" if ar else "\n\n### Caractéristiques\n") + "\n".join(f"- {l}" for l in specs)
    return b + ("\n\n" + tail if tail else "")
def add(slug, verify, d, specs=None, note=None):
    keys = cur[slug]["imgs"]
    c = {k: v for k, v in d.items() if k not in ("alt", "altAr")}
    c["imageAlts"] = [{"key": k, "alt": d["alt"] if i == 0 else f'{d["alt"]}, vue {i + 1}', "altAr": d["altAr"] if i == 0 else f'{d["altAr"]}، صورة {i + 1}'} for i, k in enumerate(keys)]
    e = {"kind": "product", "slug": slug, "source": "tv-9", "sources": [], "verify": verify, "specsVerified": False, "changes": c}
    if specs:
        c["specs"] = specs; e["specsVerified"] = True
        e["sources"] = [note or "Valeurs de la fiche et de l'ancienne description Mega Electro (aucune valeur ajoutée)"]
    P.append(e)

DIST = {32: ("1,3 à 2 mètres", "1.3 و2 متر"), 43: ("1,7 à 2,5 mètres", "1.7 و2.5 متر"), 50: ("2 à 3 mètres", "2 و3 متر")}
def distance(inch, uhd):
    lo, la = DIST[inch]
    return faq(f"À quelle distance regarder un {inch} pouces ?", f"Pour un {inch} pouces{' en 4K' if uhd else ''}, environ {lo} est confortable : plus près en 4K, un peu plus loin en HD.",
               f"على شحال من مسافة نشوف تلفزة {inch} بوصة؟", f"تقريبا بين {la}، أقرب شوية فالـ4K.")
CAST = faq("Peut-on envoyer une vidéo depuis son téléphone ?", "Oui, avec le partage d'écran intégré (Google Cast) depuis un smartphone Android ; AirPlay aussi pour iPhone quand il est indiqué dans les caractéristiques.",
           "واش نقدر نصيفط فيديو من التيليفون؟", "إيه، بـ Google Cast من أندرويد، وAirPlay للآيفون إلا كان مذكور فالمواصفات.")

def tv(slug, verify, name, nameAr, short, shortAr, intro, introAr, secs, secsAr, specs_fr, specs_ar, warranty, mt, md, tAr, mdAr, kw, kwAr, faqs, alt, altAr, specs=None, note=None):
    add(slug, verify, {"name": name, "nameAr": nameAr, "shortDescription": short,
        "description": txt(intro, secs, specs_fr, f"Garantie : {warranty}." if warranty else ""),
        "metaTitle": mt, "metaDescription": md + " " + ST,
        "seo": {"titleAr": tAr, "metaDescriptionAr": mdAr + " " + STA, "shortDescriptionAr": shortAr,
                "descriptionAr": txt(introAr, secsAr, specs_ar, {"2 ans": "الضمان: سنتان.", "1 an": "الضمان: سنة."}.get(warranty, ""), ar=True),
                "keywords": kw, "keywordsAr": kwAr},
        "faq": faqs, "alt": alt, "altAr": altAr}, specs, note)

tv("samsung-32-t5300-full-hd-smart-tv",
   ["Résolution : le nom dit « Full HD », les caractéristiques indiquent 1366 × 768 (HD). Ni l'un ni l'autre n'est publié avant vérification ; nom corrigé sans « Full HD ».", "Garantie « 1 AN » dans les caractéristiques mais champ garantie vide."],
   "Smart TV Samsung 32 pouces T5300", "تلفاز سامسونج الذكي 32 بوصة T5300",
   "Smart TV Samsung T5300 de 32 pouces avec HDR, PurColor, son Dolby Digital Plus et Wi-Fi, pour une chambre ou une cuisine.",
   "تلفاز سامسونج الذكي T5300 مقاس 32 بوصة مع HDR وPurColor وصوت Dolby Digital Plus وواي فاي، لغرفة النوم أو المطبخ.",
   "La Samsung T5300 est une Smart TV de 32 pouces, un format pensé pour une chambre, une cuisine ou un petit salon. Elle reste fine (7,4 cm sans pied) et légère (4,1 kg).",
   "سامسونج T5300 تلفاز ذكي مقاس 32 بوصة لغرفة النوم أو المطبخ أو صالون صغير، رفيع (7.4 سم بدون قاعدة) وخفيف (4.1 كلغ).",
   [("Image", "HDR, PurColor et Mega Contrast améliorent les couleurs et le contraste des contenus compatibles."),
    ("Connectée", "Wi-Fi intégré et port Ethernet pour les applications ; 2 entrées HDMI et 1 USB pour un décodeur, une console ou une clé.")],
   [("الصورة", "HDR وPurColor وMega Contrast لألوان وتباين أفضل."), ("متصل", "واي فاي ومنفذ إيثرنت، منفذا HDMI ومنفذ USB.")],
   ["Taille : 32 pouces", "Smart TV avec Wi-Fi", "HDR, PurColor, Mega Contrast", "Audio : Dolby Digital Plus, 10 W", "Fréquence : 50 Hz", "2 HDMI, 1 USB, Ethernet", "Dimensions sans pied : 73,7 × 43,8 × 7,4 cm", "Poids : 4,1 kg"],
   ["المقاس: 32 بوصة", "تلفاز ذكي بواي فاي", "HDR وPurColor", "صوت Dolby Digital Plus", "2 HDMI و1 USB", "الوزن: 4.1 كلغ"], "1 an",
   "Smart TV Samsung 32 pouces T5300 – Prix Maroc", "Smart TV Samsung T5300 32 pouces, HDR, Dolby Digital Plus, Wi-Fi, 2 HDMI.",
   "تلفاز سامسونج 32 بوصة T5300 بالمغرب", "تلفاز سامسونج الذكي T5300 مقاس 32 بوصة، HDR وDolby Digital Plus وواي فاي.",
   "Smart TV Samsung 32 pouces, Samsung T5300, TV Samsung chambre, petite Smart TV, prix TV Samsung 32 pouces Maroc",
   "تلفاز سامسونج 32 بوصة, تلفزة سامسونج, شاشة سامسونج صغيرة, تلفاز ذكي, ثمن تلفاز سامسونج في المغرب",
   [distance(32, False)], "Smart TV Samsung 32 pouces T5300", "تلفاز سامسونج الذكي 32 بوصة T5300",
   specs=[S("Taille d'écran", "32 pouces"), S("Type d'écran", "LED"), S("Smart TV", "Oui"), S("Fréquence", "50 Hz"), S("Puissance sonore", "10 W"), S("Wi-Fi intégré", "Oui"),
          S("Entrées HDMI", "2"), S("Entrée USB", "1"), S("Ethernet (RJ45)", "Oui"), S("Bluetooth", "Non"), S("Vidéo", "HDR / PurColor / Mega Contrast"), S("Audio", "Dolby Digital Plus"),
          S("Dimensions avec pied", "73,7 × 46,5 × 15,1 cm"), S("Dimensions sans pied", "73,7 × 43,8 × 7,4 cm"), S("Poids", "4,1 kg"), S("Garantie", "1 an")],
   note="Valeurs de la fiche ; résolution contradictoire avec le nom non reprise")

tv("smart-tv-50-morsat-android-14-4k-uhd-rcepteur-tnt", ["Récepteur TNT cité dans le nom, non détaillé. Garantie vide.", "Allégations marketing de l'ancienne description (« catalogue illimité », « efficacité énergétique maximale ») non reprises."],
   "Smart TV Morsat 50 pouces 4K UHD Android 14", "تلفاز مورسات الذكي 50 بوصة 4K بنظام أندرويد 14",
   "Smart TV Morsat de 50 pouces en 4K UHD sous Android 14, écran sans bordure, 3 HDMI et 2 USB.",
   "تلفاز مورسات الذكي 50 بوصة بدقة 4K بنظام أندرويد 14، شاشة بدون إطار، 3 منافذ HDMI و2 USB.",
   "La Morsat 50 pouces (127 cm) affiche en 4K UHD et fonctionne sous Android 14 pour installer les applications de streaming. Son écran sans bordure met l'image en avant dans le salon.",
   "مورسات 50 بوصة (127 سم) بدقة 4K ونظام أندرويد 14 لتثبيت تطبيقات البث، بشاشة بدون إطار.",
   [("4K et rétroéclairage D-LED", "Quatre fois plus de pixels que le Full HD, pour un rendu plus détaillé sur un grand écran."),
    ("Connectique", "3 ports HDMI (console, décodeur, barre de son) et 2 ports USB pour lire des vidéos depuis une clé ou un disque.")],
   [("4K", "أربع مرات بكسلات أكثر من Full HD."), ("التوصيلات", "3 منافذ HDMI ومنفذا USB.")],
   ["Taille : 50 pouces (127 cm)", "Résolution : 4K UHD", "Rétroéclairage : D-LED", "Système : Android 14", "3 HDMI, 2 USB", "Récepteur TNT", "Écran sans bordure"],
   ["المقاس: 50 بوصة", "الدقة: 4K", "أندرويد 14", "3 HDMI و2 USB", "مستقبل TNT"], None,
   "Smart TV Morsat 50 pouces 4K Android 14 – Prix Maroc", "Smart TV Morsat 50 pouces 4K UHD sous Android 14, écran sans bordure, 3 HDMI et récepteur TNT.",
   "تلفاز مورسات 50 بوصة 4K بالمغرب", "تلفاز مورسات الذكي 50 بوصة 4K بنظام أندرويد 14، شاشة بدون إطار و3 منافذ HDMI.",
   "Smart TV Morsat 50 pouces, TV 4K Android 14, Morsat 4K UHD, TV 50 pouces pas chère, prix TV Morsat Maroc",
   "تلفاز مورسات 50 بوصة, تلفزة 4K, شاشة أندرويد, تلفاز 50 بوصة رخيص, ثمن تلفاز مورسات في المغرب",
   [distance(50, True)], "Smart TV Morsat 50 pouces 4K UHD", "تلفاز مورسات الذكي 50 بوصة 4K",
   specs=[S("Marque", "Morsat"), S("Taille d'écran", "50 pouces (127 cm)"), S("Résolution", "4K UHD"), S("Rétroéclairage", "D-LED"), S("Système", "Android 14"), S("HDMI", "3"), S("USB", "2"), S("Design", "Sans bordure")])

tv("venezia-google-tv-50-pouce-4k-led-gtv50", ["Ancienne description mêlant « Google TV » et « Android TV » ; « Google TV » retenu d'après le nom.", "Fiche en rupture de stock ; garantie vide."],
   "Google TV Venezia 50 pouces 4K GTV50", "تلفاز فينيزيا Google TV مقاس 50 بوصة 4K GTV50",
   "Google TV Venezia GTV50 de 50 pouces en 4K, Dolby Vision et Dolby Atmos, HDMI 2.1, Bluetooth et Chromecast intégré.",
   "تلفاز فينيزيا GTV50 بنظام Google TV مقاس 50 بوصة 4K مع Dolby Vision وDolby Atmos وHDMI 2.1 وبلوتوث.",
   "Le Venezia GTV50 associe un écran 4K de 50 pouces et Google TV, qui regroupe les recommandations de YouTube, Netflix et des autres applications sur un même écran d'accueil.",
   "فينيزيا GTV50 يجمع شاشة 4K مقاس 50 بوصة ونظام Google TV الذي يعرض توصيات يوتيوب ونتفليكس والتطبيقات الأخرى في شاشة واحدة.",
   [("Image et son", "Dolby Vision et HDR pour les contenus compatibles, son Dolby Atmos sur 2 × 10 W."),
    ("Pour les consoles", "Un port HDMI 2.1 pour les consoles récentes, deux HDMI 2.0, sortie optique et Bluetooth pour un casque ou une enceinte."),
    ("Assistant Google", "Recherche vocale et Chromecast intégré pour diffuser depuis le téléphone.")],
   [("الصورة والصوت", "Dolby Vision وHDR، وصوت Dolby Atmos بقوة 2 × 10 واط."), ("للألعاب", "منفذ HDMI 2.1 ومنفذا HDMI 2.0 وبلوتوث."), ("مساعد Google", "بحث صوتي وChromecast مدمج.")],
   ["Taille : 50 pouces (126 cm)", "Résolution : 4K (3840 × 2160)", "Dolby Vision, HDR", "Audio : 2 × 10 W, Dolby Atmos", "HDMI : 1 × 2.1, 2 × 2.0", "2 USB, Ethernet, sortie optique", "Bluetooth, Wi-Fi, Chromecast intégré"],
   ["المقاس: 50 بوصة", "الدقة: 4K", "Dolby Vision", "Dolby Atmos", "HDMI 2.1"], None,
   "Google TV Venezia 50 pouces 4K GTV50 – Prix Maroc", "Google TV Venezia GTV50 50 pouces 4K, Dolby Vision, Dolby Atmos, HDMI 2.1 et Chromecast.",
   "تلفاز فينيزيا 50 بوصة 4K Google TV بالمغرب", "تلفاز فينيزيا GTV50 مقاس 50 بوصة 4K مع Dolby Vision وDolby Atmos وHDMI 2.1.",
   "Google TV Venezia 50 pouces, Venezia GTV50, TV 4K Dolby Vision, TV HDMI 2.1, prix TV Venezia Maroc",
   "تلفاز فينيزيا, تلفزة 50 بوصة 4K, شاشة Google TV, تلفاز Dolby Vision, ثمن تلفاز فينيزيا في المغرب",
   [distance(50, True), CAST], "Google TV Venezia GTV50 50 pouces 4K", "تلفاز فينيزيا GTV50 مقاس 50 بوصة 4K")

tv("thomson-google-tv-43-uhd-side-feet", ["Audio, ports et garantie non renseignés."],
   "Google TV Thomson 43 pouces 4K UHD", "تلفاز طومسون Google TV مقاس 43 بوصة 4K",
   "Google TV Thomson de 43 pouces en 4K UHD, Direct LED, 2 Go de RAM et 16 Go de stockage, Wi-Fi bi-bande et Bluetooth 5.0.",
   "تلفاز طومسون Google TV مقاس 43 بوصة بدقة 4K، ذاكرة 2 جيجا وتخزين 16 جيجا، واي فاي وبلوتوث 5.0.",
   "Le Thomson 43 pouces affiche en 4K UHD dans un format qui convient au salon d'un appartement comme à une grande chambre. Son design sans cadre est posé sur deux pieds latéraux.",
   "طومسون 43 بوصة بدقة 4K يناسب صالون شقة أو غرفة كبيرة، بتصميم بدون إطار على قاعدتين جانبيتين.",
   [("Google TV fluide", "2 Go de RAM et 16 Go de stockage, de quoi installer davantage d'applications que sur les modèles à 8 Go."),
    ("Commande vocale", "L'Assistant Google permet de chercher un film ou une chaîne à la voix.")],
   [("Google TV", "ذاكرة 2 جيجا وتخزين 16 جيجا لتطبيقات أكثر."), ("أوامر صوتية", "مساعد Google للبحث بالصوت.")],
   ["Taille : 43 pouces", "Résolution : 3840 × 2160 (4K UHD)", "Technologie : Direct LED", "Fréquence : 60 Hz", "Système : Google TV (Android 11)", "Mémoire : 2 Go RAM, 16 Go", "Wi-Fi 2,4 + 5 GHz, Bluetooth 5.0", "Design sans cadre, pieds latéraux"],
   ["المقاس: 43 بوصة", "الدقة: 4K", "Google TV", "2 جيجا رام و16 جيجا تخزين", "بلوتوث 5.0"], None,
   "Google TV Thomson 43 pouces 4K UHD – Prix Maroc", "Google TV Thomson 43 pouces 4K UHD, 2 Go RAM et 16 Go de stockage, Assistant Google et Bluetooth.",
   "تلفاز طومسون 43 بوصة 4K بالمغرب", "تلفاز طومسون Google TV مقاس 43 بوصة 4K، ذاكرة 2 جيجا و16 جيجا تخزين ومساعد Google.",
   "Google TV Thomson 43 pouces, TV Thomson 4K, TV 43 pouces UHD, Smart TV Google Assistant, prix TV Thomson Maroc",
   "تلفاز طومسون, تلفزة 43 بوصة 4K, شاشة طومسون, تلفاز Google TV, ثمن تلفاز طومسون في المغرب",
   [distance(43, True)], "Google TV Thomson 43 pouces 4K UHD pieds latéraux", "تلفاز طومسون 43 بوصة 4K",
   specs=[S("Taille d'écran", "43 pouces"), S("Résolution", "3840 × 2160 (4K UHD)"), S("Technologie d'affichage", "Direct LED"), S("Fréquence", "60 Hz"), S("Système", "Google TV (Android 11)"), S("Mémoire", "2 Go RAM, 16 Go"), S("Commande vocale", "Assistant Google"), S("Wi-Fi", "2,4 + 5 GHz"), S("Bluetooth", "5.0"), S("Design", "Sans cadre, pieds latéraux")])

tv("xiaomi-tv-a-32-2026-google-tv", ["Garantie vide."],
   "Google TV Xiaomi TV A 32 pouces 2026", "تلفاز شاومي TV A مقاس 32 بوصة إصدار 2026",
   "Xiaomi TV A 32 pouces 2026 sous Google TV : écran HD, HDR10/HLG, son Dolby Audio et DTS:X 2 × 8 W, Google Cast et Wi-Fi bi-bande.",
   "تلفاز شاومي TV A مقاس 32 بوصة إصدار 2026 بنظام Google TV: شاشة HD، HDR10، صوت Dolby Audio بقوة 2 × 8 واط وGoogle Cast.",
   "La Xiaomi TV A 32 2026 est une petite Google TV pour une chambre, une cuisine ou une pièce secondaire. Son écran est en HD (1366 × 768), un choix suffisant à cette taille et à distance normale.",
   "شاومي TV A 32 إصدار 2026 تلفاز Google TV صغير لغرفة النوم أو المطبخ، بشاشة HD تكفي لهذا المقاس.",
   [("Google TV", "Accès aux applications de streaming, Assistant Google et Google Cast pour envoyer une vidéo depuis le téléphone."),
    ("Son", "Deux haut-parleurs de 8 W compatibles Dolby Audio, DTS:X et DTS Virtual:X."),
    ("Fixation murale", "Compatible VESA 100 × 200 mm, cadre métallique à bordures fines.")],
   [("Google TV", "تطبيقات البث ومساعد Google وGoogle Cast."), ("الصوت", "مكبران 8 واط مع Dolby Audio وDTS:X."), ("التثبيت", "متوافق مع VESA 100 × 200.")],
   ["Taille : 32 pouces", "Résolution : HD (1366 × 768)", "HDR10, HLG", "Fréquence : 60 Hz", "Mémoire : 1 Go RAM, 8 Go", "Audio : 2 × 8 W, Dolby Audio, DTS:X", "2 HDMI, 1 USB, Ethernet", "Wi-Fi 2,4 et 5 GHz, Bluetooth 5.0", "VESA 100 × 200 mm"],
   ["المقاس: 32 بوصة", "الدقة: HD", "HDR10", "صوت 2 × 8 واط", "2 HDMI"], None,
   "Google TV Xiaomi TV A 32 pouces 2026 – Prix Maroc", "Xiaomi TV A 32 pouces 2026 Google TV, HDR10, Dolby Audio, Google Cast et Wi-Fi bi-bande.",
   "تلفاز شاومي 32 بوصة Google TV بالمغرب", "تلفاز شاومي TV A مقاس 32 بوصة 2026 بنظام Google TV مع HDR10 وDolby Audio وGoogle Cast.",
   "Xiaomi TV A 32 2026, Google TV 32 pouces, TV Xiaomi 32 pouces, petite TV connectée, prix TV Xiaomi 32 Maroc",
   "تلفاز شاومي 32 بوصة, تلفزة شاومي, شاشة صغيرة, تلفاز Google TV, ثمن تلفاز شاومي 32 في المغرب",
   [distance(32, False), CAST], "Google TV Xiaomi TV A 32 pouces 2026", "تلفاز شاومي TV A مقاس 32 بوصة")

tv("google-tv-32-smart-hd-daiko-gled32aq83dk", [],
   "Google TV Daiko 32 pouces HD GLED32AQ83DK", "تلفاز دايكو Google TV مقاس 32 بوصة HD GLED32AQ83DK",
   "Google TV Daiko GLED32AQ83DK de 32 pouces HD sous Google TV 5.0 (Android 14), HDR10/HLG, Dolby Audio, Google Cast et AirPlay, garantie 24 mois.",
   "تلفاز دايكو GLED32AQ83DK مقاس 32 بوصة HD بنظام Google TV 5.0، HDR10، Dolby Audio، Google Cast وAirPlay، ضمان 24 شهرا.",
   "La Daiko GLED32AQ83DK est une Google TV de 32 pouces récente, sous Google TV 5.0 et Android 14, avec une garantie de 24 mois : un bon choix pour une chambre ou une cuisine.",
   "دايكو GLED32AQ83DK تلفاز Google TV مقاس 32 بوصة بنظام Google TV 5.0 وأندرويد 14، بضمان 24 شهرا.",
   [("Partage facile", "Google Cast et AirPlay : envoyez une vidéo depuis un téléphone Android ou un iPhone. Commande vocale incluse."),
    ("Connexions", "Wi-Fi 2,4 + 5 GHz, Bluetooth 5.1, 2 HDMI, 1 USB et LAN.")],
   [("مشاركة سهلة", "Google Cast وAirPlay، وأوامر صوتية."), ("التوصيلات", "واي فاي ثنائي، بلوتوث 5.1، 2 HDMI.")],
   ["Taille : 32 pouces", "Résolution : HD 1366 × 768", "Google TV 5.0, Android 14", "HDR10, HLG", "Dolby Audio", "Fréquence : 60 Hz", "1 Go RAM, 8 Go", "2 HDMI, 1 USB, LAN", "Wi-Fi 2,4 + 5 GHz, Bluetooth 5.1"],
   ["المقاس: 32 بوصة", "HD", "Google TV 5.0", "Dolby Audio", "2 HDMI"], "2 ans",
   "Google TV Daiko 32 pouces GLED32AQ83DK – Prix Maroc", "Google TV Daiko 32 pouces HD, Android 14, Google Cast et AirPlay, garantie 24 mois.",
   "تلفاز دايكو 32 بوصة Google TV بالمغرب", "تلفاز دايكو GLED32AQ83DK مقاس 32 بوصة بنظام Google TV وأندرويد 14، ضمان 24 شهرا.",
   "Google TV Daiko 32 pouces, Daiko GLED32AQ83DK, TV 32 pouces Android 14, petite Smart TV AirPlay, prix TV Daiko 32 Maroc",
   "تلفاز دايكو 32 بوصة, تلفزة دايكو, شاشة Google TV صغيرة, تلفاز ذكي, ثمن تلفاز دايكو في المغرب",
   [distance(32, False), CAST], "Google TV Daiko GLED32AQ83DK 32 pouces", "تلفاز دايكو GLED32AQ83DK مقاس 32 بوصة",
   specs=[S("Marque", "Daiko"), S("Modèle", "GLED32AQ83DK"), S("Taille", "32 pouces"), S("Résolution", "HD 1366 × 768"), S("Système", "Google TV 5.0 / Android 14"), S("HDR", "HDR10, HLG"), S("Audio", "Dolby Audio"),
          S("Fréquence", "60 Hz"), S("RAM", "1 Go"), S("Stockage", "8 Go"), S("HDMI", "2"), S("USB", "1"), S("Wi-Fi", "2,4 + 5 GHz"), S("Bluetooth", "5.1"), S("Google Cast / AirPlay", "Oui"), S("Garantie", "24 mois")],
   note="Valeurs de l'ancienne description de la fiche")

tv("tv-qled-50-pouces-4k-google-tv-120hz-gaming-daiko-qled50gu25dk", [],
   "TV QLED Daiko 50 pouces 4K Google TV 120 Hz QLED50GU25DK", "تلفاز دايكو QLED مقاس 50 بوصة 4K بتردد 120 هرتز QLED50GU25DK",
   "TV QLED Daiko de 50 pouces en 4K, 120 Hz avec VRR et ALLM, HDMI 2.1, Google TV 5.0 et Dolby Audio 2 × 10 W, garantie 24 mois.",
   "تلفاز دايكو QLED مقاس 50 بوصة 4K بتردد 120 هرتز مع VRR وALLM وHDMI 2.1 ونظام Google TV 5.0، ضمان 24 شهرا.",
   "La Daiko QLED50GU25DK vise ceux qui jouent autant qu'ils regardent : une dalle QLED 4K de 50 pouces à 120 Hz, compatible VRR et ALLM pour les consoles récentes.",
   "دايكو QLED50GU25DK لمن يلعب ويشاهد: شاشة QLED بدقة 4K مقاس 50 بوصة بتردد 120 هرتز مع VRR وALLM.",
   [("Pour les jeux", "Le 120 Hz, le VRR (taux variable) et le mode ALLM (faible latence automatique) via HDMI 2.1 rendent l'image plus fluide et plus réactive avec une console compatible."),
    ("Image", "QLED, 350 nits, contraste 5000:1, HDR10, HLG et MEMC pour les mouvements rapides."),
    ("Google TV 5.0", "Applications de streaming, commande vocale, Chromecast et AirPlay.")],
   [("للألعاب", "120 هرتز وVRR وALLM عبر HDMI 2.1."), ("الصورة", "QLED بسطوع 350 nits وتباين 5000:1 وHDR10."), ("Google TV 5.0", "تطبيقات وأوامر صوتية وChromecast وAirPlay.")],
   ["Taille : 50 pouces", "Résolution : 4K UHD (3840 × 2160)", "Dalle : QLED, 350 nits, contraste 5000:1", "Fréquence : 120 Hz, VRR, ALLM, MEMC", "HDMI 2.1", "HDR10, HLG", "Google TV 5.0, Android 14", "Audio : Dolby Audio 2 × 10 W", "Wi-Fi 2,4 et 5 GHz"],
   ["المقاس: 50 بوصة", "4K", "QLED", "120 هرتز", "HDMI 2.1", "صوت 2 × 10 واط"], "2 ans",
   "TV QLED Daiko 50 pouces 4K 120 Hz – Prix Maroc", "TV QLED Daiko 50 pouces 4K 120 Hz, VRR, ALLM et HDMI 2.1 pour consoles, Google TV 5.0, garantie 24 mois.",
   "تلفاز دايكو QLED مقاس 50 بوصة 120 هرتز بالمغرب", "تلفاز دايكو QLED مقاس 50 بوصة 4K بتردد 120 هرتز وHDMI 2.1 للألعاب، ضمان 24 شهرا.",
   "TV QLED Daiko 50 pouces, Daiko QLED50GU25DK, TV 4K 120Hz, TV gaming HDMI 2.1, prix TV QLED Maroc",
   "تلفاز QLED دايكو, تلفزة 50 بوصة 4K, شاشة للألعاب 120 هرتز, تلفاز PS5, ثمن تلفاز QLED في المغرب",
   [faq("Est-elle adaptée à une PS5 ou une Xbox Series ?", "Elle offre 120 Hz, VRR et ALLM via HDMI 2.1, les fonctions qu'exploitent les consoles récentes compatibles.", "واش مناسبة لـ PS5 ولا Xbox؟", "فيها 120 هرتز وVRR وALLM عبر HDMI 2.1، اللي كيستعملوهم الكونسولات الجديدة."), distance(50, True)],
   "TV QLED Daiko QLED50GU25DK 50 pouces 4K", "تلفاز دايكو QLED50GU25DK مقاس 50 بوصة 4K",
   specs=[S("Marque", "Daiko"), S("Modèle", "QLED50GU25DK"), S("Taille", "50 pouces"), S("Résolution", "4K UHD 3840 × 2160"), S("Dalle", "QLED"), S("Luminosité", "350 nits"), S("Contraste", "5000:1"),
          S("Fréquence", "120 Hz"), S("Jeu", "VRR, ALLM, HDMI 2.1"), S("Image", "HDR10, HLG, MEMC"), S("Système", "Google TV 5.0 / Android 14"), S("Audio", "Dolby Audio, 2 × 10 W"), S("Wi-Fi", "2,4 et 5 GHz"), S("Garantie", "24 mois")],
   note="Valeurs de l'ancienne description de la fiche")

# ── Fans filed under TV & Image ─────────────────────────────────────────────
FANCAT = "Catégorie : ventilateur rangé dans « TV & Image ». À déplacer vers « Climatisation & chauffage » dans l'admin."
FANFAQ = faq("Un ventilateur consomme-t-il beaucoup ?", "Non, bien moins qu'un climatiseur : c'est l'une des façons les plus économiques de se rafraîchir.", "واش الفانتيلاتور كيستهلك بزاف؟", "لا، أقل بزاف من الكليماتيزور.")
tv("kenz-ventilateur-de-sol-18-pouces-puissant-mtallique-robuste", [FANCAT, "Nombre de vitesses et garantie non renseignés."],
   "Ventilateur de sol Kenz 18 pouces métallique LN-1801", "مروحة أرضية كنز 18 بوصة معدنية LN-1801",
   "Ventilateur de sol Kenz LN-1801 de 18 pouces, structure métallique robuste et 79 W, pour brasser l'air d'une grande pièce.",
   "مروحة أرضية كنز LN-1801 مقاس 18 بوصة بهيكل معدني متين وقوة 79 واط، لتحريك هواء غرفة كبيرة.",
   "Le Kenz LN-1801 est un ventilateur de sol de 18 pouces à structure métallique : plus robuste qu'un modèle en plastique, il convient à un grand salon, un atelier ou un commerce.",
   "كنز LN-1801 مروحة أرضية 18 بوصة بهيكل معدني، أمتن من البلاستيك، للصالون الكبير أو الورشة أو المحل.",
   [("Puissant", "Avec 79 W et des pales de 18 pouces, il déplace un volume d'air important.")], [("قوية", "79 واط وأجنحة 18 بوصة.")],
   ["Modèle : LN-1801", "Type : ventilateur de sol", "Diamètre : 18 pouces", "Puissance : 79 W", "Tension : 220 V – 50 Hz", "Structure métallique", "Couleur : silver"],
   ["الموديل: LN-1801", "القطر: 18 بوصة", "القوة: 79 واط", "معدنية"], None,
   "Ventilateur de sol Kenz 18 pouces LN-1801 – Prix Maroc", "Ventilateur de sol Kenz LN-1801 18 pouces, métallique et robuste, 79 W, pour grandes pièces et commerces.",
   "مروحة أرضية كنز 18 بوصة بالمغرب", "مروحة أرضية كنز LN-1801 مقاس 18 بوصة معدنية وقوية، 79 واط، للغرف الكبيرة والمحلات.",
   "ventilateur de sol Kenz, Kenz LN-1801, ventilateur métallique 18 pouces, ventilateur puissant, prix ventilateur Kenz Maroc",
   "فانتيلاتور كنز, مروحة أرضية, فانتيلاتور معدني, مروحة قوية, ثمن الفانتيلاتور في المغرب",
   [FANFAQ], "Ventilateur de sol Kenz LN-1801 18 pouces métallique", "مروحة أرضية كنز LN-1801 معدنية")
tv("ventilateur-20-pouces-aluminium-3-vitesses-sur-socle", [FANCAT, "Garantie non renseignée."],
   "Ventilateur sur socle General 20 pouces aluminium 3 vitesses", "مروحة جنرال على قاعدة 20 بوصة ألومنيوم 3 سرعات",
   "Ventilateur sur socle General de 20 pouces en aluminium, 3 vitesses, pour un grand volume d'air.",
   "مروحة جنرال على قاعدة مقاس 20 بوصة من الألومنيوم بثلاث سرعات، لحجم هواء كبير.",
   "Ce ventilateur General de 20 pouces sur socle est l'un des plus grands de notre catalogue : il convient aux grands salons, aux ateliers et aux commerces.",
   "مروحة جنرال 20 بوصة على قاعدة من أكبر المراوح عندنا: للصالونات الكبيرة والورشات والمحلات.",
   [("À savoir", "Son niveau sonore annoncé est de 80 dB : un modèle puissant, plus adapté à un grand espace qu'à une chambre.")], [("للعلم", "مستوى الصوت 80 ديسيبل: مناسبة للفضاءات الكبيرة.")],
   ["Diamètre : 20 pouces", "Vitesses : 3", "Pose : sur socle", "Niveau sonore : 80 dB", "Couleur : gris"], ["القطر: 20 بوصة", "3 سرعات", "الصوت: 80 ديسيبل"], None,
   "Ventilateur sur socle General 20 pouces – Prix Maroc", "Ventilateur sur socle General 20 pouces en aluminium, 3 vitesses, pour grands salons et commerces.",
   "مروحة جنرال 20 بوصة على قاعدة بالمغرب", "مروحة جنرال على قاعدة مقاس 20 بوصة من الألومنيوم بثلاث سرعات للفضاءات الكبيرة.",
   "ventilateur 20 pouces, ventilateur General aluminium, ventilateur sur socle, grand ventilateur, prix ventilateur 20 pouces Maroc",
   "فانتيلاتور كبير, مروحة 20 بوصة, فانتيلاتور جنرال, مروحة ألومنيوم, ثمن الفانتيلاتور في المغرب",
   [FANFAQ], "Ventilateur sur socle General 20 pouces aluminium", "مروحة جنرال 20 بوصة ألومنيوم",
   specs=[S("Marque", "General"), S("Type", "Ventilateur sur socle"), S("Dimensions", "20 pouces"), S("Vitesses", "3"), S("Niveau sonore", "80 dB"), S("Couleur", "Gris")])

assert len(P) == 9
for e in P: assert "None" not in json.dumps(e["changes"], ensure_ascii=False), e["slug"]
json.dump(P, open(os.path.join(HERE, "tv-9.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(P), "entries")
