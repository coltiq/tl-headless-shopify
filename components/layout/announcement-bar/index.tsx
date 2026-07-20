import clsx from "clsx";
import { getAnnouncementBar } from "lib/shopify";
import { Inter } from "next/font/google";
import { AnnouncementRotator } from "./announcement-rotator";

const inter = Inter({ subsets: ["latin"] });

export async function AnnouncementBar() {
  const { announcements, links } = await getAnnouncementBar();

  if (!announcements.length && !links.length) {
    return null;
  }

  return (
    <div
      className={clsx(
        inter.className,
        "announcement-bar w-full bg-linear-135 from-[#1a2bc3] from-3% to-[#121d85] text-sm leading-[25px] text-white",
      )}
    >
      <div className="announcement-bar-content page-width flex items-center justify-between gap-6">
        <div className="announcement-slot min-w-0 flex-1">
          {announcements.length ? (
            <AnnouncementRotator announcements={announcements} />
          ) : null}
        </div>
        {links.length ? (
          <div className="announcement-links hidden shrink-0 items-center gap-5 py-2 md:flex">
            {links.map((link) => (
              <a
                key={`${link.label}-${link.url}`}
                href={link.url}
                {...(link.url.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="announcement-link flex items-center gap-1.5 whitespace-nowrap hover:underline hover:underline-offset-2"
              >
                {link.iconSvg ? (
                  <span
                    aria-hidden
                    className="announcement-link-icon flex items-center [&>svg]:h-4 [&>svg]:w-4"
                    dangerouslySetInnerHTML={{ __html: link.iconSvg }}
                  />
                ) : null}
                {link.label}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
