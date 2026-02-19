/**
 * Contact form – React island.
 *
 * Why React: client-side validation, focus management, loading state, and
 * controlled submit. These require hydration; Astro components are static.
 * Using client:idle so JS loads after browser idle, keeping initial load minimal.
 */

import { type FormEvent, useState, useEffect, useRef } from "react";

const API_URL = "/api/contact";
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 200;

interface FormState {
  status: "idle" | "loading" | "success" | "error";
  message: string;
}

export default function ContactForm() {
  const [state, setState] = useState<FormState>({ status: "idle", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [messageLength, setMessageLength] = useState(0);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState("");
  const lastFocusedElement = useRef<HTMLElement | null>(null);
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);

  const closeErrorModal = () => {
    setShowErrorModal(false);
    const focusTarget = lastFocusedElement.current ?? submitButtonRef.current;
    focusTarget?.focus();
    lastFocusedElement.current = null;
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showErrorModal) {
        closeErrorModal();
      }
    };

    if (showErrorModal) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [showErrorModal]);

  function getUserFriendlyError(fieldName: string, error: string): string {
    const fieldLabels: Record<string, string> = {
      firstName: "First Name",
      lastName: "Last Name",
      phone: "Phone Number",
      email: "Email Address",
      company: "Company",
      message: "Message",
    };

    const label = fieldLabels[fieldName] || fieldName;

    if (error.includes("required")) {
      return `Please share your ${label.toLowerCase()}. This helps us respond.`;
    }
    if (error.includes("valid email")) {
      return "Please enter a valid email address (e.g., yourname@example.com).";
    }
    if (error.includes("at least")) {
      return `Please add a little more detail (at least ${MESSAGE_MIN} characters).`;
    }
    if (error.includes("at most")) {
      return `Please keep it under ${MESSAGE_MAX} characters.`;
    }
    return error;
  }

  function validate(form: HTMLFormElement): boolean {
    const data = new FormData(form);
    const next: Record<string, string> = {};

    if (!(data.get("firstName") as string)?.trim()) next.firstName = "First name is required.";
    if (!(data.get("lastName") as string)?.trim()) next.lastName = "Last name is required.";
    const email = (data.get("email") as string)?.trim();
    if (!email) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Please enter a valid email.";
    if (!(data.get("phone") as string)?.trim()) next.phone = "Phone is required.";
    if (!(data.get("company") as string)?.trim()) next.company = "Company is required.";
    const msg = (data.get("message") as string)?.trim();
    if (!msg) next.message = "Message is required.";
    else if (msg.length < MESSAGE_MIN) next.message = `Message must be at least ${MESSAGE_MIN} characters.`;
    else if (msg.length > MESSAGE_MAX) next.message = `Message must be at most ${MESSAGE_MAX} characters.`;

    setErrors(next);
    
    if (Object.keys(next).length > 0) {
      const errorMessages = Object.entries(next)
        .map(([field, error]) => getUserFriendlyError(field, error))
        .join("\n\n");
      setErrorModalMessage(`Please fix the following issues:\n\n${errorMessages}`);
        setShowErrorModal(true);
        lastFocusedElement.current = document.activeElement as HTMLElement;
    }
    
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    lastFocusedElement.current = document.activeElement as HTMLElement;
    if (!validate(form)) return;

    setState({ status: "loading", message: "" });
    setErrors({});

    const body = {
      firstName: (form.querySelector('[name="firstName"]') as HTMLInputElement).value.trim(),
      lastName: (form.querySelector('[name="lastName"]') as HTMLInputElement).value.trim(),
      email: (form.querySelector('[name="email"]') as HTMLInputElement).value.trim(),
      phone: (form.querySelector('[name="phone"]') as HTMLInputElement).value.trim(),
      company: (form.querySelector('[name="company"]') as HTMLInputElement).value.trim(),
      message: (form.querySelector('[name="message"]') as HTMLTextAreaElement).value.trim(),
      newsletter: (form.querySelector('[name="newsletter"]') as HTMLInputElement)?.checked ?? false,
      website: (form.querySelector('[name="website"]') as HTMLInputElement)?.value.trim() ?? "",
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { success?: boolean; message?: string; error?: string };

      if (res.ok && data.success) {
        setState({ status: "success", message: data.message ?? "Thanks for reaching out. We'll be in touch soon." });
        form.reset();
        setMessageLength(0);
      } else {
        const errorMsg = data.message ?? data.error ?? "We couldn't send your message just now. Please check your connection and try again, or contact us directly at enquiries@bloomneventsco.com.au.";
        setErrorModalMessage(errorMsg);
        setShowErrorModal(true);
        setState({ status: "error", message: errorMsg });
      }
    } catch (error) {
      const errorMsg = "We're having trouble connecting right now. Please try again, or contact us directly at enquiries@bloomneventsco.com.au or call 1800 826 268.";
      setErrorModalMessage(errorMsg);
      setShowErrorModal(true);
      setState({ status: "error", message: errorMsg });
    }
  }

  return (
    <>
      {/* Error Modal */}
      {showErrorModal && (
        <div
          className="error-modal-overlay"
          onClick={() => closeErrorModal()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="error-modal-title"
        >
          <div className="error-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="error-modal-header">
              <h3 id="error-modal-title" className="error-modal-title">
                Almost there — a few details to fix
              </h3>
          <button
            type="button"
            className="error-modal-close"
            onClick={() => closeErrorModal()}
            aria-label="Close error message"
          >
            ×
          </button>
            </div>
            <div className="error-modal-body">
              <p className="error-modal-message">{errorModalMessage}</p>
            </div>
            <div className="error-modal-footer">
          <button
            type="button"
            className="btn btn-gold"
            onClick={() => closeErrorModal()}
            autoFocus
          >
            I'll update that
          </button>
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="contact-form"
        id="contactForm"
        method="POST"
        action={API_URL}
        noValidate
        aria-label="Contact form"
      >
        {/* Success Messages */}
        <div id="alertContainer">
          {state.status === "success" && (
            <div className="alert alert-success" role="status">
              {state.message}
            </div>
          )}
        </div>

      <div className="mb-3">
        <label htmlFor="firstName" className="form-label">First Name <span className="text-danger">*</span></label>
        <input
          type="text"
          className="form-control"
          id="firstName"
          name="firstName"
          placeholder="First name"
          autoComplete="given-name"
          required
          aria-required="true"
          aria-invalid={!!errors.firstName}
          aria-describedby={errors.firstName ? "err-firstName" : undefined}
        />
        {errors.firstName && (
          <p id="err-firstName" className="text-danger small mt-1" role="alert">
            {errors.firstName}
          </p>
        )}
      </div>

      <div className="mb-3">
        <label htmlFor="lastName" className="form-label">Last Name <span className="text-danger">*</span></label>
        <input
          type="text"
          className="form-control"
          id="lastName"
          name="lastName"
          placeholder="Last name"
          autoComplete="family-name"
          required
          aria-required="true"
          aria-invalid={!!errors.lastName}
          aria-describedby={errors.lastName ? "err-lastName" : undefined}
        />
        {errors.lastName && (
          <p id="err-lastName" className="text-danger small mt-1" role="alert">
            {errors.lastName}
          </p>
        )}
      </div>

      <div className="mb-3">
        <label htmlFor="phone" className="form-label">Phone Number <span className="text-danger">*</span></label>
        <input
          type="tel"
          className="form-control"
          id="phone"
          name="phone"
          placeholder="Phone number"
          autoComplete="tel"
          required
          aria-required="true"
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? "err-phone" : undefined}
        />
        {errors.phone && (
          <p id="err-phone" className="text-danger small mt-1" role="alert">
            {errors.phone}
          </p>
        )}
      </div>

      <div className="mb-3">
        <label htmlFor="email" className="form-label">Email Address <span className="text-danger">*</span></label>
        <input
          type="email"
          className="form-control"
          id="email"
          name="email"
          placeholder="Email address"
          autoComplete="email"
          required
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "err-email" : undefined}
        />
        {errors.email && (
          <p id="err-email" className="text-danger small mt-1" role="alert">
            {errors.email}
          </p>
        )}
      </div>

      <div className="mb-3">
        <label htmlFor="company" className="form-label">Company <span className="text-danger">*</span></label>
        <input
          type="text"
          className="form-control"
          id="company"
          name="company"
          placeholder="Company or organisation"
          autoComplete="organization"
          required
          aria-required="true"
          aria-invalid={!!errors.company}
          aria-describedby={errors.company ? "err-company" : undefined}
        />
        {errors.company && (
          <p id="err-company" className="text-danger small mt-1" role="alert">
            {errors.company}
          </p>
        )}
      </div>

      <div className="mb-3">
        <label htmlFor="message" className="form-label">Message <span className="text-danger">*</span></label>
        <div className="message-input-wrapper position-relative">
          <textarea
            className="form-control"
            id="message"
            name="message"
            rows={4}
            placeholder="Tell us about your event or idea"
            autoComplete="off"
            maxLength={MESSAGE_MAX}
            required
            aria-required="true"
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "err-message" : "messageCounter"}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= MESSAGE_MAX) {
                setMessageLength(value.length);
              } else {
                e.target.value = value.substring(0, MESSAGE_MAX);
                setMessageLength(MESSAGE_MAX);
              }
            }}
          />
          <div
            className={`message-char-counter ${
              messageLength > MESSAGE_MAX * 0.9
                ? "error"
                : messageLength > MESSAGE_MAX * 0.75
                ? "warning"
                : ""
            }`}
            id="messageCounter"
          >
            {messageLength}/{MESSAGE_MAX}
          </div>
        </div>
        {errors.message && (
          <p id="err-message" className="text-danger small mt-1" role="alert">
            {errors.message}
          </p>
        )}
      </div>

      <div className="mb-3 form-check">
        <input
          type="checkbox"
          className="form-check-input"
          id="newsletter"
          name="newsletter"
        />
        <label className="form-check-label" htmlFor="newsletter">
          Send me occasional updates and offers
        </label>
      </div>

      {/* Honeypot: leave empty; bots that fill it are rejected server-side */}
      <div className="visually-hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

          <button
            type="submit"
            className="btn btn-gold w-100"
            id="submitBtn"
            disabled={state.status === "loading"}
            ref={submitButtonRef}
          >
        <span id="submitText" className={state.status === "loading" ? "d-none" : ""}>
          Send Message
        </span>
        <span id="loadingText" className={state.status === "loading" ? "" : "d-none"}>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          Sending...
        </span>
      </button>
    </form>
    </>
  );
}
