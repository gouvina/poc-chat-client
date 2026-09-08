import { User } from "./user";

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = {
  email: string;
  password: string;
};
