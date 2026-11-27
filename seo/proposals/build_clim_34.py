# -*- coding: utf-8 -*-
# Batch "clim-34": air conditioners, portable ACs, air coolers and fans.
# Facts only from the store database (backups/seo/after-washing/clim-current.json). Contradictions flagged, never published.
import json, os
HERE = os.path.dirname(__file__)
cur = {p["slug"]: p for p in json.load(open(os.path.join(HERE, "../../backups/seo/after-washing/clim-current.json"), encoding="utf-8"))}
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
    e = {"kind": "product", "slug": slug, "source": "clim-34", "sources": [], "verify": verify, "specsVerified": False, "changes": c}
    if specs:
        c["specs"] = specs; e["specsVerified"] = True
        e["sources"] = [note or "Valeurs de la fiche et de l'ancienne description Mega Electro (aucune valeur ajoutée)"]
    P.append(e)
W = lambda m: f"Garantie : {m} mois." if m else ""
WA = lambda m: {12: "الضمان: 12 شهرا.", 3: "الضمان: 3 أشهر."}.get(m, "")

# Room guidance by capacity (general guidance, not product claims).
ROOM = {9000: ("une chambre ou un bureau", "غرفة نوم أو مكتب"), 12000: ("une chambre spacieuse ou un séjour moyen", "غرفة كبيرة أو صالون متوسط"),
        18000: ("un salon", "صالون"), 24000: ("un grand salon ou un espace ouvert", "صالون كبير أو فضاء مفتوح")}
INSTALL = faq("L'installation est-elle comprise ?", "Un climatiseur split doit être posé par un technicien qualifié qui relie l'unité intérieure à l'unité extérieure. Demandez-nous conseil pour l'installation dans votre ville.",
              "واش التركيب داخل؟", "الكليماتيزور سبليت خاصو تقني مختص يركب الوحدة الداخلية والخارجية. سولونا على التركيب فالمدينة ديالكم.")
def sizing(btu): return faq(f"Pour quelle pièce choisir {btu} BTU ?", f"En général, {btu} BTU conviennent à {ROOM[btu][0]}. L'exposition au soleil, l'étage et l'isolation comptent aussi : envoyez-nous la surface de la pièce pour un conseil.",
                            f"{btu} BTU لأي بيت؟", f"عادة {btu} BTU كتناسب {ROOM[btu][1]}. الشمس والطابق والعزل حتى هوما كيأثرو، صيفطو لينا المساحة ونعاونوكم.")
def btu_fr(b): return f"{b:,}".replace(",", " ")

def fit(cands, lo, hi):
    """First candidate within [lo, hi] characters, else the longest one under hi."""
    for c in cands:
        if lo <= len(c) <= hi: return c
    ok = [c for c in cands if len(c) <= hi]
    return max(ok, key=len) if ok else cands[-1][:hi]

SHORT = {"Samsung": ("Samsung Wi-Fi", "سامسونج"), "LG JetCool": ("LG JetCool", "LG JetCool"), "LG ARTCOOL Mirror": ("LG ARTCOOL Mirror", "LG ARTCOOL"),
         "Fitco": ("Fitco", "فيتكو"), "Daiko Smart Wi-Fi": ("Daiko Wi-Fi", "دايكو واي فاي"), "Daiko Smart Wi-Fi gris foncé": ("Daiko gris", "دايكو رمادي"),
         "Daiko Smart Inverter": ("Daiko", "دايكو")}

def split(slug, verify, brand, brandAr, btu, model, reversible, intro, introAr, secs, secsAr, specs_fr, specs_ar, w, kw, kwAr, specs=None, note=None, label=None, title_hint=""):
    lab = label or f"Climatiseur {brand}"
    labAr = f"مكيف {brandAr}"
    rev = " réversible" if reversible else ""
    revAr = " بارد وساخن" if reversible else ""
    b = btu_fr(btu) if btu else ""
    m = f" {model}" if model else ""
    sf, sa = SHORT.get(brand, (brand, brandAr))
    bt = f" {btu} BTU" if btu else ""
    title = fit([f"Climatiseur {sf}{title_hint}{bt}{m} – Prix Maroc", f"Climatiseur {sf}{title_hint}{bt} – Prix Maroc", f"Clim {sf}{title_hint}{bt} – Prix Maroc"], 40, 55)
    hintAr = " بارد وساخن" if title_hint else ""
    titleAr = fit([f"كليماتيزور {sa}{hintAr}{bt}{m} بالمغرب", f"كليماتيزور {sa}{hintAr}{bt} بالمغرب", f"مكيف {sa}{hintAr}{bt} في المغرب"], 30, 55)
    room = ROOM[btu][0] if btu else "votre pièce"
    roomAr = ROOM[btu][1] if btu else "غرفتكم"
    def build(core, optional, tail, lo, hi):
        """core + as many optional parts as fit + tail, aiming for [lo, hi]."""
        parts = []
        for o in optional:
            if len(" ".join([core] + parts + [o, tail])) <= hi: parts.append(o)
        return " ".join([core] + parts + [tail])
    wr = "Garantie 12 mois." if w else ""
    inv = "" if "Inverter" in brand else " Inverter"   # no "Smart Inverter … Inverter"
    md = build(f"Climatiseur {brand}{rev}{(' ' + b + ' BTU') if btu else ''}{inv}{m}{' chaud et froid' if title_hint else ''}.",
               ([f"Idéal pour {room}."] if btu else []) + (["Froid en été, chauffage en hiver."] if reversible else []) + ([wr] if wr else []) + ["Conseil d'installation par notre équipe."], ST, 120, 160)
    mdAr = build(f"مكيف {brandAr}{revAr}{(' بقوة ' + str(btu) + ' BTU') if btu else ''}{' بتقنية إنفرتر' if 'إنفرتر' not in brandAr else ''}{'، نسخة التبريد والتسخين' if title_hint else ''}.",
                 ([f"مناسب ل{roomAr}."] if btu else []) + (["تبريد في الصيف وتسخين في الشتاء."] if reversible else []) + (["ضمان 12 شهرا."] if w else []) + ["نصائح التركيب من فريقنا."], STA, 100, 160)
    add(slug, verify, {
      "name": f"{lab} {b} BTU{'' if 'Inverter' in lab else ' Inverter'}{m}".replace("  ", " ") if btu else f"{lab}{m}",
      "nameAr": f"{labAr} {btu} BTU{'' if 'إنفرتر' in labAr else ' إنفرتر'}{m}" if btu else f"{labAr}{m}",
      "shortDescription": f"{lab}{rev}" + (f" de {b} BTU" if btu else "") + ("" if "Inverter" in lab else " à technologie Inverter") + f", pour {room}.",
      "description": txt(intro, secs, specs_fr, W(w)),
      "metaTitle": title, "metaDescription": md,
      "seo": {"titleAr": titleAr, "metaDescriptionAr": mdAr,
              "shortDescriptionAr": f"مكيف {brandAr}{revAr}" + (f" بقوة {btu} BTU" if btu else "") + ("" if "إنفرتر" in brandAr else " بتقنية إنفرتر") + f"، مناسب ل{roomAr}.",
              "descriptionAr": txt(introAr, secsAr, specs_ar, WA(w), ar=True), "keywords": kw, "keywordsAr": kwAr},
      "faq": ([sizing(btu)] if btu else []) + [INSTALL],
      "alt": f"Climatiseur {brand}" + (f" {b} BTU" if btu else "") + f"{m}, unité intérieure", "altAr": f"مكيف {brandAr}" + (f" {btu} BTU" if btu else "") + f"{m}، الوحدة الداخلية"}, specs, note)

# ── Samsung ─────────────────────────────────────────────────────────────────
split("inverter-wifi-ai-12btu", ["Capacité : le nom indique 12 BTU (sic), la référence fournisseur « AR50F18C1RH/RC » correspond à un 18 000 BTU. Aucune capacité publiée tant que ce n'est pas vérifié.", "Fonction chauffage non confirmée."],
      "Samsung", "سامسونج", None, "", False,
      "Climatiseur Samsung Inverter avec Wi-Fi et fonctions AI : il se pilote depuis un smartphone et ajuste son fonctionnement pour garder une température stable.",
      "مكيف سامسونج إنفرتر مع واي فاي ووظائف الذكاء الاصطناعي: يتحكم فيه من الهاتف ويعدل تشغيله للحفاظ على حرارة مستقرة.",
      [("Wi-Fi", "Allumez-le avant de rentrer chez vous ou réglez la température depuis votre lit, via l'application sur smartphone."),
       ("Inverter", "Le compresseur varie sa vitesse au lieu de s'arrêter et redémarrer sans cesse : moins de bruit et moins de pics de consommation.")],
      [("واي فاي", "شغلوه قبل الوصول إلى البيت من الهاتف."), ("إنفرتر", "الضاغط يغير سرعته بدل التوقف والتشغيل المتكرر: صوت أقل واستهلاك أقل.")],
      ["Marque : Samsung", "Technologie Inverter", "Wi-Fi intégré"], ["العلامة: سامسونج", "إنفرتر", "واي فاي"], 12,
      "climatiseur Samsung Inverter, climatiseur Samsung WiFi, climatiseur Samsung AI, clim Samsung Maroc, prix climatiseur Samsung Maroc",
      "كليماتيزور سامسونج, مكيف سامسونج, مكيف إنفرتر واي فاي, كليم سامسونج, ثمن مكيف سامسونج في المغرب",
      label="Climatiseur Samsung Wi-Fi AI")

# ── LG Jetcool ──────────────────────────────────────────────────────────────
for slug, btu, model in [("inverter-9k-btu-jetcool", 9000, "TV09SDH0"), ("inverter-12000-btu-jetcool", 12000, "TV12SDH0"), ("inverter-18000-btu-jetcool", 18000, "TV18SDH0")]:
    split(slug, ["Référence déduite de la liste de modèles de l'ancienne description (TV09SDH0 / TV12SDH0 / TV18SDH0) : à confirmer.", "Classe énergétique et dimensions non renseignées."],
          "LG JetCool", "LG JetCool", btu, model, True,
          f"Le LG JetCool de {btu_fr(btu)} BTU est un climatiseur split réversible : il rafraîchit en été et chauffe en hiver. Son mode Jet donne un coup de froid rapide en rentrant dans une pièce surchauffée.",
          f"مكيف LG JetCool بقوة {btu} BTU، بارد وساخن: يبرد في الصيف ويسخن في الشتاء، ووضع Jet يعطي برودة سريعة.",
          [("Mode Jet", "Un démarrage à pleine puissance pour faire baisser rapidement la température, puis l'Inverter prend le relais à vitesse réduite."),
           ("Chauffage en hiver", "La fonction chauffage intégrée en fait un appareil utile toute l'année, notamment pendant les soirées froides de l'hiver marocain.")],
          [("وضع Jet", "تشغيل بالقوة القصوى لتبريد سريع ثم ينتقل الإنفرتر لسرعة منخفضة."), ("التسخين في الشتاء", "وظيفة التسخين تجعله مفيدا طوال السنة.")],
          [f"Capacité : {btu_fr(btu)} BTU", "Inverter", "Mode Jet (refroidissement rapide)", "Fonction chauffage", f"Référence : {model}"],
          [f"القوة: {btu} BTU", "إنفرتر", "وضع Jet", "وظيفة التسخين"], 12,
          f"climatiseur LG {btu_fr(btu)} BTU, LG JetCool, LG {model}, climatiseur réversible LG, prix climatiseur LG Maroc",
          f"كليماتيزور LG {btu}, مكيف LG بارد وساخن, كليم LG, مكيف إنفرتر, ثمن مكيف LG في المغرب")

# ── LG ARTCOOL Mirror ───────────────────────────────────────────────────────
for slug, btu in [("artcool-mirror-uvnano", None), ("artcool-mirror-uvnano-12000btu", 12000), ("artcool-mirror-uvnano-18000btu", 18000)]:
    split(slug, ["Capacité absente du nom" if not btu else "Référence LG exacte absente.", "Fonction chauffage et classe énergétique non renseignées."],
          "LG ARTCOOL Mirror", "LG ARTCOOL Mirror", btu, "", False,
          "Le LG ARTCOOL Mirror se reconnaît à sa façade effet miroir : un climatiseur mural pensé pour les pièces où il reste visible, comme le salon." + (f" Cette version de {btu_fr(btu)} BTU convient à {ROOM[btu][0]}." if btu else ""),
          "مكيف LG ARTCOOL Mirror بواجهة تشبه المرآة، مصمم للغرف التي يظهر فيها مثل الصالون." + (f" هذه النسخة بقوة {btu} BTU تناسب {ROOM[btu][1]}." if btu else ""),
          [("UVnano", "Une lumière LED UV garde propre le ventilateur qui souffle l'air dans la pièce."), ("Un design assumé", "La façade miroir remplace le bloc blanc habituel et s'intègre à une décoration moderne.")],
          [("UVnano", "ضوء LED فوق بنفسجي يحافظ على نظافة المروحة."), ("تصميم أنيق", "واجهة مرآة بدل الشكل الأبيض المعتاد.")],
          (["Capacité : " + btu_fr(btu) + " BTU"] if btu else []) + ["Façade miroir", "Technologie UVnano", "Inverter"], ([f"القوة: {btu} BTU"] if btu else []) + ["واجهة مرآة", "UVnano"], 12,
          "climatiseur LG ARTCOOL Mirror" + (f" {btu_fr(btu)} BTU" if btu else "") + ", LG UVnano, climatiseur design miroir, clim LG Maroc, prix climatiseur LG ARTCOOL Maroc",
          "كليماتيزور LG ARTCOOL, مكيف LG مرآة, مكيف UVnano, كليم LG, ثمن مكيف LG في المغرب")

# ── Fitco ───────────────────────────────────────────────────────────────────
for slug, btu, model, extra in [("fitco-inverter-blanc", 9000, "FSW09T24PW", []), ("fitco-inverter-blanc-18000-btu", 18000, "FSW18T24PW", []),
                                ("fitco-inverter-blanc-24000-btu", 24000, "FSW24T24PW", ["Ancienne description : « 9000 BTU » pour un modèle 24 000 BTU (corrigé d'après le nom et la référence)."])]:
    split(slug, extra + ["Fonction chauffage, classe énergétique et dimensions non renseignées."],
          "Fitco", "فيتكو", btu, model, False,
          f"Le Fitco {model} est un climatiseur split Inverter de {btu_fr(btu)} BTU en finition blanche, une option abordable pour équiper {ROOM[btu][0]}.",
          f"فيتكو {model} مكيف سبليت إنفرتر بقوة {btu} BTU بلون أبيض، خيار بثمن مناسب ل{ROOM[btu][1]}.",
          [("Inverter", "Le compresseur module sa puissance au lieu de fonctionner par à-coups : la température reste plus stable et le bruit plus faible.")],
          [("إنفرتر", "الضاغط يعدل قوته فتبقى الحرارة مستقرة والصوت أقل.")],
          [f"Référence : {model}", f"Capacité : {btu_fr(btu)} BTU", "Inverter", "Couleur : blanc"], [f"المرجع: {model}", f"القوة: {btu} BTU", "إنفرتر", "أبيض"], 12,
          f"climatiseur Fitco {btu_fr(btu)} BTU, Fitco {model}, climatiseur Inverter blanc, climatiseur pas cher, prix climatiseur Fitco Maroc",
          f"كليماتيزور فيتكو {btu}, مكيف فيتكو, مكيف إنفرتر أبيض, كليم رخيص, ثمن مكيف فيتكو في المغرب",
          specs=[S("Marque", "Fitco"), S("Référence", model), S("Capacité", f"{btu_fr(btu)} BTU"), S("Technologie", "Inverter"), S("Couleur", "Blanc")])

# ── Daiko Smart Wi-Fi (QINV / LIV series, full spec sheets) ─────────────────
def daiko_wifi(slug, btu, model, heat, pc, ph, noise_in, noise_out, dim_in, weight, color, energy, timer, verify, dup_note=None):
    vf = verify + ([dup_note] if dup_note else [])
    split(slug, vf, "Daiko Smart Wi-Fi", "دايكو سمارت واي فاي", btu, model, True,
          f"Le Daiko {model} est un climatiseur split réversible de {btu_fr(btu)} BTU, pilotable en Wi-Fi depuis un smartphone. Il rafraîchit en été ({btu_fr(btu)} BTU) et chauffe en hiver ({btu_fr(heat)} BTU), avec une unité intérieure {color.lower()}.",
          f"دايكو {model} مكيف سبليت بارد وساخن بقوة {btu} BTU، يتحكم فيه بالواي فاي من الهاتف: تبريد {btu} BTU وتسخين {heat} BTU.",
          [("Chaud et froid", f"En hiver, le mode chauffage délivre {btu_fr(heat)} BTU : une façon de chauffer la pièce sans radiateur d'appoint."),
           ("Discret", f"Unité intérieure à {noise_in} dB" + (f", unité extérieure à {noise_out} dB." if noise_out else ".")),
           ("Connecté", "Application Smart Wi-Fi, télécommande, minuterie et redémarrage automatique après une coupure de courant.")],
          [("بارد وساخن", f"في الشتاء يعطي {heat} BTU من التسخين."), ("هادئ", f"الوحدة الداخلية {noise_in} ديسيبل."), ("متصل", "تطبيق واي فاي، جهاز تحكم ومؤقت.")],
          [f"Refroidissement : {btu_fr(btu)} BTU/h ({pc} W)", f"Chauffage : {btu_fr(heat)} BTU/h ({ph} W)", f"Bruit unité intérieure : {noise_in} dB", f"Dimensions unité intérieure : {dim_in}", f"Classe énergétique : {energy}", "Gaz : R410A", f"Minuterie : {timer}", f"Couleur unité intérieure : {color}"],
          [f"التبريد: {btu} BTU", f"التسخين: {heat} BTU", f"الصوت: {noise_in} ديسيبل", f"فئة الطاقة: {energy}", "غاز R410A"], 12,
          f"climatiseur Daiko {btu_fr(btu)} BTU, Daiko {model}, climatiseur WiFi chaud froid, clim réversible Inverter, prix climatiseur Daiko Maroc",
          f"كليماتيزور دايكو {btu}, مكيف دايكو بارد وساخن, مكيف واي فاي, كليم إنفرتر, ثمن مكيف دايكو في المغرب",
          specs=[S("Référence", model), S("Type", "Split mural réversible (froid et chaud)"), S("Capacité de refroidissement", f"{btu_fr(btu)} BTU/h"), S("Capacité de chauffage", f"{btu_fr(heat)} BTU/h"),
                 S("Puissance de refroidissement", f"{pc} W"), S("Puissance de chauffage", f"{ph} W"), S("Bruit unité intérieure", f"{noise_in} dB")] + ([S("Bruit unité extérieure", f"{noise_out} dB")] if noise_out else []) +
                [S("Dimensions unité intérieure", dim_in)] + ([S("Poids net unité intérieure", weight)] if weight else []) + [S("Classe énergétique", energy), S("Gaz", "R410A"), S("Minuterie", timer), S("Couleur unité intérieure", color), S("Tension", "220–240 V, 50 Hz"), S("Wi-Fi", "Oui")])

daiko_wifi("climatiseur-split-mural-smart-wifi-inverter-9000-btu", 9000, "ACW09LIV410DK", 9500, 797, 750, 40, 50, "700 × 198 × 270 mm", "6,5 kg", "Gris foncé", "A", "0–8 h", [])
daiko_wifi("climatiseur-split-mural-smart-wifi-inverter-12000-btu", 12000, "ACW12QINV410BK", 12500, 1063, 985, 42, 50, "805 × 270 × 197 mm", "7,47 kg", "Noir", "A+", "24 h", [])
daiko_wifi("climatiseur-split-mural-smart-wifi-inverter-18000-btu", 18000, "ACW18QINV410XK", 18500, 1589, 1450, 44, 54, "908 × 295 × 220 mm", "10 kg", "Gris foncé", "A", "0–8 h", [],
           "Doublon : même référence ACW18QINV410XK que la fiche « …18000-btu-gris » (en rupture). Envisager une redirection 301 de la fiche en rupture vers celle-ci.")
daiko_wifi("climatiseur-split-mural-smart-wifi-inverter-24000-btu", 24000, "ACW24QINV410XK", 24500, 2119, 1915, 46, 54, "1025 × 319 × 223 mm", "12,3 kg", "Gris foncé", "A", "0–8 h", [],
           "Doublon : même référence ACW24QINV410XK que la fiche « …24000-btu-gris » (en rupture). Envisager une redirection 301.")

# "Gris" listings (out of stock): short, distinct text pointing to the main listing facts they share.
for slug, btu, model, noise, twin in [("climatiseur-split-mural-smart-wifi-inverter-12000-btu-gris", 12000, "ACW12QINV410XK", 42, None),
                                      ("climatiseur-split-mural-smart-wifi-inverter-9000-btu-gris", 9000, "ACW09QINV410XK", 40, None),
                                      ("climatiseur-split-mural-smart-wifi-inverter-18000-btu-gris", 18000, "ACW18QINV410XK", 44, "climatiseur-split-mural-smart-wifi-inverter-18000-btu"),
                                      ("climatiseur-split-mural-smart-wifi-inverter-24000-btu-gris", 24000, "ACW24QINV410XK", None, "climatiseur-split-mural-smart-wifi-inverter-24000-btu")]:
    v = ["Fiche en rupture de stock."] + ([f"Doublon de « {twin} » (même référence) : redirection 301 recommandée."] if twin else [])
    split(slug, v, "Daiko Smart Wi-Fi gris foncé", "دايكو سمارت واي فاي رمادي", btu, model, True,
          f"Version à unité intérieure gris foncé du Daiko Smart Wi-Fi {btu_fr(btu)} BTU ({model}) : un climatiseur réversible pilotable depuis un smartphone, pour {ROOM[btu][0]}.",
          f"نسخة رمادية غامقة من دايكو سمارت واي فاي بقوة {btu} BTU ({model}): مكيف بارد وساخن يتحكم فيه من الهاتف.",
          [("Gris foncé", "La finition sombre se fond dans une décoration moderne, là où un bloc blanc se remarque."),
           ("Inverter et Wi-Fi", "Température stable, consommation maîtrisée (classe A selon la fiche) et pilotage à distance." + (f" Niveau sonore annoncé : {noise} dB." if noise else ""))],
          [("رمادي غامق", "لون داكن يناسب الديكور العصري."), ("إنفرتر وواي فاي", "حرارة مستقرة واستهلاك أقل وتحكم عن بعد.")],
          [f"Référence : {model}", f"Capacité : {btu_fr(btu)} BTU", "Réversible (froid et chaud)", "Wi-Fi", "Classe énergétique : A", "Unité intérieure gris foncé"],
          [f"المرجع: {model}", f"القوة: {btu} BTU", "بارد وساخن", "واي فاي"], 12,
          f"climatiseur Daiko gris {btu_fr(btu)} BTU, Daiko {model}, climatiseur gris foncé, clim WiFi réversible, prix climatiseur Daiko gris Maroc",
          f"كليماتيزور دايكو رمادي, مكيف {btu} BTU رمادي, مكيف واي فاي, كليم بارد وساخن, ثمن مكيف دايكو في المغرب")

# ── Daiko Smart Inverter LVI (chaud/froid) ──────────────────────────────────
for slug, btu, model, extra in [("split-mural-smart-inverter-9000-btu", 9000, "ACW09LVI410DK", ["Doublon : même référence ACW09LVI410DK que « climatiseur-split-mural-smart-inverter-9000-btu-refroidissement-et-chauffage » (3649 DH contre 3499 DH). Fusion + 301 recommandée."]),
                                ("climatiseur-split-mural-smart-inverter-9000-btu-refroidissement-et-chauffage", 9000, "ACW09LVI410DK", ["Doublon de « split-mural-smart-inverter-9000-btu » (même référence, prix différent)."]),
                                ("climatiseur-split-mural-smart-inverter-12000-btu-refroidissement-et-chauffage", 12000, None, ["Ancienne description : référence ACW09LVI410DK (modèle 9000) pour un 12 000 BTU. Référence non publiée."]),
                                ("climatiseur-split-mural-smart-inverter-18000-btu-refroidissement-et-chauffage", 18000, "ACW18LVI410DK", []),
                                ("climatiseur-split-mural-smart-inverter-24000-btu-refroidissement-et-chauffage", 24000, "ACW24LVI410DK", [])]:
    first = slug.startswith("split-mural")
    split(slug, extra + ["Puissances, bruit et dimensions non renseignés pour cette gamme."], "Daiko Smart Inverter", "دايكو سمارت إنفرتر", btu, model or "", True,
          (f"Le Daiko Smart Inverter de {btu_fr(btu)} BTU" + (f" ({model})" if model else "") + " est un climatiseur split réversible avec Wi-Fi intégré : il rafraîchit l'été et chauffe l'hiver, " + f"pour {ROOM[btu][0]}.") if not first else
          f"Climatiseur split Daiko {model} de 9 000 BTU, réversible et connecté : un format adapté aux chambres et bureaux, qui se pilote depuis un smartphone.",
          f"مكيف دايكو سمارت إنفرتر بقوة {btu} BTU، بارد وساخن مع واي فاي مدمج، مناسب ل{ROOM[btu][1]}.",
          [("Toute l'année", "Le mode chauffage prend le relais en hiver : un seul appareil pour les deux saisons."),
           ("Inverter et Wi-Fi", "Moins de bruit et une consommation mieux maîtrisée qu'un climatiseur classique, réglage à distance depuis l'application.")],
          [("طوال السنة", "وضع التسخين في الشتاء: جهاز واحد للفصلين."), ("إنفرتر وواي فاي", "صوت أقل واستهلاك أقل وتحكم عن بعد.")],
          [f"Capacité : {btu_fr(btu)} BTU", "Réversible (froid et chaud)", "Inverter", "Wi-Fi intégré"] + ([f"Référence : {model}"] if model else []),
          [f"القوة: {btu} BTU", "بارد وساخن", "إنفرتر", "واي فاي"], 12,
          f"climatiseur Daiko Smart Inverter {btu_fr(btu)} BTU, climatiseur réversible {btu_fr(btu)} BTU, clim chaud froid WiFi, climatiseur split Daiko, prix climatiseur Daiko Maroc",
          f"كليماتيزور دايكو {btu}, مكيف بارد وساخن, مكيف إنفرتر واي فاي, كليم سبليت, ثمن مكيف دايكو في المغرب",
          label="Climatiseur Daiko Smart Inverter" + (" réversible" if not first else ""), title_hint=("" if first else " chaud froid"))

# ── Portable ACs ────────────────────────────────────────────────────────────
for slug, btu, model in [("climatiseur-portable-smart-noir-4-en-1-12000-btu", 12000, "PACW12R290BK"), ("climatiseur-portable-smart-9000-btu-4-en-1-froid-chauffage", 9000, "PACW09R290BK")]:
    add(slug, ["Gaz réfrigérant, classe énergétique et dimensions non renseignés."], {
      "name": f"Climatiseur portable Daiko Smart 4 en 1 {btu_fr(btu)} BTU {model}", "nameAr": f"مكيف متنقل دايكو سمارت 4 في 1 بقوة {btu} BTU {model}",
      "shortDescription": f"Climatiseur portable Daiko de {btu_fr(btu)} BTU, 4 fonctions : froid, chauffage, ventilation et déshumidification, sans travaux d'installation.",
      "description": txt(f"Le Daiko {model} est un climatiseur portable 4 en 1 de {btu_fr(btu)} BTU, pour ceux qui ne peuvent pas installer de split : locataires, bureaux, ou une pièce de plus à équiper.",
        [("4 fonctions", "Refroidissement l'été, chauffage l'hiver, ventilation seule et déshumidification pour les pièces humides."),
         ("Sans travaux", "Il se déplace sur roulettes et se branche sur une prise. Comme tout climatiseur portable, il rejette l'air chaud par une gaine à faire passer par une fenêtre entrouverte ou une ouverture prévue."),
         ("Commandes", "Écran tactile, télécommande et minuterie programmable jusqu'à 24 heures.")],
        [f"Capacité : {btu_fr(btu)} BTU", "Fonctions : froid, chauffage, ventilation, déshumidification", "Minuterie : 24 h", "Écran tactile et télécommande", "Couleur : noir"], "Garantie : 12 mois."),
      "metaTitle": f"Climatiseur portable Daiko {btu} BTU – Prix Maroc",
      "metaDescription": f"Climatiseur portable Daiko {btu_fr(btu)} BTU 4 en 1 : froid, chauffage, ventilation et déshumidification. " + ST,
      "seo": {"titleAr": f"مكيف متنقل دايكو {btu} BTU بالمغرب",
              "metaDescriptionAr": f"مكيف متنقل دايكو {btu} BTU، 4 في 1: تبريد وتسخين وتهوية وإزالة الرطوبة، بدون أشغال. " + STA,
              "shortDescriptionAr": f"مكيف متنقل دايكو بقوة {btu} BTU بأربع وظائف: تبريد وتسخين وتهوية وإزالة الرطوبة، بدون تركيب.",
              "descriptionAr": txt(f"دايكو {model} مكيف متنقل 4 في 1 بقوة {btu} BTU لمن لا يستطيع تركيب سبليت: المكترون والمكاتب.",
                [("4 وظائف", "تبريد في الصيف، تسخين في الشتاء، تهوية وإزالة الرطوبة."), ("بدون أشغال", "يتحرك على عجلات ويشتغل بالمقبس، ويخرج الهواء الساخن عبر أنبوب من النافذة."), ("التحكم", "شاشة لمس وجهاز تحكم ومؤقت 24 ساعة.")],
                [f"القوة: {btu} BTU", "تبريد وتسخين وتهوية وإزالة الرطوبة", "مؤقت 24 ساعة", "اللون: أسود"], "الضمان: 12 شهرا.", ar=True),
              "keywords": f"climatiseur portable Daiko {btu_fr(btu)} BTU, Daiko {model}, climatiseur mobile sans installation, climatiseur portable chaud froid, prix climatiseur portable Maroc",
              "keywordsAr": f"مكيف متنقل, كليماتيزور متنقل, مكيف بلا تركيب, كليم بالرويضات, ثمن مكيف متنقل في المغرب"},
      "faq": [faq("Faut-il percer un mur ?", "Non. La gaine d'évacuation de l'air chaud passe par une fenêtre entrouverte ou une ouverture prévue à cet effet.", "واش خاص نثقب الحيط؟", "لا، التيو ديال الهوا السخون كيخرج من الشرجم."),
              faq("Chauffe-t-il en hiver ?", "Oui, le mode chauffage fait partie de ses 4 fonctions.", "واش كيسخن فالشتا؟", "إيه، التسخين من الوظائف الأربعة ديالو.")],
      "alt": f"Climatiseur portable Daiko {model} {btu_fr(btu)} BTU noir", "altAr": f"مكيف متنقل دايكو {model} بقوة {btu} BTU أسود"},
      specs=[S("Modèle", model), S("Type", "Climatiseur portable Smart"), S("Couleur", "Noir"), S("Capacité de refroidissement", f"{btu_fr(btu)} BTU"), S("Fonctions", "Refroidissement, chauffage, ventilation, déshumidification"), S("Minuterie", "24 h"), S("Commande", "Écran tactile et télécommande")])

# ── Air coolers ─────────────────────────────────────────────────────────────
def cooler(slug, model, tank, power, feats_fr, feats_ar, timer, ice, verify):
    add(slug, verify, {
      "name": f"Rafraîchisseur d'air Daiko {tank} L 3 en 1 {model}", "nameAr": f"مبرد هواء دايكو {tank} لترا 3 في 1 {model}",
      "shortDescription": f"Rafraîchisseur d'air Daiko {model} 3 en 1 (ventilation, rafraîchissement, humidification), réservoir de {tank} litres et télécommande, sans gaz réfrigérant.",
      "description": txt(f"Le Daiko {model} est un rafraîchisseur d'air par évaporation : l'air passe à travers des filtres humides et ressort plus frais. Il consomme bien moins qu'un climatiseur et ne demande aucune installation, avec un réservoir de {tank} litres.",
        [("À savoir", "Un rafraîchisseur abaisse la température ressentie de quelques degrés : il est le plus efficace dans un climat sec et une pièce aérée. Il ne remplace pas un climatiseur dans une pièce fermée et humide."),
         ("Fonctions", feats_fr)],
        [f"Réservoir : {tank} litres"] + ([f"Puissance : {power} W"] if power else []) + ["3 fonctions : ventilation, rafraîchissement, humidification", f"Minuterie : {timer} h", "Télécommande"] + ([f"Blocs de glace : {ice}"] if ice else []), "Garantie : 12 mois." if cur[slug]["w"] else ""),
      "metaTitle": f"Rafraîchisseur d'air Daiko {tank} L – Prix Maroc",
      "metaDescription": f"Rafraîchisseur d'air Daiko {model} {tank} L, 3 en 1 avec télécommande, sans gaz et sans installation. " + ST,
      "seo": {"titleAr": f"مبرد هواء دايكو {tank} لترا {model} بالمغرب",
              "metaDescriptionAr": f"مبرد هواء دايكو {model} بخزان {tank} لترا، 3 في 1 مع جهاز تحكم، بدون غاز وبدون تركيب. " + STA,
              "shortDescriptionAr": f"مبرد هواء دايكو {model} 3 في 1 (تهوية وتبريد وترطيب) بخزان {tank} لترا وجهاز تحكم، بدون غاز.",
              "descriptionAr": txt(f"دايكو {model} مبرد هواء بالتبخير: يمر الهواء عبر فلاتر مبللة فيخرج أبرد. يستهلك أقل بكثير من المكيف ولا يحتاج تركيبا، بخزان {tank} لترا.",
                [("للعلم", "المبرد يخفض الحرارة المحسوسة ببضع درجات، ويكون أفعل في الجو الجاف والغرفة المهواة."), ("الوظائف", feats_ar)],
                [f"الخزان: {tank} لترا", "تهوية وتبريد وترطيب", f"المؤقت: {timer} ساعة", "جهاز تحكم"], "الضمان: 12 شهرا." if cur[slug]["w"] else "", ar=True),
              "keywords": f"rafraîchisseur d'air Daiko {tank}L, Daiko {model}, air cooler 3 en 1, ventilateur rafraîchisseur avec télécommande, prix air cooler Maroc",
              "keywordsAr": f"مبرد هواء, كولر دايكو, مبرد هواء بالماء, فانتيلاتور بالما, ثمن مبرد الهواء في المغرب"},
      "faq": [faq("Est-ce un climatiseur ?", "Non : il rafraîchit par évaporation d'eau, sans gaz réfrigérant. Il abaisse la température ressentie de quelques degrés, surtout par temps sec.", "واش هادا كليماتيزور؟", "لا، كيبرد بتبخر الما بلا غاز، وكينقص الحرارة شي درجات خصوصا فالجو الناشف.")],
      "alt": f"Rafraîchisseur d'air Daiko {model} {tank} litres", "altAr": f"مبرد هواء دايكو {model} بخزان {tank} لترا"})

cooler("ventilateur-air-cooler-digital-avec-tlcommande-20l", "VACR-8352EK", 20, None,
       "3 modes (Normal, Eco, Nuit) et 3 vitesses, écran tactile LED, oscillation automatique, roulettes et filtres amovibles. Livré avec 4 blocs de glace réutilisables.",
       "3 أوضاع و3 سرعات، شاشة لمس، تأرجح أوتوماتيكي وعجلات، مع 4 قوالب ثلج.", 12, 4, ["Garantie non renseignée."])
cooler("ventilateur-air-cooler-3-en-1-avec-tlcommande-50l", "VACR9682EK", 50, None,
       "3 vitesses, minuterie jusqu'à 12 heures et télécommande. Son grand réservoir de 50 litres limite les remplissages.",
       "3 سرعات ومؤقت 12 ساعة وجهاز تحكم، وخزان كبير 50 لترا.", 12, None, ["Puissance, modes et accessoires non renseignés."])
cooler("ventilateur-air-cooler-3-en-1-avec-tlcommande", "VACR-7951EK", 15, 65,
       "Filtre en cellulose, oscillation gauche-droite et haut-bas, volets qui se ferment à l'arrêt contre la poussière, 3 modes (Normal, Eco, Nuit), écran tactile LED, roulettes et filtres lavables. Livré avec 2 blocs de glace.",
       "فلتر سيليلوز، تأرجح في الاتجاهين، 3 أوضاع، شاشة لمس، عجلات، مع قالبي ثلج.", 24, 2, [])
cooler("ventilateur-air-cooler-3-en-1-avec-tlcommande-40l", "VACR-9232EK", 40, 150,
       "Filtres en cellulose sur trois côtés pour une grande surface d'évaporation, 3 vitesses et 3 modes (Normal, Eco, Nuit), écran tactile LED, oscillation, roulettes. Livré avec 2 blocs de glace. Pensé pour les grandes pièces.",
       "فلاتر سيليلوز على ثلاث جهات، 3 سرعات و3 أوضاع، شاشة لمس، عجلات، مع قالبي ثلج. للغرف الكبيرة.", 12, 2, [])

# ── Fans ────────────────────────────────────────────────────────────────────
def fan(slug, name, nameAr, short, shortAr, intro, introAr, secs, secsAr, specs_fr, specs_ar, mt, md, tAr, mdAr, kw, kwAr, alt, altAr, verify, specs=None):
    w = cur[slug]["w"]
    add(slug, verify, {"name": name, "nameAr": nameAr, "shortDescription": short, "description": txt(intro, secs, specs_fr, W(w)),
        "metaTitle": mt, "metaDescription": md + " " + ST,
        "seo": {"titleAr": tAr, "metaDescriptionAr": mdAr + " " + STA, "shortDescriptionAr": shortAr, "descriptionAr": txt(introAr, secsAr, specs_ar, WA(w), ar=True), "keywords": kw, "keywordsAr": kwAr},
        "faq": [faq("Un ventilateur consomme-t-il beaucoup ?", "Non, bien moins qu'un climatiseur : c'est l'une des façons les plus économiques de se rafraîchir.", "واش الفانتيلاتور كيستهلك بزاف؟", "لا، أقل بزاف من الكليماتيزور.")],
        "alt": alt, "altAr": altAr}, specs)

fan("ventilateur-sur-pied-fs1602-general", "Ventilateur sur pied General FS1602 40 cm", "مروحة واقفة جنرال FS1602 قطر 40 سم",
    "Ventilateur sur pied General FS1602 de 40 cm : 3 vitesses, oscillation 90° et inclinaison réglable.", "مروحة واقفة جنرال FS1602 قطر 40 سم: 3 سرعات وتأرجح 90 درجة وميل قابل للتعديل.",
    "Le General FS1602 est un ventilateur sur pied simple et stable, avec des pales de 40 cm de diamètre : pour la maison, le bureau ou le commerce.",
    "جنرال FS1602 مروحة واقفة بسيطة وثابتة بقطر 40 سم للبيت والمكتب والمحل.",
    [("Réglages", "Trois vitesses, oscillation sur 90° et inclinaison verticale réglable pour diriger l'air.")], [("التعديلات", "3 سرعات وتأرجح 90 درجة وميل عمودي.")],
    ["Diamètre : 40 cm", "Vitesses : 3", "Oscillation : 90°", "Inclinaison réglable", "Dimensions : 43 × 16 × 43,5 cm"], ["القطر: 40 سم", "3 سرعات", "تأرجح 90 درجة"],
    "Ventilateur sur pied General FS1602 – Prix Maroc", "Ventilateur sur pied General FS1602 40 cm, 3 vitesses, oscillation 90° et inclinaison réglable.",
    "مروحة واقفة جنرال FS1602 بالمغرب", "مروحة واقفة جنرال FS1602 بقطر 40 سم، ثلاث سرعات وتأرجح 90 درجة وميل قابل للتعديل.",
    "ventilateur sur pied General, General FS1602, ventilateur 40 cm, ventilateur pas cher, prix ventilateur Maroc",
    "فانتيلاتور, مروحة واقفة, فانتيلاتور جنرال, مروحة 40 سم, ثمن الفانتيلاتور في المغرب",
    "Ventilateur sur pied General FS1602 40 cm", "مروحة واقفة جنرال FS1602 قطر 40 سم", ["Garantie non renseignée."])
fan("ventilateur-sur-pied-en-chrome-16", "Ventilateur sur pied Daiko chromé 16 pouces", "مروحة واقفة دايكو كروم 16 بوصة",
    "Ventilateur sur pied Daiko 16 pouces en finition chromée, 3 vitesses, oscillation 75° et base ronde stable.", "مروحة واقفة دايكو 16 بوصة بلون كروم، 3 سرعات وتأرجح 75 درجة وقاعدة دائرية.",
    "Ce ventilateur Daiko de 16 pouces se distingue par sa finition chromée, plus élégante dans un salon qu'un modèle en plastique.",
    "مروحة دايكو 16 بوصة بلون الكروم، أنيقة أكثر في الصالون.",
    [("Réglages", "Trois vitesses et oscillation sur 75° ; la base ronde le garde stable.")], [("التعديلات", "3 سرعات وتأرجح 75 درجة وقاعدة دائرية ثابتة.")],
    ["Taille : 16 pouces", "Vitesses : 3", "Oscillation : 75°", "Finition : chromée", "Base ronde"], ["المقاس: 16 بوصة", "3 سرعات", "كروم"],
    "Ventilateur sur pied Daiko chromé 16\" – Prix Maroc", "Ventilateur sur pied Daiko 16 pouces chromé, 3 vitesses, oscillation 75°, garantie 12 mois.",
    "مروحة واقفة دايكو كروم 16 بوصة بالمغرب", "مروحة واقفة دايكو 16 بوصة كروم، 3 سرعات وتأرجح 75 درجة، ضمان 12 شهرا.",
    "ventilateur Daiko 16 pouces, ventilateur sur pied chromé, ventilateur métal, ventilateur salon, prix ventilateur Daiko Maroc",
    "فانتيلاتور دايكو, مروحة كروم, مروحة واقفة, فانتيلاتور للصالون, ثمن الفانتيلاتور في المغرب",
    "Ventilateur sur pied Daiko 16 pouces chromé", "مروحة واقفة دايكو 16 بوصة كروم", [])
fan("general-ventilateur-mural-de-40-cm", "Ventilateur mural General 40 cm avec télécommande", "مروحة حائطية جنرال 40 سم بجهاز تحكم",
    "Ventilateur mural General de 40 cm avec télécommande : il libère le sol et se pilote à distance.", "مروحة حائطية جنرال 40 سم بجهاز تحكم: تترك الأرض فارغة وتتحكم فيها عن بعد.",
    "Fixé au mur, ce ventilateur General de 40 cm (16 pouces) ne prend aucune place au sol : un bon choix pour une cuisine, un commerce, un bureau ou une chambre d'enfant.",
    "مروحة جنرال حائطية 40 سم (16 بوصة) لا تأخذ مكانا على الأرض: للمطبخ والمحل والمكتب.",
    [("Télécommande", "Changez la vitesse ou arrêtez-le sans vous lever, même s'il est fixé en hauteur.")], [("جهاز التحكم", "غيروا السرعة أو أوقفوها بدون قيام.")],
    ["Diamètre : 40 cm (16\")", "Fixation murale", "Télécommande"], ["القطر: 40 سم", "حائطية", "جهاز تحكم"],
    "Ventilateur mural General 40 cm – Prix Maroc", "Ventilateur mural General 40 cm avec télécommande, idéal cuisine, commerce ou bureau.",
    "مروحة حائطية جنرال 40 سم بالمغرب", "مروحة حائطية جنرال بقطر 40 سم مع جهاز تحكم عن بعد، مناسبة للمطبخ والمحل والمكتب.",
    "ventilateur mural General, ventilateur mural 40 cm, ventilateur avec télécommande, ventilateur cuisine, prix ventilateur mural Maroc",
    "فانتيلاتور حائطي, مروحة الحائط, فانتيلاتور بالتيليكوموند, مروحة جنرال, ثمن مروحة حائطية في المغرب",
    "Ventilateur mural General 40 cm avec télécommande", "مروحة حائطية جنرال 40 سم", ["Nombre de vitesses et garantie non renseignés."])
fan("general-ventilateur-general-lectrique", "Ventilateur électrique General 40 W avec télécommande", "مروحة كهربائية جنرال 40 واط بجهاز تحكم",
    "Ventilateur électrique General blanc de 40 W avec télécommande et réglage électrique.", "مروحة كهربائية جنرال بيضاء 40 واط بجهاز تحكم.",
    "Ce ventilateur électrique General blanc consomme 40 W et se règle à la télécommande : une solution économique pour rafraîchir une pièce.",
    "مروحة جنرال كهربائية بيضاء بقوة 40 واط تتحكم فيها عن بعد: حل اقتصادي للتهوية.",
    [("Économe", "Avec 40 W, il consomme une fraction de ce que demande un climatiseur.")], [("اقتصادية", "40 واط فقط.")],
    ["Puissance : 40 W", "Télécommande : oui", "Réglage électrique : oui", "Matériau : plastique", "Couleur : blanc"], ["القوة: 40 واط", "جهاز تحكم", "أبيض"],
    "Ventilateur électrique General 40 W – Prix Maroc", "Ventilateur électrique General 40 W blanc avec télécommande, économique pour rafraîchir une pièce.",
    "مروحة كهربائية جنرال 40 واط بالمغرب", "مروحة كهربائية جنرال بيضاء بقوة 40 واط مع جهاز تحكم عن بعد، حل اقتصادي للتهوية.",
    "ventilateur électrique General, ventilateur 40W, ventilateur télécommande blanc, ventilateur économique, prix ventilateur General Maroc",
    "فانتيلاتور جنرال, مروحة كهربائية, فانتيلاتور بالتيليكوموند, مروحة بيضاء, ثمن الفانتيلاتور في المغرب",
    "Ventilateur électrique General 40 W blanc", "مروحة كهربائية جنرال 40 واط بيضاء", ["Type de ventilateur (pied, colonne, table) non renseigné."],
    specs=[S("Couleur", "Blanc"), S("Matériau", "Plastique"), S("Puissance", "40 W"), S("Télécommande", "Oui"), S("Réglage électrique", "Oui"), S("Sans fil", "Non")])
fan("ventilateur-5l-general", "Ventilateur General 5 L FS1666", "مروحة جنرال 5 لتر FS1666",
    "Ventilateur General FS1666 avec réservoir de 5 litres, pour les journées chaudes.", "مروحة جنرال FS1666 بخزان 5 لتر للأيام الحارة.",
    "Le ventilateur General FS1666 est équipé d'un réservoir de 5 litres. Contactez-nous pour connaître le détail de son fonctionnement avant de commander.",
    "مروحة جنرال FS1666 بخزان 5 لتر. اتصلوا بنا لمعرفة التفاصيل قبل الطلب.",
    [("Bon à savoir", "Notre équipe vous confirme ses caractéristiques (vitesses, brumisation, dimensions) par téléphone ou sur WhatsApp.")], [("للعلم", "فريقنا يؤكد لكم المواصفات بالهاتف أو واتساب.")],
    ["Référence : FS1666", "Réservoir : 5 litres"], ["المرجع: FS1666", "الخزان: 5 لتر"],
    "Ventilateur General 5 L FS1666 – Prix Maroc", "Ventilateur General FS1666 avec réservoir de 5 litres, caractéristiques confirmées par notre équipe.",
    "مروحة جنرال 5 لتر FS1666 بالمغرب", "مروحة جنرال FS1666 بخزان 5 لتر، ويؤكد لكم فريقنا المواصفات بالهاتف أو واتساب.",
    "ventilateur General FS1666, ventilateur 5 litres, ventilateur avec réservoir, ventilateur brumisateur, prix ventilateur General Maroc",
    "فانتيلاتور جنرال, مروحة بالما, فانتيلاتور 5 لتر, مروحة بخزان, ثمن الفانتيلاتور في المغرب",
    "Ventilateur General FS1666 avec réservoir 5 litres", "مروحة جنرال FS1666 بخزان 5 لتر",
    ["Fiche quasi vide : caractéristiques d'origine = catégories d'une autre boutique (retirées). « 5L » interprété comme réservoir : à confirmer (brumisateur ?)."],
    specs=[S("Référence", "FS1666"), S("Réservoir", "5 L")])

assert len(P) == 34, len(P)
for e in P: assert "None" not in json.dumps(e["changes"], ensure_ascii=False), e["slug"]
json.dump(P, open(os.path.join(HERE, "clim-34.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(P), "entries")
