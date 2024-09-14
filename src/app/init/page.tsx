"use client";
import { useState } from "react";
import { auth, db } from "@/lib/firebaseConfig";
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { FaGoogle } from "react-icons/fa";

// Step1 component props type
interface Step1Props {
  onNext: () => void;
  userID: string;
  setUserID: (id: string) => void;
  username: string;
  setUsername: (name: string) => void;
  setError: (error: string) => void;
}

// Step2 component props type
interface Step2Props {
  userID: string;
  username: string;
  onPrevious: () => void;
}

function Step1({ onNext, userID, setUserID, username, setUsername, setError }: Step1Props) {
  const validateUserID = (id: string) => {
    const validPattern = /^[a-zA-Z0-9._-]+$/;
    return validPattern.test(id);
  };

  const checkUserIDAvailability = async (id: string) => {
    const userDoc = await getDoc(doc(db, "users", id));
    return !userDoc.exists();
  };

  const handleNext = async () => {
    setError("");
    if (!validateUserID(userID)) {
      setError("UserID can only contain letters, numbers, '_', '-', and '.'.");
      return;
    }

    const isAvailable = await checkUserIDAvailability(userID);
    if (!isAvailable) {
      setError("This UserID is already taken. Please choose another one.");
      return;
    }

    onNext();
  };

  return (
    <div>
      <h2 className="text-2xl mb-5">Step 1: Set UserID and Username</h2>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-600">
            UserID<span className="text-red-400 ml-0.5">*</span>
          </label>
          <input
            type="text"
            value={userID}
            onChange={(e) => setUserID(e.target.value)}
            className="mt-1.5 block w-full border rounded shadow-sm py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1.5 block w-full border rounded shadow-sm py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button
          onClick={handleNext}
          className="w-full rounded-full py-2 px-4 bg-black border-black text-white"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function Step2({ userID, username, onPrevious }: Step2Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const saveUserInfo = async (authUserID: string) => {
    try {
      await setDoc(doc(db, "users", authUserID), {
        userID,  // userIDをFirestoreに保存
        username,
      });
    } catch (error) {
      console.error("Error saving user information: ", error);
      setError("Failed to save user information.");
    }
  };

  const handleEmailSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const authUserID = userCredential.user.uid;
      await saveUserInfo(authUserID);
      router.push("/");
    } catch (error) {
      console.error(error);
      setError("Failed to sign up. Please try again.");
    }
  };

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const authUserID = userCredential.user.uid;
      await saveUserInfo(authUserID);
      router.push("/");
    } catch (error) {
      console.error(error);
      setError("Failed to sign up with Google. Please try again.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl mb-5">Step 2: Sign Up</h2>
      {error && <p className="text-red-500 mb-5">{error}</p>}
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Email<span className="text-red-400 ml-0.5">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 block w-full border rounded shadow-sm py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Password<span className="text-red-400 ml-0.5">*</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 block w-full border rounded shadow-sm py-2 px-4 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button
          onClick={handleEmailSignUp}
          className="w-full rounded-full py-2 px-4 bg-black border-black text-white"
        >
          Sign Up
        </button>
        <button
          onClick={handleGoogleSignUp}
          className="w-full rounded-full py-2 px-4 border flex items-center justify-center"
        >
          <FaGoogle className="mr-2" />
          Sign Up with Google
        </button>
        <button
          onClick={onPrevious}
          className="w-full rounded-full py-2 px-4 border"
        >
          Back
        </button>
      </div>
    </div>
  );
}

export default function Init() {
  const [step, setStep] = useState(1);
  const [userID, setUserID] = useState("");
  const [username, setUsername] = useState("");
  const [, setError] = useState<string | null>(null);

  return (
    <div className="md:w-1/2 mx-5 md:mx-auto my-10">
      <Header />
      <div className="mt-12">
        {step === 1 && (
          <Step1
            onNext={() => setStep(2)}
            userID={userID}
            setUserID={setUserID}
            username={username}
            setUsername={setUsername}
            setError={setError}
          />
        )}
        {step === 2 && (
          <Step2
            userID={userID}
            username={username}
            onPrevious={() => setStep(1)}
          />
        )}
      </div>
    </div>
  );
}