import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "college-zone-3d8d4.firebaseapp.com",
  projectId: "college-zone-3d8d4",
  appId: "1:249630005104:web:79c2bf304b8bdbd29661b5",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);