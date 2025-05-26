import React, { useEffect, useRef } from "react";

// 样式直接用 style 标签插入
const badgeStyles = `
.badge-container {
  width: 100vw;
  display: flex;
  justify-content: center;
  position: fixed;
  top: 28px;
  left: 0;
  z-index: 1000;
  pointer-events: none;
}
.freelance-badge {
  display: flex;
  align-items: center;
  background: #2e2052;
  border-radius: 24px;
  padding: 0.5em 1.5em 0.5em 1em;
  width: fit-content;
  box-shadow: 0 2px 16px 0 rgba(46,32,82,0.12);
  gap: 1em;
  pointer-events: all;
  transition: background 0.3s;
}
.icon-eye {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border-radius: 12px;
  position: relative;
}
.icon-eye svg {
  display: block;
}
.badge-text {
  color: #fff;
  font-size: 1.15em;
  font-weight: 400;
  display: flex;
  align-items: center;
  gap: 0.5em;
  transition: color 0.3s;
}
.status-dot {
  width: 8px;
  height: 8px;
  background: #c0ff2e;
  border-radius: 50%;
  display: inline-block;
  margin-right: 0.5em;
}
.freelance-badge.scrolled .badge-text {
  background: #c0ff2e;
  color: #2e2052;
  border-radius: 12px;
  padding: 0.25em 1em;
  transition: background 0.3s, color 0.3s;
}
.freelance-badge.scrolled {
  background: #2e2052;
}
.freelance-badge.scrolled .status-dot {
  background: #2e2052;
  margin-right: 0.7em;
}
`;

export default function BadgeSwitch() {
  const badgeRef = useRef(null);
  const badgeTextLabelRef = useRef(null);

  useEffect(() => {
    // 插入样式
    if (!document.getElementById("badge-switch-style")) {
      const style = document.createElement("style");
      style.id = "badge-switch-style";
      style.innerHTML = badgeStyles;
      document.head.appendChild(style);
    }

    function onScroll() {
      const badge = badgeRef.current;
      const badgeTextLabel = badgeTextLabelRef.current;
      if (!badge || !badgeTextLabel) return;
      if (window.scrollY > 100) {
        badge.classList.add("scrolled");
        badgeTextLabel.textContent = "hello@adriengervaix.com";
      } else {
        badge.classList.remove("scrolled");
        badgeTextLabel.textContent = "Available for freelance";
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="badge-container">
      <div className="freelance-badge" ref={badgeRef}>
        <span className="icon-eye">
          {/* Eye icon (SVG) */}
          <svg width="28" height="18" viewBox="0 0 28 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="14" cy="9" rx="13" ry="8" fill="#fff" fillOpacity="0.1"/>
            <ellipse cx="14" cy="9" rx="8" ry="6" fill="#fff" fillOpacity="0.2"/>
            <circle cx="14" cy="9" r="4" fill="#fff"/>
            <circle cx="14" cy="9" r="2" fill="#2e2052"/>
            {/* Status dot accent overlay, matching the badge dot */}
            <circle cx="21" cy="3" r="3" fill="#c0ff2e"/>
          </svg>
        </span>
        <span className="badge-text">
          <span className="status-dot"></span>
          <span ref={badgeTextLabelRef}>Available for freelance</span>
        </span>
      </div>
    </div>
  );
}
