"use client"
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Image from "next/image";

export default function NotFound() {
    return (
        <div className="md:w-1/2 mx-5 md:mx-auto my-10">
            <Header />
            <div className="mt-12 space-y-5">
                <h1 className="text-slate-400 text-8xl text-center font-bold">404</h1>
                <p className="text-slate-200 text-2xl text-center font-bold">ページが見つかりませんでした</p>
                <div className="flex justify-center opacity-50">
                    <Image src="/w/12.svg" alt="" width={100} height={100} className="w-[400px]" />
                </div>
            </div>
            <Footer />
        </div>
    )
}