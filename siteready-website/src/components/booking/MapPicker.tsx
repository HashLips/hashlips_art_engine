import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./BookLabourNowForm.module.css";

type SiteAddress = {
  formattedAddress: string;
  lat?: number | null;
  lng?: number | null;
  placeId?: string | null;
  mapUrl?: string | null;
};

interface MapPickerProps {
  value: SiteAddress;
  onChange: (value: SiteAddress) => void;
  error?: string;
}

declare global {
  interface Window {
    __mapScriptLoading?: boolean;
    __mapScriptPromise?: Promise<void>;
  }
}

const buildMapUrl = (lat?: number | null, lng?: number | null, placeId?: string | null) => {
  if (lat != null && lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}${
      placeId ? `&query_place_id=${placeId}` : ""
    }`;
  }
  return "";
};

const MapPicker: React.FC<MapPickerProps> = ({ value, onChange, error }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [mapsKey, setMapsKey] = useState<string | null>(null);

  const updateValue = useCallback(
    (partial: Partial<SiteAddress>) => {
      const next = { ...value, ...partial };
      next.mapUrl = buildMapUrl(next.lat ?? null, next.lng ?? null, next.placeId ?? null) || "";
      onChange(next);
    },
    [onChange, value],
  );

  const initMaps = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (!mapsKey) {
      setWarning("Google Maps API key is not set. Please contact support.");
      return;
    }
    if (typeof google === "undefined" || !google.maps) {
      setWarning("Google Maps failed to load. Check your API key and network.");
      return;
    }

    if (!mapRef.current) return;
    const center = new google.maps.LatLng(value.lat ?? -33.8688, value.lng ?? 151.2093);
    mapInstance.current = new google.maps.Map(mapRef.current, {
      center,
      zoom: value.lat && value.lng ? 16 : 12,
    });

    markerRef.current = new google.maps.Marker({
      map: mapInstance.current,
      draggable: true,
      position: value.lat && value.lng ? center : undefined,
    });

    markerRef.current.addListener("dragend", () => {
      const pos = markerRef.current?.getPosition();
      if (!pos) return;
      const lat = pos.lat();
      const lng = pos.lng();
      const fallback = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          updateValue({
            formattedAddress: results[0].formatted_address || fallback,
            lat,
            lng,
            placeId: results[0].place_id || null,
          });
        } else {
          updateValue({ formattedAddress: fallback, lat, lng, placeId: null });
        }
      });
    });

    if (searchRef.current) {
      const autocomplete = new google.maps.places.Autocomplete(searchRef.current, {
        componentRestrictions: { country: "au" },
      });
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) {
          setWarning("Please select a suggested place from the list.");
          return;
        }
        const loc = place.geometry.location;
        mapInstance.current?.panTo(loc);
        mapInstance.current?.setZoom(16);
        markerRef.current?.setPosition(loc);
        updateValue({
          formattedAddress: place.formatted_address ?? searchRef.current?.value ?? "",
          lat: loc.lat(),
          lng: loc.lng(),
          placeId: place.place_id ?? "",
        });
        setWarning(null);
      });
    }

    setMapReady(true);
  }, [mapsKey, updateValue, value.lat, value.lng]);

  const loadScript = useCallback((key: string) => {
    if (typeof window === "undefined") return;
    if (typeof google !== "undefined" && google.maps) {
      initMaps();
      return;
    }
    if (window.__mapScriptPromise) {
      window.__mapScriptPromise.then(initMaps);
      return;
    }
    window.__mapScriptPromise = new Promise<void>((resolve) => {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        resolve();
      };
      script.onerror = () => {
        setWarning("Google Maps failed to load. Check your API key.");
        resolve();
      };
      document.head.appendChild(script);
    }).then(() => initMaps());
  }, [initMaps]);

  useEffect(() => {
    let active = true;
    if (mapsKey !== null) return;
    fetch("/api/public-config")
      .then((res) => res.json())
      .then((json) => {
        if (!active) return;
        setMapsKey(json?.mapsKey || "");
      })
      .catch(() => {
        if (!active) return;
        setMapsKey("");
      });
    return () => {
      active = false;
    };
  }, [mapsKey]);

  useEffect(() => {
    if (mapsKey === null) return;
    if (!mapsKey) return;
    void loadScript(mapsKey);
  }, [loadScript, mapsKey]);

  useEffect(() => {
    // Keep marker in sync when value changes externally
    if (mapReady && value.lat != null && value.lng != null && markerRef.current) {
      const pos = new google.maps.LatLng(value.lat, value.lng);
      markerRef.current.setPosition(pos);
      mapInstance.current?.panTo(pos);
    }
  }, [mapReady, value.lat, value.lng]);

  return (
    <div className={styles.mapWrapper}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="site-search">
          Site address (Google Places)
        </label>
        <input
          id="site-search"
          name="site-search"
          ref={searchRef}
          className={styles.input}
          placeholder="Start typing site address"
          autoComplete="off"
          value={value.formattedAddress}
          onChange={(e) => updateValue({ formattedAddress: e.target.value })}
        />
        <div className={styles.mapNotice}>
          If the site does not have an address yet, type above something nearby and move the red marker to the exact
          location.
        </div>
        {error ? <span className={styles.error}>{error}</span> : null}
        {warning ? <div className={styles.alert}>{warning}</div> : null}
      </div>
      <div className={styles.mapArea} ref={mapRef} aria-label="Site map preview" />
      <div className={styles.mapMeta}>
        <div className={styles.summary}>
          <strong>Selected address:</strong> {value.formattedAddress || "None"}
        </div>
        <div className={styles.summary}>
          <strong>Lat / Lng:</strong>{" "}
          {value.lat != null && value.lng != null ? `${value.lat.toFixed(6)}, ${value.lng.toFixed(6)}` : "—"}
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => {
              if (mapReady && markerRef.current && value.lat != null && value.lng != null) {
                const pos = new google.maps.LatLng(value.lat, value.lng);
                markerRef.current.setPosition(pos);
                mapInstance.current?.panTo(pos);
                mapInstance.current?.setZoom(16);
              }
            }}
          >
            If you need to view the location in full Google Maps
          </button>
          <a
            className={styles.chip}
            href={value.mapUrl || "#"}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!value.mapUrl}
          >
            Open in Google Maps
          </a>
        </div>
      </div>
    </div>
  );
};

export default MapPicker;
