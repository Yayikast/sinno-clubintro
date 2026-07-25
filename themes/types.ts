import type { ColorSwatch, FrameConfig, FrameId } from "@/types/photobooth";

export type ThemeId = "sinno";

export interface ThemeBrand {
  name: string;
  tagline: string;
  themeColor: string;
  downloadPrefix: string;
}

export interface ThemeMetadata {
  title: string;
  description: string;
  favicon: string;
  appleIcon: string;
  appleWebAppTitle: string;
}

export interface ThemeButtonColors {
  primary: string;
  primaryHover: string;
  secondary: string;
  secondaryHover: string;
}

export interface ThemeModeTabColors {
  trackBg: string;
  pillBg: string;
  selectedTextColor: string;
  unselectedTextColor: string;
}

export interface ThemeCountdownColors {
  selectedBg: string;
  unselectedBg: string;
  selectedColor: string;
  unselectedColor: string;
}

export interface ThemeSwatchStroke {
  innerColor: string;
  innerWidth: number;
  selectedOuterColor: string;
  selectedOverlayColor: string;
  selectedOuterWidth: number;
}

export interface ThemeColors {
  background: string;
  foreground: string;
  button: ThemeButtonColors;
  placeholder: string;
  viewfinder: string;
  overlay: string;
  emptySlot: string;
  modeTabs: ThemeModeTabColors;
  countdown: ThemeCountdownColors;
  landing: {
    selectorSelectedBg: string;
    selectorUnselectedOpacity: number;
  };
  customize: {
    inputBorder: string;
    swatchStroke: ThemeSwatchStroke;
  };
}

export interface ThemeTypography {
  headerTitle: number;
  headerSubtitle: number;
  primaryButton: number;
  modeTab: number;
  sectionTitle: number;
  input: number;
  hint: number;
}

export interface ThemeAssets {
  background: string;
  logo: string;
  backIcon: string;
  cameraBlack: string;
  cameraWhite: string;
  gallery: string;
  home: string;
  download: string;
  print: string;
  printerTop: string;
  printerBottom: string;
  colorPicker: string;
  patternsBase: string;
}

export interface ThemeLandingCopy {
  selectButton: string;
  credit?: string;
}

export interface ThemeAddPhotoCopy {
  modeTake: string;
  modeUpload: string;
  countdownLabel: string;
  captureButton: string;
  nextButton: string;
  tryAgainButton: string;
  cameraStarting: string;
  cameraTapToStart: string;
  uploadHint: string;
  capturingMoments: string;
  capturingPhotoOf: (pos: number, total: number) => string;
  selectPhotoToRetake: string;
  retakingPhoto: (index: number) => string;
  photoOf: (pos: number, total: number) => string;
  photosTapCapture: (count: number) => string;
}

export interface ThemeCustomizeCopy {
  title: string;
  frameLabel: string;
  textLabel: string;
  printButton: string;
  previewAlt: string;
}

export interface ThemePrintCopy {
  printing: string;
  ready: string;
  stripAlt: string;
  homeButton: string;
  downloadButton: string;
}

export interface ThemeShellCopy {
  backAriaLabel: string;
}

export interface ThemeCameraCopy {
  permissionDenied: string;
  notFound: string;
  notReadable: string;
  notSupported: string;
  unknown: string;
  captureFailed: string;
}

export interface ThemeCopy {
  shell: ThemeShellCopy;
  landing: ThemeLandingCopy;
  addPhoto: ThemeAddPhotoCopy;
  customize: ThemeCustomizeCopy;
  print: ThemePrintCopy;
  camera: ThemeCameraCopy;
}

export interface ThemeFrameDefaults {
  frameId: FrameId;
  frameColor: string;
  textColor: string;
  caption: string;
}

export interface ThemeFrames {
  list: FrameConfig[];
  defaults: ThemeFrameDefaults;
  frameColorSwatches: ColorSwatch[];
  textColorSwatches: ColorSwatch[];
  getFrameById: (id: FrameId) => FrameConfig;
}

export interface ThemePageLayout {
  frameWidth: number;
  paddingX: number;
  paddingY: number;
  contentWidth: number;
  primaryButton: {
    textSize: number;
    width: number;
    height: number;
    radius: number;
  };
  actionFooter: {
    hintToButtonGap: number;
  };
}

export interface ThemeLandingLayout {
  frameWidth: number;
  frameHeight: number;
  paddingX: number;
  paddingY: number;
  headerToPreviewGap: number;
  previewToSelectorGap: number;
  selectorToButtonGap: number;
  previewWidth: number;
  previewHeight: number;
  selectorHeight: number;
  selectorSelectedSize: number;
  selectorSelectedBg: string;
  selectorUnselectedOpacity: number;
  selectorSelectedRadius: number;
  selectorGap: number;
}

export interface ThemeAddPhotoLayout {
  contentWidth: number;
  headerToTabsGap: number;
  modeTabs: {
    width: number;
    height: number;
    gap: number;
    fontSize: number;
    radius: number;
    pillInset: number;
  };
  countdown: {
    size: number;
    gap: number;
  };
  thumbnail: {
    height: number;
    maxRowHeight: number;
    gap: number;
    widthsByFrame: Record<FrameId, number[]>;
  };
  viewfinder: {
    width: number;
    height: number;
    background: string;
  };
  takePhoto: {
    tabsToCountdownGap: number;
    countdownToCaptureGap: number;
    viewfinderToThumbnailsGap: number;
  };
  upload: {
    previewWidth: number;
    previewHeight: number;
    placeholderBg: string;
    overlayBg: string;
    tabsToPreviewGap: number;
    previewToHintGap: number;
  };
}

export interface ThemeCustomizeLayout {
  contentWidth: number;
  headerToTitleGap: number;
  titleSize: number;
  titleToContentGap: number;
  contentToFooterGap: number;
  columnGap: number;
  previewColumnShare: number;
  sectionGap: number;
  labelToSwatchesGap: number;
  swatchMinSize: number;
  swatchGap: number;
  inputRadius: number;
  inputBorder: string;
  inputPaddingX: number;
  inputPaddingY: number;
  inputFontSize: number;
  inputMinHeight: number;
}

export interface ThemePrintLayout {
  contentWidth: number;
  headerToTitleGap: number;
  titleSize: number;
  titleToContentGap: number;
  printerWidth: number;
  printerTopHeight: number;
  printerBottomHeight: number;
  printerAssemblyHeight: number;
  stripSlotTop: number;
  printerTopBleed: number;
  printerTopOffset: number;
  printerBottomOffset: number;
  zIndex: {
    printerBottom: number;
    strip: number;
    printerTop: number;
  };
  printingDurationMs: number;
}

export interface ThemeLayout {
  page: ThemePageLayout;
  landing: ThemeLandingLayout;
  addPhoto: ThemeAddPhotoLayout;
  customize: ThemeCustomizeLayout;
  print: ThemePrintLayout;
}

export interface ThemeMotion {
  stepTransitionDurationMs: number;
  printDurationMs: number;
  flashDurationMs: number;
  captureDelayMs: number;
  batchCaptureDelayMs: number;
}

export interface ThemeFonts {
  captionFamily: string;
}

export interface Theme {
  id: ThemeId;
  brand: ThemeBrand;
  metadata: ThemeMetadata;
  colors: ThemeColors;
  typography: ThemeTypography;
  assets: ThemeAssets;
  copy: ThemeCopy;
  frames: ThemeFrames;
  layout: ThemeLayout;
  motion: ThemeMotion;
  fonts: ThemeFonts;
}
