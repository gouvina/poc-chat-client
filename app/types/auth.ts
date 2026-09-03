import { User } from "./user";

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type LoginCredentials = {
  identifier: string;
  password: string;
};

export type RegisterCredentials = {
  username: string;
  email: string;
  password: string;
};
