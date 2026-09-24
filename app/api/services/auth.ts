import {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
} from "@/app/types/auth";
import { User } from "@/app/types/user";
import { apiFetch } from "../client";

export async function login(credentials: LoginCredentials) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: credentials.email,
      password: btoa(credentials.password)
    }),
    auth: false,
  });
}

export async function register(credentials: RegisterCredentials) {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email: credentials.email,
      password: btoa(credentials.password)
    }),
    auth: false,
  });
}

export async function getMe() {
  return apiFetch<User>("/auth/me");
}
