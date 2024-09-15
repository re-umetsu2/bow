import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebaseConfig";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { FiSearch, FiX } from "react-icons/fi";
import { FaGoogle, FaPlus, FaUser } from "react-icons/fa";
import Button from "./Button";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userProfile, setUserProfile] = useState<{ username?: string; iconUrl?: string; userID?: string } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        if (!userProfile) {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as { username?: string; iconUrl?: string; userID?: string });
          } else {
            setUserProfile(null); // データが存在しない場合はnullに設定
          }
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
    });

    return () => unsubscribe();
  }, [user]); // 依存配列に user を追加

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsUserMenuOpen(false);
      setUserProfile(null); // ログアウト時にプロフィールをクリア
    } catch (error) {
      console.error(error);
    }
  };

  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const handleEmailLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      closeLoginModal();
    } catch (error) {
      console.error(error);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      closeLoginModal();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="z-50 sticky top-10 left-0 bg-white bg-opacity-50 backdrop-blur border rounded-2xl shadow px-3.5 py-2.5 flex items-center">
        <Link href="/" className="w-10">
          <Image src="/logo.svg" alt="Bow" width={100} height={100} />
        </Link>
        <div className="flex ml-auto items-center">
          <Link href="/search" className="block md:hidden mr-2.5"><FiSearch className="opacity-50" /></Link>
          <div className="md:flex items-center bg-white rounded-full overflow-hidden px-1.5 py-0.5 mr-5 hidden">
            <FiSearch className="opacity-50" />
            <input placeholder="Search" className="outline-none ml-2.5" />
          </div>
          <div className="flex space-x-2.5">
            {user ? (
              <div className="relative">
                <div className="cursor-pointer" onClick={toggleUserMenu}>
                  {userProfile?.iconUrl ? (
                    <div className="w-[36px] border rounded-full overflow-hidden">
                      <Image src={userProfile.iconUrl} alt="User Icon" width={100} height={100} className="w-full" />
                    </div>
                  ) : (
                    <div className="bg-slate-200 text-slate-400 rounded-full w-[36px] h-[36px] flex items-center justify-center">
                      <FaUser />
                    </div>
                  )}
                </div>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2.5 w-40 bg-white border rounded-lg shadow-lg py-2">
                    <Link href="/editor" className="px-4 py-2 text-gray-800 hover:bg-gray-200 flex items-center link-focus border-b"><FaPlus className="mr-2" />Create Post</Link>
                    <Link href={`/users/${userProfile?.userID}`} className="block px-4 py-2 text-gray-800 hover:bg-gray-200 link-focus">
                      {userProfile?.username || "My Account"}
                    </Link>
                    <Link href="/settings" className="block px-4 py-2 text-gray-800 hover:bg-gray-200 link-focus">Settings</Link>
                    <button 
                      onClick={handleLogout} 
                      className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={openLoginModal}
                >
                  Log In
                </Button>
                <Link href="/init">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="z-50 fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-5 shadow-lg relative w-full max-w-md mx-5 md:mx-0">
            <div className="flex items-center mb-5">
              <h2 className="text-xl">Log In</h2>
              <button onClick={closeLoginModal} className="text-gray-500 ml-auto"><FiX /></button>
            </div>
            <form className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm text-slate-600">Email address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 block w-full border rounded shadow-sm py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm text-slate-600">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5 block w-full border rounded shadow-sm py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="space-y-2.5">
                <Button onClick={handleEmailLogin} className="w-full">
                  Log In
                </Button>
                <Button onClick={handleGoogleLogin} className="w-full flex items-center justify-center" variant="secondary" leftIcon={<FaGoogle />}>
                  Log In with Google
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
