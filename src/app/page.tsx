"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Button from "@/components/Button";
import { auth } from "@/lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="md:w-1/2 mx-5 md:mx-auto my-10">
      <Header />
      {isLoggedIn ? (
        <div className="mt-12 flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2">
            <h1 className="text-2xl mb-5">Capture the Moment, Make It Yours!</h1>
            <Link href="/editor" passHref>
              <Button size="lg" variant="secondary">Create Post</Button>
            </Link>
          </div>
          <div className="w-full lg:w-1/2 select-none">
            <Image src="/d/selfie.svg" alt="Illustration" width={100} height={100} className="w-full" />
          </div>
        </div>
      ) : (
        <div className="mt-12 flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2">
            <h1 className="text-2xl mb-5">Capture the Moment, Make It Yours!</h1>
            <Link href="/init" passHref>
              <Button size="lg" className="italic flex items-center" rightIcon={<FiArrowRight />}>
                Getting Started
              </Button>
            </Link>
          </div>
          <div className="w-full lg:w-1/2 select-none">
            <Image src="/d/coffe_call.svg" alt="Illustration" width={100} height={100} className="w-full" />
          </div>
        </div>
      )}
      <hr className="my-10" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="border rounded p-5">
          <h2 className="text-xl mb-2.5">Quick upload</h2>
          <p>Stress-free upload speed, you can upload any number of images quickly.</p>
        </div>
        <div className="border rounded p-5">
          <h2 className="text-xl mb-2.5">Easy editing</h2>
          <p>You can easily apply various filters and crop images.</p>
        </div>
        <div className="border rounded p-5">
          <h2 className="text-xl mb-2.5">Accurate search</h2>
          <p>You can search by keywords or tags, making it easy to find the images you want.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}