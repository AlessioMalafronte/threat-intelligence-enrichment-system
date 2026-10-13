"use client";

import styles from "../siem.module.css";
import { useState } from "react";

interface ViewAlertRawProps {
  rawData: Record<string, any>;
  highlightKeys?: string[];
  actions?: Record<string, string>;
}

export default function ViewAlertRaw({
  rawData,
  highlightKeys = ["ip", "email", "domain", "src_port", "dst_port"],
  actions = {
    ip: "https://www.ip-score.com/custom/{value}",
    domain: "https://tools.sendmarc.com/score/{value}",
    dst_port: "https://www.speedguide.net/port.php?port={value}",
    src_port: "https://www.speedguide.net/port.php?port={value}",
  },
}: ViewAlertRawProps) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  if (!rawData) return null;

  return (
    <div className={styles.view_alert_raw_extern_div}>
      {Object.entries(rawData).map(([key, val]) => {
        const isHighlighted = highlightKeys.includes(key);
        const stringValue = String(val);
        const actionTemplate = actions[key];
        const href = actionTemplate
          ? actionTemplate.replace("{value}", encodeURIComponent(stringValue))
          : null;

        return (
          <div key={key} className={styles.view_alert_raw_line}>
            <strong className={styles.raw_key}>{key}:</strong>{" "}
            {href ? (
              <div
                onMouseEnter={() => setHoveredKey(key)}
                onMouseLeave={() => setHoveredKey(null)}
                className={styles.raw_value_wrapper}
              >
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    isHighlighted
                      ? styles.raw_value_highlighted_link
                      : styles.raw_value_link
                  }
                >
                  {stringValue}
                </a>
                {hoveredKey === key && (
                  <div className={styles.hover_preview}>
                    {href}
                  </div>
                )}
              </div>
            ) : (
              <span
                className={
                  isHighlighted
                    ? styles.raw_value_highlighted
                    : styles.raw_value
                }
              >
                {stringValue}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
