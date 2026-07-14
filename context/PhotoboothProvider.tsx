"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_FRAME_COLOR } from "@/lib/layouts";
import {
  createEmptyPhotos,
  type CountdownSeconds,
  type LayoutConfig,
  type PhotoboothStep,
} from "@/types/photobooth";

interface PhotoboothContextValue {
  step: PhotoboothStep;
  layout: LayoutConfig | null;
  photos: (string | null)[];
  countdownSeconds: CountdownSeconds;
  frameColor: string;
  finalStripUrl: string | null;
  retakeIndex: number | null;
  selectLayout: (layout: LayoutConfig) => void;
  setCountdownSeconds: (seconds: CountdownSeconds) => void;
  setPhotos: (photos: (string | null)[]) => void;
  setPhotoAtIndex: (index: number, photo: string) => void;
  setFrameColor: (color: string) => void;
  setFinalStripUrl: (url: string | null) => void;
  startRetake: (index: number) => void;
  clearRetake: () => void;
  goToStep: (step: PhotoboothStep) => void;
  goBack: () => void;
  reset: () => void;
}

const STEP_ORDER: PhotoboothStep[] = [
  "layout",
  "capture",
  "review",
  "confirmPhotos",
  "frameColor",
  "confirmFrame",
  "download",
];

const PhotoboothContext = createContext<PhotoboothContextValue | null>(null);

const initialState = {
  step: "layout" as PhotoboothStep,
  layout: null as LayoutConfig | null,
  photos: [] as (string | null)[],
  countdownSeconds: 3 as CountdownSeconds,
  frameColor: DEFAULT_FRAME_COLOR,
  finalStripUrl: null as string | null,
  retakeIndex: null as number | null,
};

export function PhotoboothProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<PhotoboothStep>(initialState.step);
  const [layout, setLayout] = useState<LayoutConfig | null>(initialState.layout);
  const [photos, setPhotosState] = useState<(string | null)[]>(initialState.photos);
  const [countdownSeconds, setCountdownSecondsState] = useState<CountdownSeconds>(
    initialState.countdownSeconds,
  );
  const [frameColor, setFrameColorState] = useState(initialState.frameColor);
  const [finalStripUrl, setFinalStripUrlState] = useState<string | null>(
    initialState.finalStripUrl,
  );
  const [retakeIndex, setRetakeIndex] = useState<number | null>(
    initialState.retakeIndex,
  );

  const goToStep = useCallback((nextStep: PhotoboothStep) => {
    setStep(nextStep);
  }, []);

  const selectLayout = useCallback((selectedLayout: LayoutConfig) => {
    setLayout(selectedLayout);
    setPhotosState(createEmptyPhotos(selectedLayout.photoCount));
    setRetakeIndex(null);
    setFinalStripUrlState(null);
    setStep("capture");
  }, []);

  const setPhotos = useCallback((nextPhotos: (string | null)[]) => {
    setPhotosState(nextPhotos);
  }, []);

  const setPhotoAtIndex = useCallback((index: number, photo: string) => {
    setPhotosState((current) => {
      const next = [...current];
      next[index] = photo;
      return next;
    });
  }, []);

  const setCountdownSeconds = useCallback((seconds: CountdownSeconds) => {
    setCountdownSecondsState(seconds);
  }, []);

  const setFrameColor = useCallback((color: string) => {
    setFrameColorState(color);
  }, []);

  const setFinalStripUrl = useCallback((url: string | null) => {
    setFinalStripUrlState(url);
  }, []);

  const startRetake = useCallback((index: number) => {
    setRetakeIndex(index);
    setStep("capture");
  }, []);

  const clearRetake = useCallback(() => {
    setRetakeIndex(null);
  }, []);

  const goBack = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(step);
    if (currentIndex <= 0) return;

    const previousStep = STEP_ORDER[currentIndex - 1];

    if (step === "capture" && retakeIndex !== null) {
      setRetakeIndex(null);
      setStep("review");
      return;
    }

    if (previousStep === "capture") {
      setRetakeIndex(null);
    }

    setStep(previousStep);
  }, [retakeIndex, step]);

  const reset = useCallback(() => {
    setStep(initialState.step);
    setLayout(initialState.layout);
    setPhotosState(initialState.photos);
    setCountdownSecondsState(initialState.countdownSeconds);
    setFrameColorState(initialState.frameColor);
    setFinalStripUrlState(initialState.finalStripUrl);
    setRetakeIndex(initialState.retakeIndex);
  }, []);

  const value = useMemo(
    () => ({
      step,
      layout,
      photos,
      countdownSeconds,
      frameColor,
      finalStripUrl,
      retakeIndex,
      selectLayout,
      setCountdownSeconds,
      setPhotos,
      setPhotoAtIndex,
      setFrameColor,
      setFinalStripUrl,
      startRetake,
      clearRetake,
      goToStep,
      goBack,
      reset,
    }),
    [
      step,
      layout,
      photos,
      countdownSeconds,
      frameColor,
      finalStripUrl,
      retakeIndex,
      selectLayout,
      setCountdownSeconds,
      setPhotos,
      setPhotoAtIndex,
      setFrameColor,
      setFinalStripUrl,
      startRetake,
      clearRetake,
      goToStep,
      goBack,
      reset,
    ],
  );

  return (
    <PhotoboothContext.Provider value={value}>
      {children}
    </PhotoboothContext.Provider>
  );
}

export function usePhotobooth() {
  const context = useContext(PhotoboothContext);
  if (!context) {
    throw new Error("usePhotobooth must be used within PhotoboothProvider");
  }
  return context;
}
