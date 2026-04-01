import { NextRequest, NextResponse } from "next/server";
import { badRequest, notFound, serverError } from "@/lib/api/errors";
import { updateResult } from "@/lib/results/resultRepository";
import { toListItem } from "@/lib/results/resultService";
import { validateResultInput } from "@/lib/results/resultValidation";

export const runtime = "nodejs";

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    if (!id) return badRequest("VALIDATION_ERROR", "id is required.");

    const body = (await req.json()) as unknown;
    const validated = validateResultInput(body);
    if (!validated.ok) {
      return badRequest("VALIDATION_ERROR", validated.message, validated.fieldErrors);
    }

    const updated = await updateResult(id, validated.value);
    if (!updated) return notFound("Result not found.");

    return NextResponse.json({ result: toListItem(updated) });
  } catch (e) {
    return serverError(e instanceof Error ? e.message : "Failed to update result.");
  }
}

