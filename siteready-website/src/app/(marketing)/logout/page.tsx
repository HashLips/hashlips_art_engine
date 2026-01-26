"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const LogoutPage = () => {
  const router = useRouter();
  useEffect(() => {
    const run = async () => {
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
      router.push("/");
    };
    run();
  }, [router]);
  return <p style={{ padding: "2rem" }}>Signing out...</p>;
};

export default LogoutPage;
