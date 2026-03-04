import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LandingPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const navigate = useNavigate();

  useEffect(() => {
    const FIVE_MINUTES_MS = 5 * 60 * 1000;
    const lastDismissed = localStorage.getItem("landingPopupDismissedAt");

    if (lastDismissed) {
      const dismissedTime = parseInt(lastDismissed, 10);
      if (Date.now() - dismissedTime < FIVE_MINUTES_MS) {
        return;
      }
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let interval;
    if (isVisible && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isVisible, timeLeft]);

  const handleClose = () => {
    localStorage.setItem("landingPopupDismissedAt", Date.now().toString());
    setIsVisible(false);
  };

  const handleGoogleLogin = () => {
    navigate("/auth");
  };

  const isExpired = timeLeft === 0;
  const minutes = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4 pointer-events-none">
          {/* Backdrop */}
          <div
            className="absolute inset-0 pointer-events-auto"
            style={{
              background: "rgba(13,13,26,0.7)",
              backdropFilter: "blur(8px)",
            }}
            onClick={handleClose}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.92 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative pointer-events-auto w-full max-w-sm rounded-2xl overflow-hidden text-center"
            style={{
              background: "rgba(26,26,46,0.97)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow:
                "0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,45,120,0.1)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Gradient top line */}
            <div
              style={{
                height: "2px",
                background: "linear-gradient(90deg, #FF2D78, #00D4FF)",
              }}
            />

            {/* Ambient glow inside */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse, rgba(255,45,120,0.1) 0%, transparent 70%)",
                filter: "blur(20px)",
              }}
            />

            <div className="relative z-10 p-6">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#9BA3C7",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,45,120,0.4)";
                  e.currentTarget.style.color = "#FF2D78";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.color = "#9BA3C7";
                }}
              >
                <X size={14} />
              </button>

              {/* Timer */}
              <div className="flex items-center justify-center gap-2 mb-6 mt-2">
                {/* Minutes */}
                <div className="flex gap-1">
                  {[minutes[0], minutes[1]].map((digit, i) => (
                    <div
                      key={i}
                      className="w-10 h-12 rounded-xl flex items-center justify-center font-mono font-black text-lg"
                      style={{
                        background: isExpired
                          ? "rgba(255,45,120,0.1)"
                          : "rgba(255,255,255,0.05)",
                        border: isExpired
                          ? "1px solid rgba(255,45,120,0.4)"
                          : "1px solid rgba(255,255,255,0.1)",
                        color: isExpired ? "#FF2D78" : "#FFFFFF",
                        boxShadow: isExpired
                          ? "0 0 12px rgba(255,45,120,0.2)"
                          : "none",
                      }}
                    >
                      {isExpired ? "O" : digit}
                    </div>
                  ))}
                </div>

                <span
                  className="font-black text-lg pb-1"
                  style={{
                    color: isExpired ? "transparent" : "rgba(255,255,255,0.3)",
                  }}
                >
                  :
                </span>

                {/* Seconds */}
                <div className="flex gap-1">
                  {[seconds[0], seconds[1]].map((digit, i) => (
                    <div
                      key={i}
                      className="w-10 h-12 rounded-xl flex items-center justify-center font-mono font-black text-lg"
                      style={{
                        background: isExpired
                          ? "rgba(255,45,120,0.1)"
                          : "rgba(255,45,120,0.08)",
                        border: isExpired
                          ? "1px solid rgba(255,45,120,0.4)"
                          : "1px solid rgba(255,45,120,0.2)",
                        color: isExpired ? "#FF2D78" : "#FF2D78",
                        boxShadow: isExpired
                          ? "0 0 12px rgba(255,45,120,0.2)"
                          : "0 0 8px rgba(255,45,120,0.1)",
                      }}
                    >
                      {isExpired ? (i === 0 ? "P" : "S") : digit}
                    </div>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div
                className="mb-5"
                style={{
                  height: "1px",
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,45,120,0.3), rgba(0,212,255,0.3), transparent)",
                }}
              />

              {/* Text */}
              <h3
                className="font-extrabold text-white mb-3"
                style={{ fontSize: "1.2rem" }}
              >
                Join{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #FF2D78, #00D4FF)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  CodeSapiens
                </span>
              </h3>
              <p
                className="text-sm leading-relaxed mb-6"
                style={{ color: "#9BA3C7" }}
              >
                You can't even finish a coffee in 1 minute, but you can join
                TN's biggest student community in under{" "}
                <span className="font-bold" style={{ color: "#FF2D78" }}>
                  20 seconds
                </span>
                .
              </p>

              {/* CTA Button */}
              <motion.button
                onClick={handleGoogleLogin}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-full font-bold text-white text-sm mb-3"
                style={{
                  background: "linear-gradient(135deg, #FF2D78, #00D4FF)",
                  boxShadow: "0 0 24px rgba(255,45,120,0.35)",
                }}
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#fff"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="rgba(255,255,255,0.85)"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="rgba(255,255,255,0.7)"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="rgba(255,255,255,0.9)"
                  />
                </svg>
                Join Now
                <ArrowRight size={16} />
              </motion.button>

              {/* Dismiss */}
              <button
                onClick={handleClose}
                className="w-full text-xs py-2 transition-colors duration-200"
                style={{ color: "#9BA3C7" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#9BA3C7")}
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default LandingPopup;
