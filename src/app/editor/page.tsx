"use client";
import React, { useState, useRef, useEffect } from "react";
import { auth, db, storage } from "@/lib/firebaseConfig"; // Firebaseのauth, db, storageをインポート
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Button from "@/components/Button";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { FiUpload } from "react-icons/fi";
import { useRouter } from "next/navigation";

// User 型の定義
type User = {
    uid: string;
    userID: string;
};

export default function Editor() {
    const [image, setImage] = useState<string | null>(null);
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [invert, setInvert] = useState(0);
    const [sepia, setSepia] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [userID, setUserID] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // Firestore から userID を取得
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const userObj: User = {
                        uid: currentUser.uid,
                        userID: userData.userID,
                    };
                    setUser(userObj);
                    setUserID(userData.userID);
                }
            } else {
                router.push("/login");
            }
        });

        return () => unsubscribe();
    }, [router]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const imageStyle = {
        filter: `
            brightness(${brightness}%)
            contrast(${contrast}%)
            invert(${invert})
            sepia(${sepia})
        `,
    };

    const handlePublish = async () => {
        if (!image || !user || !userID) return;

        setUploading(true);
        try {
            const blob = await fetch(image).then(res => res.blob());
            const imageRef = ref(storage, `images/${user.uid}/${Date.now()}`);
            await uploadBytes(imageRef, blob);
            const downloadURL = await getDownloadURL(imageRef);

            await addDoc(collection(db, "posts"), {
                userID,
                imageUrl: downloadURL,
                brightness,
                contrast,
                invert,
                sepia,
                createdAt: new Date(),
            });

            // 投稿後に /users/userID へリダイレクト
            router.push(`/users/${userID}`);
        } catch (error) {
            console.error("Error publishing post: ", error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="md:w-1/2 mx-5 md:mx-auto my-10">
            <Header />
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <h1 className="text-2xl mb-5">Create New Post</h1>
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                    />
                    <Button variant="secondary" leftIcon={<FiUpload />} onClick={handleUploadButtonClick}>
                        Upload Image
                    </Button>
                    <div className="mt-5 p-2.5 border rounded space-y-2.5">
                        <div>
                            <p>Brightness</p>
                            <input 
                                type="range" 
                                className="slider" 
                                min="0" 
                                max="200" 
                                step="1" 
                                value={brightness}
                                onChange={(e) => setBrightness(Number(e.target.value))}
                            />
                        </div>
                        <div>
                            <p>Contrast</p>
                            <input 
                                type="range" 
                                className="slider" 
                                min="0" 
                                max="200" 
                                step="1" 
                                value={contrast}
                                onChange={(e) => setContrast(Number(e.target.value))}
                            />
                        </div>
                    </div>
                    <div className="mt-5 p-2.5 border rounded space-y-2.5">
                        <div>
                            <p>Invert</p>
                            <input 
                                type="range" 
                                className="slider" 
                                min="0" 
                                max="1" 
                                step="1" 
                                value={invert}
                                onChange={(e) => setInvert(Number(e.target.value))}
                            />
                        </div>
                        <div>
                            <p>Sepia</p>
                            <input 
                                type="range" 
                                className="slider" 
                                min="0" 
                                max="1" 
                                step="1" 
                                value={sepia}
                                onChange={(e) => setSepia(Number(e.target.value))}
                            />
                        </div>
                    </div>
                </div>
                <div className="border rounded">
                    <div className="p-2.5 flex">
                        {image ? (
                            <img src={image} alt="Uploaded" className="w-64 rounded" style={imageStyle} />
                        ) : (
                            <div className="bg-slate-200 w-64 h-64 rounded" />
                        )}
                    </div>
                    <hr />
                    <div className="p-2.5 flex">
                        <Button className="ml-auto" onClick={handlePublish} disabled={uploading}>
                            {uploading ? "Publishing..." : "Publish"}
                        </Button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}