import { describe, it, expect } from "vitest";
import { InfiniteSequence } from "../src/InfiniteSequence";

describe("InfiniteSequence", () => {
  it("generates sequential values from 0 by default", () => {
    const seq = new InfiniteSequence();
    const values = seq.take(5);
    expect(values).toEqual([0, 1, 2, 3, 4]);
  });

  it("accepts a custom start value", () => {
    const seq = new InfiniteSequence(10);
    expect(seq.take(3)).toEqual([10, 11, 12]);
  });

  it("accepts a custom step", () => {
    const seq = new InfiniteSequence(1, 2);
    expect(seq.take(4)).toEqual([1, 3, 5, 7]);
  });

  it("supports negative steps", () => {
    const seq = new InfiniteSequence(10, -3);
    expect(seq.take(4)).toEqual([10, 7, 4, 1]);
  });

  it("take(0) returns empty array", () => {
    const seq = new InfiniteSequence();
    expect(seq.take(0)).toEqual([]);
  });

  it("takeWhile stops when predicate fails", () => {
    const seq = new InfiniteSequence(1);
    const values = seq.takeWhile((v) => v < 5);
    expect(values).toEqual([1, 2, 3, 4]);
  });
});
