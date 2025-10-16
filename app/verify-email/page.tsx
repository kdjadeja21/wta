"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Scale, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "@/app/firebase";
import Link from "next/link";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const [email, setEmail] = useState<string>("");
  const [resending, setResending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Get the email from the current user or from session storage
    const currentUser = auth.currentUser;
    if (currentUser) {
      setEmail(currentUser.email || "");
      // If already verified, redirect to dashboard
      if (currentUser.emailVerified) {
        router.push("/dashboard");
      }
    } else {
      // If no user, check if we just signed up (email might be in storage)
      const storedEmail = sessionStorage.getItem("signupEmail");
      if (storedEmail) {
        setEmail(storedEmail);
        sessionStorage.removeItem("signupEmail");
      }
    }
  }, [router]);

  const handleResendVerification = async () => {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      toast.error("No user found. Please try signing up again.");
      router.push("/signup");
      return;
    }

    if (currentUser.emailVerified) {
      toast.success("Your email is already verified!");
      router.push("/dashboard");
      return;
    }

    setResending(true);
    try {
      await sendEmailVerification(currentUser);
      toast.success("Verification email sent! Please check your inbox.");
    } catch (error: any) {
      console.error("Resend verification error:", error);
      if (error.code === "auth/too-many-requests") {
        toast.error("Too many requests. Please wait a few minutes before trying again.");
      } else {
        toast.error("Failed to resend verification email. Please try again later.");
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900">
              <Mail className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            We&apos;ve sent a verification email to your inbox
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Display */}
          {email && (
            <div className="p-3 rounded-lg bg-muted text-center">
              <p className="text-sm font-medium">{email}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Check your inbox</p>
                <p className="text-sm text-muted-foreground">
                  Click the verification link in the email we sent you
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Check spam folder</p>
                <p className="text-sm text-muted-foreground">
                  Sometimes emails end up in spam or junk folders
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Return to login</p>
                <p className="text-sm text-muted-foreground">
                  After verifying, you can log in to your account
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleResendVerification}
              variant="outline"
              className="w-full"
              disabled={resending}
            >
              {resending ? "Sending..." : "Resend Verification Email"}
            </Button>

            <Link href="/login" className="block">
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Go to Login
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Having trouble?{" "}
              <Link href="/signup" className="text-purple-600 hover:underline">
                Try signing up again
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

