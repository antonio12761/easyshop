// packages/shared/lib/create-post-handler.ts

export type ServerHandler<TInput = unknown, TResult = unknown> = (
  input: TInput
) => Promise<TResult>;

export async function handlePostRequest<TInput = unknown, TResult = unknown>(
  reqBody: unknown,
  handler: ServerHandler<TInput, TResult>
): Promise<Response> {
  try {
    const data = reqBody as TInput;
    const result = await handler(data);
    return Response.json(result);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("[SERVER ACTION ERROR]", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message ?? "Errore server",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
