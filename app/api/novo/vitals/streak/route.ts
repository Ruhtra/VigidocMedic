import { getAuthContext } from "@/lib/casl/utils/getUserPermission";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/novo/vitals/streak:
 *   get:
 *     summary: Retrieve user's health streak
 *     description: Gets the user's current streak and a 7-day history of their vital sign measurements.
 *     tags: [Vitals]
 *     responses:
 *       200:
 *         description: Streak data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 currentStreak:
 *                   type: integer
 *                   description: The current consecutive days of active measurements.
 *                 history:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       label: { type: string, description: "Short name of the day (e.g., Seg, Ter)" }
 *                       date: { type: string, format: date, description: "YYYY-MM-DD" }
 *                       count: { type: integer, description: "Number of measurements on this day" }
 *                       status: { type: string, enum: ['done', 'pending', 'empty'] }
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Internal server error
 */
export async function GET(req: Request) {
  const authContext = await getAuthContext();

  if (!authContext) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { user } = authContext;

  try {
    const userDb = await prisma.user.findUnique({
      where: { id: user.id },
      select: { currentStreak: true },
    });

    if (!userDb) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    const MIN_MEASUREMENTS_PER_DAY = 4;

    // Build the last 7 days array
    const history = [];
    const now = new Date();
    
    // We want to fetch records from 6 days ago up to now (7 days total including today)
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    
    const records = await prisma.vitalRecord.findMany({
      where: {
        userId: user.id,
        recordedAt: {
          gte: startDate,
        },
      },
      select: {
        recordedAt: true,
      },
    });

    const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);

      // Count records for this specific day
      const count = records.filter(
        (r) => r.recordedAt >= startOfDay && r.recordedAt < endOfDay
      ).length;

      const isToday = i === 0;
      let status: "done" | "pending" | "empty" = "empty";

      if (count >= MIN_MEASUREMENTS_PER_DAY) {
        status = "done";
      } else if (isToday) {
        status = "pending";
      } else {
        // past day with less than minimum
        status = count > 0 ? "empty" : "empty"; 
        // We can decide how 'empty' vs 'pending' is handled for past days,
        // UI treats 'empty' as greyed out / not done. 
      }

      history.push({
        label: daysOfWeek[targetDate.getDay()],
        date: targetDate.toISOString().split("T")[0],
        count,
        status,
      });
    }

    return NextResponse.json(
      {
        message: "Ofensiva recuperada com sucesso.",
        data: {
          currentStreak: userDb.currentStreak || 0,
          history,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/novo/vitals/streak] Error:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar ofensiva." },
      { status: 500 }
    );
  }
}
