"use client";
import { useState } from "react";
import { auth } from "@/lib/firebaseConfig";
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Init() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleEmailSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/welcome");
    } catch (error) {
      console.error(error);
    }
  };

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/welcome");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl mb-4">Set Up Your Account</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <button
          onClick={handleEmailSignUp}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md"
        >
          Sign Up with Email
        </button>
        <button
          onClick={handleGoogleSignUp}
          className="w-full bg-red-500 text-white py-2 px-4 rounded-md"
        >
          Sign Up with Google
        </button>
      </div>
    </div>
  );
}
