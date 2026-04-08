export type SessionPayload = {
  sub: string;
  email?: string;
  [key: string]: unknown;
};

export type Session = {
  userId: string;
  email?: string;
  payload: SessionPayload;
};

