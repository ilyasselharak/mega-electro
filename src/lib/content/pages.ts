/**
 * `title` is the H1 and breadcrumb; `metaTitle` (optional) is the <title>. Body text may use
 * {shippingFee} and {freeShippingThreshold}, filled from Paramètres → Boutique so amounts never go stale.
 */
export type StaticPage = { title: string; metaTitle?: string; description: string; sections: { heading?: string; body: string[] }[] };

/** Editorial pages. Placeholders marked [À COMPLÉTER] must be reviewed before launch. */
export const STATIC_PAGES: Record<string, StaticPage> = {
  "a-propos": {
    title: "À propos de Mega Electro",
    description: "Mega Electro, boutique marocaine d'électroménager : notre mission, nos engagements et notre service.",
    sections: [
      {
        body: [
          "Mega Electro — « la belle maison » — est une enseigne marocaine spécialisée dans l'électroménager et l'équipement de la maison. Notre mission : rendre un large choix d'appareils accessible à toutes les familles du Maroc, avec un service simple, honnête et proche de vous.",
        ],
      },
      {
        heading: "Nos engagements",
        body: [
          "Des produits neufs, avec la durée de garantie indiquée sur la fiche lorsqu'elle est connue.",
          "Des prix transparents, affichés TTC en dirhams.",
          "La livraison partout au Maroc et le paiement à la livraison.",
          "Un service client joignable par téléphone et WhatsApp, avant et après l'achat.",
        ],
      },
    ],
  },
  "livraison-retours": {
    title: "Livraison & retours",
    metaTitle: "Livraison au Maroc, paiement et retours",
    description: "Livraison dans toutes les villes du Maroc en 24 à 72 h, paiement en espèces à la livraison, retours sous 7 jours et garantie : nos conditions.",
    sections: [
      {
        heading: "Livraison",
        body: [
          "Nous livrons dans toutes les villes du Maroc. Comptez 24 à 48 h pour Casablanca, Rabat et les grandes villes, et 48 à 72 h pour les autres villes.",
          "Les frais de livraison sont de {shippingFee}, et la livraison est offerte dès {freeShippingThreshold} d'achat. Le montant exact est affiché dans le panier avant la validation de votre commande.",
          "Après votre commande, un conseiller vous appelle pour confirmer l'adresse et le créneau de livraison.",
        ],
      },
      {
        heading: "Paiement",
        body: ["Le paiement s'effectue en espèces à la livraison. Vérifiez votre colis en présence du livreur avant de payer."],
      },
      {
        heading: "Retours et échanges",
        body: [
          "Vous disposez de 7 jours après réception pour nous retourner un produit : s'il est endommagé, s'il ne correspond pas à votre commande, ou si vous avez simplement changé d'avis.",
          "Le produit doit être retourné non utilisé, dans son emballage d'origine et complet (accessoires et notices compris). Les frais de retour sont à la charge du client.",
          "Pour faire un retour, contactez notre service client par téléphone ou WhatsApp en indiquant votre numéro de commande. Une fois le produit reçu et vérifié, nous l'échangeons contre le même article ou un article équivalent. Les retours ne donnent pas lieu à un remboursement en argent.",
        ],
      },
      {
        heading: "Garantie",
        body: ["La durée de garantie est indiquée sur la fiche de chaque produit lorsqu'elle est connue. Si elle n'y figure pas, demandez-la à notre équipe avant de commander."],
      },
      {
        heading: "Service client",
        body: ["Notre équipe vous répond du lundi au samedi, de 9 h à 19 h, par téléphone et WhatsApp, pour suivre une livraison, organiser un retour ou poser une question sur un produit."],
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
          "ميغا إلكترو علامة مغربية متخصصة في الأجهزة المنزلية وتجهيز البيت. مهمتنا: أن نضع تشكيلة واسعة من الأجهزة في متناول جميع الأسر المغربية، بخدمة بسيطة وصادقة وقريبة منكم.",
        ],
      },
      {
        heading: "التزاماتنا",
        body: [
          "منتجات جديدة، مع ذكر مدة الضمان في صفحة المنتج عندما تكون معروفة.",
          "أسعار واضحة، معروضة بالدرهم وشاملة للضرائب.",
          "التوصيل لجميع مدن المغرب والدفع عند الاستلام.",
          "خدمة عملاء متاحة عبر الهاتف وواتساب، قبل الشراء وبعده.",
        ],
      },
    ],
  },
  "livraison-retours": {
    title: "التوصيل والإرجاع",
    metaTitle: "التوصيل في المغرب، الدفع والإرجاع",
    description: "التوصيل لجميع مدن المغرب في 24 إلى 72 ساعة، الدفع نقداً عند الاستلام، الإرجاع خلال 7 أيام والضمان: تعرّفوا على شروطنا.",
    sections: [
      {
        heading: "التوصيل",
        body: [
          "نوصل إلى جميع مدن المغرب. احتسبوا من 24 إلى 48 ساعة للدار البيضاء والرباط والمدن الكبرى، ومن 48 إلى 72 ساعة لباقي المدن.",
          "مصاريف التوصيل {shippingFee}، والتوصيل مجاني ابتداءً من {freeShippingThreshold} من المشتريات. يظهر المبلغ الدقيق في السلة قبل تأكيد طلبكم.",
          "بعد طلبكم، يتصل بكم أحد مستشارينا لتأكيد العنوان وموعد التوصيل.",
        ],
      },
      {
        heading: "الدفع",
        body: ["يتم الدفع نقداً عند الاستلام. تحققوا من طردكم بحضور موظف التوصيل قبل الدفع."],
      },
      {
        heading: "الإرجاع والاستبدال",
        body: [
          "لديكم 7 أيام بعد الاستلام لإرجاع منتج: إذا كان متضرراً، أو غير مطابق لطلبكم، أو إذا غيّرتم رأيكم ببساطة.",
          "يجب إرجاع المنتج غير مستعمل، في علبته الأصلية وكاملاً (مع الملحقات ودليل الاستعمال). مصاريف الإرجاع على عاتق الزبون.",
          "للقيام بالإرجاع، اتصلوا بخدمة العملاء عبر الهاتف أو واتساب مع ذكر رقم الطلب. بعد استلام المنتج والتحقق منه، نستبدله بنفس المنتج أو بمنتج مماثل. لا يترتب عن الإرجاع استرداد المبلغ نقداً.",
        ],
      },
      {
        heading: "الضمان",
        body: ["تُذكر مدة الضمان في صفحة كل منتج عندما تكون معروفة. إذا لم تكن مذكورة، اسألوا فريقنا عنها قبل الطلب."],
      },
      {
        heading: "خدمة العملاء",
        body: ["يجيبكم فريقنا من الاثنين إلى السبت، من 9 صباحاً إلى 7 مساءً، عبر الهاتف وواتساب، لتتبع التوصيل أو ترتيب إرجاع أو الاستفسار عن منتج."],
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
