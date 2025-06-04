// app/sign-in/page.tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-700 via-purple-700 to-red-600">
      <SignIn routing="path" path="/sign-in" />
    </div>
  );
}