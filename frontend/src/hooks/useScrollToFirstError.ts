import { useEffect, useRef } from "react";
import { useStore } from "@tanstack/react-form";
import type { FormApi } from "@tanstack/react-form";

interface UseScrollToFirstErrorOptions {
  form: FormApi<any, any>;
  formRef: React.RefObject<HTMLFormElement | null>;
  /** Ref vers le conteneur des erreurs globales (message en haut du formulaire) */
  errorContainerRef?: React.RefObject<HTMLElement | null>;
}

export function useScrollToFirstError({
  form,
  formRef,
  errorContainerRef,
}: UseScrollToFirstErrorOptions) {
  const attempts = useStore(form.store, (state) => state.submissionAttempts);

  useEffect(() => {
    const formElement = formRef.current;
    if (!formElement) return;

    const timer = setTimeout(() => {
      // Cherche le premier champ marqué `data-invalid="true"` à l'intérieur du formulaire
      const firstError = formElement.querySelector(
        "[data-invalid='true']",
      ) as HTMLElement | null;

      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        // Sinon, scroll vers le conteneur d'erreurs globales s'il existe
        errorContainerRef?.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [attempts, formRef, errorContainerRef]);
}
