import type { ThemeCopy } from "@/themes/types";

export const copy: ThemeCopy = {
  shell: {
    backAriaLabel: "Go back",
  },
  landing: {
    selectButton: "Select",
  },
  addPhoto: {
    modeTake: "Take Photos",
    modeUpload: "Upload",
    countdownLabel: "select countdown",
    captureButton: "Capture",
    nextButton: "Next",
    tryAgainButton: "Try again",
    cameraStarting: "Starting camera...",
    cameraTapToStart: "Tap Capture to Start",
    uploadHint: "add your photos !",
    capturingMoments: "capturing the moments...",
    capturingPhotoOf: (pos, total) => `capturing photo ${pos} of ${total}...`,
    selectPhotoToRetake: "select a photo to retake or\nclick next to choose your frame !",
    retakingPhoto: (index) => `retaking photo ${index}...`,
    photoOf: (pos, total) => `photo ${pos} of ${total}`,
    photosTapCapture: (count) => `${count} photos — tap capture to start`,
  },
  customize: {
    title: "Customize your frame <3",
    frameLabel: "frame",
    textLabel: "text",
    printButton: "Print",
    previewAlt: "Strip preview",
  },
  print: {
    printing: "Printing...",
    ready: "Your photostrip is ready !",
    stripAlt: "Your photostrip",
    homeButton: "Home",
    downloadButton: "Download",
  },
  camera: {
    permissionDenied:
      "Camera access was denied. Please allow camera permissions in your browser settings.",
    notFound: "No camera was found on this device.",
    notReadable: "Camera is already in use by another application.",
    notSupported: "Your camera does not support the required settings.",
    unknown: "An unknown camera error occurred.",
    captureFailed: "Click Capture to try again.",
  },
};
