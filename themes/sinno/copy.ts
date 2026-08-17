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
    uploadFailed: "Couldn't load that photo — try a different image.",
    convertingPhoto: "Converting your photo...",
    capturingMoments: "capturing SINNO moments...",
    capturingPhotoOf: (pos, total) => `snapping photo ${pos} of ${total}...`,
    selectPhotoToRetake: "tap a photo to retake or\ncontinue to customize your strip !",
    retakingPhoto: (index) => `retaking photo ${index}...`,
    photoOf: (pos, total) => `photo ${pos} of ${total}`,
    photosTapCapture: (count) => `${count} photos — tap snap to start`,
    flipCameraAriaLabel: "Switch camera",
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
    saveFailed: "Couldn't save your strip — try again or take a screenshot.",
  },
  camera: {
    permissionDenied:
      "We can't use your camera. Turn on camera access for this site in your browser settings, then try again.",
    notFound: "No camera found on this device.",
    notReadable: "Your camera is being used by another app. Close it and try again.",
    notSupported: "This camera isn't working right now. Try switching cameras.",
    unknown: "Something went wrong with the camera. Try again.",
    captureFailed: "Tap Snap to try again.",
  },
  error: {
    title: "Oops, something went wrong",
    message: "Please try again. If it keeps happening, close and reopen the page.",
    retryButton: "Try again",
  },
};
