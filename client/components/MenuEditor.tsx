import { useState } from "react";
import { Dish, dishCategories } from "../domain";
import { api } from "../api";

export default function MenuEditor({
  menu,
  reload,
}: {
  menu: Dish[];
  reload: () => Promise<void>;
}) {
  const [selection, select] = useState("new");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const dish = menu.find((item) => String(item.id) === selection);
  return (
    <details className="panel">
      <summary>Edit menu</summary>
      <label className="field">
        Dish
        <select
          value={selection}
          disabled={busy}
          onChange={(event) => {
            select(event.target.value);
            setError("");
            setSaved("");
          }}
        >
          <option value="new">New dish</option>
          {menu.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <form
        key={selection}
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setBusy(true);
          setError("");
          setSaved("");
          try {
            const result = await api<{ id?: number }>(
              dish ? "/menu/" + dish.id : "/menu",
              dish ? "PUT" : "POST",
              {
                name: data.get("name"),
                description: data.get("description"),
                price: Number(data.get("price")),
                type: data.get("type"),
                category: [data.get("category")],
              },
            );
            await reload();
            if (result.id) select(String(result.id));
            setSaved("Dish saved.");
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Name
          <input
            name="name"
            maxLength={80}
            defaultValue={dish?.name}
            required
          />
        </label>
        <label>
          Description
          <textarea
            name="description"
            maxLength={400}
            defaultValue={dish?.description}
            required
          />
        </label>
        <label>
          Price (₹)
          <input
            name="price"
            type="number"
            min={1}
            max={10000}
            step={1}
            defaultValue={dish?.price}
            required
          />
        </label>
        <label>
          Diet
          <select name="type" defaultValue={dish?.type}>
            <option value="veg">Vegetarian</option>
            <option value="non-veg">Non-veg</option>
          </select>
        </label>
        <label>
          Category
          <select name="category" defaultValue={dish?.category[0]}>
            {dishCategories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>
        <button disabled={busy}>{busy ? "Saving…" : "Save dish"}</button>
      </form>
      {error && <p role="alert">{error}</p>}
      <p role="status">{saved}</p>
    </details>
  );
}
