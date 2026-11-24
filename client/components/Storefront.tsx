import { useState } from "react";
import AddButton from "./AddButton";
import { Dish, dishCategories, Line, money } from "../domain";
const categories = ["All dishes", ...dishCategories];
const featured = [12, 9, 1, 15, 3, 10];
const rank = (id: number) =>
  featured.includes(id) ? featured.indexOf(id) : 100 + id;
export default function Storefront({
  menu,
  add,
  lines,
  quantity,
  busy,
  home,
}: {
  menu: Dish[];
  add: (id: number) => boolean;
  lines: Line[];
  quantity: (id: number, count: number) => void;
  busy: boolean;
  home: boolean;
}) {
  const [category, filter] = useState(categories[0]),
    [query, search] = useState(""),
    [veg, setVeg] = useState(false);
  const [sort, setSort] = useState("featured");
  const hero = menu.find((i) => i.id === 10);
  const dishes = menu
    .filter(
      (i) =>
        (category === categories[0] || i.category.includes(category)) &&
        (!veg || i.type === "veg") &&
        i.name.toLowerCase().includes(query.toLowerCase().trim()),
    )
    .sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "name") return a.name.localeCompare(b.name);
      return rank(a.id) - rank(b.id);
    });
  return (
    <>
      {home && (
        <section className="hero">
          <div className="hero-copy">
            <small>
              <span className="sun">✳</span> KITCHEN SPECIAL
            </small>
            <h1>
              Masala dosa<span>.</span>
            </h1>
            <p>
              A crisp rice crêpe, spiced potato filling, and a side of South
              Indian comfort.
            </p>
            <AddButton
              variant="hero-btn"
              label={
                hero?.inStock
                  ? "Add to tray · " + money(hero.price)
                  : "Sold out"
              }
              name="Add featured Masala Dosa to tray"
              disabled={busy || !hero?.inStock}
              onAdd={() => !!hero && add(hero.id)}
            />
          </div>
          {hero && (
            <img className="hero-photo" src={hero.image} alt="Masala dosa" />
          )}
        </section>
      )}
      <section aria-label="Menu">
        <div className="menu-heading">
          <div>
            <small>FROM THE COUNTER</small>
            <h2>Campus menu</h2>
          </div>
        </div>
        <div className="menu-tools">
          <div className="search-row">
            <input
              type="search"
              aria-label="Search dishes"
              placeholder="Search dishes…"
              value={query}
              onChange={(e) => search(e.target.value)}
            />
            <label className="veg-toggle">
              <input
                type="checkbox"
                role="switch"
                checked={veg}
                onChange={(e) => setVeg(e.target.checked)}
              />{" "}
              Veg only
            </label>
            <select
              aria-label="Sort dishes"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price low to high</option>
              <option value="price-desc">Price high to low</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>
          <div className="filters" aria-label="Dish categories">
            {categories.map((c) => (
              <button
                key={c}
                aria-pressed={category === c}
                onClick={() => filter(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <p className="result-count" role="status">
            {dishes.length} {dishes.length === 1 ? "item" : "items"}
          </p>
        </div>
        {!dishes.length && (
          <p>
            No dishes match these filters.{" "}
            <button
              onClick={() => {
                search("");
                filter(categories[0]);
                setVeg(false);
              }}
            >
              Clear filters
            </button>
          </p>
        )}
        <div className="cards">
          {dishes.map((i) => {
            const count = lines.find((line) => line.id === i.id)?.quantity ?? 0;
            return (
              <article
                className={i.inStock ? "dish" : "dish sold-out"}
                key={i.id}
              >
                <div className="dish-photo">
                  {i.image && (
                    <img
                      loading="lazy"
                      width={720}
                      height={540}
                      src={i.image}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.hidden = true;
                      }}
                    />
                  )}
                  {!i.inStock && (
                    <span className="sold-out-label">Sold out</span>
                  )}
                </div>
                <div className="dish-info">
                  <small>{i.category[0]}</small>
                  <div className="dish-title">
                    <span
                      className={"diet-mark " + i.type}
                      role="img"
                      aria-label={
                        i.type === "veg" ? "Vegetarian" : "Non-vegetarian"
                      }
                    />
                    <h3>{i.name}</h3>
                    {i.rating && (
                      <span
                        className="rating"
                        aria-label={i.rating + " out of 5 stars"}
                      >
                        ★ {i.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <p>{i.description}</p>
                  <div className="spread">
                    <b className="price">{money(i.price)}</b>
                    <div className="stepper dish-controls">
                      {count > 0 && (
                        <>
                          <button
                            className="dish-decrease"
                            type="button"
                            aria-label={
                              "Remove one " + i.name + " from menu selection"
                            }
                            disabled={busy}
                            onClick={() => quantity(i.id, count - 1)}
                          >
                            −
                          </button>
                          <span
                            className="dish-quantity"
                            aria-label={count + " in tray"}
                          >
                            {count}
                          </span>
                        </>
                      )}
                      <AddButton
                        label={i.inStock ? (count ? "+" : "+ Add") : "Sold out"}
                        name={"Add " + i.name + " to tray"}
                        disabled={busy || !i.inStock || count >= 20}
                        onAdd={() => add(i.id)}
                      />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
