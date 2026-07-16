import { afterEach } from 'bun:test';
import { GlobalRegistrator } from '@happy-dom/global-registrator';

GlobalRegistrator.register();

// happy-dom's GlobalRegistrator creates a single process-wide `document`
// shared across every test file (React and Vue alike). Individual test
// files clean up their own renders, but a few Vue tests mount with
// `attachTo: document.body` and never unmount — this global hook is the
// backstop that guarantees no DOM node ever survives from one test to the
// next, regardless of which file forgets to clean up after itself.
afterEach(() => {
  document.body.replaceChildren();
});
