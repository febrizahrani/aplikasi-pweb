"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { logoutAction } from "@/actions/auth";

export default function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        startTransition(async () => {
          await logoutAction();
          router.push("/login");
          router.refresh();
        });
      }}
      disabled={isPending}
      className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
    >
      {isPending ? "Logout..." : "Logout"}
    </button>
  );
}
