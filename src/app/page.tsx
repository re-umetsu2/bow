import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiSearch } from "react-icons/fi";

export default function Home() {
  return (
    <div className="md:w-1/2 mx-5 md:mx-auto my-10">
      <div className="z-50 sticky top-10 left-0 bg-white bg-opacity-50 backdrop-blur border rounded-2xl shadow px-3.5 py-2.5 flex items-center">
        <div className="w-10">
          <Image src="/logo.svg" alt="Bow" width={100} height={100} />
        </div>
        {/* md以下 */}
        <div className="block lg:hidden ml-auto">
          <Link href="/search"><FiSearch className="opacity-50" /></Link>
        </div>
        {/* md以上 */}
        <div className="hidden lg:flex ml-auto">
          <div className="flex items-center bg-white rounded-full overflow-hidden px-1.5 py-0.5 mr-5">
            <FiSearch className="opacity-50" />
            <input placeholder="Search" className="outline-none ml-2.5" />
          </div>
          <div className="flex space-x-2.5">
            <button className="border rounded-full px-1.5 py-0.5">Log In</button>
            <button className="border border-black bg-black text-white rounded-full px-1.5 py-0.5">Sign Up</button>
          </div>
        </div>
      </div>
      <div className="mt-12 flex flex-col lg:flex-row items-center">
        <div className="lg:w-1/2">
          <h1 className="text-2xl">Capture the Moment, Make It Yours!</h1>
          <button className="border border-black bg-black text-white rounded-full px-3.5 py-2.5 mt-5 italic flex items-center">Getting Started<FiArrowRight className="ml-0.5" /></button>
        </div>
        <div className="w-full lg:w-1/2 select-none">
          <Image src="/d/coffe_call.svg" alt="Illustration" width={100} height={100} className="w-full" />
        </div>
      </div>
      <hr className="my-10" />
    </div>
  )
}