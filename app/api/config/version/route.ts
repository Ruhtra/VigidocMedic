import { NextResponse } from 'next/server';

/**
 * Rota de configuração de versão do VigiDoc.
 * Controle manual via constante conforme solicitado.
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
