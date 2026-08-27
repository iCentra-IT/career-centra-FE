"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useLogin } from "@/hooks/mutations/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const next = useSearchParams().get("next");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const { mutate, isPending, error } = useLogin(next);

  useEffect(() => {
    if (!error) return;
    if (!error.errors) {
      toast.error(error.message);
      return;
    }
    for (const [field, messages] of Object.entries(error.errors)) {
      if (field === "email" || field === "password") {
        setError(field, { message: messages[0] });
      }
    }
  }, [error, setError]);

  const onSubmit = (values: LoginFormValues) => mutate(values);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">
        Login to your account
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Welcome back! Please enter your details.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-5">
        <Input
          label="Email Address"
          type="email"
          required
          placeholder="Enter your email address"
          error={errors.email?.message}
          {...register("email")}
        />

        <div className="flex flex-col gap-2">
          <Input
            label="Password"
            type="password"
            required
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register("password")}
          />
          <Link
            href="/forgot-password"
            className="self-end text-sm text-secondary hover:underline"
          >
            Forget Password?
          </Link>
        </div>

        <Button type="submit" loading={isPending}>
          Login
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link href="/registration" className="font-medium text-secondary hover:underline">
          Create an account
        </Link>
      </p>

      <p className="mt-6 text-center text-xs text-gray-400">
        By clicking sign in, you agree to our{" "}
        <span className="font-medium text-secondary">Terms and Condition</span> and{" "}
        <span className="font-medium text-secondary">Privacy Statement</span>
      </p>
    </div>
  );
};

const LoginPage = () => (
  <Suspense fallback={null}>
    <LoginForm />
  </Suspense>
);

export default LoginPage;
