"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitEvent, useState } from "react";
import { ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
  const t = useTranslations('Register')
  const router = useRouter();
  const { register } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await register({ email, password });
      router.replace("/");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError(t('errors.emailTaken'));
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('errors.createAccountFail'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4 dark:bg-[#1c1c1c]">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-5 shadow-xl dark:border-[#2e2e2e] dark:bg-[#222222]">
        <h1 className="text-lg font-medium text-gray-900 dark:text-[#eeeeee]">
          {t('title')}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-[#888888]">
          {t('subtitle')}
        </p>

        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="register-email"
              className="mb-1 block text-xs font-medium text-gray-600 dark:text-[#aaaaaa]"
            >
              {t('email')}
            </label>
            <input
              id="register-email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-[#3a3a3a] dark:bg-[#1a1a1a] dark:text-[#e0e0e0] dark:focus:border-[#555555]"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="register-password"
              className="mb-1 block text-xs font-medium text-gray-600 dark:text-[#aaaaaa]"
            >
              {t('password')}
            </label>
            <input
              id="register-password"
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-[#3a3a3a] dark:bg-[#1a1a1a] dark:text-[#e0e0e0] dark:focus:border-[#555555]"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-60 dark:bg-[#444444] dark:hover:bg-[#4a4a4a]"
          >
            {isSubmitting ? t('creatingAccount') : t('createAccount')}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500 dark:text-[#888888]">
          {t('loginPrompt')}{" "}
          <Link
            href="/"
            className="font-medium text-blue-600 hover:underline dark:text-[#cccccc]"
          >
            {t('signIn')}
          </Link>
        </p>
      </div>
    </div>
  );
}
