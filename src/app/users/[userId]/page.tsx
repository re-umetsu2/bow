"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { query, where, collection, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseConfig";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import Skeleton from "@/components/Skeleton";
import Button from "@/components/Button";

interface User {
  username: string;
  iconUrl: string;
  userID: string;
  bio: string;
}

interface Post {
  id: string;
  imageUrl: string;
  brightness: number;
  contrast: number;
  invert: number;
  sepia: number;
}

export default function UserPage({ params }: { params: { userId: string } }) {
  const { userId } = params;
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // ユーザーデータを取得
          const q = query(collection(db, "users"), where("userID", "==", userId));
          const userQuerySnapshot = await getDocs(q);

          if (!userQuerySnapshot.empty) {
            const userData = userQuerySnapshot.docs[0].data() as User;
            setUser(userData);

            if (currentUser.uid === userQuerySnapshot.docs[0].id) {
              setIsCurrentUser(true);
            }

            // 投稿データを取得
            const postsQuery = query(
              collection(db, "posts"),
              where("userID", "==", userId)
            );
            const postsSnapshot = await getDocs(postsQuery);

            const userPosts = postsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
            })) as Post[];
            setPosts(userPosts);
          } else {
            router.push("/404");
          }
        } catch (error) {
          console.error("Error fetching user data: ", error);
          router.push("/404");
        } finally {
          setIsLoading(false);
        }
      } else {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [userId, router]);

  const applyFilterStyle = (post: Post) => ({
    filter: `
      brightness(${post.brightness}%)
      contrast(${post.contrast}%)
      invert(${post.invert})
      sepia(${post.sepia})
    `,
  });

  return (
    <div className="md:w-1/2 mx-5 md:mx-auto my-10">
      <Header />
      {isLoading ? (
        <div className="mt-12">
          <div className="flex flex-col md:flex-row md:items-center">
            <Skeleton className="w-[94px] h-[94px] block md:hidden" rounded="full" />
            <Skeleton className="p-10 hidden md:block" rounded="full" />
            <div className="w-full flex items-center mt-5 md:mt-0 md:ml-5">
              <div className="mr-5">
                <Skeleton className="w-20 h-[32px] mb-[4px]" />
                <Skeleton className="w-40 h-[20px]" />
              </div>
              <div className="ml-auto">
                <Skeleton className="w-[99px] h-[38px]" rounded="full" />
              </div>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
            <Skeleton className="w-full h-32" />
            <Skeleton className="w-full h-32" />
            <Skeleton className="w-full h-32" />
            <Skeleton className="w-full h-32" />
            <Skeleton className="w-full h-32" />
            <Skeleton className="w-full h-32" />
          </div>
        </div>
      ) : user ? (
        <div className="mt-12">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="w-24 rounded-full overflow-hidden border">
              <Image src={user.iconUrl} alt={`${user.username}'s icon`} className="w-full" width={100} height={100} />
            </div>
            <div className="w-full flex items-center mt-5 md:mt-0 md:ml-5">
              <div className="mr-5">
                <h1 className="text-2xl mb-[4px]">{user.username}</h1>
                <p className="text-sm opacity-75">{user.bio}</p>
              </div>
              <div className="ml-auto">
                {isCurrentUser ? (
                  <Link href="/settings" passHref>
                    <Button variant="secondary">Edit Profile</Button>
                  </Link>
                ) : (
                  <Button variant="secondary">Follow</Button>
                )}
              </div>
            </div>
          </div>
          <div className="mt-12">
            {posts.length > 0 ? (
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
                {posts.map((post) => (
                  <Link key={post.id} href={`/post/${post.id}`} passHref>
                    <img
                      src={post.imageUrl}
                      alt="Post Image"
                      className="w-full h-auto rounded-lg"
                      style={applyFilterStyle(post)}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center opacity-50">
                <div className="w-40 mb-5">
                  <Image src="/w/01.svg" alt="watermelon 01" width={100} height={100} className="w-full" />
                </div>
                <p>The user&apos;s post was not found.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p>User not found</p>
      )}
      <Footer />
    </div>
  );
}