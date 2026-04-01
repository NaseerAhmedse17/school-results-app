import { NextRequest, NextResponse } from "next/server";
import { badRequest, serverError } from "@/lib/api/errors";
import { createResult, deleteManyResults } from "@/lib/results/resultRepository";
import { listResultsAsListItems, toListItem } from "@/lib/results/resultService";
import { validateResultInput } from "@/lib/results/resultValidation";

export const runtime = "nodejs";

export async function GET() {
  try {
    const results = await listResultsAsListItems();
    return NextResponse.json({ results });
  } catch (e) {
    return serverError(e instanceof Error ? e.message : "Failed to list results.");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as unknown;
    const validated = validateResultInput(body);
    if (!validated.ok) {
      return badRequest("VALIDATION_ERROR", validated.message, validated.fieldErrors);
    }

    const created = await createResult(validated.value);
    return NextResponse.json({ result: toListItem(created) }, { status: 201 });
  } catch (e) {
    return serverError(e instanceof Error ? e.message : "Failed to create result.");
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = (await req.json()) as unknown;
    if (!body || typeof body !== "object" || !("ids" in body)) {
      return badRequest("VALIDATION_ERROR", "ids is required.");
    }
    const ids = (body as { ids: unknown }).ids;
    if (!Array.isArray(ids) || ids.length === 0 || !ids.every((x) => typeof x === "string" && x)) {
      return badRequest("VALIDATION_ERROR", "ids must be a non-empty array of strings.");
    }

    const res = await deleteManyResults(ids);
    return NextResponse.json({ deletedCount: res.deletedCount });
  } catch (e) {
    return serverError(e instanceof Error ? e.message : "Failed to delete results.");
  }
}

