import { useAuth } from "@getmocha/users-service/react";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Clock } from "lucide-react";

export default function AuthCallback() {
  const { exchangeCodeForSessionToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await exchangeCodeForSessionToken();
        navigate("/dashboard");
      } catch (error) {
        console.error("Authentication failed:", error);
        navigate("/");
      }
    };

    handleCallback();
  }, [exchangeCodeForSessionToken, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="text-center">
        <div className="animate-spin mb-4">
          <Clock className="w-12 h-12 text-indigo-600 mx-auto" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          جاري تسجيل الدخول...
        </h2>
        <p className="text-gray-600">
          يرجى الانتظار بينما نقوم بإعداد حسابك
        </p>
      </div>
    </div>
  );
}
