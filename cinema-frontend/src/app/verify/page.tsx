"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { API_URL } from "@/config/apiConfig";

export default function VerifyPage() {
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      const backendUrl = `${API_URL}/auth/verify?token=${token}`;
      window.location.href = backendUrl;
    }
  }, [params]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
      <h1 className="text-2xl font-bold mb-4">Verifying your email...</h1>
      <p className="text-gray-600">
        Please wait while we confirm your account.
      </p>
    </div>
  );
}
