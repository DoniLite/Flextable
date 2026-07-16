import type { VNode } from 'vue';
import { Comment, Fragment, Text } from 'vue';

export function isVNodeEmpty(vnode: VNode, recursiveFragmentCheck = false): boolean {
  if (!vnode) return true;
  if (vnode.type === Comment) return true;
  if (vnode.type === Text) return (vnode.children as string)?.trim() === '';
  if (vnode.type === Fragment) {
    const children = vnode.children as Array<VNode> | undefined;
    if (!children || children.length === 0) return true;
    return recursiveFragmentCheck
      ? children.every((child) => isVNodeEmpty(child, true))
      : false;
  }
  return false;
}
