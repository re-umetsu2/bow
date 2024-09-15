"use client";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Image from "next/image";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        // 投稿データを取得
        const postDocRef = doc(db, "posts", postId);
        const postDoc = await getDoc(postDocRef);

        if (postDoc.exists()) {
          const postData = postDoc.data() as Post;
          setPost(postData);

          // ユーザーデータを無理やり取得
          try {
            const userDocRef = doc(db, "users", postData.userID);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
              const userData = userDoc.data() as User;
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostData();
  }, [postId]);

  const applyFilterStyle = () => ({
    filter: `
      brightness(${post?.brightness}%)
      contrast(${post?.contrast}%)
      invert(${post?.invert})
      sepia(${post?.sepia})
    `,
  });

  if (isLoading) {
    return <div>Loading...</div>; // ローディングインジケーター
  }

  return (
    <div className="md:w-1/2 mx-5 md:mx-auto my-10">
      <Header />
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
        {post ? (
          <img
            src={post.imageUrl}
            className="w-full rounded"
            alt="Post Image"
            style={applyFilterStyle()}
          />
        ) : (
          <p>Post not found</p>
        )}
        {user ? (
        <div className="mt-5">
          <div className="flex items-center">
            <Image
              src={user.iconUrl}
              alt={`${user.username}'s icon`}
              width={50}
              height={50}
              className="rounded-full"
            />
            <div className="ml-3">
              <h2 className="text-lg font-bold">{user.username}</h2>
              <p className="text-sm opacity-75">{user.bio}</p>
            </div>
          </div>
        </div>
      ) : (
        <p>User information not available</p>
      )}
      </div>
      <Footer />
    </div>
  );
}