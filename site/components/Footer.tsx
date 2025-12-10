import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-12 text-center border-t border-white/10 bg-[#020202]">
      <div className="mx-auto max-w-7xl px-6 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <Link href="/contact" className="text-sm leading-6 text-gray-600 hover:text-gray-400 transition-colors">
            Contact Us
          </Link>
          <Link href="/privacy-policy" className="text-sm leading-6 text-gray-600 hover:text-gray-400 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms-of-use" className="text-sm leading-6 text-gray-600 hover:text-gray-400 transition-colors">
            Terms of Use
          </Link>
        </div>
        <div className="mt-4 md:order-1 md:mt-0">
          <p className="text-center text-sm text-gray-600">
            © {new Date().getFullYear()} DocTree. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
