# -*- coding: utf-8 -*-
# Batch "categories-13": all remaining category pages (+ a link fix on Petit électroménager).
# Each page targets its own head term (parents broad, children specific). No prices or product counts
# (they change); brands are the ones actually stocked (backups/seo/before-categories/cat-summary.json).
import json, os
HERE = os.path.dirname(__file__)
summary = {c["slug"]: c for c in json.load(open(os.path.join(HERE, "../../backups/seo/before-categories/cat-summary.json"), encoding="utf-8"))}
P = []
ST = "Livraison partout au Maroc, paiement à la livraison."
STA = "توصيل لكل المغرب والدفع عند الاستلام."
def L(label, slug): return f"[{label}](/categorie/{slug})"
def brands(slug, n=8):
    bs = [b for b in summary[slug]["brands"] if b != "?"]
    return ", ".join(sorted({b[:1].upper() + b[1:] for b in bs})[:n])

def cat(slug, nameAr, desc, mt, md, h1, long_fr, tAr, mdAr, long_ar, kw, kwAr, verify=()):
    assert slug in summary, slug
    P.append({"kind": "category", "slug": slug, "source": "categories-13", "sources": [], "verify": list(verify), "specsVerified": False,
      "changes": {"nameAr": nameAr, "description": desc, "metaTitle": mt, "metaDescription": md + " " + ST,
        "seo": {"h1": h1, "longDescription": long_fr, "titleAr": tAr, "metaDescriptionAr": mdAr + " " + STA, "descriptionAr": long_ar, "keywords": kw, "keywordsAr": kwAr}}})

# ── Réfrigérateurs ──────────────────────────────────────────────────────────
cat("refrigerateurs", "ثلاجات",
  "Réfrigérateurs deux portes, combinés, No Frost et mini bars, de " + brands("refrigerateurs", 6) + " et d'autres marques.",
  "Réfrigérateur Maroc – deux portes, combiné, No Frost", "Réfrigérateurs deux portes, combinés, No Frost et mini bars des marques " + brands("refrigerateurs", 4) + ".",
  "Réfrigérateurs",
  "Le réfrigérateur est l'appareil qui tourne jour et nuit dans la cuisine : bien le choisir, c'est payer moins d'électricité pendant des années.\n\n"
  "### Quelle capacité ?\nComptez environ 100 à 150 litres pour une personne, 200 à 300 litres pour un couple ou une petite famille, et plus de 350 litres pour une famille de cinq personnes ou plus. Les mini bars de 40 à 50 litres conviennent à une chambre ou un bureau.\n\n"
  "### Deux portes ou combiné ?\n- **Deux portes** : congélateur en haut, le format le plus courant au Maroc.\n- **Combiné** : congélateur en bas, réfrigérateur à hauteur des yeux.\n- **Mini bar** : une seule porte, compact, souvent avec serrure.\n\n"
  "### No Frost ou froid statique ?\nLe **No Frost** ventile l'air froid et empêche le givre : plus de dégivrage. Le **froid statique** est plus simple et souvent moins cher, mais le congélateur doit être dégivré de temps en temps.\n\n"
  "### Avant de commander\nMesurez la niche (largeur, hauteur, profondeur) et le passage des portes, et laissez quelques centimètres à l'arrière pour la ventilation. Regardez la classe énergétique et la consommation annuelle quand elle est indiquée.\n\n"
  "Voir aussi : " + L("Congélateurs", "minibar") + ", " + L("Lavage", "lavage") + " et " + L("Cuisson", "cuisson") + ".",
  "ثلاجات في المغرب – ثلاجة بابين، كومبي، No Frost", "ثلاجات ببابين وكومبي وNo Frost وثلاجات صغيرة من " + brands("refrigerateurs", 4) + ".",
  "الثلاجة جهاز يعمل ليلا ونهارا في المطبخ، واختيارها الجيد يعني فاتورة كهرباء أقل لسنوات.\n\n"
  "### أي سعة؟\nمن 100 إلى 150 لترا لشخص واحد، ومن 200 إلى 300 لترا لزوجين أو عائلة صغيرة، وأكثر من 350 لترا لعائلة من خمسة أفراد أو أكثر. الثلاجات الصغيرة من 40 إلى 50 لترا تناسب غرفة النوم أو المكتب.\n\n"
  "### بابين أو كومبي؟\n- **بابين**: المجمد في الأعلى، الشكل الأكثر شيوعا في المغرب.\n- **كومبي**: المجمد في الأسفل والثلاجة في مستوى النظر.\n- **ثلاجة صغيرة**: باب واحد وغالبا بقفل.\n\n"
  "### No Frost أو تبريد عادي؟\nتقنية **No Frost** تمنع تكون الثلج فلا حاجة لإزالته. **التبريد العادي** أبسط وغالبا أرخص، لكن يجب إزالة الثلج من المجمد من وقت لآخر.\n\n"
  "### قبل الطلب\nقيسوا المكان ومدخل الباب، واتركوا مسافة في الخلف للتهوية.\n\n"
  "انظروا أيضا: " + L("المجمدات", "minibar") + " و" + L("الغسيل", "lavage") + ".",
  "réfrigérateur Maroc, frigo Maroc, réfrigérateur deux portes, réfrigérateur combiné, réfrigérateur No Frost, mini bar, prix réfrigérateur Maroc",
  "ثلاجة, فريكو, ثلاجة بابين, ثلاجة كومبي, ثلاجة No Frost, ميني بار, ثمن الثلاجة في المغرب")

# ── Congélateurs (slug "minibar", formerly /categorie/congelateurs) ──────────
cat("minibar", "مجمدات",
  "Congélateurs coffres pour conserver une réserve de surgelés à la maison.",
  "Congélateur Maroc – congélateurs coffres", "Congélateurs coffres pour stocker viande, pain et préparations faites maison.",
  "Congélateurs",
  "Un congélateur coffre complète le réfrigérateur quand le compartiment congélation ne suffit plus : viande achetée en quantité, provisions de l'Aïd, pain, plats préparés à l'avance.\n\n"
  "### Coffre ou armoire ?\nLe **congélateur coffre** s'ouvre par le dessus : il garde mieux le froid à l'ouverture et offre beaucoup de volume pour son prix. Il demande en revanche de la place au sol.\n\n"
  "### Quelle capacité ?\nUne centaine de litres convient à une famille qui stocke un peu ; au-delà de 200 litres, on parle de réserve pour une grande famille.\n\n"
  "### Consommation\nUn congélateur fonctionne en continu : regardez la classe énergétique et la consommation annuelle en kWh, qui comptent davantage que le prix d'achat sur la durée.\n\n"
  "Voir aussi : " + L("Réfrigérateurs", "refrigerateurs") + ".",
  "مجمدات في المغرب – كونجيلاتور أفقي", "مجمدات أفقية لحفظ اللحم والخبز والأطباق المحضرة مسبقا، مع فئة الطاقة.",
  "المجمد الأفقي يكمل الثلاجة عندما لا يكفي مكان التجميد: اللحم المشترى بكميات، مؤونة العيد، الخبز والأطباق المحضرة مسبقا.\n\n"
  "### لماذا الأفقي؟\nيفتح من الأعلى فيحافظ على البرودة عند الفتح، ويعطي سعة كبيرة بثمن مناسب، لكنه يحتاج مكانا على الأرض.\n\n"
  "### الاستهلاك\nالمجمد يعمل طوال الوقت، لذلك انظروا إلى فئة الطاقة والاستهلاك السنوي.\n\n"
  "انظروا أيضا: " + L("الثلاجات", "refrigerateurs") + ".",
  "congélateur Maroc, congélateur coffre, congélateur horizontal, congélateur A++, prix congélateur Maroc",
  "كونجيلاتور, مجمد, مجمد أفقي, كونجيلاتور أفقي, ثمن الكونجيلاتور في المغرب",
  verify=["Catégorie renommée « Congélateurs » (nom uniquement) ; l'URL reste /categorie/minibar. Restaurer /categorie/congelateurs (URL d'origine) demande une approbation."])

# ── Lavage (parent) ─────────────────────────────────────────────────────────
cat("lavage", "الغسيل",
  "Lave-linge automatiques, machines semi-automatiques à double bac et lave-vaisselle.",
  "Lave-linge et lave-vaisselle au Maroc – Lavage", "Lave-linge frontaux, à chargement par le haut, semi-automatiques à double bac et lave-vaisselle.",
  "Lavage : lave-linge et lave-vaisselle",
  "Le rayon lavage réunit les " + L("machines à laver", "machines-a-laver") + " et les " + L("lave-vaisselle", "lave-vaisselle") + ". Voici comment s'y retrouver.\n\n"
  "### Lave-linge automatique ou semi-automatique ?\n- **Automatique** : il remplit, lave, rince et essore seul. Frontal ou à chargement par le haut.\n- **Semi-automatique à double bac** : un bac pour laver, un autre pour essorer, sans arrivée d'eau fixe. Économique et répandu au Maroc.\n\n"
  "### Lave-vaisselle\nUn lave-vaisselle 13 couverts lave la vaisselle d'un repas familial en un cycle, souvent avec moins d'eau qu'à la main.\n\n"
  "### Installation\nPrévoyez une arrivée d'eau, une évacuation et une prise avec terre pour les modèles automatiques ; un sol plan pour limiter les vibrations.",
  "الغسيل في المغرب – غسالات الملابس والصحون", "غسالات ملابس أمامية وعلوية ونصف أوتوماتيكية بحوضين، وغسالات الصحون.",
  "قسم الغسيل يجمع " + L("غسالات الملابس", "machines-a-laver") + " و" + L("غسالات الصحون", "lave-vaisselle") + ".\n\n"
  "### أوتوماتيكية أو نصف أوتوماتيكية؟\n- **أوتوماتيكية**: تملأ وتغسل وتشطف وتعصر وحدها.\n- **نصف أوتوماتيكية بحوضين**: حوض للغسيل وآخر للعصر، بدون مدخل ماء ثابت. اقتصادية ومنتشرة في المغرب.\n\n"
  "### غسالة الصحون\nغسالة 13 طقما تغسل أواني وجبة عائلية في دورة واحدة.\n\n"
  "### التركيب\nمدخل ماء ومخرج تصريف ومقبس فيه الأرضي للغسالات الأوتوماتيكية.",
  "lave-linge et lave-vaisselle Maroc, électroménager lavage, machine à laver et lave-vaisselle, lavage Maroc",
  "الغسيل, غسالة الملابس, غسالة الصحون, ماكينة التصبين, أجهزة الغسيل في المغرب")

cat("machines-a-laver", "غسالات الملابس",
  "Machines à laver frontales, à chargement par le haut et semi-automatiques à double bac, de " + brands("machines-a-laver", 6) + " et d'autres marques.",
  "Machine à laver Maroc – automatique et semi-auto", "Machines à laver automatiques frontales ou par le haut, et semi-automatiques à double bac, de 2,5 à 13 kg.",
  "Machines à laver",
  "Choisir une machine à laver, c'est d'abord choisir sa capacité et son type.\n\n"
  "### Quelle capacité ?\nComptez 5 à 7 kg pour une ou deux personnes, 8 kg pour trois à cinq personnes, et 9 kg ou plus pour une grande famille ou pour laver couettes et couvertures. Les mini machines de 2,5 kg servent pour les petites lessives ou un studio.\n\n"
  "### Frontale, par le haut ou semi-automatique ?\n- **Frontale** : la plus répandue, souvent avec un essorage rapide (1200 à 1400 tr/min).\n- **Chargement par le haut** : plus étroite, on charge sans se baisser.\n- **Semi-automatique à double bac** : lavage et essorage séparés, pas d'arrivée d'eau fixe, très économique.\n\n"
  "### L'essorage\nPlus il est rapide, moins le linge est humide à la sortie : un vrai plus en hiver ou sans terrasse.\n\n"
  "### Lire l'étiquette énergie\nDepuis 2021, l'étiquette européenne va de A à G sans « + » : une classe C récente n'est pas comparable à un ancien « A+++ ».\n\n"
  "Voir aussi : " + L("Lave-vaisselle", "lave-vaisselle") + ".",
  "غسالة ملابس في المغرب – أوتوماتيكية ونصف أوتوماتيكية", "غسالات ملابس أوتوماتيكية أمامية أو علوية، ونصف أوتوماتيكية بحوضين، من 2.5 إلى 13 كيلو.",
  "اختيار غسالة الملابس يبدأ بالسعة والنوع.\n\n"
  "### أي سعة؟\nمن 5 إلى 7 كيلو لشخص أو اثنين، 8 كيلو لثلاثة إلى خمسة أفراد، و9 كيلو أو أكثر لعائلة كبيرة أو لغسل الأغطية. الغسالات الصغيرة 2.5 كيلو للغسيل القليل.\n\n"
  "### أمامية، علوية أو نصف أوتوماتيكية؟\n- **أمامية**: الأكثر انتشارا وعصر سريع.\n- **علوية**: أضيق وتملأ بدون انحناء.\n- **نصف أوتوماتيكية بحوضين**: غسيل وعصر منفصلان، بدون مدخل ماء ثابت.\n\n"
  "### العصر\nكلما كان أسرع خرجت الملابس أقل رطوبة.\n\n"
  "انظروا أيضا: " + L("غسالات الصحون", "lave-vaisselle") + ".",
  "machine à laver Maroc, lave-linge Maroc, machine à laver automatique, machine à laver semi-automatique, lave-linge 8 kg, prix machine à laver Maroc",
  "ماكينة التصبين, غسالة الملابس, ماكينة الصابون, غسالة أوتوماتيكية, غسالة بحوضين, ثمن ماكينة التصبين في المغرب")

cat("lave-vaisselle", "غسالات الصحون",
  "Lave-vaisselle pose libre pour laver la vaisselle des repas de famille.",
  "Lave-vaisselle Maroc – lave-vaisselle pose libre", "Lave-vaisselle pose libre pour la vaisselle des repas de famille, capacité en couverts indiquée.",
  "Lave-vaisselle",
  "Un lave-vaisselle fait gagner du temps chaque jour et consomme souvent moins d'eau qu'une vaisselle à la main pour la même quantité.\n\n"
  "### La capacité en couverts\nUn « couvert » correspond à la vaisselle d'une personne pour un repas. Un modèle de 12 à 14 couverts convient à une famille de quatre à six personnes.\n\n"
  "### Installation\nPrévoyez une arrivée d'eau, une évacuation et une prise électrique à proximité. Le format standard fait 60 cm de large.\n\n"
  "### Bien charger\nAssiettes vers le centre, verres et tasses dans le panier du haut, couverts manche vers le bas : l'eau atteint mieux toutes les surfaces.\n\n"
  "Voir aussi : " + L("Machines à laver", "machines-a-laver") + ".",
  "غسالة الصحون في المغرب – لافيسيل", "غسالات صحون لأواني الوجبات العائلية، مع عدد الأطقم واستهلاك الماء.",
  "غسالة الصحون توفر الوقت كل يوم وتستهلك غالبا ماء أقل من الغسيل باليد.\n\n"
  "### عدد الأطقم\nالطقم هو أواني شخص واحد لوجبة واحدة. غسالة من 12 إلى 14 طقما تناسب عائلة من أربعة إلى ستة أفراد.\n\n"
  "### التركيب\nمدخل ماء ومخرج تصريف ومقبس قريب، والعرض المعتاد 60 سم.\n\n"
  "انظروا أيضا: " + L("غسالات الملابس", "machines-a-laver") + ".",
  "lave-vaisselle Maroc, lave-vaisselle 13 couverts, lave-vaisselle pose libre, lave-vaisselle inox, prix lave-vaisselle Maroc",
  "غسالة الصحون, لافيسيل, ماكينة غسيل الأواني, غسالة الأواني, ثمن غسالة الصحون في المغرب")

# ── Cuisson ─────────────────────────────────────────────────────────────────
cat("cuisson", "الطهي",
  "Fours électriques posables et encastrables, plaques de cuisson gaz et électriques.",
  "Appareils de cuisson Maroc – fours et plaques", "Fours électriques posables et encastrables, plaques de cuisson gaz encastrables et plaques électriques.",
  "Appareils de cuisson : fours et plaques",
  "Le rayon cuisson réunit les " + L("fours électriques", "fours") + " et les " + L("plaques de cuisson", "fours-plaques-a-gaz-et-cuisinieres-mega-electro") + ".\n\n"
  "### Four posable ou encastrable ?\nLe **four posable** se met sur le plan de travail et se branche sur une prise : pas de travaux. Le **four encastrable** s'intègre dans un meuble de cuisine de 60 cm.\n\n"
  "### Plaque gaz ou électrique ?\nLa **plaque gaz encastrable** (4 ou 5 feux) est la plus utilisée dans les cuisines marocaines. La **plaque électrique** dépanne là où il n'y a pas de gaz : studio, bureau, feu d'appoint.\n\n"
  "### Sécurité\nLe raccordement au gaz se fait par un professionnel, avec un flexible conforme. Un four électrique de forte puissance demande une prise adaptée.\n\n"
  "Voir aussi : " + L("Micro-ondes", "micro-ondes") + " et " + L("Petit électroménager", "petit-electromenager") + ".",
  "أجهزة الطهي في المغرب – أفران وطباخات", "أفران كهربائية توضع على السطح ومدمجة، وطباخات غاز مدمجة وطباخات كهربائية.",
  "قسم الطهي يجمع " + L("الأفران الكهربائية", "fours") + " و" + L("الطباخات", "fours-plaques-a-gaz-et-cuisinieres-mega-electro") + ".\n\n"
  "### فرن يوضع أو مدمج؟\nالفرن الذي يوضع على السطح يشتغل بالمقبس بدون أشغال، والمدمج يركب في خزانة 60 سم.\n\n"
  "### طباخة غاز أو كهربائية؟\nطباخة الغاز المدمجة بأربع أو خمس عيون هي الأكثر استعمالا، والكهربائية مفيدة حيث لا يوجد غاز.\n\n"
  "### السلامة\nالتوصيل بالغاز يقوم به مختص بخرطوم مطابق.\n\n"
  "انظروا أيضا: " + L("الميكروويف", "micro-ondes") + ".",
  "appareils de cuisson Maroc, four et plaque de cuisson, électroménager cuisine, cuisson Maroc",
  "أجهزة الطهي, فرن وطباخة, أجهزة المطبخ, الطهي في المغرب")

cat("fours", "أفران",
  "Fours électriques posables de 45 à 70 litres et fours encastrables, de " + brands("fours", 5) + ".",
  "Four électrique Maroc – posable et encastrable", "Fours électriques posables de 45 à 70 litres, chaleur tournante ou double vitrage, et encastrables.",
  "Fours électriques",
  "Un four électrique prend le relais du four à gaz pour le pain, les msemen, les gâteaux, les gratins et les poulets rôtis.\n\n"
  "### Quelle capacité ?\n45 litres pour un couple ou une petite famille, 50 à 60 litres pour une famille, 70 litres pour cuire plusieurs plaques à la fois ou recevoir souvent.\n\n"
  "### Les options utiles\n- **Chaleur tournante** : cuisson homogène sur plusieurs niveaux.\n- **Double vitrage** : porte moins chaude, meilleure tenue de la température.\n- **Résistances haut et bas séparées** : gratiner ou cuire une pâte par le dessous.\n- **Minuterie** : la cuisson s'arrête seule.\n\n"
  "### Posable ou encastrable ?\nLe four posable n'a besoin que d'une prise ; l'encastrable demande une niche de 60 cm et un raccordement par un électricien.\n\n"
  "Voir aussi : " + L("Plaques de cuisson", "fours-plaques-a-gaz-et-cuisinieres-mega-electro") + " et " + L("Micro-ondes", "micro-ondes") + ".",
  "فرن كهربائي في المغرب – يوضع ومدمج", "أفران كهربائية من 45 إلى 70 لترا بمروحة أو زجاج مزدوج، وأفران مدمجة.",
  "الفرن الكهربائي يعوض فرن الغاز للخبز والمسمن والحلويات والغراتان والدجاج المحمر.\n\n"
  "### أي سعة؟\n45 لترا لزوجين، من 50 إلى 60 لترا للعائلة، و70 لترا لطهي عدة صواني في نفس الوقت.\n\n"
  "### خيارات مفيدة\n- **مروحة الحرارة**: طهي متساو على عدة مستويات.\n- **زجاج مزدوج**: باب أقل حرارة.\n- **مقاومتان منفصلتان**: تحمير من الأعلى أو طهي العجين من الأسفل.\n- **مؤقت**: يتوقف الطهي وحده.\n\n"
  "انظروا أيضا: " + L("الطباخات", "fours-plaques-a-gaz-et-cuisinieres-mega-electro") + ".",
  "four électrique Maroc, four posable, four encastrable, four électrique 60 litres, four chaleur tournante, prix four électrique Maroc",
  "فرن كهربائي, فور الضو, فرن كبير, فرن مدمج, ثمن الفرن الكهربائي في المغرب")

cat("fours-plaques-a-gaz-et-cuisinieres-mega-electro", "طباخات",
  "Plaques de cuisson gaz encastrables 4 et 5 feux, et plaques électriques d'appoint.",
  "Plaque de cuisson Maroc – plaques gaz et électriques", "Plaques de cuisson gaz encastrables 4 et 5 feux en inox, et plaques électriques pour cuisiner sans gaz.",
  "Plaques de cuisson",
  "La plaque de cuisson est le cœur de la cuisine marocaine : tajine, harira, thé et plats mijotés en même temps.\n\n"
  "### Combien de feux ?\n**4 feux sur 60 cm** est le format standard des cuisines équipées. **5 feux sur 90 cm** laisse plus d'espace entre les grandes marmites, pour les familles qui reçoivent.\n\n"
  "### Les détails qui comptent\n- **Allumage électrique** : plus besoin de briquet.\n- **Inox** : se nettoie à l'eau savonneuse et à l'éponge douce.\n- **Découpe** : vérifiez les dimensions de découpe du plan de travail avant de commander, surtout pour remplacer une ancienne plaque.\n\n"
  "### Plaque électrique\nUne plaque électrique d'un feu dépanne dans un studio, un bureau ou comme feu supplémentaire.\n\n"
  "Le raccordement au gaz doit être fait par un professionnel. Voir aussi : " + L("Fours électriques", "fours") + ".",
  "طباخات الغاز والكهرباء في المغرب", "طباخات غاز مدمجة بأربع وخمس عيون من الإينوكس، وطباخات كهربائية للطهي بدون غاز.",
  "الطباخة قلب المطبخ المغربي: الطاجين والحريرة والأتاي في نفس الوقت.\n\n"
  "### كم عين؟\n**4 عيون على 60 سم** المقاس المعتاد، و**5 عيون على 90 سم** لمساحة أكبر بين الطناجر.\n\n"
  "### تفاصيل مهمة\n- **إشعال كهربائي** بدون ولاعة.\n- **إينوكس** سهل التنظيف.\n- **الفتحة**: تأكدوا من مقاس فتحة السطح قبل الطلب.\n\n"
  "التوصيل بالغاز يقوم به مختص. انظروا أيضا: " + L("الأفران الكهربائية", "fours") + ".",
  "plaque de cuisson Maroc, plaque gaz encastrable, plaque 4 feux, plaque 5 feux, plaque électrique, prix plaque de cuisson Maroc",
  "طباخة الغاز, بلاكة الغاز, طباخة مدمجة, فوكو, طباخة كهربائية, ثمن الطباخة في المغرب",
  verify=["Catégorie renommée « Plaques de cuisson » (nom uniquement) ; l'URL reste /categorie/fours-plaques-a-gaz-et-cuisinieres-mega-electro."])

cat("micro-ondes", "ميكروويف",
  "Fours micro-ondes pour réchauffer, décongeler et gratiner au quotidien.",
  "Micro-ondes Maroc – micro-ondes et micro-ondes gril", "Fours micro-ondes et micro-ondes gril pour réchauffer, décongeler et gratiner au quotidien.",
  "Micro-ondes",
  "Le micro-ondes réchauffe un plat en quelques minutes et décongèle sans attendre.\n\n"
  "### Simple ou gril ?\nUn **micro-ondes gril** ajoute une résistance qui dore et rend croustillant : utile pour les gratins et les restes de pizza.\n\n"
  "### Quelle taille ?\n20 litres conviennent à la plupart des foyers et prennent peu de place ; au-delà de 25 litres, on peut réchauffer de grands plats.\n\n"
  "### Les bons récipients\nVerre, céramique ou plastique adapté : jamais de métal en mode micro-ondes.\n\n"
  "Voir aussi : " + L("Fours électriques", "fours") + " et " + L("Cuisson", "cuisson") + ".",
  "ميكروويف في المغرب – ميكروويف بالشواية", "أفران ميكروويف وميكروويف بالشواية للتسخين وإذابة الثلج والتحمير.",
  "الميكروويف يسخن الطبق في دقائق ويذيب الثلج بسرعة.\n\n"
  "### عادي أو بالشواية؟\n**الميكروويف بالشواية** يحمر الأطباق ويجعلها مقرمشة.\n\n"
  "### الأواني المناسبة\nالزجاج أو الفخار أو البلاستيك المناسب، ولا حديد في وضع الميكروويف.\n\n"
  "انظروا أيضا: " + L("الأفران الكهربائية", "fours") + ".",
  "micro-ondes Maroc, micro-ondes gril, four micro-ondes 20 litres, prix micro-ondes Maroc",
  "ميكروويف, ميكرو أوند, ميكروويف بالشواية, فرن ميكروويف, ثمن الميكروويف في المغرب")

# ── Climatisation & chauffage ──────────────────────────────────────────────
cat("climatisation", "التكييف والتدفئة",
  "Climatiseurs split Inverter réversibles, climatiseurs portables, rafraîchisseurs d'air et ventilateurs, de " + brands("climatisation", 6) + ".",
  "Climatiseur Maroc – split Inverter et climatisation", "Climatiseurs split Inverter réversibles, climatiseurs portables, rafraîchisseurs d'air et ventilateurs.",
  "Climatisation et chauffage",
  "Au Maroc, un climatiseur réversible sert toute l'année : il rafraîchit l'été et chauffe l'hiver. Ce rayon réunit aussi les " + L("chauffages électriques", "chauffage") + " et les " + L("chauffe-eau", "chauffe-eau") + ".\n\n"
  "### Quelle puissance (BTU) ?\nEn général : 9 000 BTU pour une chambre ou un bureau, 12 000 BTU pour une grande chambre ou un séjour moyen, 18 000 BTU pour un salon, 24 000 BTU pour un grand salon ou un espace ouvert. L'exposition au soleil, l'étage et l'isolation comptent aussi.\n\n"
  "### Inverter et réversible\nUn climatiseur **Inverter** ajuste sa puissance au lieu de s'arrêter et redémarrer : plus silencieux et plus économe. **Réversible** signifie froid et chaud.\n\n"
  "### Split, portable ou rafraîchisseur ?\n- **Split mural** : le plus efficace, installé par un technicien.\n- **Climatiseur portable** : sans travaux, avec une gaine d'évacuation par la fenêtre.\n- **Rafraîchisseur d'air** : rafraîchit par évaporation d'eau, sans gaz ; plus efficace en climat sec.\n- **Ventilateur** : la solution la plus économique.",
  "مكيفات الهواء في المغرب – كليماتيزور إنفرتر", "مكيفات سبليت إنفرتر بارد وساخن، مكيفات متنقلة، مبردات هواء، مراوح، مدافئ وسخانات ماء.",
  "في المغرب، المكيف البارد والساخن يستعمل طوال السنة. هذا القسم يجمع أيضا " + L("المدافئ الكهربائية", "chauffage") + " و" + L("سخانات الماء", "chauffe-eau") + ".\n\n"
  "### أي قوة (BTU)؟\nعادة: 9000 BTU لغرفة نوم أو مكتب، 12000 BTU لغرفة كبيرة أو صالون متوسط، 18000 BTU لصالون، 24000 BTU لصالون كبير.\n\n"
  "### إنفرتر وبارد وساخن\nمكيف **الإنفرتر** يعدل قوته فيكون أهدأ وأقل استهلاكا، و**البارد والساخن** يبرد ويسخن.\n\n"
  "### سبليت، متنقل أو مبرد هواء؟\n- **سبليت حائطي**: الأكثر فعالية، يركبه تقني.\n- **مكيف متنقل**: بدون أشغال.\n- **مبرد هواء**: يبرد بتبخر الماء بدون غاز.\n- **مروحة**: الحل الأرخص.",
  "climatiseur Maroc, climatiseur inverter, climatiseur réversible, climatiseur 12000 BTU, climatiseur split, climatiseur portable, prix climatiseur Maroc",
  "كليماتيزور, مكيف الهواء, مكيف إنفرتر, مكيف بارد وساخن, كليم, ثمن المكيف في المغرب")

cat("chauffage", "مدافئ",
  "Chauffages électriques d'appoint à quartz, avec ou sans rotation, de " + brands("chauffage", 4) + ".",
  "Chauffage électrique Maroc – chauffage d'appoint", "Chauffages d'appoint à quartz de 800 à 1200 W, avec rotation, télécommande ou minuterie.",
  "Chauffages électriques",
  "Un chauffage d'appoint réchauffe vite une chambre, un salon ou un bureau pendant les soirées froides de l'hiver marocain.\n\n"
  "### Quelle puissance ?\n**800 W** pour une petite pièce, **1200 W** pour une pièce plus grande. Plusieurs niveaux de puissance permettent de garder la chaleur sans consommer au maximum en permanence.\n\n"
  "### Pourquoi le quartz ?\nLes tubes à quartz chauffent dès l'allumage et la chaleur se sent tout de suite face à l'appareil, sans attendre que l'air de la pièce monte en température.\n\n"
  "### Options utiles\nRotation pour répartir la chaleur, télécommande, minuterie et arrêt automatique en cas de chute.\n\n"
  "### Sécurité\nGardez le chauffage à distance des rideaux et des couvertures, ne le couvrez jamais et éteignez-le avant de dormir.\n\n"
  "Voir aussi : " + L("Chauffe-eau", "chauffe-eau") + " et les " + L("climatiseurs réversibles", "climatisation") + ".",
  "شوفاج كهربائي في المغرب – مدافئ كوارتز", "مدافئ كهربائية كوارتز من 800 إلى 1200 واط بالدوران أو جهاز التحكم أو المؤقت.",
  "المدفأة الإضافية تدفئ بسرعة غرفة النوم أو الصالون في ليالي الشتاء الباردة.\n\n"
  "### أي قوة؟\n**800 واط** لغرفة صغيرة و**1200 واط** لغرفة أكبر، والدرجات المتعددة توفر الاستهلاك.\n\n"
  "### لماذا الكوارتز؟\nأنابيب الكوارتز تعطي الحرارة مباشرة بعد التشغيل.\n\n"
  "### السلامة\nأبعدوها عن الستائر والأغطية، لا تغطوها، وأطفئوها قبل النوم.\n\n"
  "انظروا أيضا: " + L("سخانات الماء", "chauffe-eau") + ".",
  "chauffage électrique Maroc, chauffage d'appoint, chauffage quartz, radiateur électrique, chauffage 1200W, prix chauffage électrique Maroc",
  "شوفاج كهربائي, رادياتور كهربائي, مدفأة كهربائية, شوفاج كوارتز, ثمن الشوفاج في المغرب")

cat("chauffe-eau", "سخانات الماء",
  "Chauffe-eau à gaz instantanés de 6 litres et chauffe-eau électriques de 30 à 50 litres, de " + brands("chauffe-eau", 6) + ".",
  "Chauffe-eau Maroc – chauffe-eau gaz et électrique", "Chauffe-eau à gaz instantanés 6 L/min et chauffe-eau électriques à accumulation de 30 à 50 litres.",
  "Chauffe-eau",
  "Deux grandes familles de chauffe-eau, deux usages différents.\n\n"
  "### Chauffe-eau à gaz (instantané)\nIl chauffe l'eau au moment où elle passe : pas d'attente, pas de réservoir. Un modèle de **6 litres par minute** convient en général à un point d'eau à la fois, comme une douche. Il doit être installé par un professionnel dans un local ventilé, jamais dans une salle de bain fermée.\n\n"
  "### Chauffe-eau électrique (à accumulation)\nIl chauffe et garde au chaud une réserve d'eau. **30 litres** pour une ou deux personnes, **50 litres** pour une famille de deux à quatre personnes. Il demande un temps de chauffe après une forte consommation.\n\n"
  "### Butane ou propane ?\nVérifiez le gaz compatible indiqué sur la fiche du modèle avant de commander.\n\n"
  "Voir aussi : " + L("Chauffages électriques", "chauffage") + ".",
  "سخان الماء في المغرب – شوفو الغاز والكهرباء", "سخانات ماء بالغاز فورية 6 لتر في الدقيقة، وسخانات كهربائية من 30 إلى 50 لترا.",
  "نوعان من سخانات الماء لاستعمالين مختلفين.\n\n"
  "### سخان الغاز الفوري\nيسخن الماء عند مروره بدون انتظار ولا خزان. **6 لتر في الدقيقة** تكفي عادة لنقطة ماء واحدة مثل الدوش. يركبه مختص في مكان جيد التهوية، وليس في حمام مغلق.\n\n"
  "### السخان الكهربائي\nيخزن الماء الساخن: **30 لترا** لشخص أو اثنين، و**50 لترا** لعائلة من اثنين إلى أربعة.\n\n"
  "انظروا أيضا: " + L("المدافئ الكهربائية", "chauffage") + ".",
  "chauffe-eau Maroc, chauffe-eau gaz, chauffe-eau électrique, chauffe-bain 6 litres, ballon eau chaude 50L, prix chauffe-eau Maroc",
  "شوفو, سخان الماء, شوفو الغاز, سخان الماء الكهربائي, شوفو الضو, ثمن سخان الماء في المغرب",
  verify=["Anciens titre et description arabes consacrés à la marque « MONACO », non vendue : remplacés."])

cat("tv-image", "تلفزيونات",
  "Smart TV, Google TV et téléviseurs QLED de 32 à 50 pouces, de " + brands("tv-image", 6) + ".",
  "Téléviseur Maroc – Smart TV, Google TV et QLED", "Smart TV, Google TV et téléviseurs QLED de 32 à 50 pouces, en HD, Full HD ou 4K selon les modèles.",
  "Téléviseurs et Smart TV",
  "Choisir un téléviseur, c'est d'abord choisir la taille selon la distance de visionnage.\n\n"
  "### Quelle taille ?\n- **32 pouces** : chambre, cuisine, environ 1,3 à 2 m de distance.\n- **43 pouces** : salon d'appartement ou grande chambre, 1,7 à 2,5 m.\n- **50 pouces** : salon, 2 à 3 m.\n\n"
  "### HD, Full HD ou 4K ?\nEn 32 pouces, la HD suffit à distance normale. À partir de 43 pouces, la **4K** donne une image nettement plus fine, à condition de regarder des contenus 4K.\n\n"
  "### Smart TV et Google TV\nLes applications (YouTube, Netflix…) sont intégrées ; **Google Cast** ou **AirPlay** permettent d'envoyer une vidéo depuis un téléphone quand ils sont indiqués.\n\n"
  "### Pour les consoles\nUne fréquence de **120 Hz** et l'**HDMI 2.1** rendent les jeux plus fluides sur les consoles récentes.",
  "تلفزيونات في المغرب – سمارت تي في وGoogle TV", "تلفزيونات ذكية وGoogle TV وQLED من 32 إلى 50 بوصة بدقة HD أو Full HD أو 4K.",
  "اختيار التلفاز يبدأ بالمقاس حسب مسافة المشاهدة.\n\n"
  "### أي مقاس؟\n- **32 بوصة**: غرفة النوم أو المطبخ.\n- **43 بوصة**: صالون شقة أو غرفة كبيرة.\n- **50 بوصة**: الصالون.\n\n"
  "### HD أو 4K؟\nفي 32 بوصة تكفي HD، ومن 43 بوصة تعطي **4K** صورة أدق.\n\n"
  "### تلفاز ذكي\nتطبيقات يوتيوب ونتفليكس مدمجة، وGoogle Cast أو AirPlay لإرسال الفيديو من الهاتف عندما تكون مذكورة.",
  "téléviseur Maroc, Smart TV Maroc, Google TV, TV 4K, TV QLED, TV 43 pouces, TV 50 pouces, prix TV Maroc",
  "تلفاز, تلفزة, شاشة, تلفاز ذكي, سمارت تي في, تلفاز 4K, ثمن التلفاز في المغرب",
  verify=["Deux ventilateurs (Kenz 18\", General 20\") rangés dans TV & Image : à déplacer vers Climatisation & chauffage dans l'admin."])

# ── Link fix on Petit électroménager (its title was edited by hand: left untouched) ──
cur_pe = None
P.append({"kind": "category", "slug": "petit-electromenager", "source": "categories-13", "sources": [], "specsVerified": False,
  "verify": ["Titre modifié à la main dans l'admin (« …blenders, ») : non touché."],
  "changes": {"seo": {"longDescription": None}}})  # filled below from the current text

snap = [c for c in json.load(open(os.path.join(HERE, "../../backups/seo/before-categories/categories.json"), encoding="utf-8")) if c["slug"] == "petit-electromenager"][0]
fixed = snap["seo"]["longDescription"].replace("(/categorie/climatisation-chauffage)", "(/categorie/climatisation)")
assert fixed != snap["seo"]["longDescription"], "link already fixed?"
P[-1]["changes"]["seo"]["longDescription"] = fixed
assert len([e for e in P if e["slug"] != "petit-electromenager"]) == 13
json.dump(P, open(os.path.join(HERE, "categories-13.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(P), "entries")
