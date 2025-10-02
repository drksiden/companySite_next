import { HomeClient } from "./HomeClient";
import { News } from "@/components/News"; 

export default function ServerHomePage() {
  return (
    <HomeClient
      newsSlot={<News />}
    />
  );
}