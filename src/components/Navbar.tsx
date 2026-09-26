"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar({
  walletAddress,
  walletName,
  onOpenConnectModal,
  onDisconnect,
}: {
  walletAddress: string | null;
  walletName: string;
  onOpenConnectModal: () => void;
  onDisconnect: () => void;
}) {
  const pathname = usePathname();
  const short = walletAddress
    ? walletAddress.substring(0, 8) + "..." + walletAddress.slice(-6)
    : null;

  return (
    <header className="navbar-3d">
      <div className="navbar-container">
        {/* Brand */}
        <Link href="/" className="nav-brand-3d">
          <span className="brand-logo-text">3DVERSE</span>
          <span className="brand-badge-pill">CIC</span>
        </Link>

        {/* Links */}
        <nav className="nav-menu-3d">
          <Link href="/" className={`nav-item-3d ${pathname === "/" ? "active" : ""}`}>
            About
          </Link>
          <Link href="/claim" className={`nav-item-3d ${pathname === "/claim" ? "active" : ""}`}>
            Services
          </Link>
          <Link href="/explorer" className={`nav-item-3d ${pathname === "/explorer" ? "active" : ""}`}>
            Experience
          </Link>
          <Link href="/admin" className={`nav-item-3d ${pathname === "/admin" ? "active" : ""}`}>
            Insurer Admin
          </Link>
        </nav>

        {/* Actions */}
        <div className="nav-actions-3d">
          <span className="network-indicator-pill">
            <span className="indicator-dot" />
            Midnight Preview
          </span>

          {walletAddress ? (
            <div className="wallet-connected-group">
              <span className="wallet-address-pill" title={walletAddress}>
                {short}
              </span>
              <button onClick={onDisconnect} className="btn-disconnect-3d">
                Disconnect
              </button>
            </div>
          ) : (
            <button onClick={onOpenConnectModal} className="btn-pill-cyan-glow">
              EXPLORE IN 3D
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
