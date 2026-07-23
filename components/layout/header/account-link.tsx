import { UserIcon } from "@heroicons/react/24/outline";
import { ACCOUNT_URL } from "lib/constants";
import Link from "next/link";

export default function AccountLink() {
  if (!ACCOUNT_URL) return null;

  return (
    <Link
      href={ACCOUNT_URL}
      aria-label="Account"
      className="flex h-10 w-10 items-center justify-center text-white transition-colors hover:text-neutral-300"
    >
      <UserIcon className="h-4" />
    </Link>
  );
}
