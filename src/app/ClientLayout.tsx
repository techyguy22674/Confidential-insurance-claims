"use client";

import { useState, useCallback, useEffect } from "react";
import Navbar from "../components/Navbar";
import WalletConnectModal from "../components/WalletConnectModal";
import { getClient } from "../lib/contract";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string>("1AM Wallet");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const client = getClient();
      const status = client.getWalletStatus();
      if (status.connected && status.address) {
        setWalletAddress(status.address);
        setWalletName(status.walletName || "1AM Wallet");
      }
    }
  }, []);

  const handleOpenConnectModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleConnected = useCallback((address: string, name: string) => {
    setWalletAddress(address);
    setWalletName(name);
  }, []);

  const handleDisconnect = useCallback(() => {
    const client = getClient();
    client.disconnectWallet();
    setWalletAddress(null);
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar
        walletAddress={walletAddress}
        walletName={walletName}
        onOpenConnectModal={handleOpenConnectModal}
        onDisconnect={handleDisconnect}
      />
      <main style={{ flex: 1 }}>{children}</main>

      <footer style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", padding: "1.5rem", textAlign: "center", fontSize: "0.8rem", color: "#64748b" }}>
        <p style={{ margin: "0 0 0.4rem" }}>
          Confidential Insurance Claims (CIC) — Powered by Midnight Network ZK Smart Contracts.
        </p>
        <p style={{ margin: 0, fontSize: "0.75rem" }}>
          Compliant with Midnight Level 2 & Level 3 Specifications. Zero PII, medical records, or damages disclosed on-chain.
        </p>
      </footer>

      <WalletConnectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConnected={handleConnected}
      />
    </div>
  );
}
