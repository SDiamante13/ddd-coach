import { render, screen } from "@testing-library/react";
import { App } from "./App.tsx";

describe("App", () => {
  it("renders the heading", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "DDD Coach" })).toBeInTheDocument();
  });
});
