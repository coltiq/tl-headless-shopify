import { EnvelopeIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function ContactLink() {
  return (
    <Link
      href="/contact"
      aria-label="Contact"
      className="flex h-10 w-10 items-center justify-center text-white transition-colors hover:text-neutral-300"
    >
      <EnvelopeIcon className="h-4" />
    </Link>
  );
}
