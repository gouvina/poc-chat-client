import { User } from "./user";

export type AuthResponse = {
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

export type LogoutResponse = {
  message: string
}
