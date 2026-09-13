import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const { checkSession } = useAuth();

  const [email, setEmail] = useState("demo@schedulr.app");
  const [password, setPassword] = useState("Schedule123!");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleEmailChange(event) {
    setEmail(event.target.value);
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
  }

  function handleRememberMeChange(event) {
    setRememberMe(event.target.checked);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email,
          password: password,
          rememberMe: rememberMe,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to log in.");
      }

      await checkSession();
      navigate("/schedule");
    } catch (error) {
      setError(error.message || "Unable to log in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  let buttonText = "Log In";

  if (isSubmitting) {
    buttonText = "Logging in...";
  }

  return (
    <main className="px-12 py-8 max-sm:px-5">
      <h1 className="text-2xl font-bold uppercase text-[#494263]">Log In</h1>

      <p className="mt-5 text-slate-600">
        Please enter your email and password.
      </p>

      <form onSubmit={handleSubmit} className="mt-7 max-w-xl">
        <fieldset className="border border-slate-300 px-8 pb-8 pt-5">
          <legend className="px-2 text-lg font-semibold text-[#494263]">
            Account Information
          </legend>

          <div className="mt-4">
            <label htmlFor="email" className="mb-2 block text-slate-700">
              Email:
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              className="w-full border border-slate-300 px-3 py-1.5 outline-none focus:border-[#6558B1] focus:ring-1 focus:ring-[#6558B1]"
              autoComplete="email"
              required
            />
          </div>

          <div className="mt-5">
            <label htmlFor="password" className="mb-2 block text-slate-700">
              Password:
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              className="w-full border border-slate-300 px-3 py-1.5 outline-none focus:border-[#6558B1] focus:ring-1 focus:ring-[#6558B1]"
              autoComplete="current-password"
              required
            />
          </div>

          <label className="mt-5 flex cursor-pointer items-center gap-2 text-slate-700">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={handleRememberMeChange}
              className="size-4 accent-[#6558B1]"
            />

            <span>Keep me logged in</span>
          </label>

          {error && (
            <p
              className="mt-4 bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              {error}
            </p>
          )}
        </fieldset>

        <div className="mt-5 text-right">
          <button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer border border-[#494263] bg-[#6558B1] px-5 py-1.5 text-white transition hover:bg-[#554C7A] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {buttonText}
          </button>
        </div>

        <div className="mt-6 bg-[#f4f2fa] p-4 text-sm text-slate-600">
          <p className="font-semibold text-[#494263]">Demo account</p>

          <p className="mt-1">demo@schedulr.app</p>
          <p>Schedule123!</p>
        </div>
      </form>
    </main>
  );
}

export default LoginPage;
