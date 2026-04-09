import { PrismaClient } from '../generated';

const prisma = new PrismaClient();

async function checkToken(token: string) {
  console.log(`Checking token: ${token}`);
  const sessions = await prisma.session.findMany({
    where: {
      OR: [
        { token: token },
        { id: token }
      ]
    },
    include: {
      user: true
    }
  });

  if (sessions.length === 0) {
    console.log("No session found with this token/id.");
    // Check all sessions to see what's there
    const allSessions = await prisma.session.findMany({ take: 5 });
    console.log("Recent sessions in DB:", JSON.stringify(allSessions, null, 2));
  } else {
    console.log("Session(s) found:", JSON.stringify(sessions, null, 2));
  }
}

const token = process.argv[2];
if (!token) {
  console.log("Please provide a token.");
} else {
  checkToken(token).finally(() => prisma.$disconnect());
}
