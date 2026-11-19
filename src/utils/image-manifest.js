// Image helpers — hard-disabled until we have a working image source.
// All components fall back to emoji + gradient cards, which looks great
// and is 100% offline + guaranteed non-repetitive.
//
// When a real image source becomes available, re-enable by importing the manifest:
//   import manifest from '../data/image-manifest.json';
//   const imgManifest = manifest;

export function getSpeakerImg(key) {
  return null;
}

export function getSceneImg(sceneId) {
  return null;
}

export function getWordImg(themeId, word) {
  return null;
}
