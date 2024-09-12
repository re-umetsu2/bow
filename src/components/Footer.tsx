import Image from "next/image";
import Link from "next/link";

export default function Footer() {
    return (
        <div className="bg-slate-200 rounded-2xl p-5 mt-20 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
            <div className="w-10">
                <Image src="/logo.svg" alt="Bow" width={100} height={100} />
            </div>
            <p className="mt-2.5">&copy; 2024 umetsu.</p>
            </div>
            <div className="flex flex-col space-y-2.5">
                <Link href="#">Terms of Service</Link>
                <Link href="#">Privacy Policy</Link>
                <Link href="#">FAQ</Link>
            </div>
            <div className="flex flex-col space-y-2.5">
                <Link href="#">About</Link>
                <Link href="#">Blog</Link>
                <Link href="#">Contact</Link>
            </div>
        </div>
    )
}