import { useForm } from "@tanstack/react-form";

import { useState } from "react";
import { Eye, EyeOff, InfoIcon } from "lucide-react";
import {
  FieldError,
  FieldGroup,
  Field,
  FieldLabel,
} from "../../../components/ui/field";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { loginSchema } from "../schema/loginSchema";
import LogoHff from "@/assets/logoHFF.jpg";
import { formatErrorMessage } from "@/lib/utils";
import { useAuth } from "@/context/authContext";
import { useNavigate } from "react-router-dom";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [errors, setErrors] = useState<string[]>([]);
  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    validators: {
      onBlur: loginSchema,
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      setErrors([]);
      try {
        await login(value);
        navigate("/");
      } catch (error: any) {
        const message = await formatErrorMessage(
          error,
          "Échec de la connexion.",
        );
        setErrors([message]);
      }
    },
  });

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className=" bg-gray-400 w-full h-full flex flex-col justify-center items-center">
      <div className="w-full max-w-md border px-8 py-10 mx-auto bg-white shadow-lg ">
        <div className="flex justify-center mb-4">
          <img
            src={LogoHff}
            alt="HFF logo"
            className="max-w-60 object-contain "
          />
        </div>
        {errors.length > 0 && (
          <div className="p-2 text-xs text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400  dark:border-red-900 mb-4">
            {errors.map((err, index) => (
              <p key={index}>{String(err)}</p>
            ))}
          </div>
        )}
        <form
          id="login-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              name="username"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Utilisateur</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder=""
                      autoComplete="off"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
            <form.Field
              name="password"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Mot de passe</FieldLabel>
                    <div className="relative">
                      <Input
                        id={field.name}
                        name={field.name}
                        type={showPassword ? "text" : "password"}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
          </FieldGroup>

          <form.Subscribe
            selector={(state) => [state.isSubmitting]}
            children={([isSubmitting]) => (
              <FieldGroup className="mt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  form="login-form"
                  className="w-full flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Connexion en cours...
                    </span>
                  ) : (
                    "Se connecter"
                  )}
                </Button>
              </FieldGroup>
            )}
          />
        </form>
        {/* don't forget to change this div to components  */}
        <div className="flex items-start gap-2 text-gray-500 mt-8">
          <InfoIcon size={16} className="mt-0.5 shrink-0" />

          <p className="text-xs leading-relaxed">
            L'identifiant et le mot de passe sont ceux utilisés pour vous
            connecter à votre ordinateur.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
