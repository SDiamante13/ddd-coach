// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { dropUnknownCitations, vetCitations } from "./citationGuard.ts";

const TITLES = ["Bounded Context", "Context Map"];
const answer = (sourceLine: string) => ["DDD shapes software around a shared model.", sourceLine, "Paste a thread when you have one."].join("\n");

describe("dropUnknownCitations", () => {
  it("drops a Source line citing a title the Reference doesn't have, and says which", () => {
    const reply = answer('Source: Evans, Domain-Driven Design Reference (2015), "Domain-Driven Design"');

    expect(dropUnknownCitations(reply, TITLES)).toEqual({
      reply: ["DDD shapes software around a shared model.", "Paste a thread when you have one."].join("\n"),
      dropped: ['Source: Evans, Domain-Driven Design Reference (2015), "Domain-Driven Design"'],
    });
  });

  it.each([
    ["a verbatim citation", answer('Source: Evans, Domain-Driven Design Reference (2015), "Bounded Context".')],
    ["no Source line", "Events, in order\n1. From thread: The customer submits a booking."],
  ])("leaves a reply with %s untouched", (_case, reply) => {
    expect(dropUnknownCitations(reply, TITLES)).toEqual({ reply, dropped: [] });
  });

  it("drops a Source line that isn't the Reference at all", () => {
    expect(dropUnknownCitations(answer("Source: Wikipedia, Domain-driven design."), TITLES).dropped).toEqual(["Source: Wikipedia, Domain-driven design."]);
  });
});

describe("vetCitations", () => {
  it("checks titles against the DDD Reference itself and logs only what it dropped", () => {
    const log = vi.fn();
    const vet = vetCitations(log);

    expect(vet(answer('Source: Evans, Domain-Driven Design Reference (2015), "Bounded Context".'))).toContain('"Bounded Context"');
    expect(log).not.toHaveBeenCalled();
    expect(vet(answer('Source: Evans, Domain-Driven Design Reference (2015), "Domain-Driven Design"'))).not.toContain("Source:");
    expect(log).toHaveBeenCalledWith(['Source: Evans, Domain-Driven Design Reference (2015), "Domain-Driven Design"']);
  });
});
