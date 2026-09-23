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
    <header className="nav">
      <Link href="/" className="nav-brand" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
        <span style={{ fontSize: "1.4rem" }}>🛡️</span>
        <div>
          <span style={{ fontWeight: 800, letterSpacing: "-0.02em", color: "#f1f5f9" }}>CIC</span>
          <span style={{ color: "#64748b", margin: "0 0.4rem" }}>|</span>
          <span style={{ color: "#e11d48", fontWeight: 700, fontSize: "0.95rem" }}>Confidential Insurance</span>
        </div>
      </Link>

      <div className="nav-links">
        <Link href="/" className={"nav-link " + (pathname === "/" ? "active" : "")}>
          Dashboard
        </Link>
        <Link href="/claim" className={"nav-link " + (pathname === "/claim" ? "active" : "")}>
          File & Verify Claim
        </Link>
        <Link href="/admin" className={"nav-link " + (pathname === "/admin" ? "active" : "")}>
          Insurer Console
        </Link>
        <Link href="/explorer" className={"nav-link " + (pathname === "/explorer" ? "active" : "")}>
          Ledger Explorer
        </Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span className="badge badge-purple" style={{ fontSize: "0.7rem", padding: "0.25rem 0.6rem" }}>
          Midnight Preview
        </span>

        {walletAddress ? (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                fontSize: "0.78rem",
                background: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.4)",
                color: "#10b981",
                padding: "0.35rem 0.85rem",
                borderRadius: "99px",
                fontWeight: 700,
                fontFamily: "monospace",
              }}
              title={walletAddress}
            >
              ✓ {short}
            </span>
            <button
              onClick={onDisconnect}
              className="btn-secondary"
              style={{ padding: "0.35rem 0.8rem", fontSize: "0.75rem" }}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            id="connect-wallet-btn"
            onClick={onOpenConnectModal}
            className="btn-primary"
            style={{
              padding: "0.45rem 1rem",
              fontSize: "0.82rem",
              background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
              borderColor: "#e11d48",
            }}
          >
            ⚡ Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
}
