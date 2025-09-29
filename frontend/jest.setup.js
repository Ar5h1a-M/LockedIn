// --- Minimal, robust polyfills first ---
// For libs that expect these in Node test env:
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Web fetch primitives compatible with jsdom:
require('whatwg-fetch');

// --- Testing Library matchers ---
import '@testing-library/jest-dom';

// --- Mock next/navigation (router, pathname) ---
jest.mock('next/navigation', () => ({
  useRouter() {
    return { push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() };
  },
  usePathname() {
    return '';
  },
}));

// --- Mock next/image to be a plain <img> ---
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />;
  },
}));

// --- Suppress noisy console output (same pattern you used) ---
const originalError = console.error;
const originalLog = console.log;
const originalWarn = console.warn;

const suppressed = [
  'validateDOMNesting',
  'inside a test was not wrapped in act',
  'at act',
  'at render',
  'Authentication error',
  'Submission error',
  'Login error',
  'Error loading data',
  'MSAL initialization error',
  'Error during registration',
];

const shouldSuppress = (args) => {
  if (!args || !args[0]) return false;
  const msg = typeof args[0] === 'string' ? args[0] : String(args[0]);
  return suppressed.some((p) => msg.includes(p));
};

beforeAll(() => {
  console.error = jest.fn((...args) => { if (!shouldSuppress(args)) originalError(...args); });
  console.log = jest.fn((...args) => { if (!shouldSuppress(args)) originalLog(...args); });
  console.warn = jest.fn((...args) => { if (!shouldSuppress(args)) originalWarn(...args); });
});

afterAll(() => {
  console.error = originalError;
  console.log = originalLog;
  console.warn = originalWarn;
});

// ResizeObserver mock (common in UI libs)
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
// Polyfill BroadcastChannel (needed by msw/ws in tests)
if (typeof global.BroadcastChannel === "undefined") {
  class DummyBroadcastChannel {
    constructor(name) { this.name = name; this.onmessage = null; }
    postMessage() {}
    close() {}
    addEventListener() {}
    removeEventListener() {}
  }
  // @ts-ignore
  global.BroadcastChannel = DummyBroadcastChannel;
}

// Add Response.json static if missing
try {
  if (typeof Response !== "undefined" && typeof (Response).json !== "function") {
    // @ts-ignore
    Response.json = function (data, init = {}) {
      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
        ...init,
      });
    };
  }
} catch {}

// Clean between tests
afterEach(() => {
  jest.clearAllMocks();
  try { jest.clearAllTimers(); } catch {}
});
