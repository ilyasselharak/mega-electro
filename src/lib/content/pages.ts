export type StaticPage = { title: string; description: string; sections: { heading?: string; body: string[] }[] };

/** Editorial pages. Placeholders marked [À COMPLÉTER] must be reviewed before launch. */
export const STATIC_PAGES: Record<string, StaticPage> = {
  "a-propos": {
    title: "À propos de Mega Electro",
    description: "Mega Electro, boutique marocaine d'électroménager : notre mission, nos engagements et notre service.",
    sections: [
      {
        body: [
          "Mega Electro — « la belle maison » — est une enseigne marocaine spécialisée dans l'électroménager et l'équipement de la maison. Notre mission : rendre les meilleurs appareils accessibles à toutes les familles du Maroc, avec un service simple, honnête et proche de vous.",
        ],
      },
      {
        heading: "Nos engagements",
        body: [
          "Des produits neufs, d'origine et couverts par la garantie constructeur.",
          "Des prix transparents, affichés TTC en dirhams.",
          "La livraison partout au Maroc et le paiement à la livraison.",
          "Un service client joignable par téléphone et WhatsApp, avant et après l'achat.",
        ],
      },
    ],
  },
  "livraison-retours": {
    title: "Livraison & retours",
    description: "Délais et frais de livraison au Maroc, paiement à la livraison, retours et garantie chez Mega Electro.",
    sections: [
      {
        heading: "Livraison",
        body: [
          "Nous livrons dans toutes les villes du Maroc. Comptez 24 à 48 h pour Casablanca, Rabat et les grandes villes, et 48 à 72 h pour les autres villes.",
          "Les frais de livraison sont affichés dans le panier ; la livraison est offerte au-delà du seuil indiqué sur le site.",
          "Après votre commande, un conseiller vous appelle pour confirmer l'adresse et le créneau de livraison.",
        ],
      },
      {
        heading: "Paiement",
        body: ["Le paiement s'effectue en espèces à la livraison. Vérifiez votre colis en présence du livreur avant de payer."],
      },
      {
        heading: "Retours",
        body: [
          "Vous disposez de 7 jours après réception pour nous signaler un produit endommagé ou non conforme. Le produit doit être retourné dans son emballage d'origine, complet et non utilisé.",
          "[À COMPLÉTER] Précisez ici les conditions exactes de retour et de remboursement.",
        ],
      },
      {
        heading: "Garantie",
        body: ["Tous nos produits bénéficient de la garantie constructeur dont la durée est indiquée sur chaque fiche produit."],
      },
    ],
  },
  contact: {
    title: "Contactez-nous",
    description: "Contactez le service client Mega Electro par téléphone, WhatsApp ou email.",
    sections: [
      {
        body: [
          "Notre équipe est disponible du lundi au samedi, de 9 h à 19 h, pour vous conseiller et suivre vos commandes.",
          "Les coordonnées (téléphone, WhatsApp, email et adresse) sont indiquées ci-dessous et en bas de chaque page.",
        ],
      },
    ],
  },
  "conditions-generales": {
    title: "Conditions générales de vente",
    description: "Conditions générales de vente de la boutique en ligne Mega Electro.",
    sections: [
      { heading: "1. Objet", body: ["Les présentes conditions régissent les ventes conclues sur le site Mega Electro entre la société [À COMPLÉTER : raison sociale, RC, ICE, adresse] et toute personne effectuant un achat."] },
      { heading: "2. Prix", body: ["Les prix sont indiqués en dirhams marocains toutes taxes comprises. Les frais de livraison sont précisés avant la validation de la commande."] },
      { heading: "3. Commande", body: ["La commande est confirmée par téléphone par notre service client. Mega Electro se réserve le droit d'annuler toute commande en cas d'indisponibilité ou d'informations erronées."] },
      { heading: "4. Paiement", body: ["Le paiement s'effectue en espèces à la livraison."] },
      { heading: "5. Livraison et retours", body: ["Voir la page Livraison & retours."] },
      { heading: "6. Droit applicable", body: ["Les présentes conditions sont soumises au droit marocain, notamment la loi n° 31-08 édictant des mesures de protection du consommateur."] },
    ],
  },
  confidentialite: {
    title: "Politique de confidentialité",
    description: "Comment Mega Electro collecte et protège vos données personnelles.",
    sections: [
      {
        body: [
          "Les données collectées lors de votre commande (nom, téléphone, adresse, email) sont utilisées uniquement pour traiter et livrer votre commande et assurer le service après-vente.",
          "Conformément à la loi n° 09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel, vous disposez d'un droit d'accès, de rectification et d'opposition. [À COMPLÉTER : n° de déclaration CNDP].",
          "Vos données ne sont jamais vendues à des tiers.",
        ],
      },
    ],
  },
};

/**
 * Arabic versions (faithful translations of the French pages above). Placeholders are kept as
 * "[يُستكمل]" and must be completed with the French ones. Legal pages should be reviewed by a lawyer.
 */
export const STATIC_PAGES_AR: Record<keyof typeof STATIC_PAGES, StaticPage> = {
  "a-propos": {
    title: "من نحن — ميغا إلكترو",
    description: "ميغا إلكترو، متجر مغربي للأجهزة المنزلية: مهمتنا والتزاماتنا وخدمتنا.",
    sections: [
      {
        body: [
          "ميغا إلكترو علامة مغربية متخصصة في الأجهزة المنزلية وتجهيز البيت. مهمتنا: أن نجعل أفضل الأجهزة في متناول جميع الأسر المغربية، بخدمة بسيطة وصادقة وقريبة منكم.",
        ],
      },
      {
        heading: "التزاماتنا",
        body: [
          "منتجات جديدة وأصلية ومشمولة بضمان الشركة المصنعة.",
          "أسعار واضحة، معروضة بالدرهم وشاملة للضرائب.",
          "التوصيل لجميع مدن المغرب والدفع عند الاستلام.",
          "خدمة عملاء متاحة عبر الهاتف وواتساب، قبل الشراء وبعده.",
        ],
      },
    ],
  },
  "livraison-retours": {
    title: "التوصيل والإرجاع",
    description: "آجال ومصاريف التوصيل في المغرب، الدفع عند الاستلام، الإرجاع والضمان لدى ميغا إلكترو.",
    sections: [
      {
        heading: "التوصيل",
        body: [
          "نوصل إلى جميع مدن المغرب. احتسبوا من 24 إلى 48 ساعة للدار البيضاء والرباط والمدن الكبرى، ومن 48 إلى 72 ساعة لباقي المدن.",
          "تظهر مصاريف التوصيل في السلة؛ والتوصيل مجاني ابتداءً من المبلغ المحدد على الموقع.",
          "بعد طلبكم، يتصل بكم أحد مستشارينا لتأكيد العنوان وموعد التوصيل.",
        ],
      },
      {
        heading: "الدفع",
        body: ["يتم الدفع نقداً عند الاستلام. تحققوا من طردكم بحضور موظف التوصيل قبل الدفع."],
      },
      {
        heading: "الإرجاع",
        body: [
          "لديكم 7 أيام بعد الاستلام لإبلاغنا بمنتج متضرر أو غير مطابق. يجب إرجاع المنتج في علبته الأصلية، كاملاً وغير مستعمل.",
          "[يُستكمل] حدّدوا هنا الشروط الدقيقة للإرجاع واسترداد المبلغ.",
        ],
      },
      {
        heading: "الضمان",
        body: ["تستفيد جميع منتجاتنا من ضمان الشركة المصنعة، وتُذكر مدته في صفحة كل منتج."],
      },
    ],
  },
  contact: {
    title: "اتصلوا بنا",
    description: "تواصلوا مع خدمة عملاء ميغا إلكترو عبر الهاتف أو واتساب أو البريد الإلكتروني.",
    sections: [
      {
        body: [
          "فريقنا متاح من الاثنين إلى السبت، من 9 صباحاً إلى 7 مساءً، لتقديم النصيحة وتتبع طلباتكم.",
          "معلومات الاتصال (الهاتف، واتساب، البريد الإلكتروني والعنوان) مذكورة أدناه وفي أسفل كل صفحة.",
        ],
      },
    ],
  },
  "conditions-generales": {
    title: "الشروط العامة للبيع",
    description: "الشروط العامة للبيع في متجر ميغا إلكترو الإلكتروني.",
    sections: [
      { heading: "1. الموضوع", body: ["تنظم هذه الشروط عمليات البيع المبرمة على موقع ميغا إلكترو بين شركة [يُستكمل: الاسم التجاري، رقم السجل التجاري، المعرف الموحد للمقاولة، العنوان] وكل شخص يقوم بعملية شراء."] },
      { heading: "2. الأسعار", body: ["الأسعار معروضة بالدرهم المغربي شاملة لجميع الضرائب. تُحدَّد مصاريف التوصيل قبل تأكيد الطلب."] },
      { heading: "3. الطلب", body: ["تؤكد خدمة العملاء الطلب عبر الهاتف. تحتفظ ميغا إلكترو بحق إلغاء أي طلب في حالة عدم توفر المنتج أو عدم صحة المعلومات."] },
      { heading: "4. الدفع", body: ["يتم الدفع نقداً عند الاستلام."] },
      { heading: "5. التوصيل والإرجاع", body: ["انظروا صفحة التوصيل والإرجاع."] },
      { heading: "6. القانون المطبق", body: ["تخضع هذه الشروط للقانون المغربي، ولا سيما القانون رقم 31.08 القاضي بتحديد تدابير لحماية المستهلك."] },
    ],
  },
  confidentialite: {
    title: "سياسة الخصوصية",
    description: "كيف تجمع ميغا إلكترو بياناتكم الشخصية وتحميها.",
    sections: [
      {
        body: [
          "تُستعمل البيانات المجمّعة أثناء طلبكم (الاسم، الهاتف، العنوان، البريد الإلكتروني) فقط لمعالجة طلبكم وتوصيله وضمان خدمة ما بعد البيع.",
          "طبقاً للقانون رقم 09.08 المتعلق بحماية الأشخاص الذاتيين تجاه معالجة المعطيات ذات الطابع الشخصي، لكم حق الولوج والتصحيح والتعرض. [يُستكمل: رقم التصريح لدى اللجنة الوطنية لمراقبة حماية المعطيات ذات الطابع الشخصي].",
          "لا تُباع بياناتكم أبداً لأي طرف ثالث.",
        ],
      },
    ],
  },
};
