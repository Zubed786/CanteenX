import { useEffect, useRef, useState } from "react";
import { api, User } from "../domain";
export default function Account({
  close,
  login,
}: {
  close: () => void;
  login: (user: User) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [create, setCreate] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog ref={ref} onCancel={close} aria-labelledby="auth-title">
      <div className="spread">
        <small>CANTEENX ACCOUNT</small>
        <button onClick={close} aria-label="Close sign in">
          ×
        </button>
      </div>
      <h2 id="auth-title">{create ? "Create an account" : "Welcome back"}</h2>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const data = Object.fromEntries(new FormData(e.currentTarget));
          setBusy(true);
          setError("");
          try {
            login(
              await api<User>(
                "/users/" + (create ? "signup" : "login"),
                "POST",
                data,
              ),
            );
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {create && (
          <label>
            Name
            <input name="name" maxLength={80} required autoComplete="name" />
          </label>
        )}
        <label>
          Email
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            minLength={10}
            maxLength={128}
            required
            autoComplete={create ? "new-password" : "current-password"}
          />
        </label>
        {create && <p>Use at least 10 characters.</p>}
        {error && <p role="alert">{error}</p>}
        <button className="primary" disabled={busy}>
          {busy ? "Please wait…" : create ? "Create account" : "Sign in"}
        </button>
      </form>
      <button
        className="link"
        onClick={() => {
          setCreate(!create);
          setError("");
        }}
      >
        {create
          ? "Already registered? Sign in"
          : "New to CanteenX? Create an account"}
      </button>
    </dialog>
  );
}
