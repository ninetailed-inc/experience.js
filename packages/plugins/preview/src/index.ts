export { NinetailedPreviewPlugin } from './lib/plugin';
export { NinetailedPreviewPlugin as default } from './lib/plugin';

if (typeof window === 'object' && !('process' in window)) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).process = {};
}
