"use client";

import { useEffect, useState } from "react";
import { FollowRestrictionModal } from "./components/FollowRestrictionModal";

export default function Home() {
  const [isInstagramBrowser, setIsInstagramBrowser] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "recent" | "albums" | "blogs" | "spaces"
  >("recent");
  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || "";
    setIsInstagramBrowser(/Instagram/i.test(ua));
  }, []);

  const openInChrome = () => {
    const currentUrl = window.location.href;
    const ua = navigator.userAgent || "";

    if (/Android/i.test(ua)) {
      const pathWithoutScheme = currentUrl.replace(/^https?:\/\//i, "");
      window.location.href = `intent://${pathWithoutScheme}#Intent;scheme=https;package=com.android.chrome;end`;
      return;
    }

    if (/iPhone|iPad|iPod/i.test(ua)) {
      window.location.href = currentUrl.replace(/^http/i, "googlechrome");
      return;
    }

    window.open(currentUrl, "_blank", "noopener,noreferrer");
  };

  const decode = (codePoints: number[]) => String.fromCharCode(...codePoints);

  const name = decode([67, 104, 105, 99, 108, 101, 116, 101]);
  const surname = decode([86, 101, 108, 104, 111]);
  const username = name.toLocaleLowerCase() + "." + surname.toLocaleLowerCase();

  const photos = [
    {
      id: 1,
      ratio: "ratio-3-4",
      src: "/img-01.jpg",
      enabled: true,
    },
    {
      id: 2,
      ratio: "ratio-3-4",
      src: "/img-02.jpg",
      enabled: true,
    },
    {
      id: 3,
      ratio: "ratio-3-4",
      src: "/img-03.jpg",
      enabled: true,
    },
    {
      id: 4,
      ratio: "ratio-8-16",
      src: "",
      enabled: false,
    },
    {
      id: 5,
      ratio: "ratio-16-8",
      src: "",
      enabled: false,
    },
    {
      id: 6,
      ratio: "ratio-3-4",
      src: "",
      enabled: false,
    },
    {
      id: 7,
      ratio: "ratio-8-16",
      src: "",
      enabled: false,
    },
    {
      id: 8,
      ratio: "ratio-4-3",
      src: "",
      enabled: false,
    },
  ];

  const enabledPhotos = photos.filter((photo) => photo.enabled);

  const showInstagramOverlay = isInstagramBrowser;

  useEffect(() => {
    if (showInstagramOverlay === undefined) {
      return;
    }

    if (!showInstagramOverlay) {
      if (document.body.parentElement)
        document.body.parentElement.style.overflow = "auto";
      document.body.style.overflowY = "auto";
      return;
    }

    const { overflow, touchAction } = document.body.style;
    document.body.style.overflow = "hidden";
    if (document.body.parentElement)
      document.body.parentElement.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.body.style.overflow = overflow;
      document.body.style.overflowY = "auto";
      document.body.style.touchAction = touchAction;
    };
  }, [showInstagramOverlay]);

  return (
    <>
      <main className="profile-page" aria-hidden={showInstagramOverlay}>
        <section className="profile-header" aria-label="Profile header">
          <div className="profile-main">
            <img
              className="avatar"
              src="/profile-picture.jpg"
              width={104}
              height={104}
            />
            <div className="profile-meta">
              <h1>{`${name} ${surname}`}</h1>
              <div className="badges">
                <span className="badge">PRO</span>
                <span className="badge-text">@{username}</span>
              </div>
            </div>
          </div>

          <aside className="profile-side" aria-label="Profile details">
            <div className="side-actions">
              <button
                type="button"
                className="follow-btn"
                onClick={() => setIsFollowModalOpen(true)}
              >
                FOLLOW
              </button>
              <button type="button" className="menu-btn" aria-label="Open menu">
                ...
              </button>
            </div>

            <div className="side-block">
              <h3>AVAILABLE FOR</h3>
              <p>-</p>
            </div>
          </aside>
        </section>

        <nav className="profile-tabs" aria-label="Gallery sections">
          <button
            type="button"
            className={activeTab === "recent" ? "active" : ""}
            aria-current={activeTab === "recent" ? "page" : undefined}
            onClick={() => setActiveTab("recent")}
          >
            RECENT
          </button>
          <button
            type="button"
            className={activeTab === "albums" ? "active" : ""}
            aria-current={activeTab === "albums" ? "page" : undefined}
            onClick={() => setActiveTab("albums")}
          >
            ALBUMS
          </button>
          <button
            type="button"
            className={activeTab === "blogs" ? "active" : ""}
            aria-current={activeTab === "blogs" ? "page" : undefined}
            onClick={() => setActiveTab("blogs")}
          >
            BLOGS
          </button>
          <button
            type="button"
            className={activeTab === "spaces" ? "active" : ""}
            aria-current={activeTab === "spaces" ? "page" : undefined}
            onClick={() => setActiveTab("spaces")}
          >
            SPACES
          </button>
        </nav>

        {activeTab === "recent" ? (
          <section className="gallery" aria-label="User gallery">
            {enabledPhotos.map((photo) => (
              <article className="tile" key={photo.id}>
                <div
                  className={`tile-frame ${photo.ratio}`}
                  onContextMenu={(event) => event.preventDefault()}
                >
                  <img
                    src={photo.src}
                    alt={`Gallery photo ${photo.id}`}
                    loading="lazy"
                    draggable={false}
                  />
                  <span className="image-protect-layer" aria-hidden="true" />
                </div>
              </article>
            ))}
            {showInstagramOverlay && <div className="blocking-overlay"></div>}
          </section>
        ) : (
          <section
            className="empty-section"
            aria-label={`${activeTab} content`}
          >
            <p>{name.toUpperCase()} HASN&apos;T POSTED YET</p>
          </section>
        )}

        <FollowRestrictionModal
          isOpen={isFollowModalOpen}
          onClose={() => setIsFollowModalOpen(false)}
        />
      </main>

      {showInstagramOverlay ? (
        <div className="modal-overlay" role="presentation">
          <section
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="open-in-chrome-title"
          >
            <h2 id="open-in-chrome-title">Open in Chrome</h2>
            <p>Continue in Google Chrome to view this profile.</p>
            <div className="modal-actions">
              <button
                type="button"
                className="modal-primary"
                onClick={openInChrome}
              >
                OPEN IN CHROME
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
