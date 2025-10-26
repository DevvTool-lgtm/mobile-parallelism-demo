import type { ExpoConfig } from 'expo/config';

const parseList = (val?: string) =>
  (val || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

export default ({ config }: { config: ExpoConfig }) => {
  const supabaseUrl = process.env.SUPABASE_URL || (config.extra as any)?.supabaseUrl || '';
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || (config.extra as any)?.supabaseAnonKey || '';
  const adminEmailsEnv = parseList(process.env.ADMIN_EMAILS);
  const adminEmailsCfg = ((config.extra as any)?.adminEmails as string[]) || [];

  const brand = {
    name: process.env.BRAND_NAME || (config.extra as any)?.brand?.name || 'Your Brand',
    primary: process.env.BRAND_PRIMARY || (config.extra as any)?.brand?.primary || '',
    accent: process.env.BRAND_ACCENT || (config.extra as any)?.brand?.accent || '',
    logoUrl: process.env.BRAND_LOGO_URL || (config.extra as any)?.brand?.logoUrl || '',
  };

  return {
    ...config,
    extra: {
      ...(config.extra || {}),
      supabaseUrl,
      supabaseAnonKey,
      adminEmails: adminEmailsEnv.length ? adminEmailsEnv : adminEmailsCfg,
      brand,
    },
  } as ExpoConfig;
};