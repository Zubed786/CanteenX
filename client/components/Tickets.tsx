import { useState, useEffect } from "react";
import { api, Dish, money, Ticket, statuses } from "../domain";
const action: Record<string, string> = {
  PLACED: "Start preparing",
  PREPARING: "Mark ready",
  READY: "Confirm pickup",
};
export default function Tickets({
  kitchen,
  menu,
  reloadMenu,
}: {
  kitchen: boolean;
  menu: Dish[];
  reloadMenu: () => Promise<void>;
}) {
  const [tickets, setTickets] = useState<Ticket[] | null>(null),
    [error, setError] = useState(""),
    [revision, refresh] = useState(0);
  const [notes, setNotes] = useState<
      { id: number; name: string; message: string }[]
    >([]),
    [message, setMessage] = useState(""),
    [sent, setSent] = useState(false),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    let live = true;
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      try {
        const rows = await api<Ticket[]>(kitchen ? "/kitchen" : "/orders");
        if (live) setTickets(rows);
        if (kitchen) {
          const list = await api<typeof notes>("/feedback");
          if (live) setNotes(list);
        }
      } catch (e) {
        if (live) setError((e as Error).message);
      } finally {
        if (live) timer = setTimeout(poll, 5000);
      }
    }
    poll();
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [kitchen, revision]);
  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      refresh((n) => n + 1);
    }
  }
  return (
    <section className="workspace">
      <small>CAMPUS PICKUP</small>
      <h1>{kitchen ? "Kitchen counter" : "My orders"}</h1>
      {error && <p role="alert">{error}</p>}
      {tickets === null ? (
        <p>Loading tickets…</p>
      ) : tickets.length === 0 ? (
        <p className="panel">
          {kitchen
            ? "The kitchen queue is clear."
            : "Your pickup tickets will appear here after checkout."}
        </p>
      ) : (
        tickets.map((t) => (
          <article className="panel" key={t.id}>
            <div className="spread">
              <h2>Ticket #{t.id}</h2>
              <strong className="tag">{statuses[t.status]}</strong>
            </div>
            <p>
              {kitchen && t.name + " · "}
              {new Date(t.created).toLocaleString()}
            </p>
            {t.items.map((i, n) => (
              <div className="spread line" key={n}>
                <span>
                  {i.quantity} × {i.name}
                </span>
                <b>{money(i.price * i.quantity)}</b>
              </div>
            ))}
            <div className="spread">
              <b>Total {money(t.total)}</b>
              {(kitchen || t.status === "PLACED") && (
                <button
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      await api(
                        kitchen
                          ? "/kitchen/" + t.id
                          : "/orders/" + t.id + "/cancel",
                        "PATCH",
                        { from: t.status },
                      );
                    })
                  }
                >
                  {kitchen ? action[t.status] : "Cancel order"}
                </button>
              )}
            </div>
          </article>
        ))
      )}
      {kitchen ? (
        <>
          <details className="panel">
            <summary>Menu availability</summary>
            {menu.map((i) => (
              <div className="spread line" key={i.id}>
                {i.name}
                <button
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      await api("/menu/" + i.id, "PATCH", {
                        available: !i.inStock,
                      });
                      await reloadMenu();
                    })
                  }
                >
                  {i.inStock ? "Mark sold out" : "Make available"}
                </button>
              </div>
            ))}
          </details>
          <details className="panel">
            <summary>Customer feedback ({notes.length})</summary>
            {notes.map((n) => (
              <p key={n.id}>
                <b>{n.name}</b> · {n.message}
              </p>
            ))}
          </details>
        </>
      ) : (
        <details className="panel">
          <summary>Leave kitchen feedback</summary>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                await api("/feedback", "POST", { message });
                setMessage("");
                setSent(true);
              });
            }}
          >
            <label>
              Your message
              <textarea
                value={message}
                required
                maxLength={1000}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setSent(false);
                }}
              />
            </label>
            <button disabled={busy}>Send feedback</button>
            {sent && <p role="status">Feedback sent to the kitchen.</p>}
          </form>
        </details>
      )}
    </section>
  );
}
