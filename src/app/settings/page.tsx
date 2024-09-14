"use client";
import { useState, useEffect } from "react";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, storage, db } from "@/lib/firebaseConfig";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function Settings() {
  const [username, setUsername] = useState("");
  const [icon, setIcon] = useState<File | null>(null);
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [userID, setUserID] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUsername(userData.username || "");
          setIconUrl(userData.iconUrl || null);
          setUserID(userData.userID || null); // userIDをセット
        }
      }
    };
    fetchUserProfile();
  }, []);

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIcon(e.target.files[0]);
      setIconUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user || !userID) return;  // userIDがない場合は保存しない

    try {
      setUploading(true);

      let updatedIconUrl = iconUrl;

      // アイコンが変更された場合のみ、Firebase Storageにアップロード
      if (icon) {
        const storageRef = ref(storage, `icons/${userID}`);
        const uploadTask = await uploadBytesResumable(storageRef, icon);
        updatedIconUrl = await getDownloadURL(uploadTask.ref);
      }

      // Firestoreにユーザー名とアイコンのURLを保存
      await setDoc(doc(db, "users", user.uid), {
        userID,  // userIDは変更せず、そのまま保存
        username,
        iconUrl: updatedIconUrl,
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
            <label className="block text-sm font-medium text-gray-600">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1.5 block w-full border rounded shadow-sm py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Icon</label>
            {iconUrl && (
              <img src={iconUrl} alt="User Icon" className="mb-2.5 w-20 h-20 rounded-full object-cover" />
            )}
            <input
              type="file"
              onChange={handleIconChange}
              className="mt-1.5 block w-full border rounded shadow-sm py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            onClick={handleSave}
            className={`bg-black text-white border border-black rounded-full py-2 px-4 ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={uploading}
          >
            {uploading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}