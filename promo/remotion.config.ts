import { Config } from '@remotion/cli/config';

// WebGL for the three.js scenes in headless rendering
Config.setChromiumOpenGlRenderer('angle');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setBrowserExecutable('C:/Program Files/Google/Chrome/Application/chrome.exe');
