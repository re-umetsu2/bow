"use client";
import { useState } from "react";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { auth, storage, db } from "@/lib/firebaseConfig"; // 必要なFirebaseサービスをインポート
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function Home() {
  const [username, setUsername] = useState("");
  const [icon, setIcon] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIcon(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;

    try {
      setUploading(true);

      // 1. アイコンをFirebase Storageにアップロード
      let iconUrl = "";
      if (icon) {
        const storageRef = ref(storage, `icons/${userId}`);
        const uploadTask = await uploadBytesResumable(storageRef, icon);
        iconUrl = await getDownloadURL(uploadTask.ref);
      }

      // 2. Firestoreにユーザー名とアイコンのURLを保存
      await setDoc(doc(db, "users", userId), {
        username,
        iconUrl,
      });

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile: ", error);
      alert("Failed to update profile.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="md:w-1/2 mx-5 md:mx-auto my-10">
      <Header />
      <div className="mt-12">
        <h2 className="text-2xl mb-5">Set Your Profile</h2>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1.5 block w-full border rounded shadow-sm py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Icon</label>
            <input
              type="file"
              onChange={handleIconChange}
              className="mt-1.5 block w-full border rounded shadow-sm py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            onClick={handleSave}
            className={`w-full bg-black text-white border border-black rounded-full py-2 px-4 ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={uploading}
          >
            {uploading ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}