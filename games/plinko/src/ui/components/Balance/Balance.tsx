import { useEffect, useRef, useState } from "react";
import { usePlinkoStore } from "../../../store/store";
import "./Balance.css";

export function Balance() {
  const balance = usePlinkoStore((s) => s.balance);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const prev = useRef(balance);

  useEffect(() => {
    if (balance > prev.current) setFlash("up");
    else if (balance < prev.current) setFlash("down");
    prev.current = balance;
    const t = setTimeout(() => setFlash(null), 500);
    return () => clearTimeout(t);
  }, [balance]);

  return (
    <div className={`balance ${flash ? `balance--${flash}` : ""}`}>
      <span className="balance__label">Balance</span>
      <span className="balance__amount">${balance.toFixed(2)}</span>
    </div>
  );
}
