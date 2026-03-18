import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { defineAbilityFor } from "../abilities";
import { User } from "../types";
import { userSchema, UserSubject } from "../subjects/UserSubject";

export async function getAuthContext() {
  const head = await headers();
  const headerUserId = head.get("x-user-id");
  const headerUserRole = head.get("x-user-role");
  const headerDoctorId = head.get("x-doctor-id");

  let userContext: { id: string; role: string; doctorId?: string } | null =
    null;

  if (headerUserId && headerUserRole && headerDoctorId) {
    userContext = {
      id: headerUserId,
      role: headerUserRole,
      doctorId: headerDoctorId,
    };
  } else {
    const session = await auth.api.getSession({ headers: head });
    if (session) {
      userContext = {
        id: session.user.id,
        // @ts-ignore
        role: session.user.role || "user",
        // @ts-ignore
        doctorId: session.user.doctorId,
      };
    }
  }

  if (!userContext) return null;

  const ability = defineAbilityFor({
    id: userContext.id,
    role: userContext.role,
  } as User);

  return {
    user: userContext,
    ability,
    can: ability.can.bind(ability),
    cannot: ability.cannot.bind(ability),
  };
}

export const getUserPermission = (userId: string, role: string) => {
  const user: Partial<User> = {
    id: userId,
    role: role,
  };
  const ability = defineAbilityFor(user as User);
  return ability;
};

export const getUserPermision = getUserPermission;

export const mapUserToAuth = (user: UserSubject): UserSubject => {
  return userSchema.parse({ kind: user.kind, id: user.id });
};
