/** Shape of error JSON returned by this app’s API routes (client-side). */
export type ClientApiErrorBody = {
  error: {
    message: string;
    fieldErrors?: Record<string, string>;
  };
};
