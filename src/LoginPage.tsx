// Remove unused React import (in React 17+ it's not required)
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, KeyRound, ShieldCheck, School } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "./pages/supabase-client";

// Custom theme colors
const theme = {
  black: "#000000",
  primary: "#CF0F47",
  secondary: "#FF0B55",
};

const AdminSignIn = () => {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/lostitems");
      }
    };

    checkSession();
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!adminId || !password) {
      setError("Please fill in all required fields");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      // Use adminId as email for authentication
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: adminId,
          password,
        });

      if (signInError) {
        setError(
          signInError.message ||
            "Failed to sign in. Please check your credentials.",
        );
        console.error("Sign in error:", signInError);
      } else {
        console.log("Sign in successful", { user: data.user });
        // Redirect to lost items page on successful login
        navigate("/lostitems");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Authentication error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md shadow-lg border-0 bg-black text-white">
        <CardHeader className="space-y-2 text-center border-b border-gray-800 pb-6">
          <div className="flex justify-center mb-2">
            <Link to="/">
              <School
                className="h-12 w-12 cursor-pointer"
                style={{ color: theme.primary }}
              />
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold">
            Campus Item Finder
          </CardTitle>
          <CardDescription className="text-gray-400">
            Administrator Sign In
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSignIn}>
          <CardContent className="space-y-4 pt-6 pb-4">
            <div className="space-y-2">
              <Label htmlFor="adminId" className="text-gray-300">
                Admin Email
              </Label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="adminId"
                  type="email"
                  placeholder="admin@example.com"
                  className="pl-10 bg-gray-900 border-gray-800 focus:border-pink-600 text-white"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  style={
                    {
                      "--input-focus-border": theme.primary,
                    } as React.CSSProperties
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminPassword" className="text-gray-300">
                Password
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="adminPassword"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10 bg-gray-900 border-gray-800 focus:border-pink-600 text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={
                    {
                      "--input-focus-border": theme.primary,
                    } as React.CSSProperties
                  }
                />
              </div>
            </div>
          </CardContent>

          {/* Error Alert */}
          {error && (
            <div className="px-6 pb-4">
              <Alert
                variant="destructive"
                className="bg-red-900 border-red-700 text-white"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          {/* Buttons */}
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-pink-600 hover:bg-pink-700 text-white"
              style={{
                backgroundColor: theme.primary,
              }}
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-400">
                Need help accessing your admin account?
              </p>

              <div className="text-sm">
                <a
                  href="#"
                  className="text-pink-500 hover:text-pink-400"
                  style={{ color: theme.secondary }}
                >
                  Contact IT Support
                </a>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminSignIn;
