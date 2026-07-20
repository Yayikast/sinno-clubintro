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
    countdownLabel: "countdown timer",
    captureButton: "Snap",
    nextButton: "Continue",
    tryAgainButton: "Retry",
    cameraStarting: "Opening camera...",
    cameraTapToStart: "Tap Snap to begin",
    uploadHint: "upload your photos eiei !",
    capturingMoments: "capturing SINNO moments...",
    capturingPhotoOf: (pos, total) => `snapping photo ${pos} of ${total}...`,
    selectPhotoToRetake: "tap a photo to retake or\ncontinue to customize your strip !",
    retakingPhoto: (index) => `retaking photo ${index}...`,
    photoOf: (pos, total) => `photo ${pos} of ${total}`,
    photosTapCapture: (count) => `${count} photos — tap snap to start`,
  },
  customize: {
    title: "Customize >3<",
    frameLabel: "frame color",
    textLabel: "text color",
    printButton: "Print",
    previewAlt: "SINNO strip preview",
  },
  print: {
    printing: "Printing your strip...",
    ready: "Tag us @sinnoclub.official !",
    stripAlt: "Your SINNO photostrip",
    homeButton: "Home",
    downloadButton: "Save",
  },
  camera: {
    permissionDenied:
      "Camera access was denied. Allow camera permissions in your browser to use SINNO PhotoBooth.",
    notFound: "No camera found on this device.",
    notReadable: "Camera is in use by another app.",
    notSupported: "This camera does not support the required settings.",
    unknown: "Something went wrong with the camera.",
    captureFailed: "Tap Snap to try again.",
  },
};
