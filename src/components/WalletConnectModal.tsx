"use client";
import { useState, useEffect } from "react";
import { getAvailableWallets, getClient, type DiscoveredWallet } from "../lib/contract";

export default function WalletConnectModal({
  isOpen,
  onClose,
  onConnected,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConnected: (address: string, walletName: string) => void;
}) {
  const [wallets, setWallets] = useState<DiscoveredWallet[]>([]);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setConnectingId(null);
      const available = getAvailableWallets();
      setWallets(available);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectWallet = async (walletId?: string) => {
    setConnectingId(walletId || "default");
    setError(null);
    try {
      const client = getClient();
      const res = await client.connectWallet(walletId);
      onConnected(res.walletAddress, res.walletName);
      onClose();
    } catch (err: any) {
      const msg = err?.message || String(err);
      setError(msg);
    } finally {
      setConnectingId(null);
    }
  };

  const handleSimulate = () => {
    const client = getClient();
    const res = client.simulateApprovalConnect();
    onConnected(res.walletAddress, res.walletName);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(3, 7, 18, 0.8)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          width: "100%",
          maxWidth: 480,
          padding: "2rem",
          border: "1px solid rgba(225, 29, 72, 0.3)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.3rem" }}>🛡️</span>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#f1f5f9", margin: 0 }}>
              Connect Midnight Wallet
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              fontSize: "1.2rem",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "1.5rem", lineHeight: 1.5 }}>
          Select an authorized Midnight Network wallet. An interactive connection approval popup will prompt you to authorize this dApp.
        </p>

        {error && (
          <div
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#fca5a5",
              fontSize: "0.8rem",
              marginBottom: "1.25rem",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
          {wallets.length > 0 ? (
            wallets.map((w) => (
              <button
                key={w.id}
                onClick={() => handleSelectWallet(w.id)}
                disabled={connectingId !== null}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.9rem 1.2rem",
                  borderRadius: "10px",
                  background: w.is1AM ? "rgba(225, 29, 72, 0.12)" : "rgba(255, 255, 255, 0.04)",
                  border: `1px solid ${w.is1AM ? "rgba(225, 29, 72, 0.4)" : "rgba(255, 255, 255, 0.1)"}`,
                  color: "#f1f5f9",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontSize: "1.2rem" }}>{w.is1AM ? "⚡" : "🌙"}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{w.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      {w.is1AM ? "Recommended (Interactive Approval Flow)" : "Midnight Network DApp Connector"}
                    </div>
                  </div>
                </div>
                {connectingId === w.id ? (
                  <span className="spinner" />
                ) : (
                  <span style={{ color: "#e11d48", fontWeight: 600, fontSize: "0.8rem" }}>Connect →</span>
                )}
              </button>
            ))
          ) : (
            <div
              style={{
                padding: "1rem",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px dashed rgba(255, 255, 255, 0.15)",
                textAlign: "center",
                fontSize: "0.85rem",
                color: "#94a3b8",
              }}
            >
              <p style={{ margin: "0 0 0.5rem" }}>No Midnight extension detected in this browser.</p>
              <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0 }}>
                Please install <strong>1AM Wallet</strong> (from <a href="https://1am.xyz" target="_blank" rel="noreferrer" style={{ color: "#38bdf8" }}>1am.xyz</a>) or Midnight Lace.
              </p>
            </div>
          )}
        </div>

        <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Testing on Preview without extension?</span>
            <button
              type="button"
              onClick={handleSimulate}
              style={{
                background: "rgba(56, 189, 248, 0.1)",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                color: "#38bdf8",
                padding: "0.35rem 0.75rem",
                borderRadius: "6px",
                fontSize: "0.75rem",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Simulate Approval
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
