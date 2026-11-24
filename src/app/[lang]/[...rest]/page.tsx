import { notFound } from "next/navigation";

// Any unmatched URL renders the localized not-found page (with the store layout's 404 status).
export default function CatchAll() {
  notFound();
}
