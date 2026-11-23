import { useCallback, useEffect, useState } from "react";
import { api, Dish, Line, money, readSaved, User } from "./domain";
import Account from "./components/Account";
import Storefront from "./components/Storefront";
import Tickets from "./components/Tickets";
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
  ["orders", "kitchen"].includes(location.hash.slice(1))
    ? location.hash.slice(1)
    : "menu";
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
  const savedKey = "cx.meals." + (user?.id ?? "guest");
  const saved = readSaved<SavedTray[]>(savedKey, []);
  useEffect(() => {
    const expire = () => { setUser(null); setAccount(true); };
    window.addEventListener("session-expired", expire);
    return () => window.removeEventListener("session-expired", expire);
  }, []);
  function saveMeals(meals: SavedTray[]) {
    localStorage.setItem(savedKey, JSON.stringify(meals));
    bumpSaved(savedRevision + 1);
  }
  const reloadMenu = useCallback(
    async () => setMenu(await api<Dish[]>("/menu")),
    [],
  );
  useEffect(() => {
    const change = () => setPage(pageFromHash());
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    Promise.all([reloadMenu(), api<User | null>("/session").then(setUser)])
      .catch((e) => setError(e.message))
      .finally(() => setReady(true));
  }, [reloadMenu]);
  useEffect(() => {
    const timer = setInterval(() => reloadMenu().catch(() => {}), 15000);
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
      const id = setTimeout(() => setNotice(""), 2600);
      return () => clearTimeout(id);
    }
  }, [notice]);
  function quantity(id: number, n: number) {
    setTray((t) =>
      fresh([
        ...t.lines.filter((i) => i.id !== id),
        ...(n > 0 ? [{ id, quantity: Math.min(20, n) }] : []),
      ]),
    );
  }
  function add(id: number) {
    if (busy) return;
    setTray((t) => {
      const n = t.lines.find((i) => i.id === id)?.quantity || 0;
      return fresh([
        ...t.lines.filter((i) => i.id !== id),
        { id, quantity: Math.min(n + 1, 20) },
      ]);
    });
    setNotice("Tray updated");
  }
  const lines = tray.lines.flatMap((l) => {
    const item = menu.find((i) => i.id === l.id);
    return item ? [{ ...item, quantity: l.quantity }] : [];
  });
  const total = lines.reduce((s, i) => s + i.price * i.quantity, 0),
    count = lines.reduce((s, i) => s + i.quantity, 0);
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
      });
      setTray(fresh());
      location.hash = "orders";
      setNotice("Ticket #" + ticket.id + " placed");
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
      location.hash = "menu";
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <>
      <header>
        <div className="top">
          <a href="#menu" className="brand">
            <Mark />
            Canteen<span>X</span>
          </a>
          <nav aria-label="Main">
            {[
              "menu",
              "orders",
              ...(user?.role === "staff" ? ["kitchen"] : []),
            ].map((p) => (
              <a
                key={p}
                href={"#" + p}
                aria-current={page === p ? "page" : undefined}
              >
                {p === "menu"
                  ? "Menu"
                  : p === "orders"
                    ? "My orders"
                    : "Kitchen"}
              </a>
            ))}
          </nav>
          <div className="actions">
            <button
              title="Switch theme"
              aria-label="Switch theme"
              onClick={() => setDark(!dark)}
            >
              {dark ? "☀" : "☾"}
            </button>
            <button disabled={busy} onClick={() => (user ? logout() : setAccount(true))}>
              {user ? "Sign out" : "Sign in"}
            </button>
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
        {!ready || !menu.length ? (
          <p>{ready ? "Menu unavailable." : "Opening the kitchen…"}</p>
        ) : page === "menu" ? (
          <div className="layout">
            <div>
              <Storefront menu={menu} add={add} />
            </div>
            <aside id="tray">
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
                        <button
                          aria-label={"Add one " + i.name}
                          disabled={busy || i.quantity >= 20}
                          onClick={() => quantity(i.id, i.quantity + 1)}
                        >
                          +
                        </button>
                        {!i.inStock && <strong>Sold out</strong>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="spread total">
                <span>Total</span>
                <b>{money(total)}</b>
              </div>
              <p className="payment">Pay at the pickup counter</p>
              <button
                className="primary"
                disabled={busy || !count || lines.some((i) => !i.inStock)}
                onClick={place}
              >
                {busy
                  ? "Placing order…"
                  : user
                    ? "Place pickup order"
                    : "Sign in to order"}
              </button>
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
            <a
              className="mobile-tray"
              href="#tray"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("tray")?.scrollIntoView();
              }}
            >
              Your tray · {count} · {money(total)}
            </a>
          </div>
        ) : !user ? (
          <section className="workspace">
            <h1>My orders</h1>
            <p>Sign in to see your pickup tickets.</p>
            <button onClick={() => setAccount(true)}>Sign in</button>
          </section>
        ) : page === "kitchen" && user.role !== "staff" ? (
          <p>Kitchen access required.</p>
        ) : (
          <Tickets
            key={user.id + page}
            kitchen={page === "kitchen"}
            menu={menu}
            reloadMenu={reloadMenu}
          />
        )}
      </main>
      <footer>
        <b>CanteenX</b>
        <span>Campus kitchen · Counter pickup</span>
      </footer>
      {account && (
        <Account
          close={() => setAccount(false)}
          login={(u) => {
            setUser(u);
            setAccount(false);
            setNotice("Signed in as " + u.name);
          }}
        />
      )}
      {notice && (
        <div className="toast" role="status">
          {notice}
        </div>
      )}
    </>
  );
}
