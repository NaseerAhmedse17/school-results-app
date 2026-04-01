import { NextResponse } from "next/server";

export type ApiError = {
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string>;
  };
};

export function badRequest(code: string, message: string, fieldErrors?: Record<string, string>) {
  const body: ApiError = { error: { code, message, fieldErrors } };
  return NextResponse.json(body, { status: 400 });
}

export function notFound(message = "Not found.") {
  const body: ApiError = { error: { code: "NOT_FOUND", message } };
  return NextResponse.json(body, { status: 404 });
}

export function serverError(message = "Unexpected error.") {
  const body: ApiError = { error: { code: "SERVER_ERROR", message } };
  return NextResponse.json(body, { status: 500 });
}

