export const AUTH_CONSTANTS = {
  JWT_EXPIRATION: '15m',
  SALT_ROUNDS: 10,
} as const;

export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  TOKEN_EXPIRED: 'Token has expired',
  USER_ALREADY_EXIST: 'This email is already registered with us.',
} as const;
