import { cn } from "@/utils/utils";
describe("cn utility function", () => {
  it("should merge class names correctly", () => {
    expect(cn("class1", "class2")).toBe("class1 class2");
    expect(cn("class1", {
      class2: true,
      class3: false
    })).toBe("class1 class2");
  });
  it("should handle Tailwind CSS class merges", () => {
    expect(cn("px-2 py-1", "p-4")).toBe("p-4");
  });
});