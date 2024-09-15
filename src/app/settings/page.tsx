"use client"
import { useState, useEffect, useRef } from "react";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, storage, db } from "@/lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Image from "next/image";
import { FiUpload } from "react-icons/fi";

export default function Settings() {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState(""); // New state for bio
  const [icon, setIcon] = useState<File | null>(null);
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [userID, setUserID] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUsername(userData.username || "");
          setBio(userData.bio || ""); // Load bio from Firestore
          setIconUrl(userData.iconUrl || null);
          setUserID(userData.userID || null);
        }
      } else {
        setUsername("");
        setBio(""); // Reset bio when user logs out
        setIconUrl(null);
        setUserID(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIcon(e.target.files[0]);
      setIconUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user || !userID) return;

    try {
      setUploading(true);

      let updatedIconUrl = iconUrl;

      if (icon) {
        const storageRef = ref(storage, `icons/${userID}`);
        const uploadTask = await uploadBytesResumable(storageRef, icon);
        updatedIconUrl = await getDownloadURL(uploadTask.ref);
      }

      await setDoc(doc(db, "users", user.uid), {
        userID,
        username,
        bio, // Save bio to Firestore
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
      {/* <div className="mt-12 grid grid-cols-1 md:grid-cols-2">
        <div className="space-y-5">
          <div className="bg-slate-200 w-[75%] aspect-[1/1] rounded-full" />
          <button
            className="px-2.5 py-1.5 border rounded-full flex items-center"
            onClick={() => fileInputRef.current?.click()}
          >
            <FiUpload className="mr-1.5" />
            Upload
          </button>
        </div>
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
            <label className="block text-sm font-medium text-gray-600">Bio</label>
            <textarea
              value={bio} // Bind bio state to textarea
              onChange={(e) => setBio(e.target.value)} // Update bio state
              className="mt-1.5 block w-full border rounded shadow-sm py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            onClick={handleSave}
            className={`bg-black text-white border border-black rounded-full py-1.5 px-2.5 ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={uploading}
          >
            {uploading ? "Saving..." : "Save"}
          </button>
        </div>
      </div> */}

      <div className=" mt-12 grid grid-cols-1 md:grid-cols-2">
        <div className="space-y-5">
          <div className="w-[75%] rounded-full border overflow-hidden">
            {iconUrl && (
              <Image src={iconUrl} alt="User Icon" width={100} height={100} className="w-full" />
            )}
          </div>
          <button
            className="px-2.5 py-1.5 border rounded-full flex items-center"
            onClick={() => fileInputRef.current?.click()}
          >
            <FiUpload className="mr-1.5" />
            Upload
          </button>
        </div>
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
            <label className="block text-sm font-medium text-gray-600">Bio</label>
            <textarea
              value={bio} // Bind bio state to textarea
              onChange={(e) => setBio(e.target.value)} // Update bio state
              className="mt-1.5 block w-full border rounded shadow-sm py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            onClick={handleSave}
            className={`bg-black text-white border border-black rounded-full py-1.5 px-2.5 ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={uploading}
          >
            {uploading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleIconChange}
        className="hidden"
      />
      <Footer />
    </div>
  );
}