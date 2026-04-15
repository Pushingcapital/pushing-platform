export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  return Response.json(
    {
      ok: false,
      message:
        "Stripe webhook endpoint scaffolded. Add signature verification and event handlers before production.",
      hasSignature: Boolean(signature),
    },
    { status: 501 },
  );
}
