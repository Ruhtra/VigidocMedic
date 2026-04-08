import { auth } from "@/lib/auth";

/**
 * @swagger
 * /api/auth/sign-in/email:
 *   post:
 *     summary: Sign in with Email
 *     description: Authenticate a user using their email and password.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "user@example.com" }
 *               password: { type: string, example: "password123" }
 *     responses:
 *       200:
 *         description: Signed in successfully
 *       401:
 *         description: Invalid credentials
 * 
 * /api/auth/sign-up/email:
 *   post:
 *     summary: Sign up with Email
 *     description: Create a new user account using email and password.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               name: { type: string }
 *     responses:
 *       200:
 *         description: User created successfully
 * 
 * /api/auth/sign-out:
 *   post:
 *     summary: Sign Out
 *     description: Terminate the current session.
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Signed out successfully
 * 
 * /api/auth/get-session:
 *   get:
 *     summary: Get Session
 *     description: Retrieve the current session and user information.
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Session details
 */
export const GET = auth.handler;
export const POST = auth.handler;
