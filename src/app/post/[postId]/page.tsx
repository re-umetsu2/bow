"use client";
import { useEffect, useState } from "react";
import { doc, getDoc, query, where, collection, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { ref, deleteObject } from "firebase/storage"; // Storageから画像を削除するために必要
import { storage } from "@/lib/firebaseConfig"; // Firebase Storageのインスタンス
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Image from "next/image";
import Link from "next/link";
import Skeleton from "@/components/Skeleton";
import Button from "@/components/Button";

interface User {
  username: string;
  iconUrl: string;
  userID: string;
  bio: string;
}

interface Post {
  imageUrl: string;
  brightness: number;
  contrast: number;
  invert: number;
  sepia: number;
  userID: string;
}

export default function PostPage({ params }: { params: { postId: string } }) {
  const { postId } = params;
  const [post, setPost] = useState<Post | null>(null);
  const [user, setUser] = useState<User | null>(null);
  
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [invert, setInvert] = useState(0);
  const [sepia, setSepia] = useState(0);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        // 投稿データを取得
        const postDocRef = doc(db, "posts", postId);
        const postDoc = await getDoc(postDocRef);

        if (postDoc.exists()) {
          const postData = postDoc.data() as Post;
          setPost(postData);

          // 初期フィルター値をセット
          setBrightness(postData.brightness);
          setContrast(postData.contrast);
          setInvert(postData.invert);
          setSepia(postData.sepia);

          // ユーザーデータを取得
          try {
            const userQuery = query(
              collection(db, "users"),
              where("userID", "==", postData.userID)
            );
            const userQuerySnapshot = await getDocs(userQuery);

            if (!userQuerySnapshot.empty) {
              const userData = userQuerySnapshot.docs[0].data() as User;
              setUser(userData);
            } else {
              console.warn("User not found");
            }
          } catch (error) {
            console.error("Error fetching user data: ", error);
          }
        } else {
          console.warn("Post not found");
        }
      } catch (error) {
        console.error("Error fetching post data: ", error);
      }
    };

    fetchPostData();
  }, [postId]);

  const applyFilterStyle = () => ({
    filter: `
      brightness(${brightness}%)
      contrast(${contrast}%)
      invert(${invert})
      sepia(${sepia})
    `,
  });

  const handleDelete = async () => {
    if (post && user) {
      try {
        // Storageから画像を削除
        const imageRef = ref(storage, post.imageUrl);
        await deleteObject(imageRef);

        // Firestoreから投稿データを削除
        const postDocRef = doc(db, "posts", postId);
        await deleteDoc(postDocRef);

        alert("The post has been deleted.");
      } catch (error) {
        console.error("Error deleting post: ", error);
        alert("An error occurred while deleting the post.");
      }
    } else {
      alert("Poster information not found.");
    }
  };

  return (
    <div className="md:w-1/2 mx-5 md:mx-auto my-10">
      <Header />
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
        {post ? (
          <img
            src={post.imageUrl}
            className="w-full border rounded"
            alt="Post Image"
            style={applyFilterStyle()}
          />
        ) : (
          <Skeleton className="w-full" />
        )}
        <div>
          {user ? (
            <div>
              <div className="flex items-center">
                <Link href={`/users/${user.userID}`} className="w-12 border rounded-full overflow-hidden link-focus" passHref>
                  <Image src={user.iconUrl} alt={`${user.username}'s icon`} width={100} height={100} className="w-full" />
                </Link>
                <div className="ml-2.5 flex flex-col">
                  <Link href={`/users/${user.userID}`} className="text-lg link-focus" passHref>{user.username}</Link>
                  <p className="text-sm opacity-75">{user.bio}</p>
                </div>
              </div>
              {user.userID === post?.userID && (
                <Button
                  onClick={handleDelete}
                  size="sm"
                  className="mt-5 bg-white text-[#EF4444] border border-red-500"
                >
                  Delete Post
                </Button>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center">
                <Skeleton className="w-12" rounded="full" />
                <div className="ml-2.5 flex flex-col">
                  <Skeleton className="w-20 h-[24px] mb-[4px]" />
                  <Skeleton className="w-40 h-[16px]" />
                </div>
              </div>
            </div>
          )}
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
      </div>
      <Footer />
    </div>
  );
}