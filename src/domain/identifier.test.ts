import { describe, expect, it } from "vitest";
import { identifiersIn } from "./identifier.ts";

describe("identifiersIn, class names (#118)", () => {
  it.each([
    ["The Booking class holds one row per request.", ["Booking"]],
    ["The class Booking has status late.", ["Booking"]],
    ["Uses class Booking.", ["Booking"]],
    ["Booking rows live in the bookings table.", []],
  ])("takes from %j only the class it names", (text, identifiers) => {
    expect(identifiersIn(text)).toEqual(identifiers);
  });
});
