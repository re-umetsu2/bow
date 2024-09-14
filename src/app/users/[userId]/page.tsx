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
            router.push("/404");
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

  return (
    <div className="md:w-1/2 mx-5 md:mx-auto my-10">
        <Header />
        {/* 読み込み中のスケルトンUI */}
        {!user && (
          <div className="mt-12">
            <div className="flex flex-col md:flex-row md:items-center">
                <div className="w-[94px] h-[94px] rounded-full overflow-hidden">
                  <div className="bg-slate-200 w-[94px] h-[94px]" />
                </div>
                <div className="w-full flex items-center mt-5 md:mt-0 md:ml-5">
                    <div className="mr-5">
                        <div className="bg-slate-200 rounded w-20 h-[32px] mb-[4px]" />
                        <div className="bg-slate-200 rounded w-40 h-[20px]" />
                    </div>
                    <div className="ml-auto">
                        <div className="bg-slate-200 rounded-full w-32 h-[42px]" />
                    </div>
                </div>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-slate-200 w-full h-32 rounded" />
                <div className="bg-slate-200 w-full h-32 rounded" />
                <div className="bg-slate-200 w-full h-32 rounded" />
                <div className="bg-slate-200 w-full h-32 rounded" />
                <div className="bg-slate-200 w-full h-32 rounded" />
                <div className="bg-slate-200 w-full h-32 rounded" />
            </div>
          </div>
        )}
        {/* データ取得後の表示 */}
        {user && (
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
                            <Link href="/settings" passHref><button className="border px-2.5 py-1.5 rounded-full">Edit Profile</button></Link>
                        ) : (
                            <button className="border px-2.5 py-1.5 rounded-full">Follow</button>
                        )}
                    </div>
                </div>
            </div>
            <div className="mt-12">
                <div className="flex flex-col items-center opacity-50">
                    <div className="w-40 mb-5">
                        <Image src="/w/01.svg" alt="watermelon 01" width={100} height={100} className="w-full" />
                    </div>
                    <p>The user&apos;s post was not found.</p>
                </div>
            </div>
          </div>
        )}
        <Footer />
    </div>
  );
}