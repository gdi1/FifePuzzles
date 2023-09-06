const main = require("./../AI/HashiConnectionChecker");
const h1 = 11;
const h2 = 12;
const v1 = 21;
const v2 = 22;

test("Check a valid Hashi is correctly identified", () => {
    expect(main([
        [2, null, 2, h2, h2, h2, 3, h1, 3],
        [v2, 2, h1, h1, 3, h2, h2, 3, v2],
        [3, v1, null, null, null, 1, null, v1, 3],
        [v1, 3, h2, 2, null, v1, null, 2, v1],
        [4, h2, 3, h1, 2, v1, null, v1, 3],
        [v1, 3, h2, 2, v1, 3, h1, 3, v2],
        [3, v1, null, null, v1, v1, 2, v1, 4],
        [v2, 3, h1, h1, 3, v1, v2, 1, v2],
        [3, v1, 2, null, v1, v1, 4, h2, 5],
        [v1, 2, v2, null, v1, 5, h2, 2, v1],
        [3, v1, 3, h1, 2, v2, 3, h1, 2],
        [v2, 2, h1, h1, h1, 3, v2, null, null],
        [3, h1, h1, 3, h2, h2, 6, h2, 2]
    ])).toBe(true);
});

test("Check an invalid Hashi is correctly identified", () => {
    expect(main([
        [2, null, 2, h2, h2, h2, 3, h1, 3],
        [null, 2, h1, h1, 3, h2, h2, 3, v2],
        [3, v1, null, null, null, 1, null, v1, 3],
        [v1, 3, h2, 2, null, v1, null, 2, v1],
        [4, h2, 3, h1, 2, v1, null, v1, 3],
        [v1, 3, h2, 2, v1, 3, h1, 3, v2],
        [3, v1, null, null, v1, v1, 2, v1, 4],
        [v2, 3, h1, h1, 3, v1, v2, 1, v2],
        [3, v1, 2, null, v1, v1, 4, h2, 5],
        [v1, 2, v2, null, v1, 5, h2, 2, v1],
        [3, v1, 3, h1, 2, v2, 3, h1, 2],
        [v2, 2, h1, h1, h1, 3, v2, null, null],
        [3, h1, h1, 3, h2, h2, 6, h2, 2]
    ])).toBe(false);
});

test("Check an invalid Hashi where there are connections between islands but not a single continuous connection is identified", () => {
    expect(main([
        [2, h1, 2, h1, h1, h1, 3, h1, 3],
        [v1, 2, h1, h1, 3, h1, h1, 3, v1],
        [3, v1, null, null, v1, 1, null, v1, 3],
        [v1, 3, h1, 2, v1, v1, null, 2, v1],
        [4, h1, 3, v1, 2, v1, null, v1, 3],
        [v1, 3, h1, 2, v1, 3, h1, 3, v1],
        [3, v1, null, null, v1, v1, 2, v1, 4],
        [v1, 3, null, null, 3, v1, v1, 1, v1],
        [3, v1, 2, null, v1, v1, 4, null, 5],
        [v1, 2, v1, null, v1, 5, h1, 2, v1],
        [3, v1, 3, h1, 2, v1, 3, null, 2],
        [v1, 2, h1, h1, h1, 3, v1, null, v1],
        [3, h1, h1, 3, h1, h1, 6, h1, 2]
    ]))
});