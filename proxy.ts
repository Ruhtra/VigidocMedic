import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  adminRoutes,
  doctorRoutes,
  apiAuthPrefix,
  authRoutes,
  DEFAULT_LOGIN_REDIRECT,
  userRoutes,
} from "./routes";

export async function proxy(request: NextRequest) {
  // Try to get session from headers for the edge/proxy
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Extract the role safely if the session exists
  const role = session?.user?.role;
  const userId = session?.user?.id;

  const { nextUrl } = request;
  const isLoggedIn = !!session;
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // Basic substring matches for nested routes
  const isAdminRoute = adminRoutes.some((route) =>
    nextUrl.pathname.startsWith(route),
  );
  const isDoctorRoute = doctorRoutes.some((route) =>
    nextUrl.pathname.startsWith(route),
  );
  const isUserRoute = userRoutes.some((route) =>
    nextUrl.pathname.startsWith(route),
  );

  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      const redirectPath = role
        ? DEFAULT_LOGIN_REDIRECT[role] || "/user"
        : "/user";
      return NextResponse.redirect(new URL(redirectPath, nextUrl));
    }
    return NextResponse.next();
  }

  // Se o usuário está PENDING, o acesso é restrito à página de pending e logout
  const status = session?.user?.status as
    | "PENDING"
    | "ACTIVE"
    | "BLOCKED"
    | undefined;
  const isPendingRoute = nextUrl.pathname === "/pending";

  if (isPendingRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (
    isLoggedIn &&
    status === "PENDING" &&
    !isPendingRoute &&
    nextUrl.pathname !== "/logout"
  ) {
    // Permite que eles fiquem nas rotas de auth para não criar loop infinito ou saírem
    if (!isAuthRoute && !isApiAuthRoute) {
      return NextResponse.redirect(new URL("/pending", nextUrl));
    }
  }

  if (isDoctorRoute && role !== "doctor") {
    return NextResponse.redirect(new URL("/not-found", nextUrl));
  }

  if (isUserRoute && role !== "user") {
    return NextResponse.redirect(new URL("/not-found", nextUrl));
  }

  // Pass session data to headers to avoid redundant auth hits in routes
  const requestHeaders = new Headers(request.headers);
  if (userId) requestHeaders.set("x-user-id", userId);
  if (role) requestHeaders.set("x-user-role", role);
  if (status) requestHeaders.set("x-user-status", status);

  // If role is medic/user (or whichever role handles patients) and we can find a doctor profile, inject it
  // This is a candidate for caching in a real production env

  if (userId && role != "user") {
    const { prisma } = await import("@/lib/prisma");
    const doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: userId },
      select: { id: true },
    });

    if (doctorProfile) {
      requestHeaders.set("x-doctor-id", doctorProfile.id);
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
