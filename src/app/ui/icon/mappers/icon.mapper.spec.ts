import { buildIconClassSize } from "./icon.mapper";
import { iconSize } from "../models/icon";

describe("buildIconClassSize", () => {
    const cases: Array<[iconSize, string]> = [
        ["xs", "sm"],
        ["md", "md"],
        ["lg", "lg"],
    ];

    it.each(cases)("maps icon size %s to CSS size class %s", (size, expected) => {
        expect(buildIconClassSize(size)).toBe(expected);
    });
});
