import { PhotoboothApp } from "@/components/PhotoboothApp";
import { PhotoboothProvider } from "@/context/PhotoboothProvider";

export default function Home() {
  return (
    <PhotoboothProvider>
      <PhotoboothApp />
    </PhotoboothProvider>
  );
}
