import { describe, expect, test } from 'bun:test';
import type { VNode } from 'vue';
import { createCommentVNode, createTextVNode, Fragment, h } from 'vue';
import { isVNodeEmpty } from './vnodes';

function fragmentVNode(children: Array<VNode>): VNode {
  return { type: Fragment, children } as unknown as VNode;
}

describe('isVNodeEmpty', () => {
  test('treats comment vnodes as empty', () => {
    expect(isVNodeEmpty(createCommentVNode(''))).toBe(true);
  });

  test('treats blank text vnodes as empty, non-blank text as non-empty', () => {
    expect(isVNodeEmpty(createTextVNode('   '))).toBe(true);
    expect(isVNodeEmpty(createTextVNode('hello'))).toBe(false);
  });

  test('treats element vnodes as non-empty', () => {
    expect(isVNodeEmpty(h('div', 'content'))).toBe(false);
  });

  test('fragment with no children is empty', () => {
    expect(isVNodeEmpty(fragmentVNode([]))).toBe(true);
  });

  test('non-recursive check treats a fragment with children as non-empty regardless of content', () => {
    expect(isVNodeEmpty(fragmentVNode([createCommentVNode('')]), false)).toBe(false);
  });

  test('recursive check considers a fragment empty when every child is empty', () => {
    const allBlank = fragmentVNode([createCommentVNode(''), createTextVNode('  ')]);
    expect(isVNodeEmpty(allBlank, true)).toBe(true);

    const mixed = fragmentVNode([createCommentVNode(''), h('div', 'content')]);
    expect(isVNodeEmpty(mixed, true)).toBe(false);
  });
});
