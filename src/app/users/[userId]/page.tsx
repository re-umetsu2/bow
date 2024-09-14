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

interface User {
  username: string;
  iconUrl: string;
  userID: string;
}

export default function UserPage({ params }: { params: { userId: string } }) {
  const { userId } = params;
  const [user, setUser] = useState<User | null>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // FirestoreでuserIDが一致するユーザーを検索
          const q = query(collection(db, "users"), where("userID", "==", userId));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data() as User;
            setUser(userData);

            // ログイン中のユーザーのUIDと表示するユーザーのUIDを比較
            if (currentUser.uid === querySnapshot.docs[0].id) {
              setIsCurrentUser(true);
            }
          } else {
            router.push("/404"); // ユーザーが存在しない場合は404ページへ
          }
        } catch (error) {
          console.error("Error fetching user data: ", error);
          router.push("/404");
        }
      } else {
        router.push("/"); // ユーザーがログインしていない場合はトップページへリダイレクト
      }
    });

    return () => unsubscribe();
  }, [userId, router]);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="md:w-1/2 mx-5 md:mx-auto my-10">
        <Header />
        <div className="mt-12">
            <div className="flex flex-col md:flex-row md:items-center">
                <div className="w-24 rounded-full overflow-hidden border">
                    <Image src={user.iconUrl} alt={`${user.username}'s icon`} className="w-full" width={100} height={100} />
                </div>
                <div className="w-full flex items-center mt-5 md:mt-0 md:ml-5">
                    <div className="mr-5">
                        <h1 className="text-2xl mb-[4px]">{user.username}</h1>
                        <p className="text-sm opacity-75">こんにちは。Bowを作った人です。</p>
                    </div>
                    <div className="ml-auto">
                        {isCurrentUser ? (
                            <Link href="/settings" passHref><button className="border px-4 py-2 rounded-full">Edit Profile</button></Link>
                        ) : (
                            <button className="border px-4 py-2 rounded-full">Follow</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
        <Footer />
    </div>
  );
}