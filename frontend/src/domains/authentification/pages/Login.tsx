import { useForm } from "@tanstack/react-form";

import { useState } from "react";
import { Eye, EyeOff, InfoIcon } from "lucide-react";
import { toast } from "sonner";
import {
  FieldError,
  FieldGroup,
  Field,
  FieldLabel,
} from "../../../components/ui/field";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { loginSchema } from "../schema/loginSchema";

function Login() {
  const form = useForm({
    defaultValues: {
      userName: "",
      password: "",
    },
    validators: {
      onBlur: loginSchema,
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      toast.success(
        "You submitted the following values:" + value.userName + value.password,
      );
    },
  });

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-md border px-8 py-10 mx-auto">
      <div className="flex justify-center mb-6">
        <img
          src="" // put your image in /public/logo.png
          alt="HFF logo"
          className="w-40 h-20 border-2 object-contain "
        />
      </div>
      <form
        id="login-form"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field
            name="userName"
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
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
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
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />
        </FieldGroup>

        <FieldGroup className="mt-6">
          <Button type="submit">Se connecter</Button>
        </FieldGroup>
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
  );
}

export default Login;
