"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";

type FormStatus = "idle" | "sending" | "success" | "error";

export function OrdumContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus("sending");
    setMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(data.entries())),
      });
      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message || "Poruka trenutno nije poslata.");
      }

      form.reset();
      setStatus("success");
      setMessage("Hvala. Javićemo vam se da dogovorimo sledeći korak.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Poruka trenutno nije poslata. Pokušajte ponovo."
      );
    }
  }

  if (status === "success") {
    return (
      <div className="ordum-form-success" role="status">
        <CheckCircle2 aria-hidden="true" />
        <h3>Poruka je poslata.</h3>
        <p>{message}</p>
        <button type="button" onClick={() => setStatus("idle")}>
          Pošalji novu poruku
        </button>
      </div>
    );
  }

  return (
    <form className="ordum-contact-form" onSubmit={handleSubmit}>
      <div className="ordum-form-grid">
        <label>
          <span>Ime i prezime</span>
          <input name="name" autoComplete="name" minLength={2} maxLength={80} required />
        </label>
        <label>
          <span>Naziv studija</span>
          <input name="studio" autoComplete="organization" minLength={2} maxLength={100} required />
        </label>
        <label>
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" maxLength={160} required />
        </label>
        <label>
          <span>Telefon <small>opciono</small></span>
          <input name="phone" type="tel" autoComplete="tel" maxLength={40} />
        </label>
      </div>
      <label>
        <span>Tip studija</span>
        <select name="studioType" defaultValue="beauty-salon" required>
          <option value="beauty-salon">Beauty salon</option>
          <option value="hair-salon">Frizerski salon</option>
          <option value="barbershop">Barbershop</option>
          <option value="nails">Nail studio</option>
          <option value="spa-wellness">Spa / wellness</option>
          <option value="other">Drugo</option>
        </select>
      </label>
      <label>
        <span>Šta želite da unapredite?</span>
        <textarea
          name="message"
          rows={4}
          minLength={10}
          maxLength={1200}
          placeholder="Ukratko opišite studio, tim i način na koji sada primate rezervacije."
          required
        />
      </label>
      <label className="ordum-honeypot" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <div className="ordum-form-submit">
        <p>Slanjem forme dajete saglasnost da vas kontaktiramo u vezi sa upitom.</p>
        <button type="submit" disabled={status === "sending"}>
          {status === "sending" ? (
            <><LoaderCircle className="ordum-spin" aria-hidden="true" /> Slanje...</>
          ) : (
            <>Pošalji upit <ArrowRight aria-hidden="true" /></>
          )}
        </button>
      </div>
      {status === "error" ? <p className="ordum-form-error" role="alert">{message}</p> : null}
    </form>
  );
}
