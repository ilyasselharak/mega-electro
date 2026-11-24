/** Replaces {placeholders}: fmt("Dès {amount}", { amount: "1 000 DH" }). */
export function fmt(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{${k}}`));
}

/**
 * Plural forms separated by "|", in Intl.PluralRules order for the locale:
 * fr → "one|other" ; ar → "zero|one|two|few|many|other".
 * plural("ar", 3, "…|منتج واحد|منتجان|{count} منتجات|{count} منتجاً|{count} منتج") → "3 منتجات".
 */
const ORDER: Record<string, string[]> = { fr: ["one", "other"], ar: ["zero", "one", "two", "few", "many", "other"] };
const rules: Record<string, Intl.PluralRules> = {};

export function plural(locale: "fr" | "ar", n: number, template: string, vars: Record<string, string | number> = {}) {
  const forms = template.split("|");
  const cat = (rules[locale] ??= new Intl.PluralRules(locale)).select(n);
  const i = ORDER[locale].indexOf(cat);
  return fmt(forms[i] ?? forms[forms.length - 1], { count: n, n, ...vars });
}
