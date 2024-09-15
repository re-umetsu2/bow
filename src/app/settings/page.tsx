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
import Skeleton from "@/components/Skeleton";
import Button from "@/components/Button";

export default function Settings() {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [icon, setIcon] = useState<File | null>(null);
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [userID, setUserID] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUsername(userData.username || "");
          setBio(userData.bio || "");
          setIconUrl(userData.iconUrl || null);
          setUserID(userData.userID || null);
        }
      } else {
        setUsername("");
        setBio("");
        setIconUrl(null);
        setUserID(null);
      }
      setIsLoading(false);
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
        bio,
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
      {isLoading ? (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2">
          <div className="space-y-5">
            <Skeleton className="w-[75%]" rounded="full" />
            <Skeleton className="w-24 h-[38px]" rounded="full" />
          </div>
          <div className="space-y-5 mt-10 md:mt-0">
            <div>
              <Skeleton className="w-16 h-[20px]" />
              <Skeleton className="mt-1.5 w-full h-[42px]" />
            </div>
            <div>
              <Skeleton className="w-16 h-[20px]" />
              <Skeleton className="mt-1.5 w-full h-[66px]" />
            </div>
            <Skeleton className="w-14 h-[38px]" rounded="full" />
          </div>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2">
          <div className="space-y-5">
            <div className="w-[75%] rounded-full border overflow-hidden">
              {iconUrl && (
                <Image src={iconUrl} alt="User Icon" width={100} height={100} className="w-full" />
              )}
            </div>
            <Button
              variant="secondary"
              className="flex items-center"
              onClick={() => fileInputRef.current?.click()}
            >
              <FiUpload className="mr-1.5" />
              Upload
            </Button>
          </div>
          <div className="space-y-5 mt-10 md:mt-0">
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
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="mt-1.5 block w-full border rounded shadow-sm py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <Button
              onClick={handleSave}
              disabled={uploading}
            >
              {uploading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      )}
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