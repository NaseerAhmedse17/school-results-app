import { ResultsPageClient } from "@/components/ResultsPageClient";
import type { ResultListItem } from "@/lib/results/contracts";
import { listResultsAsListItems } from "@/lib/results/resultService";

export const dynamic = "force-dynamic";

export default async function Home() {
  let initialError: string | null = null;
  let initialResults: ResultListItem[] = [];

  try {
    initialResults = await listResultsAsListItems();
  } catch (e) {
    initialError =
      e instanceof Error
        ? e.message
        : "Failed to load results from the database. Check your MongoDB configuration.";
  }

  return <ResultsPageClient initialResults={initialResults} initialError={initialError} />;
}
