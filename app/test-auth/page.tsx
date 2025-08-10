"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function TestAuthPage() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-2xl font-bold">NextAuth Test Page</h2>
          <p className="mt-2 text-gray-600">Testing Discord OAuth integration</p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded">
            <p className="font-semibold">Session Status:</p>
            <p className="text-sm">{status}</p>
          </div>

          {session && (
            <div className="p-4 bg-green-50 rounded">
              <p className="font-semibold">Logged in as:</p>
              <p className="text-sm">{session.user?.name || session.user?.email}</p>
              <pre className="mt-2 text-xs overflow-auto">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
          )}

          <div className="space-y-2">
            {!session ? (
              <>
                <Button
                  onClick={() => {
                    console.log("Calling signIn with discord provider");
                    signIn("discord", { 
                      callbackUrl: "/test-auth",
                      redirect: true 
                    }).then(result => {
                      console.log("SignIn result:", result);
                    }).catch(error => {
                      console.error("SignIn error:", error);
                    });
                  }}
                  className="w-full"
                >
                  Sign in with Discord
                </Button>
                
                <Button
                  onClick={() => {
                    // Try direct navigation
                    window.location.href = "/api/auth/signin/discord";
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Sign in (Direct Navigation)
                </Button>
              </>
            ) : (
              <Button
                onClick={() => signOut({ callbackUrl: "/test-auth" })}
                variant="outline"
                className="w-full"
              >
                Sign out
              </Button>
            )}
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>Provider endpoint: /api/auth/signin/discord</p>
            <p>Callback URL: /api/auth/callback/discord</p>
            <p>Check browser console for debug logs</p>
          </div>
        </div>
      </div>
    </div>
  );
}