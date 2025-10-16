"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Lock, Edit2, Eye, EyeOff } from "lucide-react";
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

  // First name states
  const [showFirstNameForm, setShowFirstNameForm] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [savingFirstName, setSavingFirstName] = useState(false);

  // Last name states
  const [showLastNameForm, setShowLastNameForm] = useState(false);
  const [lastName, setLastName] = useState("");
  const [savingLastName, setSavingLastName] = useState(false);

  // Password states
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [verifyingPassword, setVerifyingPassword] = useState(false);
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  useEffect(() => {
    if (userProfile?.username) {
      setUsername(userProfile.username);
    }
    if (userProfile?.firstName) {
      setFirstName(userProfile.firstName);
    }
    if (userProfile?.lastName) {
      setLastName(userProfile.lastName);
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

  const handleSaveFirstName = async () => {
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    if (firstName && firstName.trim().length < 2) {
      toast.error("First name must be at least 2 characters");
      return;
    }

    // Validate first name format (letters, spaces, hyphens, apostrophes)
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (firstName && !nameRegex.test(firstName.trim())) {
      toast.error("First name can only contain letters, spaces, hyphens, and apostrophes");
      return;
    }

    setSavingFirstName(true);
    const success = await updateUserProfile(user.uid, { firstName: firstName.trim() || undefined });
    setSavingFirstName(false);

    if (success) {
      toast.success("First name updated successfully");
      setShowFirstNameForm(false);
    } else {
      toast.error("Failed to update first name");
    }
  };

  const handleCancelFirstName = () => {
    setFirstName(userProfile?.firstName || "");
    setShowFirstNameForm(false);
  };

  const handleSaveLastName = async () => {
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    if (lastName && lastName.trim().length < 2) {
      toast.error("Last name must be at least 2 characters");
      return;
    }

    // Validate last name format (letters, spaces, hyphens, apostrophes)
    const nameRegex = /^[a-zA-Z\s'-]+$/;
    if (lastName && !nameRegex.test(lastName.trim())) {
      toast.error("Last name can only contain letters, spaces, hyphens, and apostrophes");
      return;
    }

    setSavingLastName(true);
    const success = await updateUserProfile(user.uid, { lastName: lastName.trim() || undefined });
    setSavingLastName(false);

    if (success) {
      toast.success("Last name updated successfully");
      setShowLastNameForm(false);
    } else {
      toast.error("Failed to update last name");
    }
  };

  const handleCancelLastName = () => {
    setLastName(userProfile?.lastName || "");
    setShowLastNameForm(false);
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
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
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
      {/* First Name Section */}
      {!showFirstNameForm ? (
        // Display mode - show first name and update button
        <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
              <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">First Name</p>
              <p className="text-base font-medium">{userProfile?.firstName || "Not set"}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFirstNameForm(true)}
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
              First Name
            </CardTitle>
            <CardDescription>
              Update your first name
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                minLength={2}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                At least 2 characters (letters, spaces, hyphens, apostrophes)
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCancelFirstName}
                className="flex-1"
                disabled={savingFirstName}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveFirstName}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                disabled={savingFirstName}
              >
                {savingFirstName ? "Saving..." : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Name Section */}
      {!showLastNameForm ? (
        // Display mode - show last name and update button
        <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
              <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Name</p>
              <p className="text-base font-medium">{userProfile?.lastName || "Not set"}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLastNameForm(true)}
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
              Last Name
            </CardTitle>
            <CardDescription>
              Update your last name
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                minLength={2}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                At least 2 characters (letters, spaces, hyphens, apostrophes)
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCancelLastName}
                className="flex-1"
                disabled={savingLastName}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveLastName}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                disabled={savingLastName}
              >
                {savingLastName ? "Saving..." : "Save"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      autoFocus
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
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
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    At least 6 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmNewPassword"
                      type={showConfirmNewPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
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

