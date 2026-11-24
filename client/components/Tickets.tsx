import { useState, useEffect } from "react";
import { api } from "../api";
import { Dish, Line, money, Ticket, statuses, ticketToken } from "../domain";
import MenuEditor from "./MenuEditor";
const icons = {
  PLACED: "◷",
  PREPARING: "♨",
  READY: "✓",
  COMPLETED: "✓",
  CANCELLED: "×",
};
const steps = ["PLACED", "PREPARING", "READY", "COMPLETED"] as const;
const action: Record<string, string> = {
  PLACED: "Start preparing",
  PREPARING: "Mark ready",
  READY: "Confirm pickup",
};
export default function Tickets({
  kitchen,
  menu,
  reloadMenu,
  acceptingOrders,
  reorder,
}: {
  kitchen: boolean;
  menu: Dish[];
  reloadMenu: () => Promise<void>;
  acceptingOrders: boolean;
  reorder: (lines: Line[]) => void;
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
  const [estimates, setEstimates] = useState<Record<number, number>>({});
  useEffect(() => {
    let live = true;
    let timer: ReturnType<typeof setTimeout>;
    let pending = false;
    async function poll() {
      if (document.hidden || pending) return;
      pending = true;
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
        pending = false;
        if (live && !document.hidden) timer = setTimeout(poll, 5000);
      }
    }
    const resume = () => {
      clearTimeout(timer);
      void poll();
    };
    poll();
    document.addEventListener("visibilitychange", resume);
    return () => {
      live = false;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", resume);
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
  const newestActive = tickets?.find((ticket) =>
    ["PLACED", "PREPARING", "READY"].includes(ticket.status),
  );
  return (
    <section className="workspace">
      <small>CAMPUS PICKUP</small>
      <h1>{kitchen ? "Kitchen counter" : "My orders"}</h1>
      {kitchen && (
        <section className="panel spread">
          <strong>
            {acceptingOrders ? "Accepting orders" : "New orders paused"}
          </strong>
          <button
            disabled={busy}
            onClick={() =>
              run(async () => {
                await api("/kitchen/settings", "PATCH", {
                  acceptingOrders: !acceptingOrders,
                });
                await reloadMenu();
              })
            }
          >
            {acceptingOrders ? "Pause new orders" : "Resume orders"}
          </button>
        </section>
      )}
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
              <h2 className="ticket-token">{ticketToken(t.id)}</h2>
              <strong className="tag">
                <span aria-hidden="true">{icons[t.status]}</span>{" "}
                {statuses[t.status]}
              </strong>
            </div>
            <p>
              {kitchen && t.name + " · "}
              {new Date(t.created).toLocaleString()}
            </p>
            {t.pickupAt && (
              <p>
                Requested pickup at{" "}
                {new Date(t.pickupAt).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            )}
            {t.status === "PREPARING" && t.readyAt && (
              <p>
                Estimated ready at{" "}
                {new Date(t.readyAt).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            )}
            {t.instructions && (
              <p className="ticket-instructions">
                <b>Instructions</b> {t.instructions}
              </p>
            )}
            {!kitchen && newestActive?.id === t.id && (
              <ol className="order-progress" aria-label="Pickup progress">
                {steps.map((step, index) => (
                  <li
                    key={step}
                    aria-current={step === t.status ? "step" : undefined}
                    data-reached={
                      index <= steps.findIndex((value) => value === t.status)
                    }
                  >
                    {statuses[step]}
                  </li>
                ))}
              </ol>
            )}
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
              {kitchen && t.status === "PLACED" && (
                <select
                  aria-label={"Ready time estimate for " + ticketToken(t.id)}
                  value={estimates[t.id] || 0}
                  onChange={(e) =>
                    setEstimates((current) => ({
                      ...current,
                      [t.id]: Number(e.target.value),
                    }))
                  }
                >
                  <option value={0}>No estimate</option>
                  {[5, 10, 15, 20, 30, 45, 60].map((minutes) => (
                    <option value={minutes} key={minutes}>
                      {minutes} min
                    </option>
                  ))}
                </select>
              )}
              {(kitchen || t.status === "PLACED") && (
                <button
                  disabled={busy}
                  onClick={() =>
                    run(async () => {
                      await api(
                        kitchen
                          ? "/orders/" + t.id + "/status"
                          : "/orders/" + t.id + "/cancel",
                        "PATCH",
                        {
                          from: t.status,
                          estimateMinutes: kitchen
                            ? estimates[t.id] || undefined
                            : undefined,
                        },
                      );
                    })
                  }
                >
                  {kitchen ? action[t.status] : "Cancel order"}
                </button>
              )}
              {!kitchen && ["COMPLETED", "CANCELLED"].includes(t.status) && (
                <button onClick={() => reorder(t.items)}>Reorder</button>
              )}
            </div>
          </article>
        ))
      )}
      {kitchen ? (
        <>
          <MenuEditor menu={menu} reload={reloadMenu} />
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
