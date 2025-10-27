"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verify } from "@/libs/authApi";

export default function VerifyPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }

    // Call backend verify endpoint
    (async () => {
      try {
        const res = await verify(token);

        if (res.status === 302 && res.headers.location) {
          // Spring Boot sends a redirect — go there
          window.location.href = res.headers.location;
          return;
        }

        if (res.status >= 200 && res.status < 300) {
          setStatus("success");
          setMessage("Your account has been verified! Redirecting to login...");
          // Redirect manually if backend didn’t
          setTimeout(() => router.push("/login?verified=1"), 2000);
        } else {
          setStatus("error");
          setMessage(res.data?.message || "Invalid or expired token.");
        }
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message);
      }
    })();
  }, [params, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
      {status === "loading" && (
        <>
          <div className="text-xl font-semibold mb-2">Verifying your account...</div>
          <div className="text-gray-500">Please wait a moment.</div>
        </>
      )}

      {status === "success" && (
        <div className="text-green-600 text-xl font-semibold">{message}</div>
      )}

      {status === "error" && (
        <div className="text-red-600 text-xl font-semibold">{message}</div>
      )}
    </div>
  );
}
