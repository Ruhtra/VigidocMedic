import { getAuthContext } from "@/lib/casl/utils/getUserPermission";
import { NextResponse } from "next/server";

export async function GET() {
  const authContext = await getAuthContext();

  if (!authContext) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { user, cannot } = authContext;

  if (
    cannot("get", {
      kind: "User",
      id: user.id,
    })
  ) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  return NextResponse.json(user);
}
