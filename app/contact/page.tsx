import type { Metadata } from "next";

import Footer from "components/layout/footer";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with the ${process.env.SITE_NAME} team.`,
};

// TODO: placeholder — replace with the custom-designed contact page (and add
// the shop's real support email/phone here).
export default function ContactPage() {
  return (
    <>
      <div className="mx-8 max-w-2xl py-20 sm:mx-auto">
        <h1 className="mb-8 text-5xl font-bold">Contact</h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Have a question about parts, fitment, or an order? Reach out and
          we&apos;ll get back to you.
        </p>
      </div>
      <Footer />
    </>
  );
}
