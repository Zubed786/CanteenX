import { useState } from "react";
import { Dish, money } from "../domain";
const categories = [
  "All dishes",
  "Meals",
  "Snacks",
  "Sandwiches",
  "Salads",
  "Drinks",
];
const featured = [12, 9, 1, 15, 3, 10];
const rank = (id: number) =>
  featured.includes(id) ? featured.indexOf(id) : 100 + id;
export default function Storefront({
  menu,
  add,
}: {
  menu: Dish[];
  add: (id: number) => void;
}) {
  const [category, filter] = useState(categories[0]),
    [query, search] = useState(""),
    [veg, setVeg] = useState(false);
  const hero = menu.find((i) => i.id === 10);
  const dishes = menu
    .filter(
      (i) =>
        (category === categories[0] || i.category.includes(category)) &&
        (!veg || i.type === "veg") &&
        i.name.toLowerCase().includes(query.toLowerCase().trim()),
    )
    .sort((a, b) => rank(a.id) - rank(b.id));
  return (
    <>
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
          <button
            className="hero-btn"
            disabled={!hero?.inStock}
            onClick={() => hero && add(hero.id)}
          >
            {hero?.inStock ? "Add to tray · " + money(hero.price) : "Sold out"}
          </button>
        </div>
        {hero && (
          <img className="hero-photo" src={hero.image} alt="Masala dosa" />
        )}
      </section>
      <section aria-label="Menu">
        <div className="menu-heading">
          <div>
            <small>FROM THE COUNTER</small>
            <h2>Campus menu</h2>
          </div>
          <input
            type="search"
            aria-label="Search dishes"
            placeholder="Search dishes…"
            value={query}
            onChange={(e) => search(e.target.value)}
          />
        </div>
        <div className="filters">
          {categories.map((c) => (
            <button
              key={c}
              aria-pressed={category === c}
              onClick={() => filter(c)}
            >
              {c}
            </button>
          ))}
          <label>
            <input
              type="checkbox"
              checked={veg}
              onChange={(e) => setVeg(e.target.checked)}
            />{" "}
            Veg only
          </label>
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
          {dishes.map((i) => (
            <article className="dish" key={i.id}>
              <div className="dish-photo">
                <img
                  loading="lazy"
                  src={i.image}
                  alt=""
                  onError={(e) => {
                    e.currentTarget.hidden = true;
                  }}
                />
                <span className="diet">
                  {i.type === "veg" ? "Vegetarian" : "Non-veg"}
                </span>
              </div>
              <div className="dish-info">
                <small>{i.category[0]}</small>
                <h3>{i.name}</h3>
                <p>{i.description}</p>
                <div className="spread">
                  <b>{money(i.price)}</b>
                  <button
                    disabled={!i.inStock}
                    aria-label={"Add " + i.name + " to tray"}
                    onClick={() => add(i.id)}
                  >
                    {i.inStock ? "+ Add" : "Sold out"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
