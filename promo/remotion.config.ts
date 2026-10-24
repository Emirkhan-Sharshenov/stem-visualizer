import { Config } from '@remotion/cli/config';
import { enableTailwind } from '@remotion/tailwind-v4';

// WebGL for the three.js scenes in headless rendering
Config.setChromiumOpenGlRenderer('angle');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setBrowserExecutable('C:/Program Files/Google/Chrome/Application/chrome.exe');
// Tailwind v4 for the HeroUI components in the newer videos
Config.overrideWebpackConfig((config) => enableTailwind(config));
