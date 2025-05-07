import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useAuth, useToast } from "@/hooks"
import { useNavigate } from "@tanstack/react-router"
import { Loader2 } from "lucide-react"
import { ApiErrorResponse } from "@/types/sol"
import axios from "axios"

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState("Email is not registered.");
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("Incorrect password.");
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(false);
    setPasswordError(false);
    setIsLoading(true);
    let toastMessage = "Failed to login";

    try {
      const response = await login({ email, password });
      console.log("response:", response);
      navigate({ to: '/' });
      ``
    } catch (err) {
      console.error("Login error:", err);
      console.log("axios.isAxiosError(err):", err);

      if (axios.isAxiosError(err) && err.response?.data) {
        const errorData = err.response.data as ApiErrorResponse;
        console.log("errorData:", errorData);
        toastMessage = errorData.description || toastMessage;

        if (errorData.error === "Entity not found" && errorData.description === "Email is not registered") {
          setEmailError(true);
          setEmailErrorMessage(errorData.description);
        } else {
          setPasswordError(true);
          setPasswordErrorMessage(errorData.description || "Incorrect password.");
        }
      } else if (err instanceof Error) {
        toastMessage = err.message;
        setPasswordError(true);
        setPasswordErrorMessage("Incorrect password or login failed.");
      } else {
        setPasswordError(true);
        setPasswordErrorMessage("An unexpected error occurred.");
      }

      toast({
        variant: "destructive",
        title: "Login Unsuccessful",
        description: toastMessage,
      });
    } finally {
      setIsLoading(false);
    } ``
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) setEmailError(false);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError(false);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Money has ceased to be Ernest.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="m@example.com"
                    required
                    className={cn({ "border-red-500 focus-visible:ring-red-500": emailError })}
                  />
                  {emailError && (
                    <p className="text-xs text-red-500">{emailErrorMessage}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                    className={cn({ "border-red-500 focus-visible:ring-red-500": passwordError })}
                  />
                  {passwordError && (
                    <p className="text-xs text-red-500">{passwordErrorMessage}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Login
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a href="/register" className="underline underline-offset-4">
                  Sign up
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
