"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Lock, Edit2 } from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { updateUserProfile } from "@/lib/firebaseService";
import { updatePassword, sendPasswordResetEmail } from "@/lib/passwordUtils";
import { toast } from "sonner";
import { reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth } from "@/app/firebase";

export function ProfileSettings() {
  const { user, userProfile } = useAuth();
  
  // Username states
  const [showUsernameForm, setShowUsernameForm] = useState(false);
  const [username, setUsername] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);

  // Password states
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [verifyingPassword, setVerifyingPassword] = useState(false);
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (userProfile?.username) {
      setUsername(userProfile.username);
    }
  }, [userProfile]);

  const handleSaveUsername = async () => {
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    if (!username || username.trim().length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username.trim())) {
      toast.error("Username can only contain letters, numbers, underscores, and hyphens");
      return;
    }

    setSavingUsername(true);
    const success = await updateUserProfile(user.uid, { username: username.trim() });
    setSavingUsername(false);

    if (success) {
      toast.success("Username updated successfully");
      setShowUsernameForm(false);
    } else {
      toast.error("Failed to update username");
    }
  };

  const handleCancelUsername = () => {
    setUsername(userProfile?.username || "");
    setShowUsernameForm(false);
  };

  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      toast.error("No user is currently logged in");
      return;
    }

    setVerifyingPassword(true);

    try {
      // Try to re-authenticate with current password
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      
      // If successful, password is verified
      setPasswordVerified(true);
      toast.success("Password verified. Now enter your new password.");
    } catch (error: any) {
      console.error("Password verification error:", error);
      if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        toast.error("Current password is incorrect");
      } else {
        toast.error("Failed to verify password. Please try again.");
      }
    } finally {
      setVerifyingPassword(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmNewPassword) {
      toast.error("Please enter and confirm your new password");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    setSavingPassword(true);
    const result = await updatePassword(currentPassword, newPassword);
    setSavingPassword(false);

    if (result.success) {
      toast.success(result.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setPasswordVerified(false);
      setShowPasswordForm(false);
    } else {
      toast.error(result.message);
    }
  };

  const handleCancelPasswordUpdate = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setPasswordVerified(false);
    setShowPasswordForm(false);
  };

  const handleForgotPassword = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      toast.error("No user email found");
      return;
    }

    const result = await sendPasswordResetEmail(currentUser.email);
    
    if (result.success) {
      toast.success("Password reset email sent! Check your inbox.");
      handleCancelPasswordUpdate();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Username Section */}
      {!showUsernameForm ? (
        // Display mode - show username and update button
        <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
              <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Username</p>
              <p className="text-base font-medium">{userProfile?.username || "Not set"}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUsernameForm(true)}
            className="gap-2"
          >
            <Edit2 className="h-4 w-4" />
            Update
          </Button>
        </div>
      ) : (
        // Edit mode - show form
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Username
            </CardTitle>
            <CardDescription>
              Update your display name
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                minLength={3}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                At least 3 characters (letters, numbers, _, -)
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCancelUsername}
                className="flex-1"
                disabled={savingUsername}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveUsername}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                disabled={savingUsername}
              >
                {savingUsername ? "Saving..." : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Password Section */}
      {!showPasswordForm ? (
        // Display mode - show password label and update button
        <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
              <Lock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Password</p>
              <p className="text-base font-medium">••••••••</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPasswordForm(true)}
            className="gap-2"
          >
            <Edit2 className="h-4 w-4" />
            Update
          </Button>
        </div>
      ) : (
        // Edit mode - show form
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your account password
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!passwordVerified ? (
              // Step 1: Verify current password
              <form onSubmit={handleVerifyPassword} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs text-purple-600 hover:underline font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your current password to continue
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelPasswordUpdate}
                    className="flex-1"
                    disabled={verifyingPassword}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    disabled={verifyingPassword}
                  >
                    {verifyingPassword ? "Verifying..." : "Verify Password"}
                  </Button>
                </div>
              </form>
            ) : (
              // Step 2: Enter new password
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950 text-sm text-green-800 dark:text-green-200">
                  <p className="font-medium">Password verified ✓</p>
                  <p className="text-xs mt-1">Now enter your new password</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <p className="text-xs text-muted-foreground">
                    At least 6 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelPasswordUpdate}
                    className="flex-1"
                    disabled={savingPassword}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    disabled={savingPassword}
                  >
                    {savingPassword ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

