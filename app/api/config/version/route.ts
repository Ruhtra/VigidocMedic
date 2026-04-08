import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/config/version:
 *   get:
 *     summary: Get application version configuration
 *     description: Returns the latest and minimum required versions for the mobile application to enforce updates.
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Version configuration retrieved successfully
 */
export async function GET() {
  const config = {
    latest_version: '1.0.0',
    min_version: '1.0.0', // Versão mínima obrigatória para uso
    store_url: 'https://play.google.com/store/apps/details?id=com.vigidoc.app', // Link da Play Store
    force_update: true,
  };

  return NextResponse.json(config);
}
