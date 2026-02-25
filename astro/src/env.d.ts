/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface Window {
  bloomTrack?: (eventName: string, params?: Record<string, string | number | boolean>) => void;
}
