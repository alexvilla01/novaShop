import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProductCard from "../../components/ProductCard";
import CategoryChips from "../../components/CategoryChips";

const base = {
  id: 1,
  slug: "auriculares-pro-x",
  name: "Auriculares Pro X",
  priceCents: 249900,
  imageUrl: null,
  categoryName: "Electrónica",
  categorySlug: "electronica",
  available: true,
};

describe("ProductCard", () => {
  it("muestra el precio formateado en MXN desde centavos", () => {
    render(
      <MemoryRouter>
        <ProductCard product={base} />
      </MemoryRouter>,
    );
    expect(screen.getByText("$2,499.00")).toBeInTheDocument();
  });

  it("muestra chip No Disponible cuando available=false", () => {
    render(
      <MemoryRouter>
        <ProductCard product={{ ...base, available: false }} />
      </MemoryRouter>,
    );
    expect(screen.getByText("No Disponible")).toBeInTheDocument();
  });

  it("usa placeholder cuando no hay imagen", () => {
    const { container } = render(
      <MemoryRouter>
        <ProductCard product={base} />
      </MemoryRouter>,
    );
    expect(container.querySelector("img")).toBeNull();
  });
});

describe("CategoryChips", () => {
  const cats = [
    { id: 1, name: "Electrónica", slug: "electronica" },
    { id: 2, name: "Moda", slug: "moda" },
  ];

  it("marca como activa la categoría actual", () => {
    render(
      <MemoryRouter>
        <CategoryChips categories={cats} activeSlug="moda" />
      </MemoryRouter>,
    );
    expect(screen.getByText("Moda")).toHaveAttribute("aria-current", "page");
  });
});
