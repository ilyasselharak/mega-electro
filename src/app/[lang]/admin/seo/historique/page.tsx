import { TriangleAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { isAdmin, requireStaffPage } from "@/lib/session";
import { getSeoHistory } from "@/server/queries/seo";
import { RollbackButton } from "./rollback-button";

export const metadata = { title: "Historique SEO" };

const fmtDate = (ms: number) => new Intl.DateTimeFormat("fr-MA", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Casablanca" }).format(ms);
const show = (v: unknown) => (v == null ? "—" : typeof v === "string" ? v : JSON.stringify(v));

export default async function SeoHistoryPage() {
  const user = await requireStaffPage();
  const { available, batches } = await getSeoHistory();
  return (
    <div className="space-y-4">
      <p className="max-w-3xl text-sm text-muted-foreground">
        Mises à jour groupées du référencement (script <code className="rounded bg-muted px-1">scripts/seo/apply.mjs</code>). Chaque champ modifié est enregistré avec sa valeur précédente.
        L&apos;annulation ne restaure que les champs qui n&apos;ont pas été modifiés depuis.
      </p>
      {!available ? (
        <div className="flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>L&apos;historique sera disponible après le déploiement des fonctions Convex (module seoBulk).</p>
        </div>
      ) : !batches.length ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Aucune mise à jour groupée pour le moment.</p>
      ) : (
        batches.map((b) => (
          <Card key={b.batchId} className="gap-0 py-0">
            <CardContent className="space-y-3 p-4">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <p className="font-semibold">{b.batchId}</p>
                <p className="text-sm text-muted-foreground">{fmtDate(b.appliedAt)}</p>
                <p className="text-sm">{b.entities} élément(s), {b.fields} champ(s)</p>
                {b.rolledBack ? <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{b.rolledBack === b.fields ? "Annulé" : `${b.rolledBack} champ(s) annulé(s)`}</span> : null}
                <div className="ms-auto">{isAdmin(user) && b.rolledBack < b.fields ? <RollbackButton batchId={b.batchId} /> : null}</div>
              </div>
              <details>
                <summary className="cursor-pointer text-sm font-medium">Voir les modifications</summary>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-xs">
                    <thead className="text-muted-foreground">
                      <tr><th className="py-1.5 pe-3">Élément</th><th className="py-1.5 pe-3">Champ</th><th className="py-1.5 pe-3">Avant</th><th className="py-1.5">Après</th></tr>
                    </thead>
                    <tbody className="divide-y">
                      {b.changes.map((c) => (
                        <tr key={c.id} className={c.rolledBackAt ? "opacity-50" : undefined}>
                          <td className="py-1.5 pe-3 align-top">{c.slug}</td>
                          <td className="py-1.5 pe-3 align-top font-mono">{c.field}</td>
                          <td className="max-w-72 py-1.5 pe-3 align-top"><span className="line-clamp-3">{show(c.before)}</span></td>
                          <td className="max-w-72 py-1.5 align-top"><span className="line-clamp-3">{show(c.after)}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
