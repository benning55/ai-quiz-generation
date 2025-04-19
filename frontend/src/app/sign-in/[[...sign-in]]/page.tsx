import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-white">
      <div className="max-w-md w-full">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-red-700">Sign In to CanCitizenTest</h1>
          <p className="text-gray-600">Access all citizenship practice tests</p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "rounded-xl shadow-lg",
              headerTitle: "text-red-700",
              headerSubtitle: "text-gray-600",
              formButtonPrimary: "bg-red-700 hover:bg-red-800",
            }
          }}
        />
      </div>
    </div>
  );
} 