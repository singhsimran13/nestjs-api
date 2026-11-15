export const EnvKeys = {
  JWT_SECRET: 'JWT_SECRET',
  DATABASE_URL: 'DATABASE_URL',
};

export type EnvKeys = keyof typeof EnvKeys;
