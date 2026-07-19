"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_CAPTION,
  DEFAULT_FRAME_COLOR,
  DEFAULT_FRAME_ID,
  DEFAULT_TEXT_COLOR,
  getFrameById,
} from "@/lib/frames";
import { clampStripCaption } from "@/lib/stripCaption";
import {
  createEmptyPhotos,
  type CountdownSeconds,
  type FrameConfig,
  type FrameId,
  type PhotoMode,
  type PhotoboothStep,
} from "@/types/photobooth";

interface PhotoboothContextValue {
  step: PhotoboothStep;
  frame: FrameConfig;
  selectedFrameId: FrameId;
  photos: (string | null)[];
  photoMode: PhotoMode;
  countdownSeconds: CountdownSeconds;
  frameColor: string;
  textColor: string;
  captionText: string;
  finalStripUrl: string | null;
  activeSlotIndex: number | null;
  isRetaking: boolean;
  selectFrameId: (id: FrameId) => void;
  confirmFrameSelection: () => void;
  setPhotoMode: (mode: PhotoMode) => void;
  setCountdownSeconds: (seconds: CountdownSeconds) => void;
  setPhotoAtIndex: (index: number, photo: string | null) => void;
  setFrameColor: (color: string) => void;
  setTextColor: (color: string) => void;
  setCaptionText: (text: string) => void;
  setFinalStripUrl: (url: string | null) => void;
  setActiveSlotIndex: (index: number | null) => void;
  setIsRetaking: (value: boolean) => void;
  goToStep: (step: PhotoboothStep) => void;
  goBack: () => void;
  reset: () => void;
  allPhotosFilled: boolean;
}

const STEP_ORDER: PhotoboothStep[] = ["landing", "addPhoto", "customize", "print"];

const PhotoboothContext = createContext<PhotoboothContextValue | null>(null);

function buildInitialState() {
  const frame = getFrameById(DEFAULT_FRAME_ID);
  return {
    step: "landing" as PhotoboothStep,
    selectedFrameId: DEFAULT_FRAME_ID,
    frame,
    photos: createEmptyPhotos(frame.photoCount),
    photoMode: "take" as PhotoMode,
    countdownSeconds: 3 as CountdownSeconds,
    frameColor: DEFAULT_FRAME_COLOR,
    textColor: DEFAULT_TEXT_COLOR,
    captionText: DEFAULT_CAPTION,
    finalStripUrl: null as string | null,
    activeSlotIndex: null as number | null,
    isRetaking: false,
  };
}

export function PhotoboothProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<PhotoboothStep>("landing");
  const [selectedFrameId, setSelectedFrameId] = useState<FrameId>(DEFAULT_FRAME_ID);
  const [frame, setFrame] = useState<FrameConfig>(getFrameById(DEFAULT_FRAME_ID));
  const [photos, setPhotosState] = useState<(string | null)[]>(
    createEmptyPhotos(getFrameById(DEFAULT_FRAME_ID).photoCount),
  );
  const [photoMode, setPhotoModeState] = useState<PhotoMode>("take");
  const [countdownSeconds, setCountdownSecondsState] = useState<CountdownSeconds>(3);
  const [frameColor, setFrameColorState] = useState(DEFAULT_FRAME_COLOR);
  const [textColor, setTextColorState] = useState(DEFAULT_TEXT_COLOR);
  const [captionText, setCaptionTextState] = useState(DEFAULT_CAPTION);
  const [finalStripUrl, setFinalStripUrlState] = useState<string | null>(null);
  const [activeSlotIndex, setActiveSlotIndexState] = useState<number | null>(null);
  const [isRetaking, setIsRetakingState] = useState(false);

  const allPhotosFilled = photos.every((photo) => photo !== null);

  const selectFrameId = useCallback((id: FrameId) => {
    const nextFrame = getFrameById(id);
    setSelectedFrameId(id);
    setFrame(nextFrame);
    setPhotosState(createEmptyPhotos(nextFrame.photoCount));
    setActiveSlotIndexState(null);
    setIsRetakingState(false);
    setFinalStripUrlState(null);
  }, []);

  const confirmFrameSelection = useCallback(() => {
    setStep("addPhoto");
  }, []);

  const setPhotoMode = useCallback((mode: PhotoMode) => {
    setPhotoModeState(mode);
    setActiveSlotIndexState(null);
    setIsRetakingState(false);
  }, []);

  const setCountdownSeconds = useCallback((seconds: CountdownSeconds) => {
    setCountdownSecondsState(seconds);
  }, []);

  const setPhotoAtIndex = useCallback((index: number, photo: string | null) => {
    setPhotosState((current) => {
      const next = [...current];
      next[index] = photo;
      return next;
    });
  }, []);

  const setFrameColor = useCallback((color: string) => {
    setFrameColorState(color);
  }, []);

  const setTextColor = useCallback((color: string) => {
    setTextColorState(color);
  }, []);

  const setCaptionText = useCallback((text: string) => {
    setCaptionTextState(clampStripCaption(text));
  }, []);

  const setFinalStripUrl = useCallback((url: string | null) => {
    setFinalStripUrlState(url);
  }, []);

  const setActiveSlotIndex = useCallback((index: number | null) => {
    setActiveSlotIndexState(index);
  }, []);

  const setIsRetaking = useCallback((value: boolean) => {
    setIsRetakingState(value);
  }, []);

  const goToStep = useCallback((nextStep: PhotoboothStep) => {
    setStep(nextStep);
  }, []);

  const goBack = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(step);
    if (currentIndex <= 0) return;
    setActiveSlotIndexState(null);
    setIsRetakingState(false);
    setStep(STEP_ORDER[currentIndex - 1]);
  }, [step]);

  const reset = useCallback(() => {
    const initial = buildInitialState();
    setStep(initial.step);
    setSelectedFrameId(initial.selectedFrameId);
    setFrame(initial.frame);
    setPhotosState(initial.photos);
    setPhotoModeState(initial.photoMode);
    setCountdownSecondsState(initial.countdownSeconds);
    setFrameColorState(initial.frameColor);
    setTextColorState(initial.textColor);
    setCaptionTextState(initial.captionText);
    setFinalStripUrlState(initial.finalStripUrl);
    setActiveSlotIndexState(initial.activeSlotIndex);
    setIsRetakingState(initial.isRetaking);
  }, []);

  const value = useMemo(
    () => ({
      step,
      frame,
      selectedFrameId,
      photos,
      photoMode,
      countdownSeconds,
      frameColor,
      textColor,
      captionText,
      finalStripUrl,
      activeSlotIndex,
      isRetaking,
      selectFrameId,
      confirmFrameSelection,
      setPhotoMode,
      setCountdownSeconds,
      setPhotoAtIndex,
      setFrameColor,
      setTextColor,
      setCaptionText,
      setFinalStripUrl,
      setActiveSlotIndex,
      setIsRetaking,
      goToStep,
      goBack,
      reset,
      allPhotosFilled,
    }),
    [
      step,
      frame,
      selectedFrameId,
      photos,
      photoMode,
      countdownSeconds,
      frameColor,
      textColor,
      captionText,
      finalStripUrl,
      activeSlotIndex,
      isRetaking,
      selectFrameId,
      confirmFrameSelection,
      setPhotoMode,
      setCountdownSeconds,
      setPhotoAtIndex,
      setFrameColor,
      setTextColor,
      setCaptionText,
      setFinalStripUrl,
      setActiveSlotIndex,
      setIsRetaking,
      goToStep,
      goBack,
      reset,
      allPhotosFilled,
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
