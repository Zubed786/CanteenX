import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import {
  canManageKitchen,
  Dish,
  Line,
  money,
  readSaved,
  Ticket,
  ticketToken,
  User,
} from "./domain";
import AddButton from "./components/AddButton";
import Account from "./components/Account";
import Storefront from "./components/Storefront";
import Tickets from "./components/Tickets";
import "@fontsource/poppins/latin-400.css";
import "@fontsource/poppins/latin-600.css";
import "./styles.css";

interface Tray {
  key: string;
  lines: Line[];
}
interface SavedTray {
  name: string;
  lines: Line[];
}
const fresh = (lines: Line[] = []): Tray => ({
  key: crypto.randomUUID(),
  lines,
});
const pageFromHash = () =>
  ["home", "menu", "cart", "orders", "kitchen"].includes(location.hash.slice(1))
    ? location.hash.slice(1)
    : "home";
function Mark() {
  return (
    <span className="mark" aria-hidden="true">
      <svg
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      >
        <path d="M4 22h24M6 20a10 10 0 0 1 20 0M15 7h2M8 26h16" />
      </svg>
    </span>
  );
}
export default function App() {
  const [menu, setMenu] = useState<Dish[]>([]),
    [user, setUser] = useState<User | null>(null),
    [ready, setReady] = useState(false),
    [page, setPage] = useState(pageFromHash);
  const [account, setAccount] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  const [tray, setTray] = useState<Tray>(() => readSaved("cx.tray", fresh())),
    [savedName, setSavedName] = useState(""),
    [savedRevision, bumpSaved] = useState(0);
  const [dark, setDark] = useState(() => readSaved("cx.dark", false));
  const [pickupMinutes, setPickupMinutes] = useState(0);
  const [instructions, setInstructions] = useState("");
  const [clearedTray, setClearedTray] = useState<Tray | null>(null);
  const [lastMeal, setLastMeal] = useState<Ticket | null>(null);
  const [acceptingOrders, setAcceptingOrders] = useState<boolean | null>(null);
  const savedKey = "cx.meals." + (user?.id ?? "guest");
  const saved = readSaved<SavedTray[]>(savedKey, []);
  useEffect(() => {
    const expire = () => {
      setUser(null);
      setAccount(true);
    };
    window.addEventListener("session-expired", expire);
    return () => window.removeEventListener("session-expired", expire);
  }, []);
  useEffect(() => {
    let live = true;
    setLastMeal(null);
    if (user && page === "home") {
      api<Ticket[]>("/orders")
        .then((tickets) => {
          if (live)
            setLastMeal(
              tickets.find((ticket) => ticket.status === "COMPLETED") ?? null,
            );
        })
        .catch(() => {});
    }
    return () => {
      live = false;
    };
  }, [user, page]);
  function saveMeals(meals: SavedTray[]) {
    localStorage.setItem(savedKey, JSON.stringify(meals));
    bumpSaved(savedRevision + 1);
  }
  const reloadMenu = useCallback(async () => {
    const [dishes, settings] = await Promise.all([
      api<Dish[]>("/menu"),
      api<{ acceptingOrders: boolean }>("/kitchen/settings"),
    ]);
    setMenu(dishes);
    setAcceptingOrders(settings.acceptingOrders);
  }, []);
  useEffect(() => {
    const change = () => {
      setPage(pageFromHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    Promise.all([reloadMenu(), api<User | null>("/session").then(setUser)])
      .catch((e) => setError(e.message))
      .finally(() => setReady(true));
  }, [reloadMenu]);
  useEffect(() => {
    const timer = setInterval(() => {
      if (!document.hidden) reloadMenu().catch(() => {});
    }, 15000);
    return () => clearInterval(timer);
  }, [reloadMenu]);
  useEffect(() => {
    localStorage.setItem("cx.tray", JSON.stringify(tray));
  }, [tray]);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("cx.dark", JSON.stringify(dark));
  }, [dark]);
  useEffect(() => {
    if (notice) {
      const id = setTimeout(
        () => {
          setNotice("");
          setClearedTray(null);
        },
        clearedTray ? 5000 : 2600,
      );
      return () => clearTimeout(id);
    }
  }, [notice, clearedTray]);
  function quantity(id: number, n: number) {
    setClearedTray(null);
    setTray((t) => {
      if (n <= 0) return fresh(t.lines.filter((line) => line.id !== id));
      const updated = { id, quantity: Math.min(20, n) };
      return fresh(
        t.lines.some((line) => line.id === id)
          ? t.lines.map((line) => (line.id === id ? updated : line))
          : [...t.lines, updated],
      );
    });
  }
  function add(id: number) {
    const dish = menu.find((item) => item.id === id);
    if (busy || !dish?.inStock) return false;
    const current = tray.lines.find((line) => line.id === id)?.quantity ?? 0;
    if (current >= 20) {
      setNotice("You can add up to 20 per dish.");
      return false;
    }
    quantity(id, current + 1);
    setNotice(dish.name + " added to tray · " + (current + 1) + " in tray");
    return true;
  }
  const lines = tray.lines.flatMap((l) => {
    const item = menu.find((i) => i.id === l.id);
    return item ? [{ ...item, quantity: l.quantity }] : [];
  });
  const total = lines.reduce((s, i) => s + i.price * i.quantity, 0),
    count = lines.reduce((s, i) => s + i.quantity, 0);
  function reorder(previous: Line[]) {
    const available = previous.filter((line) =>
      menu.some((item) => item.id === line.id && item.inStock),
    );
    if (!available.length) {
      setError("The dishes from this order are currently unavailable.");
      return;
    }
    setClearedTray(null);
    setTray(
      fresh(
        available.map(({ id, quantity }) => ({
          id,
          quantity: Math.min(20, quantity),
        })),
      ),
    );
    setError(
      available.length === previous.length
        ? ""
        : "Some dishes are unavailable. Review your tray before checking out.",
    );
    location.hash = "cart";
  }
  async function place() {
    if (!user) {
      setAccount(true);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const ticket = await api<{ id: number }>("/orders", "POST", {
        items: tray.lines,
        requestKey: tray.key,
        pickupMinutes,
        instructions,
      });
      setTray(fresh());
      location.hash = "orders";
      setPickupMinutes(0);
      setInstructions("");
      setNotice("Ticket " + ticketToken(ticket.id) + " placed");
    } catch (e) {
      setError((e as Error).message);
      await reloadMenu().catch(() => {});
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    try {
      await api("/logout", "POST", {});
      setUser(null);
      setTray(fresh());
      setClearedTray(null);
      setInstructions("");
      setPickupMinutes(0);
      location.hash = "menu";
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <>
      <header>
        <div className="top">
          <a href="#home" className="brand">
            <Mark />
            Canteen<span>X</span>
          </a>
          <nav aria-label="Main">
            {[
              "home",
              "menu",
              "orders",
              ...(canManageKitchen(user) ? ["kitchen"] : []),
            ].map((p) => (
              <a
                key={p}
                href={"#" + p}
                aria-current={page === p ? "page" : undefined}
              >
                {p === "home"
                  ? "Home"
                  : p === "menu"
                    ? "Menu"
                    : p === "orders"
                      ? "My orders"
                      : "Kitchen"}
              </a>
            ))}
          </nav>
          <div className="actions">
            {user ? (
              <details className="profile">
                <summary>Account</summary>
                <div className="profile-links">
                  <a href="#orders">My orders</a>
                  {canManageKitchen(user) && (
                    <a href="#kitchen">Kitchen dashboard</a>
                  )}
                  <button onClick={() => setDark(!dark)}>
                    {dark ? "Light mode" : "Dark mode"}
                  </button>
                  <button disabled={busy} onClick={logout}>
                    Sign out
                  </button>
                </div>
              </details>
            ) : (
              <>
                <button
                  aria-label="Switch theme"
                  onClick={() => setDark(!dark)}
                >
                  {dark ? "☀" : "☾"}
                </button>
                <button onClick={() => setAccount(true)}>Sign in</button>
              </>
            )}
            <a
              className="top-tray"
              href="#cart"
              onClick={() => setAccount(false)}
            >
              Tray <span className="count">{count}</span> {money(total)}
            </a>
          </div>
        </div>
      </header>
      <main>
        {error && (
          <div className="alert" role="alert">
            {error}{" "}
            <button
              onClick={() => {
                setError("");
                if (!menu.length) location.reload();
              }}
            >
              {" "}
              {menu.length ? "Dismiss" : "Retry"}{" "}
            </button>
          </div>
        )}
        {account ? (
          <Account
            close={() => setAccount(false)}
            login={(u) => {
              setUser(u);
              setAccount(false);
              setError("");
              setNotice("Signed in as " + u.name);
            }}
          />
        ) : !ready || !menu.length ? (
          ready ? (
            <p>Menu unavailable.</p>
          ) : (
            <div className="cards" aria-label="Loading menu" aria-busy="true">
              {[1, 2, 3].map((id) => (
                <div className="skeleton-card" key={id} />
              ))}
            </div>
          )
        ) : ["home", "menu", "cart"].includes(page) ? (
          <div className="layout">
            {page !== "cart" && (
              <div>
                {page === "home" && acceptingOrders !== null && (
                  <p className="kitchen-status">
                    {acceptingOrders
                      ? "Kitchen open for orders"
                      : "Kitchen closed to new orders"}
                  </p>
                )}
                {page === "home" && lastMeal && (
                  <div className="spread panel last-meal">
                    <span>Order your last meal again</span>
                    <button onClick={() => reorder(lastMeal.items)}>
                      Reorder
                    </button>
                  </div>
                )}
                <Storefront
                  menu={menu}
                  add={add}
                  lines={tray.lines}
                  quantity={quantity}
                  busy={busy}
                  home={page === "home"}
                />
              </div>
            )}
            <section
              className={
                page === "cart"
                  ? "tray-items panel"
                  : "tray-items tray-preview panel"
              }
            >
              <small>COUNTER PICKUP</small>
              <div className="spread">
                <h2>Your tray</h2>
                <span className="count">{count}</span>
              </div>
              {!lines.length ? (
                <div className="empty">
                  <Mark />
                  <h3>Your tray is empty</h3>
                  <p>Add a dish from the menu to start your order.</p>
                  <a className="outline-link" href="#menu">
                    Browse menu
                  </a>
                </div>
              ) : (
                <div>
                  {lines.map((i) => (
                    <div className="tray-line" key={i.id}>
                      <div className="spread">
                        <b>{i.name}</b>
                        <b>{money(i.quantity * i.price)}</b>
                      </div>
                      <div className="stepper">
                        <button
                          aria-label={"Remove one " + i.name}
                          disabled={busy}
                          onClick={() => quantity(i.id, i.quantity - 1)}
                        >
                          −
                        </button>
                        {i.quantity}
                        <AddButton
                          variant="compact"
                          label="+"
                          name={"Add one " + i.name}
                          disabled={busy || !i.inStock || i.quantity >= 20}
                          onAdd={() => add(i.id)}
                        />
                        {!i.inStock && <strong>Sold out</strong>}
                        <button
                          className="remove-line"
                          type="button"
                          aria-label={"Remove " + i.name + " from tray"}
                          disabled={busy}
                          onClick={() => quantity(i.id, 0)}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                          >
                            <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7m4-7v7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {page === "cart" && count > 0 && (
                <button
                  disabled={busy}
                  onClick={() => {
                    setClearedTray(tray);
                    setTray(fresh());
                    setNotice("Tray cleared");
                  }}
                >
                  Clear tray
                </button>
              )}
              {page !== "cart" && (
                <a className="outline-link" href="#cart">
                  Review tray · {money(total)}
                </a>
              )}
            </section>
            {page === "cart" && (
              <aside className="order-summary" aria-label="Order summary">
                <h2>Order summary</h2>
                <div className="checkout-fields">
                  <label>
                    Pickup time
                    <select
                      disabled={busy}
                      value={pickupMinutes}
                      onChange={(e) => {
                        setPickupMinutes(Number(e.target.value));
                        setTray((t) => fresh(t.lines));
                      }}
                    >
                      <option value={0}>As soon as possible</option>
                      <option value={15}>In 15 minutes</option>
                      <option value={30}>In 30 minutes</option>
                    </select>
                  </label>
                  <label>
                    Special instructions (optional)
                    <textarea
                      disabled={busy}
                      maxLength={240}
                      value={instructions}
                      onChange={(e) => {
                        setInstructions(e.target.value);
                        setTray((t) => fresh(t.lines));
                      }}
                    />
                  </label>
                </div>
                <div className="checkout-action">
                  <div className="spread total">
                    <span>Total</span>
                    <b>{money(total)}</b>
                  </div>
                  <p className="payment">Pay at the pickup counter</p>
                  <button
                    className="primary"
                    disabled={
                      busy ||
                      !acceptingOrders ||
                      !count ||
                      lines.some((i) => !i.inStock)
                    }
                    onClick={place}
                  >
                    {busy && <span className="spinner" aria-hidden="true" />}
                    {busy
                      ? "Placing order…"
                      : !acceptingOrders
                        ? "Kitchen closed"
                        : user
                          ? "Place pickup order"
                          : "Sign in to order"}
                  </button>
                </div>
                {user && (
                  <details>
                    <summary>Saved trays</summary>
                    {saved.map((s, n) => (
                      <div className="spread line" key={n}>
                        <button
                          disabled={busy}
                          onClick={() => setTray(fresh(s.lines))}
                        >
                          {s.name}
                        </button>
                        <button
                          aria-label={"Delete " + s.name}
                          onClick={() =>
                            saveMeals(saved.filter((_, j) => j !== n))
                          }
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (count && savedName.trim()) {
                          saveMeals([
                            ...saved,
                            { name: savedName.trim(), lines: tray.lines },
                          ]);
                          setSavedName("");
                          setNotice("Tray saved");
                        }
                      }}
                    >
                      <label>
                        Save current tray
                        <input
                          value={savedName}
                          onChange={(e) => setSavedName(e.target.value)}
                          required
                          maxLength={40}
                          placeholder="Lunch between classes"
                        />
                      </label>
                      <button disabled={!count}>Save tray</button>
                    </form>
                  </details>
                )}
              </aside>
            )}
          </div>
        ) : !user ? (
          <section className="workspace">
            <h1>My orders</h1>
            <p>Sign in to see your pickup tickets.</p>
            <button onClick={() => setAccount(true)}>Sign in</button>
          </section>
        ) : page === "kitchen" && !canManageKitchen(user) ? (
          <p>Kitchen access required.</p>
        ) : (
          <Tickets
            key={user.id + page}
            kitchen={page === "kitchen"}
            menu={menu}
            reloadMenu={reloadMenu}
            acceptingOrders={acceptingOrders === true}
            reorder={reorder}
          />
        )}
      </main>
      <footer>
        <b>CanteenX</b>
        <span>Campus kitchen · Counter pickup</span>
      </footer>
      <nav className="bottom-nav" aria-label="Mobile navigation">
        {Object.entries({
          home: "Home",
          menu: "Menu",
          cart: "Tray",
          orders: "Orders",
        }).map(([id, label]) => (
          <a
            key={id}
            href={"#" + id}
            aria-current={page === id ? "page" : undefined}
            onClick={() => setAccount(false)}
          >
            {label}
            {id === "cart" && <span className="count">{count}</span>}
          </a>
        ))}
      </nav>
      {notice && (
        <div className="toast" role="status">
          {notice}
          {clearedTray && !count && (
            <button
              onClick={() => {
                setTray(clearedTray);
                setClearedTray(null);
                setNotice("Tray restored");
              }}
            >
              Undo
            </button>
          )}
        </div>
      )}
    </>
  );
}
