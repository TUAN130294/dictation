import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-sm">
        <h1 className="text-2xl font-display font-bold text-center mb-6">
          Sign In
        </h1>
        <LoginForm />
      </div>
    </div>
  );
}
