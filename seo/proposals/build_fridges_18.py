# -*- coding: utf-8 -*-
# Batch "fridges-18": refrigerators and mini bars. Facts only from the store database
# (backups/seo/after-heating/fridges-current.json). Competitor mentions removed.
import json, os
HERE = os.path.dirname(__file__)
cur = {p["slug"]: p for p in json.load(open(os.path.join(HERE, "../../backups/seo/after-heating/fridges-current.json"), encoding="utf-8"))}
P = []
ST = "Livraison partout au Maroc, paiement à la livraison."
STA = "توصيل لكل المغرب والدفع عند الاستلام."

def S(label, value): return {"label": label, "value": value}
def faq(q, a, qa, aa): return {"question": q, "answer": a, "questionAr": qa, "answerAr": aa}

def add(slug, verify, c, alt, altAr, specs=None, specs_note=None):
    keys = cur[slug]["imgs"]
    c["imageAlts"] = [{"key": k, "alt": alt if i == 0 else f"{alt}, vue {i + 1}", "altAr": altAr if i == 0 else f"{altAr}، صورة {i + 1}"} for i, k in enumerate(keys)]
    e = {"kind": "product", "slug": slug, "source": "fridges-18", "sources": [], "verify": verify, "specsVerified": False, "changes": c}
    if specs:
        c["specs"] = specs
        e["specsVerified"] = True
        e["sources"] = [specs_note or "Valeurs de la fiche Mega Electro existante (libellés normalisés, aucune valeur ajoutée)"]
    P.append(e)

NOFROST = faq("Faut-il dégivrer ce réfrigérateur ?", "Non, le froid ventilé No Frost empêche la formation de givre.", "واش خاص نزول الثلج؟", "لا، تبريد No Frost كيمنع الثلج يتكون.")
STATIC = faq("Faut-il le dégivrer ?", "Oui, c'est un réfrigérateur à froid statique : un dégivrage de temps en temps garde le froid efficace, surtout dans le congélateur.", "واش خاص نزول الثلج؟", "إيه، هاد الثلاجة بتبريد عادي (ستاتيك)، خاص تزولو الثلج من وقت لوقت خصوصا فالمجمد.")
INSTALL = faq("Quand brancher le réfrigérateur après la livraison ?", "Laissez-le reposer debout quelques heures avant de le brancher, surtout s'il a été transporté couché, puis attendez qu'il refroidisse avant d'y ranger les aliments.", "إمتى نشعل الثلاجة من بعد التوصيل؟", "خليوها واقفة شي ساعات قبل ما تشعلوها، خصوصا إلا تنقلات ناعسة، ومن بعد تسناو حتى تبرد عاد حطو الماكلة.")

def fridge_text(intro, sections, specs_lines, tail=""):
    body = intro + "\n\n" + "\n\n".join(f"### {h}\n{t}" for h, t in sections)
    if specs_lines: body += "\n\n### Caractéristiques\n" + "\n".join(f"- {l}" for l in specs_lines)
    return body + ("\n\n" + tail if tail else "")

def fridge_text_ar(intro, sections, specs_lines, tail=""):
    body = intro + "\n\n" + "\n\n".join(f"### {h}\n{t}" for h, t in sections)
    if specs_lines: body += "\n\n### المواصفات\n" + "\n".join(f"- {l}" for l in specs_lines)
    return body + ("\n\n" + tail if tail else "")

# 1 Krohler 216 L
add("rfrigrateur-216l-krhler-gris-krg-255-g-g", ["Garantie non renseignée.", "Total annoncé 216 L pour 170 L + 45 L (215 L) : écart d'arrondi à vérifier."],
 {"name": "Réfrigérateur Kröhler 216 L gris KRG-255-G-G", "nameAr": "ثلاجة كروهلر 216 لترا رمادية KRG-255-G-G",
  "shortDescription": "Réfrigérateur deux portes Kröhler de 216 litres (170 L frais, 45 L congélateur), classe A+, commande mécanique et éclairage intérieur.",
  "description": fridge_text("Le Kröhler KRG-255-G-G est un réfrigérateur deux portes de 216 litres, un format adapté à un couple ou à une petite famille. Le compartiment frais de 170 litres accueille les courses de la semaine, et le congélateur de 45 litres garde une réserve de surgelés.",
   [("Simple et économe", "La commande mécanique se règle d'un geste, sans écran ni menu. La classe A+ limite la consommation d'un appareil qui fonctionne jour et nuit."),
    ("Bien pensé au quotidien", "L'éclairage intérieur aide à trouver ses produits, et la poignée encastrée garde une façade nette, en gris.")],
   ["Capacité totale : 216 litres", "Réfrigérateur : 170 litres", "Congélateur : 45 litres", "Classe énergétique : A+", "Commande mécanique", "Éclairage intérieur", "Couleur : gris"]),
  "metaTitle": "Réfrigérateur Kröhler 216 L KRG-255-G-G – Prix Maroc",
  "metaDescription": "Réfrigérateur Kröhler 216 L gris, 2 portes, classe A+, commande mécanique et éclairage intérieur. " + ST,
  "seo": {"titleAr": "ثلاجة كروهلر 216 لترا KRG-255-G-G بالمغرب",
   "metaDescriptionAr": "ثلاجة كروهلر 216 لترا رمادية ببابين، فئة A+، تحكم ميكانيكي وإضاءة داخلية. " + STA,
   "shortDescriptionAr": "ثلاجة كروهلر ببابين سعة 216 لترا (170 لترا للتبريد و45 للمجمد)، فئة A+ وتحكم ميكانيكي.",
   "descriptionAr": fridge_text_ar("كروهلر KRG-255-G-G ثلاجة ببابين بسعة 216 لترا، مناسبة لزوجين أو لعائلة صغيرة: 170 لترا للتبريد و45 لترا للمجمد.",
    [("بسيطة واقتصادية", "تحكم ميكانيكي سهل، وفئة A+ تقلل استهلاك جهاز يعمل ليلا ونهارا."), ("عملية", "إضاءة داخلية ومقبض مدمج بواجهة رمادية.")],
    ["السعة الإجمالية: 216 لترا", "التبريد: 170 لترا", "المجمد: 45 لترا", "فئة الطاقة: A+", "اللون: رمادي"]),
   "keywords": "réfrigérateur Kröhler 216L, KRG-255-G-G, réfrigérateur 2 portes gris, frigo 216 litres, prix réfrigérateur Kröhler Maroc",
   "keywordsAr": "ثلاجة كروهلر, فريكو 216 لتر, ثلاجة بابين رمادية, فريكو كروهلر, ثمن ثلاجة كروهلر في المغرب"},
  "faq": [INSTALL]},
 "Réfrigérateur Kröhler KRG-255-G-G 216 litres gris", "ثلاجة كروهلر KRG-255-G-G سعة 216 لترا رمادية")

# 2-4 Goldenstar
for slug, cap, fr, fz, dim, kwh, ref, extra in [
    ("rfrigrateur-goldenstar-380l-dp380", "380", "280", "100", "550 × 590 × 1700 mm", "256", "DP380-2638-GRIS", []),
    ("rfrigrateur-goldenstar-440l-dp440", "440", "308", "132", "600 × 630 × 1780 mm", "374", "DP440-3344", []),
    ("rfrigrateur-goldenstar-490l-dp490d", "490", "340", "150", "720 × 720 × 1820 mm", "360", "DP440-4449", ["Référence fournisseur « DP440-4449 » pour un produit nommé DP490D (490 L) : vérifier le modèle."])]:
    model = slug.split("-")[-1].upper()
    add(slug, ["Garantie : la fiche indique 1 an mais le champ garantie est vide.", "Consommation indiquée « %s Kwh » sans période : à confirmer (en général par an)." % kwh] + extra,
     {"name": f"Réfrigérateur Goldenstar {cap} L {model}", "nameAr": f"ثلاجة غولدن ستار {cap} لترا {model}",
      "shortDescription": f"Réfrigérateur deux portes Goldenstar de {cap} litres ({fr} L frais, {fz} L congélateur), classe A+, pour les familles qui stockent beaucoup.",
      "description": fridge_text(f"Le Goldenstar {model} offre {cap} litres au total : {fr} litres de réfrigérateur et {fz} litres de congélateur. C'est un format familial, pour ceux qui font de grosses courses ou reçoivent souvent.",
       [("Un grand congélateur", f"Avec {fz} litres, le congélateur garde une vraie réserve : viande achetée en quantité, pain, préparations faites à l'avance."),
        ("Avant de commander", f"L'appareil mesure {dim} (L × P × H). Mesurez l'emplacement et le passage des portes, et laissez quelques centimètres à l'arrière pour la ventilation.")],
       [f"Volume total : {cap} litres", f"Réfrigérateur : {fr} litres", f"Congélateur : {fz} litres", "Classe énergétique : A+", f"Consommation énergétique : {kwh} kWh", f"Dimensions : {dim}"]),
      "metaTitle": f"Réfrigérateur Goldenstar {cap} L {model} – Prix Maroc",
      "metaDescription": f"Réfrigérateur Goldenstar {model} {cap} L, {fr} L frais et {fz} L congélateur, classe A+. " + ST,
      "seo": {"titleAr": f"ثلاجة غولدن ستار {cap} لترا {model} بالمغرب",
       "metaDescriptionAr": f"ثلاجة غولدن ستار {model} بسعة {cap} لترا: {fr} لترا للتبريد و{fz} لترا للمجمد، فئة A+. " + STA,
       "shortDescriptionAr": f"ثلاجة غولدن ستار ببابين سعة {cap} لترا ({fr} للتبريد و{fz} للمجمد)، فئة A+، للعائلات التي تخزن كثيرا.",
       "descriptionAr": fridge_text_ar(f"غولدن ستار {model} بسعة {cap} لترا: {fr} لترا للتبريد و{fz} لترا للمجمد. حجم عائلي لمن يتسوق بكميات كبيرة أو يستقبل الضيوف كثيرا.",
        [("مجمد كبير", f"{fz} لترا للحم والخبز والأطباق المحضرة مسبقا."), ("قبل الطلب", f"الأبعاد {dim}. قيسوا المكان ومدخل الباب، واتركوا مسافة في الخلف للتهوية.")],
        [f"السعة: {cap} لترا", f"التبريد: {fr} لترا", f"المجمد: {fz} لترا", "فئة الطاقة: A+", f"الأبعاد: {dim}"]),
       "keywords": f"réfrigérateur Goldenstar {cap}L, Goldenstar {model}, réfrigérateur {cap} litres, grand réfrigérateur 2 portes, prix réfrigérateur Goldenstar Maroc",
       "keywordsAr": f"ثلاجة غولدن ستار, فريكو {cap} لتر, ثلاجة كبيرة بابين, فريكو غولدن ستار, ثمن ثلاجة غولدن ستار في المغرب"},
      "faq": [faq("Quelles sont ses dimensions ?", f"{dim} (largeur × profondeur × hauteur).", "شنو هي الأبعاد ديالها؟", f"{dim}."), INSTALL]},
     f"Réfrigérateur Goldenstar {model} {cap} litres deux portes", f"ثلاجة غولدن ستار {model} سعة {cap} لترا ببابين",
     specs=[S("Marque", "Goldenstar"), S("Référence fournisseur", ref), S("Volume total", f"{cap} L"), S("Volume réfrigérateur", f"{fr} L"), S("Volume congélateur", f"{fz} L"), S("Classe énergétique", "A+"), S("Consommation énergétique", f"{kwh} kWh"), S("Dimensions (L × P × H)", dim), S("Garantie", "1 an")])

# 5 Siera DP460 No Frost
add("siera-ref-dp-460-no-frost-460l-silverinox-siera", ["Ancienne description = tableau brut avec champs vides et « 135 KWh /24h » (valeur incohérente, non reprise).", "Garantie non renseignée ; autonomie du congélateur « 20 » sans unité (non reprise)."],
 {"name": "Réfrigérateur Siera No Frost 460 L silver DP460", "nameAr": "ثلاجة سييرا No Frost سعة 460 لترا فضية DP460",
  "shortDescription": "Grand réfrigérateur deux portes Siera de 460 litres, froid No Frost au réfrigérateur et au congélateur, éclairage LED et finition silver.",
  "description": fridge_text("Le Siera DP460 est un réfrigérateur deux portes de 460 litres, pour les familles nombreuses ou ceux qui stockent beaucoup. Il est No Frost dans les deux compartiments : ni givre au congélateur, ni corvée de dégivrage.",
   [("No Frost partout", "L'air froid est ventilé dans le réfrigérateur comme dans le congélateur, ce qui empêche la glace de se former et répartit le froid de façon plus homogène."),
    ("Classe climatique N-ST", "Cette classe indique un fonctionnement prévu pour des températures ambiantes allant jusqu'aux climats subtropicaux, un point utile pour les étés marocains.")],
   ["Volume total : 460 litres", "Froid No Frost (réfrigérateur et congélateur)", "Classe énergétique : A", "Classe climatique : N-ST", "Clayettes : 3 au réfrigérateur, 1 au congélateur", "Éclairage intérieur LED", "Pose libre, sans distributeur d'eau", "Finition : silver"]),
  "metaTitle": "Réfrigérateur Siera No Frost 460 L DP460 – Prix Maroc",
  "metaDescription": "Réfrigérateur Siera DP460 460 L, No Frost réfrigérateur et congélateur, éclairage LED, silver. " + ST,
  "seo": {"titleAr": "ثلاجة سييرا No Frost سعة 460 لترا بالمغرب",
   "metaDescriptionAr": "ثلاجة سييرا DP460 بسعة 460 لترا، تبريد No Frost في الثلاجة والمجمد، إضاءة LED، لون فضي. " + STA,
   "shortDescriptionAr": "ثلاجة سييرا كبيرة ببابين سعة 460 لترا، تبريد No Frost في الجزأين، إضاءة LED ولون فضي.",
   "descriptionAr": fridge_text_ar("سييرا DP460 ثلاجة ببابين بسعة 460 لترا للعائلات الكبيرة. تبريد No Frost في الثلاجة والمجمد: لا ثلج ولا حاجة لإزالته.",
    [("No Frost", "الهواء البارد يتوزع في الجزأين فلا يتكون الثلج."), ("فئة مناخية N-ST", "مصممة للعمل في درجات حرارة مرتفعة، وهذا مهم في صيف المغرب.")],
    ["السعة: 460 لترا", "تبريد No Frost", "فئة الطاقة: A", "الفئة المناخية: N-ST", "إضاءة LED", "اللون: فضي"]),
   "keywords": "réfrigérateur Siera 460L, Siera DP460 No Frost, réfrigérateur No Frost 460 litres, grand frigo silver, prix réfrigérateur Siera Maroc",
   "keywordsAr": "ثلاجة سييرا, فريكو 460 لتر, ثلاجة No Frost, فريكو كبير, ثمن ثلاجة سييرا في المغرب"},
  "faq": [NOFROST, INSTALL]},
 "Réfrigérateur Siera DP460 No Frost 460 litres silver", "ثلاجة سييرا DP460 No Frost سعة 460 لترا فضية",
 specs=[S("Marque", "Siera"), S("Référence", "DP460"), S("Volume total", "460 L"), S("Froid", "No Frost (réfrigérateur et congélateur)"), S("Classe énergétique", "A"), S("Classe climatique", "N-ST"), S("Clayettes réfrigérateur", "3"), S("Clayettes congélateur", "1"), S("Éclairage intérieur", "LED"), S("Distributeur d'eau", "Non"), S("Encastrable", "Non"), S("Finition", "Silver")],
 specs_note="Valeurs reprises de l'ancienne description de la fiche (champs vides et valeur incohérente écartés)")

# 6-7 Siera static
for slug, cap, model in [("siera-405l-silver-dp405", "405", "DP405"), ("siera-statique-450l-silver-dp450", "450", "DP450")]:
    add(slug, ["Garantie « 1 an » écrite dans l'ancienne description mais champ garantie vide.", "Répartition réfrigérateur/congélateur, classe énergétique et dimensions non renseignées."],
     {"name": f"Réfrigérateur Siera statique {cap} L silver {model}", "nameAr": f"ثلاجة سييرا بتبريد عادي سعة {cap} لترا فضية {model}",
      "shortDescription": f"Réfrigérateur deux portes Siera de {cap} litres à froid statique, finition silver ; aussi proposé en blanc.",
      "description": fridge_text(f"Le Siera {model} est un réfrigérateur deux portes de {cap} litres à froid statique, un grand volume pour une famille à un prix accessible.",
       [("Froid statique : ce qu'il faut savoir", "Le froid est produit par contact avec la paroi du fond, sans ventilateur. C'est une technologie simple et robuste ; en contrepartie, le congélateur doit être dégivré de temps en temps."),
        ("Couleurs", "Il est présenté ici en silver et existe aussi en blanc : précisez votre choix à notre équipe lors de la confirmation.")],
       [f"Volume : {cap} litres", "Deux portes", "Froid statique", "Finition : silver (existe en blanc)"], "Garantie : 1 an."),
      "metaTitle": f"Réfrigérateur Siera {cap} L {model} – Prix Maroc",
      "metaDescription": f"Réfrigérateur Siera {model} {cap} litres, deux portes, froid statique, silver ou blanc, garantie 1 an. " + ST,
      "seo": {"titleAr": f"ثلاجة سييرا {cap} لترا {model} بالمغرب",
       "metaDescriptionAr": f"ثلاجة سييرا {model} بسعة {cap} لترا ببابين وتبريد عادي، لون فضي أو أبيض، ضمان سنة. " + STA,
       "shortDescriptionAr": f"ثلاجة سييرا ببابين سعة {cap} لترا بتبريد عادي (ستاتيك)، لون فضي ومتوفرة بالأبيض.",
       "descriptionAr": fridge_text_ar(f"سييرا {model} ثلاجة ببابين بسعة {cap} لترا وتبريد عادي، حجم كبير للعائلة بثمن مناسب.",
        [("التبريد العادي", "البرودة تأتي من الجدار الخلفي بدون مروحة. تقنية بسيطة، لكن يجب إزالة الثلج من المجمد من وقت لآخر."), ("الألوان", "فضي، ومتوفرة أيضا بالأبيض: أخبروا فريقنا عند تأكيد الطلب.")],
        [f"السعة: {cap} لترا", "بابان", "تبريد عادي", "اللون: فضي أو أبيض"], "الضمان: سنة."),
       "keywords": f"réfrigérateur Siera {cap}L, Siera {model}, réfrigérateur statique {cap} litres, frigo 2 portes silver, prix réfrigérateur Siera Maroc",
       "keywordsAr": f"ثلاجة سييرا {cap} لتر, فريكو سييرا, ثلاجة بابين, فريكو ستاتيك, ثمن ثلاجة سييرا في المغرب"},
      "faq": [STATIC, faq("Existe-t-il en blanc ?", "Oui, ce modèle existe aussi en blanc : indiquez-le lors de la confirmation de commande.", "واش كاينة بالأبيض؟", "إيه، كاينة حتى بالأبيض، قولوها لينا منين نأكدو الطلب.")]},
     f"Réfrigérateur Siera {model} {cap} litres silver", f"ثلاجة سييرا {model} سعة {cap} لترا فضية")

# 8 Daiko 168 L
add("rfrigrateur-168-l-double-portes-dark-silver", [],
 {"name": "Réfrigérateur Daiko 168 L double porte dark silver FTD-2925K", "nameAr": "ثلاجة دايكو 168 لترا ببابين لون فضي غامق FTD-2925K",
  "shortDescription": "Réfrigérateur Daiko FTD-2925K de 168 litres (128 L + 40 L), portes réversibles, éclairage LED et 41 dB : compact pour un studio ou une petite cuisine.",
  "description": fridge_text("Le Daiko FTD-2925K loge 168 litres dans un format élancé : 128 litres de réfrigérateur et un congélateur supérieur de 40 litres. Il convient à un studio, un appartement pour une ou deux personnes, ou en appoint.",
   [("Facile à placer", "Les portes sont réversibles : elles peuvent s'ouvrir à gauche ou à droite selon la configuration de votre cuisine."),
    ("Intérieur", "Étagères en verre, éclairage LED et un bac à légumes de bonne taille. Le thermostat règle la température."),
    ("Discret", "Avec 41 dB, il peut se trouver près d'un séjour sans gêner. Il utilise le gaz réfrigérant R600a.")],
   ["Volume net : 168 litres", "Réfrigérateur : 128 litres", "Congélateur : 40 litres", "Portes réversibles", "Éclairage LED", "Niveau sonore : 41 dB", "Gaz réfrigérant : R600a", "Couleur : dark silver"], "Garantie : 12 mois."),
  "metaTitle": "Réfrigérateur Daiko 168 L FTD-2925K – Prix Maroc",
  "metaDescription": "Réfrigérateur Daiko FTD-2925K 168 L, 2 portes réversibles, éclairage LED, 41 dB, dark silver. " + ST,
  "seo": {"titleAr": "ثلاجة دايكو 168 لترا FTD-2925K بالمغرب",
   "metaDescriptionAr": "ثلاجة دايكو FTD-2925K بسعة 168 لترا، أبواب قابلة للعكس، إضاءة LED وصوت 41 ديسيبل. " + STA,
   "shortDescriptionAr": "ثلاجة دايكو FTD-2925K بسعة 168 لترا (128 + 40)، أبواب قابلة للعكس وإضاءة LED: مناسبة للستوديو والمطبخ الصغير.",
   "descriptionAr": fridge_text_ar("دايكو FTD-2925K بسعة 168 لترا في حجم نحيف: 128 لترا للتبريد و40 لترا للمجمد في الأعلى. مناسبة لستوديو أو لشخص أو شخصين.",
    [("سهلة التركيب", "الأبواب قابلة للعكس يمينا أو يسارا."), ("الداخل", "رفوف زجاجية وإضاءة LED ودرج للخضر، وترموستات للتعديل."), ("هادئة", "41 ديسيبل، بغاز R600a.")],
    ["السعة: 168 لترا", "التبريد: 128 لترا", "المجمد: 40 لترا", "صوت: 41 ديسيبل", "اللون: فضي غامق"], "الضمان: 12 شهرا."),
   "keywords": "réfrigérateur Daiko 168L, Daiko FTD-2925K, petit réfrigérateur 2 portes, réfrigérateur studio, prix réfrigérateur Daiko Maroc",
   "keywordsAr": "ثلاجة دايكو, فريكو صغير, ثلاجة 168 لتر, فريكو بابين صغير, ثمن ثلاجة دايكو في المغرب"},
  "faq": [faq("Peut-on inverser le sens d'ouverture des portes ?", "Oui, les portes sont réversibles.", "واش نقدر نبدل جهة حلان الباب؟", "إيه، الأبواب كيتقلبو."), INSTALL]},
 "Réfrigérateur Daiko FTD-2925K 168 litres dark silver", "ثلاجة دايكو FTD-2925K سعة 168 لترا لون فضي غامق",
 specs=[S("Marque", "Daiko"), S("Référence", "FTD-2925K"), S("Volume net", "168 L"), S("Réfrigérateur", "128 L"), S("Congélateur", "40 L"), S("Portes", "Réversibles"), S("Éclairage", "LED"), S("Niveau sonore", "41 dB"), S("Gaz réfrigérant", "R600a"), S("Couleur", "Dark silver")],
 specs_note="Valeurs reprises de l'ancienne description de la fiche")

# 9 Daiko 310 L
add("rfrigrateur-310-l-double-portes-silver", ["Volume indiqué « brut » (310 L) : volume net non renseigné."],
 {"name": "Réfrigérateur Daiko 310 L double porte silver FTD-4146K", "nameAr": "ثلاجة دايكو 310 لترات ببابين فضية FTD-4146K",
  "shortDescription": "Réfrigérateur Daiko FTD-4146K de 310 litres bruts, classe A+, congélateur 4 étoiles (8,6 kg/24 h) et portes réversibles.",
  "description": fridge_text("Le Daiko FTD-4146K est un réfrigérateur deux portes de 310 litres bruts, adapté à une famille. Sa finition silver se marie avec les cuisines modernes.",
   [("Un congélateur 4 étoiles", "Le congélateur est classé 4 étoiles, avec un pouvoir de congélation de 8,6 kg par 24 heures : il peut congeler des produits frais, pas seulement conserver des surgelés."),
    ("Économe et adaptable", "Classé A+, il dispose de portes réversibles pour s'adapter à l'emplacement de votre cuisine.")],
   ["Volume brut : 310 litres", "Classe énergétique : A+", "Congélateur 4 étoiles", "Pouvoir de congélation : 8,6 kg/24 h", "Portes réversibles", "Finition : silver"], "Garantie : 12 mois."),
  "metaTitle": "Réfrigérateur Daiko 310 L FTD-4146K – Prix Maroc",
  "metaDescription": "Réfrigérateur Daiko FTD-4146K 310 L, classe A+, congélateur 4 étoiles et portes réversibles. " + ST,
  "seo": {"titleAr": "ثلاجة دايكو 310 لترات FTD-4146K بالمغرب",
   "metaDescriptionAr": "ثلاجة دايكو FTD-4146K بسعة 310 لترات، فئة A+، مجمد 4 نجوم وأبواب قابلة للعكس. " + STA,
   "shortDescriptionAr": "ثلاجة دايكو FTD-4146K بسعة 310 لترات، فئة A+، مجمد 4 نجوم (8.6 كلغ في 24 ساعة) وأبواب قابلة للعكس.",
   "descriptionAr": fridge_text_ar("دايكو FTD-4146K ثلاجة ببابين بسعة 310 لترات، مناسبة للعائلة، بلون فضي.",
    [("مجمد 4 نجوم", "قدرة تجميد 8.6 كلغ في 24 ساعة: يجمد المواد الطازجة وليس فقط يحفظ المجمدات."), ("اقتصادية", "فئة A+ وأبواب قابلة للعكس.")],
    ["السعة: 310 لترات", "فئة الطاقة: A+", "مجمد 4 نجوم", "اللون: فضي"], "الضمان: 12 شهرا."),
   "keywords": "réfrigérateur Daiko 310L, Daiko FTD-4146K, réfrigérateur 2 portes A+, congélateur 4 étoiles, prix réfrigérateur Daiko Maroc",
   "keywordsAr": "ثلاجة دايكو 310 لتر, فريكو دايكو, ثلاجة بابين, فريكو اقتصادي, ثمن ثلاجة دايكو في المغرب"},
  "faq": [faq("Que signifie congélateur 4 étoiles ?", "Il peut congeler des aliments frais (ici 8,6 kg par 24 h), et pas seulement conserver des produits déjà surgelés.", "شنو معنى مجمد 4 نجوم؟", "كيقدر يجمد الماكلة الطرية (8.6 كلغ ف24 ساعة) ماشي غير يحفظ المجمدات."), INSTALL]},
 "Réfrigérateur Daiko FTD-4146K 310 litres silver", "ثلاجة دايكو FTD-4146K سعة 310 لترات فضية",
 specs=[S("Marque", "Daiko"), S("Référence", "FTD-4146K"), S("Volume brut", "310 L"), S("Classe énergétique", "A+"), S("Congélateur", "4 étoiles"), S("Pouvoir de congélation", "8,6 kg/24 h"), S("Portes", "Réversibles"), S("Couleur", "Silver")],
 specs_note="Valeurs reprises de l'ancienne description de la fiche")

# 10 LG GR-B302PQCF
add("refregirateur-lg-2-portes-statique-275l-net-inox", ["Couleur : « inox » dans le nom, « silver » dans les caractéristiques. Le texte dit « finition métallisée »."],
 {"name": "Réfrigérateur LG 2 portes statique 275 L net GR-B302PQCF", "nameAr": "ثلاجة LG ببابين تبريد عادي 275 لترا صافية GR-B302PQCF",
  "shortDescription": "Réfrigérateur deux portes LG GR-B302PQCF de 275 litres nets, à froid statique, classe A.",
  "description": fridge_text("Le LG GR-B302PQCF est un réfrigérateur deux portes de 275 litres nets, une capacité adaptée à un foyer de trois ou quatre personnes. Le volume « net » est celui réellement utilisable pour ranger vos aliments.",
   [("Froid statique", "Sans ventilateur, le froid est simple et fiable. Pensez à dégivrer le congélateur de temps en temps pour garder son efficacité."),
    ("La marque LG", "LG est l'un des fabricants d'électroménager les plus répandus au Maroc, ce qui facilite l'accès aux pièces et au service.")],
   ["Référence : GR-B302PQCF", "Type : réfrigérateur 2 portes", "Volume net : 275 litres", "Froid statique", "Classe énergétique : A"], "Garantie : 12 mois."),
  "metaTitle": "Réfrigérateur LG 275 L GR-B302PQCF – Prix Maroc",
  "metaDescription": "Réfrigérateur LG GR-B302PQCF deux portes, 275 litres nets, froid statique, classe A, garantie 12 mois. " + ST,
  "seo": {"titleAr": "ثلاجة LG بسعة 275 لترا GR-B302PQCF بالمغرب",
   "metaDescriptionAr": "ثلاجة LG GR-B302PQCF ببابين، 275 لترا صافية، تبريد عادي، فئة A، ضمان 12 شهرا. " + STA,
   "shortDescriptionAr": "ثلاجة LG GR-B302PQCF ببابين بسعة 275 لترا صافية وتبريد عادي، فئة A.",
   "descriptionAr": fridge_text_ar("LG GR-B302PQCF ثلاجة ببابين بسعة 275 لترا صافية، مناسبة لعائلة من ثلاثة أو أربعة أفراد.",
    [("تبريد عادي", "بدون مروحة، بسيط وموثوق. أزيلوا الثلج من المجمد من وقت لآخر.")],
    ["المرجع: GR-B302PQCF", "بابان", "السعة الصافية: 275 لترا", "فئة الطاقة: A"], "الضمان: 12 شهرا."),
   "keywords": "réfrigérateur LG 275L, LG GR-B302PQCF, réfrigérateur LG 2 portes, frigo LG statique, prix réfrigérateur LG Maroc",
   "keywordsAr": "ثلاجة LG, فريكو LG, ثلاجة بابين 275 لتر, ثلاجة إل جي, ثمن ثلاجة LG في المغرب"},
  "faq": [STATIC, INSTALL]},
 "Réfrigérateur LG GR-B302PQCF deux portes 275 litres", "ثلاجة LG GR-B302PQCF ببابين سعة 275 لترا",
 specs=[S("Référence", "GR-B302PQCF"), S("Type", "Réfrigérateur 2 portes"), S("Volume net", "275 L"), S("Froid", "Statique"), S("Classe énergétique", "A")])

# 11 Sharp SJ-48C
add("rfrigrateur-deux-portes-sj-48c", [],
 {"name": "Réfrigérateur Sharp No Frost 340 L net SJ-48C", "nameAr": "ثلاجة شارب No Frost سعة 340 لترا صافية SJ-48C",
  "shortDescription": "Réfrigérateur deux portes Sharp SJ-48C-SL : 340 L nets (425 L bruts), No Frost, filtre désodorisant Ag+ Nano, 161 × 64 cm.",
  "description": fridge_text("Le Sharp SJ-48C-SL est un grand réfrigérateur deux portes : 340 litres nets pour 425 litres bruts, de quoi ranger les courses d'une famille nombreuse.",
   [("No Frost", "Le froid ventilé évite la formation de givre ; le congélateur reste propre et efficace sans dégivrage."),
    ("Moins d'odeurs", "Un filtre désodorisant Ag+ Nano limite les odeurs, et le refroidissement hybride aide à conserver les aliments frais plus longtemps."),
    ("Encombrement", "Il mesure 161 cm de haut pour 64 cm de large : un bon compromis entre capacité et place au sol.")],
   ["Référence : SJ-48C-SL", "Volume brut : 425 litres", "Volume net : 340 litres", "Froid No Frost", "Filtre désodorisant Ag+ Nano", "Hauteur : 161 cm", "Largeur : 64 cm", "Finition : argentée"], "Garantie : 12 mois."),
  "metaTitle": "Réfrigérateur Sharp No Frost 340 L SJ-48C – Prix Maroc",
  "metaDescription": "Réfrigérateur Sharp SJ-48C-SL, 340 L nets, No Frost et filtre Ag+ Nano, 161 × 64 cm, garantie 12 mois. " + ST,
  "seo": {"titleAr": "ثلاجة شارب No Frost سعة 340 لترا SJ-48C بالمغرب",
   "metaDescriptionAr": "ثلاجة شارب SJ-48C-SL بسعة 340 لترا صافية، No Frost وفلتر Ag+ Nano، 161 × 64 سم. " + STA,
   "shortDescriptionAr": "ثلاجة شارب SJ-48C-SL ببابين: 340 لترا صافية (425 إجمالية)، No Frost وفلتر Ag+ Nano ضد الروائح.",
   "descriptionAr": fridge_text_ar("شارب SJ-48C-SL ثلاجة كبيرة ببابين: 340 لترا صافية من أصل 425، مناسبة لعائلة كبيرة.",
    [("No Frost", "لا ثلج ولا حاجة لإزالته."), ("روائح أقل", "فلتر Ag+ Nano يقلل الروائح، والتبريد الهجين يحافظ على الطعام مدة أطول."), ("الحجم", "161 سم ارتفاعا و64 سم عرضا.")],
    ["السعة الصافية: 340 لترا", "No Frost", "فلتر Ag+ Nano", "الارتفاع: 161 سم", "العرض: 64 سم"], "الضمان: 12 شهرا."),
   "keywords": "réfrigérateur Sharp SJ-48C, réfrigérateur Sharp No Frost, réfrigérateur 340 litres, frigo Sharp 2 portes, prix réfrigérateur Sharp Maroc",
   "keywordsAr": "ثلاجة شارب, فريكو شارب, ثلاجة No Frost كبيرة, فريكو 340 لتر, ثمن ثلاجة شارب في المغرب"},
  "faq": [faq("Quelle est la différence entre volume brut et net ?", "Le volume brut (425 L) mesure tout l'intérieur ; le volume net (340 L) est l'espace réellement utilisable, hors parois et équipements.", "شنو الفرق بين السعة الإجمالية والصافية؟", "الإجمالية (425 لتر) هي الداخل كامل، والصافية (340 لتر) هي البلاصة اللي كتستعملو بصح."), NOFROST]},
 "Réfrigérateur Sharp SJ-48C-SL No Frost 340 litres argenté", "ثلاجة شارب SJ-48C-SL No Frost سعة 340 لترا فضية",
 specs=[S("Marque", "Sharp"), S("Référence", "SJ-48C-SL"), S("Volume brut", "425 L"), S("Volume net", "340 L"), S("Froid", "No Frost"), S("Filtre", "Désodorisant Ag+ Nano"), S("Hauteur", "161 cm"), S("Largeur", "64 cm"), S("Finition", "Argentée")],
 specs_note="Valeurs reprises de l'ancienne description de la fiche")

# 12 LG combiné 333 L
add("rfrigrateurs-combin-i-333-l-door-cooling", ["Référence LG exacte absente (nécessaire pour publier volume réfrigérateur/congélateur, classe et dimensions).", "Garantie non renseignée."],
 {"name": "Réfrigérateur combiné LG 333 L Door Cooling", "nameAr": "ثلاجة كومبي LG سعة 333 لترا Door Cooling",
  "shortDescription": "Réfrigérateur combiné LG de 333 litres avec Door Cooling, Linear Cooling, bac Moist Balance Crisper et 35 dB.",
  "description": fridge_text("Ce réfrigérateur combiné LG de 333 litres place le congélateur en bas et le réfrigérateur en haut, à hauteur des yeux. Il réunit plusieurs technologies LG pensées pour garder un froid stable.",
   [("Door Cooling", "Une sortie d'air froid à l'avant refroidit plus vite les aliments rangés dans la porte, souvent la zone la plus tiède d'un réfrigérateur."),
    ("Linear Cooling et Multi-Air Flow", "Le froid est maintenu de façon plus régulière et distribué par plusieurs sorties d'air dans tout le compartiment."),
    ("Fruits et légumes", "Le bac Moist Balance Crisper garde l'humidité adaptée aux légumes, et FRESHConverter permet d'adapter un tiroir au type d'aliments.")],
   ["Volume : 333 litres", "Combiné (congélateur en bas)", "Door Cooling, Linear Cooling", "Multi-Air Flow", "Moist Balance Crisper, FRESHConverter", "Niveau sonore : 35 dB"]),
  "metaTitle": "Réfrigérateur combiné LG 333 L – Prix Maroc",
  "metaDescription": "Réfrigérateur combiné LG 333 L avec Door Cooling, Linear Cooling et Moist Balance Crisper, 35 dB. " + ST,
  "seo": {"titleAr": "ثلاجة كومبي LG سعة 333 لترا Door Cooling بالمغرب",
   "metaDescriptionAr": "ثلاجة كومبي LG بسعة 333 لترا مع Door Cooling وLinear Cooling ودرج للخضر، 35 ديسيبل. " + STA,
   "shortDescriptionAr": "ثلاجة كومبي LG بسعة 333 لترا مع تقنية Door Cooling وLinear Cooling ودرج Moist Balance للخضر، 35 ديسيبل.",
   "descriptionAr": fridge_text_ar("ثلاجة LG كومبي بسعة 333 لترا: المجمد في الأسفل والثلاجة في الأعلى في مستوى النظر.",
    [("Door Cooling", "منفذ هواء بارد في الأمام يبرد بسرعة ما يوجد في الباب."), ("تبريد منتظم", "Linear Cooling وMulti-Air Flow لتبريد مستقر وموزع."), ("الخضر والفواكه", "درج Moist Balance يحافظ على الرطوبة المناسبة.")],
    ["السعة: 333 لترا", "كومبي (المجمد في الأسفل)", "صوت: 35 ديسيبل"]),
   "keywords": "réfrigérateur combiné LG 333L, LG Door Cooling, réfrigérateur congélateur bas LG, frigo LG Linear Cooling, prix réfrigérateur combiné LG Maroc",
   "keywordsAr": "ثلاجة كومبي LG, فريكو LG, ثلاجة المجمد تحت, ثلاجة 333 لتر, ثمن ثلاجة LG كومبي في المغرب"},
  "faq": [faq("Qu'est-ce que le Door Cooling ?", "Une sortie d'air froid à l'avant du réfrigérateur qui refroidit plus rapidement les produits rangés dans la porte.", "شنو هو Door Cooling؟", "منفذ ديال الهوا البارد فالقدام كيبرد بالزربة الحوايج اللي فالباب."), INSTALL]},
 "Réfrigérateur combiné LG 333 litres Door Cooling", "ثلاجة كومبي LG سعة 333 لترا Door Cooling")

# 13 Alaska ALKRFG-26
add("rfrigrateur-alaska-alkrfg-26-260l-inox-grande-capacit", ["Ancienne description : « Commandez … chez Electro Darna » (retiré).", "Répartition des volumes et classe énergétique non renseignées."],
 {"name": "Réfrigérateur Alaska 260 L inox ALKRFG-26", "nameAr": "ثلاجة ألاسكا 260 لترا إينوكس ALKRFG-26",
  "shortDescription": "Réfrigérateur Alaska ALKRFG-26 de 260 litres en finition inox, pour une famille qui veut de la place sans un appareil encombrant.",
  "description": fridge_text("L'Alaska ALKRFG-26 offre 260 litres de stockage dans une finition inox, un volume de milieu de gamme qui convient à la plupart des familles de trois à quatre personnes.",
   [("Bien organiser 260 litres", "Rangez les produits laitiers et les restes en haut, la viande et le poisson sur l'étagère la plus froide en bas, et les boissons dans la porte."),
    ("Finition inox", "L'inox s'accorde avec les autres appareils de la cuisine ; un chiffon microfibre légèrement humide suffit pour effacer les traces de doigts.")],
   ["Référence : ALKRFG-26", "Capacité : 260 litres", "Finition : inox"], "Garantie : 12 mois."),
  "metaTitle": "Réfrigérateur Alaska 260 L inox ALKRFG-26 – Prix Maroc",
  "metaDescription": "Réfrigérateur Alaska ALKRFG-26 260 litres, finition inox, garantie 12 mois. " + ST,
  "seo": {"titleAr": "ثلاجة ألاسكا 260 لترا إينوكس ALKRFG-26 بالمغرب",
   "metaDescriptionAr": "ثلاجة ألاسكا ALKRFG-26 بسعة 260 لترا بلون إينوكس، ضمان 12 شهرا. " + STA,
   "shortDescriptionAr": "ثلاجة ألاسكا ALKRFG-26 بسعة 260 لترا ولون إينوكس، لعائلة تحتاج مساحة دون جهاز ضخم.",
   "descriptionAr": fridge_text_ar("ألاسكا ALKRFG-26 بسعة 260 لترا ولون إينوكس، حجم مناسب لأغلب العائلات من ثلاثة إلى أربعة أفراد.",
    [("ترتيب 260 لترا", "مشتقات الحليب في الأعلى، اللحم والسمك في الرف الأبرد في الأسفل، والمشروبات في الباب."), ("إينوكس", "يتناسب مع أجهزة المطبخ، وينظف بقطعة قماش مبللة قليلا.")],
    ["المرجع: ALKRFG-26", "السعة: 260 لترا", "اللون: إينوكس"], "الضمان: 12 شهرا."),
   "keywords": "réfrigérateur Alaska 260L, Alaska ALKRFG-26, réfrigérateur inox 260 litres, frigo Alaska, prix réfrigérateur Alaska Maroc",
   "keywordsAr": "ثلاجة ألاسكا, فريكو ألاسكا 260 لتر, ثلاجة إينوكس, فريكو عائلي, ثمن ثلاجة ألاسكا في المغرب"},
  "faq": [INSTALL]},
 "Réfrigérateur Alaska ALKRFG-26 260 litres inox", "ثلاجة ألاسكا ALKRFG-26 سعة 260 لترا إينوكس",
 specs=[S("Marque", "Alaska"), S("Modèle", "ALKRFG-26"), S("Capacité", "260 litres"), S("Finition", "Inox")])

# 14 Nexon mini bar
add("rfrigrateur-mini-bar-nexon-45-litres-silver-nfr-605-ms", ["Ancienne description : « Commandez … chez Electro Darna » (retiré)."],
 {"name": "Mini bar Nexon 45 L silver NFR-605-M(S)", "nameAr": "ثلاجة صغيرة ميني بار نيكسون 45 لترا فضية NFR-605-M(S)",
  "shortDescription": "Mini réfrigérateur Nexon de 45 litres avec serrure à clé, commande mécanique, 106 kWh/an et 40 dB, pour une chambre, un bureau ou un studio.",
  "description": fridge_text("Le Nexon NFR-605-M(S) est un mini bar de 45 litres qui se glisse dans une chambre, un bureau, une chambre d'étudiant ou un cabinet professionnel. Il garde au frais boissons, fruits et petits produits à portée de main.",
   [("Une serrure à clé", "Pratique au bureau, en location ou dans une chambre d'hôte : le contenu reste fermé."),
    ("Discret et économe", "Avec 40 dB et une consommation annoncée de 106 kWh par an, il peut rester branché dans une pièce de vie."),
    ("Entretien", "Le dégivrage est manuel : débranchez-le de temps en temps et laissez fondre la glace sur un torchon.")],
   ["Capacité : 45 litres", "Commande mécanique", "Serrure avec clé", "Dégivrage manuel", "Consommation : 106 kWh/an", "Niveau sonore : 40 dB", "Finition : silver"], "Garantie : 12 mois."),
  "metaTitle": "Mini bar Nexon 45 L NFR-605-M(S) – Prix Maroc",
  "metaDescription": "Mini réfrigérateur Nexon 45 L avec serrure, 106 kWh/an et 40 dB, pour chambre ou bureau. " + ST,
  "seo": {"titleAr": "ميني بار نيكسون 45 لترا NFR-605 بالمغرب",
   "metaDescriptionAr": "ثلاجة صغيرة نيكسون 45 لترا بقفل، استهلاك 106 كيلوواط ساعة سنويا وصوت 40 ديسيبل. " + STA,
   "shortDescriptionAr": "ثلاجة صغيرة نيكسون 45 لترا بقفل ومفتاح، تحكم ميكانيكي وصوت 40 ديسيبل، لغرفة النوم أو المكتب.",
   "descriptionAr": fridge_text_ar("نيكسون NFR-605-M(S) ميني بار بسعة 45 لترا للغرفة أو المكتب أو غرفة الطالب، للمشروبات والفواكه.",
    [("قفل بمفتاح", "مفيد في المكتب أو الكراء."), ("هادئة واقتصادية", "40 ديسيبل واستهلاك 106 كيلوواط ساعة في السنة."), ("العناية", "إزالة الثلج يدويا من وقت لآخر.")],
    ["السعة: 45 لترا", "قفل بمفتاح", "الاستهلاك: 106 كيلوواط ساعة في السنة", "الصوت: 40 ديسيبل", "اللون: فضي"], "الضمان: 12 شهرا."),
   "keywords": "mini bar Nexon 45L, Nexon NFR-605, mini réfrigérateur avec serrure, frigo chambre, prix mini bar Maroc",
   "keywordsAr": "ميني بار, ثلاجة صغيرة, فريكو صغير, ثلاجة بيت النعاس, ثمن ميني بار في المغرب"},
  "faq": [faq("Peut-on le fermer à clé ?", "Oui, il est équipé d'une serrure avec clé.", "واش كيتسد بالساروت؟", "إيه، عندو قفل بالساروت.")]},
 "Mini bar Nexon NFR-605-M(S) 45 litres silver", "ميني بار نيكسون NFR-605-M(S) سعة 45 لترا فضي",
 specs=[S("Marque", "Nexon"), S("Référence", "NFR-605-M(S)"), S("Capacité", "45 L"), S("Commande", "Mécanique"), S("Serrure", "Avec clé"), S("Dégivrage", "Manuel"), S("Consommation énergétique indiquée", "106 kWh/an"), S("Niveau sonore indiqué", "40 dB"), S("Finition", "Silver")],
 specs_note="Valeurs reprises de la fiche et de l'ancienne description")

# 15 Alaska 150 L
add("rfrigrateur-alaska-150-litres-2-portes-silver", ["Ancienne description : « Choisissez Alaska chez Electro Darna » (retiré).", "Classe énergétique et dimensions non renseignées."],
 {"name": "Réfrigérateur Alaska 150 L 2 portes silver ALKREG-15", "nameAr": "ثلاجة ألاسكا 150 لترا ببابين فضية ALKREG-15",
  "shortDescription": "Réfrigérateur deux portes Alaska ALKREG-15 de 150 litres : congélateur en haut, étagères en verre réglables, bacs à légumes et ventilation intérieure.",
  "description": fridge_text("L'Alaska ALKREG-15 est un réfrigérateur deux portes de 150 litres pour un studio, un petit appartement ou une cuisine étroite. Le congélateur est en haut, le réfrigérateur en bas.",
   [("Rangement", "Les étagères en verre se règlent en hauteur pour accueillir bouteilles et plats ; les tiroirs gardent fruits et légumes, et les balconnets transparents de la porte laissent voir ce qu'il reste."),
    ("Froid réparti", "Un système de ventilation aide l'air froid à circuler dans le compartiment.")],
   ["Référence : ALKREG-15", "Capacité totale : 150 litres", "Congélateur en haut", "Étagères en verre réglables", "Tiroirs à fruits et légumes", "Couleur : gris silver"], "Garantie : 12 mois."),
  "metaTitle": "Réfrigérateur Alaska 150 L ALKREG-15 – Prix Maroc",
  "metaDescription": "Réfrigérateur Alaska ALKREG-15 150 L, 2 portes, étagères en verre réglables, silver. " + ST,
  "seo": {"titleAr": "ثلاجة ألاسكا 150 لترا ALKREG-15 بالمغرب",
   "metaDescriptionAr": "ثلاجة ألاسكا ALKREG-15 بسعة 150 لترا ببابين، رفوف زجاجية قابلة للتعديل، لون فضي. " + STA,
   "shortDescriptionAr": "ثلاجة ألاسكا ALKREG-15 ببابين سعة 150 لترا: المجمد في الأعلى، رفوف زجاجية قابلة للتعديل ودرج للخضر.",
   "descriptionAr": fridge_text_ar("ألاسكا ALKREG-15 ثلاجة ببابين بسعة 150 لترا لستوديو أو شقة صغيرة أو مطبخ ضيق. المجمد في الأعلى.",
    [("الترتيب", "رفوف زجاجية قابلة للتعديل، أدراج للخضر والفواكه ورفوف شفافة في الباب."), ("تبريد موزع", "نظام تهوية يساعد على توزيع البرودة.")],
    ["المرجع: ALKREG-15", "السعة: 150 لترا", "المجمد في الأعلى", "اللون: رمادي فضي"], "الضمان: 12 شهرا."),
   "keywords": "réfrigérateur Alaska 150L, Alaska ALKREG-15, petit réfrigérateur 2 portes, frigo 150 litres, prix réfrigérateur Alaska Maroc",
   "keywordsAr": "ثلاجة ألاسكا 150 لتر, فريكو صغير, ثلاجة بابين صغيرة, فريكو ألاسكا, ثمن ثلاجة ألاسكا في المغرب"},
  "faq": [INSTALL]},
 "Réfrigérateur Alaska ALKREG-15 150 litres deux portes", "ثلاجة ألاسكا ALKREG-15 سعة 150 لترا ببابين")

# 16 Alaska 120 L
add("rfrigrateur-alaska-120l-gris-alkreg-12-compact-et-pratique", ["Ancienne description : « Commandez … sur Electro Darna » (retiré). Lignes marketing retirées des caractéristiques."],
 {"name": "Réfrigérateur compact Alaska 120 L gris ALKREG-12", "nameAr": "ثلاجة صغيرة ألاسكا 120 لترا رمادية ALKREG-12",
  "shortDescription": "Réfrigérateur compact Alaska ALKREG-12 de 120 litres, 84,5 cm de haut, étagères en verre réglables et tiroir à légumes.",
  "description": fridge_text("L'Alaska ALKREG-12 est un réfrigérateur compact de 120 litres qui mesure 84,5 cm de haut : il peut se placer sous un plan de travail, dans un studio, un bureau ou une chambre d'étudiant.",
   [("Organisation", "Étagères en verre réglables, tiroir à fruits et légumes et bacs de porte transparents pour les bouteilles."),
    ("Dimensions", "845 × 453 × 425 mm (H × L × P) : vérifiez la hauteur disponible sous votre plan de travail en laissant un peu d'air autour.")],
   ["Référence : ALKREG-12", "Capacité : 120 litres", "Hauteur : 845 mm", "Largeur : 453 mm", "Profondeur : 425 mm", "Couleur : gris"], "Garantie : 12 mois."),
  "metaTitle": "Réfrigérateur Alaska 120 L ALKREG-12 – Prix Maroc",
  "metaDescription": "Réfrigérateur compact Alaska ALKREG-12 120 L, 84,5 cm de haut, étagères en verre et tiroir à légumes. " + ST,
  "seo": {"titleAr": "ثلاجة صغيرة ألاسكا 120 لترا ALKREG-12 بالمغرب",
   "metaDescriptionAr": "ثلاجة صغيرة ألاسكا ALKREG-12 بسعة 120 لترا وارتفاع 84.5 سم، رفوف زجاجية ودرج للخضر. " + STA,
   "shortDescriptionAr": "ثلاجة صغيرة ألاسكا ALKREG-12 بسعة 120 لترا وارتفاع 84.5 سم، رفوف زجاجية قابلة للتعديل ودرج للخضر.",
   "descriptionAr": fridge_text_ar("ألاسكا ALKREG-12 ثلاجة صغيرة بسعة 120 لترا وارتفاع 84.5 سم: يمكن وضعها تحت سطح المطبخ أو في ستوديو أو مكتب.",
    [("الترتيب", "رفوف زجاجية، درج للخضر ورفوف الباب للقنينات."), ("الأبعاد", "845 × 453 × 425 مم.")],
    ["المرجع: ALKREG-12", "السعة: 120 لترا", "الارتفاع: 845 مم", "العرض: 453 مم", "العمق: 425 مم", "اللون: رمادي"], "الضمان: 12 شهرا."),
   "keywords": "réfrigérateur compact Alaska 120L, Alaska ALKREG-12, petit frigo sous plan, réfrigérateur studio, prix petit réfrigérateur Maroc",
   "keywordsAr": "فريكو صغير, ثلاجة صغيرة, ثلاجة ألاسكا 120 لتر, فريكو تحت الكونطوار, ثمن ثلاجة صغيرة في المغرب"},
  "faq": [faq("Peut-il aller sous un plan de travail ?", "Il mesure 84,5 cm de haut ; vérifiez la hauteur disponible et laissez de l'espace autour pour la ventilation.", "واش كيدخل تحت الكونطوار؟", "الطول ديالو 84.5 سم، قيسو البلاصة وخليو شوية ديال الهوا داير بيه.")]},
 "Réfrigérateur compact Alaska ALKREG-12 120 litres gris", "ثلاجة صغيرة ألاسكا ALKREG-12 سعة 120 لترا رمادية",
 specs=[S("Marque", "Alaska"), S("Référence", "ALKREG-12"), S("Type", "Réfrigérateur compact"), S("Capacité", "120 litres"), S("Couleur", "Gris"), S("Étagères", "Verre réglables"), S("Rangement", "Bacs de porte transparents"), S("Tiroir", "Fruits et légumes"), S("Hauteur", "845 mm"), S("Largeur", "453 mm"), S("Profondeur", "425 mm")])

# 17 Kenz mini bar
add("mini-bar-kenz-44-litres-kb-7543-rfrigrateur-compact-gris", [],
 {"name": "Mini bar Kenz 44 L gris KB-7543", "nameAr": "ثلاجة صغيرة ميني بار كنز 44 لترا رمادية KB-7543",
  "shortDescription": "Mini bar Kenz KB-7543 de 44 litres, classe A, 139 kWh/an, 39 dB et serrure à clé : pour chambre, bureau ou hôtellerie.",
  "description": fridge_text("Le Kenz KB-7543 est un mini réfrigérateur de 44 litres pensé aussi bien pour la maison que pour les professionnels : chambre d'hôtel, maison d'hôtes, bureau ou chambre à coucher.",
   [("Silencieux", "Avec 39 dB, il fait partie des modèles les plus discrets : un point important dans une chambre."),
    ("Sécurisé", "Une serrure à clé garde le contenu fermé, utile en location ou au bureau.")],
   ["Capacité nette : 44 litres", "Classe énergétique : A", "Consommation : 139 kWh/an", "Niveau sonore : 39 dB", "Serrure avec clé", "Couleur : gris foncé"], "Garantie : 12 mois."),
  "metaTitle": "Mini bar Kenz 44 litres KB-7543 – Prix Maroc",
  "metaDescription": "Mini bar Kenz KB-7543 44 L, classe A, 39 dB et serrure à clé, pour chambre, bureau ou hôtel. " + ST,
  "seo": {"titleAr": "ميني بار كنز 44 لترا KB-7543 بالمغرب",
   "metaDescriptionAr": "ثلاجة صغيرة كنز KB-7543 بسعة 44 لترا، فئة A، صوت 39 ديسيبل وقفل بمفتاح. " + STA,
   "shortDescriptionAr": "ميني بار كنز KB-7543 بسعة 44 لترا، فئة A، صوت 39 ديسيبل وقفل بمفتاح، للغرفة والمكتب والفندق.",
   "descriptionAr": fridge_text_ar("كنز KB-7543 ثلاجة صغيرة بسعة 44 لترا للبيت وللمهنيين: غرف الفنادق، دور الضيافة، المكاتب.",
    [("هادئة", "39 ديسيبل فقط، مهم في غرفة النوم."), ("آمنة", "قفل بمفتاح.")],
    ["السعة: 44 لترا", "فئة الطاقة: A", "الاستهلاك: 139 كيلوواط ساعة في السنة", "الصوت: 39 ديسيبل", "اللون: رمادي غامق"], "الضمان: 12 شهرا."),
   "keywords": "mini bar Kenz 44L, Kenz KB-7543, mini réfrigérateur hôtel, mini bar silencieux, prix mini bar Kenz Maroc",
   "keywordsAr": "ميني بار كنز, ثلاجة صغيرة, فريكو صغير للفندق, ميني بار بقفل, ثمن ميني بار في المغرب"},
  "faq": [faq("Est-il adapté à une chambre d'hôtel ?", "Oui : 44 litres, 39 dB et une serrure à clé, c'est l'usage pour lequel il est conçu.", "واش مناسب لغرفة الفندق؟", "إيه: 44 لتر، 39 ديسيبل وقفل بالساروت.")]},
 "Mini bar Kenz KB-7543 44 litres gris foncé", "ميني بار كنز KB-7543 سعة 44 لترا رمادي غامق")

# 18 Génial 138 L
add("rfrigrateur-gnial-2-portes-138-litres-grf-240dhs-silver-classe-a", ["Ancienne description : « Commandez … chez Electro Darna » (retiré)."],
 {"name": "Réfrigérateur Génial 138 L 2 portes silver GRF-240DHS", "nameAr": "ثلاجة جنيال 138 لترا ببابين فضية GRF-240DHS",
  "shortDescription": "Réfrigérateur deux portes Génial GRF-240DHS de 138 litres (93 L + 45 L), classe A, 42 dB, 137 cm de haut.",
  "description": fridge_text("Le Génial GRF-240DHS est un petit réfrigérateur deux portes de 138 litres, avec 93 litres de réfrigérateur et un congélateur supérieur de 45 litres, un congélateur généreux pour cette taille.",
   [("Petit format", "137 cm de haut, 50 cm de large et 48 cm de profondeur : il trouve sa place dans une cuisine étroite ou un studio."),
    ("Consommation", "Classé A, il consomme 207 kWh par an selon sa fiche, avec un niveau sonore de 42 dB.")],
   ["Capacité totale : 138 litres", "Réfrigérateur : 93 litres", "Congélateur : 45 litres", "Classe énergétique : A", "Consommation : 207 kWh/an", "Niveau sonore : 42 dB", "Dimensions (H × L × P) : 137 × 50 × 48 cm", "Poids net : 31 kg", "Couleur : silver"], "Garantie : 12 mois."),
  "metaTitle": "Réfrigérateur Génial 138 L GRF-240DHS – Prix Maroc",
  "metaDescription": "Réfrigérateur Génial GRF-240DHS 138 L, 2 portes, congélateur 45 L, classe A, 137 cm de haut. " + ST,
  "seo": {"titleAr": "ثلاجة جنيال 138 لترا GRF-240DHS بالمغرب",
   "metaDescriptionAr": "ثلاجة جنيال GRF-240DHS بسعة 138 لترا ببابين ومجمد 45 لترا، فئة A وارتفاع 137 سم. " + STA,
   "shortDescriptionAr": "ثلاجة جنيال GRF-240DHS ببابين سعة 138 لترا (93 + 45)، فئة A وصوت 42 ديسيبل.",
   "descriptionAr": fridge_text_ar("جنيال GRF-240DHS ثلاجة صغيرة ببابين بسعة 138 لترا: 93 لترا للتبريد و45 لترا للمجمد، مجمد كبير بالنسبة لحجمها.",
    [("حجم صغير", "137 سم ارتفاعا و50 عرضا و48 عمقا، مناسبة لمطبخ ضيق أو ستوديو."), ("الاستهلاك", "فئة A و207 كيلوواط ساعة في السنة، وصوت 42 ديسيبل.")],
    ["السعة: 138 لترا", "التبريد: 93 لترا", "المجمد: 45 لترا", "فئة الطاقة: A", "الأبعاد: 137 × 50 × 48 سم", "اللون: فضي"], "الضمان: 12 شهرا."),
   "keywords": "réfrigérateur Génial 138L, Génial GRF-240DHS, petit réfrigérateur 2 portes, réfrigérateur 50 cm, prix réfrigérateur Génial Maroc",
   "keywordsAr": "ثلاجة جنيال, فريكو صغير بابين, ثلاجة 138 لتر, فريكو جنيال, ثمن ثلاجة جنيال في المغرب"},
  "faq": [faq("Quelles sont ses dimensions ?", "137 cm de haut, 50 cm de large et 48 cm de profondeur.", "شنو هي الأبعاد ديالها؟", "137 سم طول، 50 سم عرض و48 سم عمق."), INSTALL]},
 "Réfrigérateur Génial GRF-240DHS 138 litres silver", "ثلاجة جنيال GRF-240DHS سعة 138 لترا فضية")

assert len(P) == 18, len(P)
json.dump(P, open(os.path.join(HERE, "fridges-18.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(P), "entries")
