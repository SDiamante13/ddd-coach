// @vitest-environment node
import { describe, expect, it } from "vitest";
import { DDD_REFERENCE } from "./dddReference.ts";
import { referenceTitles } from "./sections.ts";

describe("referenceTitles", () => {
  const titles = referenceTitles(DDD_REFERENCE);

  it("lists the Reference's 54 contents titles", () => {
    expect(titles).toHaveLength(54);
  });

  it.each([["Bounded Context"], ["Customer/Supplier Development"], ["I. Putting the Model to Work"], ["Domain Events"], ["Big Ball of Mud"]])(
    "holds %s exactly, without page numbers or the new-term star",
    (title) => {
      expect(titles).toContain(title);
    },
  );

  it("finds every section title again as a heading in the Reference's body (part titles wrap there, so the Contents is their source)", () => {
    const body = DDD_REFERENCE.slice(DDD_REFERENCE.indexOf("* New term introduced since the 2004 book.")).split("\n").map((line) => line.trim());

    const sections = titles.filter((title) => !/^[IVX]+\. /.test(title));

    expect(sections.filter((title) => !body.some((line) => line === title || line === `${title} *`))).toEqual([]);
  });
});
