// Jest setup for DOM-related tests
// Provide minimal stubs for browser APIs used by the app that are not implemented by jsdom

// Confirm/alert stubs (so tests don't hang)
window.alert = jest.fn();
window.confirm = jest.fn(() => true);

// location.href writable shim for redirects
Object.defineProperty(window, 'location', {
  value: { href: 'about:blank' },
  writable: true,
});

// localStorage shim (jsdom provides a working one, but ensure clean state)
beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});
