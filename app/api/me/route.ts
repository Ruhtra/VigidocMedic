import { getAuthContext } from "@/lib/casl/utils/getUserPermission";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/me:
 *   get:
 *     summary: Get current authenticated user details
 *     description: Returns the profile information of the currently logged-in user.
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
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
