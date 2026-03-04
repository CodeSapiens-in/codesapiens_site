import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ChevronDown,
  Menu,
  X,
  Github,
  Linkedin,
  Youtube,
  Users,
  Calendar,
  Code,
  Award,
  Crown,
  Rocket,
  Zap,
  Globe,
  Cpu,
  Handshake,
  Heart,
  ArrowUpRight,
  Instagram,
  Twitter,
  MessageCircle,
  Megaphone,
  Sparkles,
} from "lucide-react";
import { BACKEND_URL } from "../config";
import { authFetch } from "../lib/authFetch";
import LandingPopup from "./LandingPopup";

const StatsSection = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalColleges: 0,
    topColleges: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch(`${BACKEND_URL}/api/public-stats`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.stats);
        }
      })
      .catch((err) => console.error("Stats fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section
      className="relative py-20 md:py-28 overflow-hidden"
      style={{ background: "#0D0D1A" }}
    >
      {/* Ambient glows */}
      <div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255,45,120,0.08) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* Top divider */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(255,45,120,0.3), rgba(0,212,255,0.3), transparent)",
        }}
      />

      <div
        className="mx-auto px-4 sm:px-6 relative z-10"
        style={{ maxWidth: "1200px" }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-semibold tracking-widest uppercase"
            style={{
              background: "rgba(255,45,120,0.08)",
              border: "1px solid rgba(255,45,120,0.2)",
              color: "#FF2D78",
            }}
          >
            Impact
          </div>
          <h2
            className="font-extrabold text-white mb-4"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
          >
            By The{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #FF2D78, #00D4FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Numbers
            </span>
          </h2>
          <p className="text-sm" style={{ color: "#9BA3C7" }}>
            We are growing fast. Join the movement.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-start">
          {/* Left: Big Stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                val: "2000+",
                label: "Total Members",
                icon: <Users size={20} />,
                delay: 0,
              },
              {
                val: "50+",
                label: "Colleges Reached",
                icon: <Globe size={20} />,
                delay: 0.1,
              },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: stat.delay }}
                className="relative p-6 rounded-2xl text-center overflow-hidden group"
                style={{
                  background: "rgba(26,26,46,0.8)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                  backdropFilter: "blur(12px)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,45,120,0.25)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 40px rgba(255,45,120,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 32px rgba(0,0,0,0.3)";
                }}
              >
                {/* Gradient top line */}
                <div
                  className="absolute top-0 left-0 right-0"
                  style={{
                    height: "2px",
                    background: "linear-gradient(90deg, #FF2D78, #00D4FF)",
                  }}
                />

                {/* Hover shimmer */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,45,120,0.05), transparent)",
                  }}
                />

                <div
                  className="w-10 h-10 rounded-xl mx-auto mb-4 flex items-center justify-center"
                  style={{
                    background: "rgba(255,45,120,0.12)",
                    border: "1px solid rgba(255,45,120,0.2)",
                    color: "#FF2D78",
                  }}
                >
                  {stat.icon}
                </div>
                <p
                  className="font-extrabold mb-2"
                  style={{
                    fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
                    background: "linear-gradient(135deg, #FF2D78, #00D4FF)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {stat.val}
                </p>
                <p
                  className="text-xs font-semibold tracking-widest uppercase"
                  style={{ color: "#9BA3C7" }}
                >
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Right: Top Colleges */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: "rgba(26,26,46,0.8)",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              backdropFilter: "blur(12px)",
            }}
          >
            {/* Gradient top line */}
            <div
              style={{
                height: "2px",
                background: "linear-gradient(90deg, #FF2D78, #00D4FF)",
              }}
            />

            <div className="p-6">
              <h4 className="font-bold text-white mb-6 flex items-center gap-2">
                <Crown size={18} style={{ color: "#FF2D78" }} />
                Top Active Colleges
              </h4>

              <div className="flex flex-col justify-center">
                {loading ? (
                  <div
                    className="text-center py-10 animate-pulse"
                    style={{ color: "#9BA3C7" }}
                  >
                    Loading leaderboards...
                  </div>
                ) : stats.topColleges.filter(
                    (c) => c.name && c.name !== "Not specified",
                  ).length > 0 ? (
                  <div className="space-y-6">
                    {/* Podium — top 3 */}
                    {stats.topColleges.filter(
                      (c) => c.name && c.name !== "Not specified",
                    ).length >= 3 && (
                      <div className="flex items-end justify-center gap-3 min-h-[160px]">
                        {/* 2nd Place */}
                        <motion.div
                          initial={{ opacity: 0, y: 40 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2 }}
                          className="flex flex-col items-center w-1/3"
                        >
                          <p className="text-center text-xs font-bold text-white mb-1 line-clamp-2 leading-tight min-h-[2.5em]">
                            {
                              stats.topColleges.filter(
                                (c) => c.name && c.name !== "Not specified",
                              )[1].name
                            }
                          </p>
                          <p
                            className="text-xs mb-2"
                            style={{ color: "#9BA3C7" }}
                          >
                            {
                              stats.topColleges.filter(
                                (c) => c.name && c.name !== "Not specified",
                              )[1].count
                            }{" "}
                            Students
                          </p>
                          <div
                            className="w-full rounded-t-xl h-24 flex items-end justify-center pb-3 relative"
                            style={{
                              background:
                                "linear-gradient(to top, rgba(156,163,175,0.3), rgba(156,163,175,0.1))",
                              border: "1px solid rgba(156,163,175,0.2)",
                              borderBottom: "none",
                            }}
                          >
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                              style={{
                                background: "rgba(156,163,175,0.3)",
                                border: "1px solid rgba(156,163,175,0.5)",
                                color: "#D1D5DB",
                              }}
                            >
                              2
                            </div>
                          </div>
                        </motion.div>

                        {/* 1st Place */}
                        <motion.div
                          initial={{ opacity: 0, y: 40 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.1 }}
                          className="flex flex-col items-center w-1/3 -mt-4 z-10"
                        >
                          <p
                            className="text-center text-xs font-bold mb-1 line-clamp-2 leading-tight min-h-[2.5em]"
                            style={{ color: "#FF2D78" }}
                          >
                            {
                              stats.topColleges.filter(
                                (c) => c.name && c.name !== "Not specified",
                              )[0].name
                            }
                          </p>
                          <p
                            className="text-xs mb-2"
                            style={{ color: "#FF2D78", opacity: 0.7 }}
                          >
                            {
                              stats.topColleges.filter(
                                (c) => c.name && c.name !== "Not specified",
                              )[0].count
                            }{" "}
                            Students
                          </p>
                          <div
                            className="w-full rounded-t-xl h-32 flex items-end justify-center pb-3 relative overflow-hidden"
                            style={{
                              background:
                                "linear-gradient(to top, rgba(255,45,120,0.3), rgba(255,45,120,0.08))",
                              border: "1px solid rgba(255,45,120,0.3)",
                              borderBottom: "none",
                            }}
                          >
                            <div
                              className="absolute inset-0 opacity-30 animate-pulse"
                              style={{
                                background:
                                  "radial-gradient(circle at 50% 100%, rgba(255,45,120,0.4), transparent 70%)",
                              }}
                            />
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center relative z-10"
                              style={{
                                background:
                                  "linear-gradient(135deg, #FF2D78, #00D4FF)",
                                boxShadow: "0 0 16px rgba(255,45,120,0.6)",
                              }}
                            >
                              <Crown size={16} className="text-white" />
                            </div>
                          </div>
                        </motion.div>

                        {/* 3rd Place */}
                        <motion.div
                          initial={{ opacity: 0, y: 40 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 }}
                          className="flex flex-col items-center w-1/3"
                        >
                          <p
                            className="text-center text-xs font-bold mb-1 line-clamp-2 leading-tight min-h-[2.5em]"
                            style={{ color: "#00D4FF" }}
                          >
                            {
                              stats.topColleges.filter(
                                (c) => c.name && c.name !== "Not specified",
                              )[2].name
                            }
                          </p>
                          <p
                            className="text-xs mb-2"
                            style={{ color: "#9BA3C7" }}
                          >
                            {
                              stats.topColleges.filter(
                                (c) => c.name && c.name !== "Not specified",
                              )[2].count
                            }{" "}
                            Students
                          </p>
                          <div
                            className="w-full rounded-t-xl h-20 flex items-end justify-center pb-3 relative"
                            style={{
                              background:
                                "linear-gradient(to top, rgba(0,212,255,0.2), rgba(0,212,255,0.05))",
                              border: "1px solid rgba(0,212,255,0.2)",
                              borderBottom: "none",
                            }}
                          >
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                              style={{
                                background: "rgba(0,212,255,0.2)",
                                border: "1px solid rgba(0,212,255,0.4)",
                                color: "#00D4FF",
                              }}
                            >
                              3
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    )}

                    {/* 4th & 5th list */}
                    <div className="space-y-2">
                      {stats.topColleges
                        .filter((c) => c.name && c.name !== "Not specified")
                        .slice(
                          stats.topColleges.filter(
                            (c) => c.name && c.name !== "Not specified",
                          ).length >= 3
                            ? 3
                            : 0,
                          5,
                        )
                        .map((college, index) => {
                          const actualIndex =
                            stats.topColleges.filter(
                              (c) => c.name && c.name !== "Not specified",
                            ).length >= 3
                              ? index + 3
                              : index;
                          return (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.4 + index * 0.1 }}
                              className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200"
                              style={{
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.06)",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background =
                                  "rgba(255,45,120,0.06)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background =
                                  "rgba(255,255,255,0.04)")
                              }
                            >
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                style={{
                                  background: "rgba(255,255,255,0.06)",
                                  border: "1px solid rgba(255,255,255,0.1)",
                                  color: "#9BA3C7",
                                }}
                              >
                                {actualIndex + 1}
                              </div>
                              <p className="flex-1 text-sm font-medium text-white truncate">
                                {college.name}
                              </p>
                              <div
                                className="px-2 py-1 rounded-full text-xs font-bold"
                                style={{
                                  background: "rgba(255,45,120,0.1)",
                                  color: "#FF2D78",
                                  border: "1px solid rgba(255,45,120,0.2)",
                                }}
                              >
                                {college.count}
                              </div>
                            </motion.div>
                          );
                        })}
                    </div>
                  </div>
                ) : (
                  <div
                    className="text-center py-10 text-sm"
                    style={{ color: "#9BA3C7" }}
                  >
                    Stats will update soon
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const SponsorSection = () => {
  const sponsors = [
    {
      name: "Mako IT Lab",
      link: "https://www.makoitlab.com/",
      image:
        "https://res.cloudinary.com/dqudvximt/image/upload/v1767816977/users_cme79i2lk00qls401ar5qxqnc_VGly5cMkz1ZxkXas-1_76R8XDxGiLgjc8BaeXApow_yzzhyw.webp",
    },
    {
      name: "Yuniq",
      link: "https://yuniq.co/",
      image:
        "https://res.cloudinary.com/dqudvximt/image/upload/v1767817525/users_cme79i2lk00qls401ar5qxqnc_hBofB72xXBV4C0cL-users_clylc5w1v070to301jatq0e85_FVqmiMesQBlCZ0ZM-yuniq_njsnoy.jpg",
    },
    {
      name: "Contentstack",
      link: "https://www.contentstack.com/",
      image:
        "https://res.cloudinary.com/dqudvximt/image/upload/v1767817529/users_cme79i2lk00qls401ar5qxqnc_DaxnHl7f0QdeQwgx-square-image_pvgube.jpg",
    },
    {
      name: "Navan AI",
      link: "https://navan.ai/",
      image:
        "https://res.cloudinary.com/dqudvximt/image/upload/v1771507803/WhatsApp_Image_2026-02-19_at_4.28.11_PM_bxnzfc.jpg",
    },
    {
      name: "Notion",
      link: "https://www.notion.com/",
      image:
        "https://res.cloudinary.com/dqudvximt/image/upload/v1767817532/users_cme79i2lk00qls401ar5qxqnc_891aQQNEpsjHP7Ef-notion-logo-png_seeklogo-425508_k0njb3.webp",
    },
    {
      name: "Interview Buddy",
      link: "https://interviewbuddy.net/",
      image:
        "https://res.cloudinary.com/dqudvximt/image/upload/v1771508422/WhatsApp_Image_2026-02-19_at_4.28.12_PM_xxalgw.jpg",
    },
  ];

  return (
    <section
      className="relative py-20 md:py-28 overflow-hidden"
      style={{ background: "#0D0D1A" }}
    >
      {/* Ambient glows */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255,45,120,0.07) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* Top divider */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(255,45,120,0.3), rgba(0,212,255,0.3), transparent)",
        }}
      />

      <div
        className="mx-auto px-4 sm:px-6 relative z-10"
        style={{ maxWidth: "1200px" }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-xs font-semibold tracking-widest uppercase"
            style={{
              background: "rgba(255,45,120,0.08)",
              border: "1px solid rgba(255,45,120,0.2)",
              color: "#FF2D78",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D78] animate-pulse" />
            Backing the Future
          </div>
          <h2
            className="font-extrabold text-white mb-3"
            style={{ fontSize: "clamp(1.8rem, 5vw, 3rem)" }}
          >
            OUR{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #FF2D78, #00D4FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              SPONSORS
            </span>
          </h2>
          <p className="text-sm" style={{ color: "#9BA3C7" }}>
            Companies that believe in the next generation of builders.
          </p>
        </motion.div>

        {/* Sponsor Cards — horizontal pill style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sponsors.map((sponsor, idx) => (
            <motion.a
              key={idx}
              href={sponsor.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.07 }}
              whileHover={{ y: -4 }}
              className="group relative flex items-center gap-4 p-4 rounded-2xl overflow-hidden"
              style={{
                background: "rgba(26,26,46,0.8)",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
                backdropFilter: "blur(12px)",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,45,120,0.3)";
                e.currentTarget.style.boxShadow =
                  "0 8px 32px rgba(255,45,120,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.3)";
              }}
            >
              {/* Gradient top line */}
              <div
                className="absolute top-0 left-0 right-0"
                style={{
                  height: "2px",
                  background:
                    idx % 2 === 0
                      ? "linear-gradient(90deg, #FF2D78, #00D4FF)"
                      : "linear-gradient(90deg, #00D4FF, #FF2D78)",
                }}
              />

              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at 30% 50%, rgba(255,45,120,0.05), transparent 70%)",
                }}
              />

              {/* Logo box */}
              <div
                className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <img
                  src={sponsor.image}
                  alt={sponsor.name}
                  className="w-10 h-10 object-contain transition-transform duration-400 group-hover:scale-110"
                  loading="lazy"
                />
              </div>

              {/* Name + visit */}
              <div className="flex-1 min-w-0 relative z-10">
                <p className="font-bold text-white text-sm truncate mb-0.5">
                  {sponsor.name}
                </p>
                <p className="text-xs" style={{ color: "#9BA3C7" }}>
                  Visit website
                </p>
              </div>

              {/* Arrow */}
              <div
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 relative z-10"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#9BA3C7",
                }}
              >
                <ArrowUpRight size={14} />
              </div>
            </motion.a>
          ))}
        </div>

        {/* Bottom trust line */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-xs" style={{ color: "#9BA3C7" }}>
            Interested in supporting CodeSapiens?{" "}
            <a
              href="mailto:codesapiens@gmail.com"
              className="font-semibold transition-colors duration-200"
              style={{ color: "#FF2D78" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#00D4FF")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#FF2D78")}
            >
              Become a sponsor →
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
};
const CommunityPartners = () => {
  const partners = [
    {
      name: "Chennai React.JS",
      image:
        "https://res.cloudinary.com/dqudvximt/image/upload/v1767817843/users_cme79i2lk00qls401ar5qxqnc_OGGz5HgXCzS9rI8H-users_clylc5w1v070to301jatq0e85_bNj4z9CoW02cMzqm-circle_rs5ttj.png",
      link: "#",
    },
    {
      name: "D3 Community",
      image:
        "https://res.cloudinary.com/dqudvximt/image/upload/v1767817844/users_cme79i2lk00qls401ar5qxqnc_EMRqmDnatuO4Rk38-users_cm9cf3ngn02erro015wogiktk_8CHW9Warth4BkBG9-Blue_2520Minimalist_2520Simple_2520Technology_2520Logo_2520_2520_1_mqig9s.png",
      link: "#",
    },
    {
      name: "Namma Flutter",
      image:
        "https://res.cloudinary.com/dqudvximt/image/upload/v1767817846/users_cme79i2lk00qls401ar5qxqnc_1KwVf1Iz3NmGXUQP-176333249_mhbrlj.webp",
      link: "#",
    },
  ];

  return (
    <section
      className="relative py-20 md:py-28 overflow-hidden"
      style={{ background: "#0D0D1A" }}
    >
      {/* Ambient glows */}
      <div
        className="absolute top-0 left-1/3 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />
      <div
        className="absolute bottom-0 right-1/3 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255,45,120,0.07) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* Top divider */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(0,212,255,0.3), rgba(255,45,120,0.3), transparent)",
        }}
      />

      <div
        className="mx-auto px-4 sm:px-6 relative z-10"
        style={{ maxWidth: "1200px" }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-xs font-semibold tracking-widest uppercase"
            style={{
              background: "rgba(0,212,255,0.08)",
              border: "1px solid rgba(0,212,255,0.2)",
              color: "#00D4FF",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse" />
            Growing Together
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <h2
              className="font-extrabold leading-none tracking-tight"
              style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)" }}
            >
              <span className="text-white">COMMUNITY </span>
              <span
                style={{
                  background: "linear-gradient(135deg, #00D4FF, #FF2D78)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                PARTNERS
              </span>
            </h2>
            <p className="text-sm pb-1" style={{ color: "#9BA3C7" }}>
              Communities we grow with.
            </p>
          </div>
          <div
            className="mt-5"
            style={{
              height: "1px",
              background:
                "linear-gradient(90deg, rgba(0,212,255,0.4), rgba(255,45,120,0.3), transparent)",
            }}
          />
        </motion.div>

        {/* Partner Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {partners.map((partner, idx) => (
            <motion.a
              key={idx}
              href={partner.link}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -6 }}
              className="group relative flex flex-col items-center justify-center p-8 rounded-2xl overflow-hidden"
              style={{
                background: "rgba(26,26,46,0.8)",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
                backdropFilter: "blur(12px)",
                textDecoration: "none",
                minHeight: "220px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(0,212,255,0.3)";
                e.currentTarget.style.boxShadow =
                  "0 8px 40px rgba(0,212,255,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.3)";
              }}
            >
              {/* Gradient top line — alternates */}
              <div
                className="absolute top-0 left-0 right-0"
                style={{
                  height: "2px",
                  background:
                    idx % 2 === 0
                      ? "linear-gradient(90deg, #00D4FF, #FF2D78)"
                      : "linear-gradient(90deg, #FF2D78, #00D4FF)",
                }}
              />

              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(0,212,255,0.06), transparent 70%)",
                }}
              />

              {/* Logo */}
              <div className="relative z-10 flex items-center justify-center w-full flex-1">
                <img
                  src={partner.image}
                  alt={partner.name}
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                  style={{ maxWidth: "75%", maxHeight: "130px" }}
                  loading="lazy"
                />
              </div>

              {/* Name badge at bottom */}
              <div className="relative z-10 mt-6">
                <div
                  className="px-4 py-1.5 rounded-full text-xs font-semibold text-center"
                  style={{
                    background: "rgba(0,212,255,0.08)",
                    border: "1px solid rgba(0,212,255,0.2)",
                    color: "#00D4FF",
                  }}
                >
                  {partner.name}
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-xs" style={{ color: "#9BA3C7" }}>
            Want to partner with CodeSapiens?{" "}
            <a
              href="mailto:codesapiens@gmail.com"
              className="font-semibold transition-colors duration-200"
              style={{ color: "#00D4FF" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#FF2D78")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#00D4FF")}
            >
              Let's connect →
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

const SocialMediaSection = () => {
  const socials = [
    {
      name: "LinkedIn",
      icon: <Linkedin size={28} />,
      link: "https://www.linkedin.com/company/codesapiens-community/posts/",
      badge: "@codesapiens-community",
      accentColor: "rgba(0,119,181,0.8)",
      backgroundImage:
        "url('https://res.cloudinary.com/dqudvximt/image/upload/v1767874220/users_cme79i2lk00qls401ar5qxqnc_n74cMGsKIBuvEzzj-users_cme5bsukl01binm014j8ioh2j_2SNEHA31eEqsxFRS-original-33f53dcd2f48e068523d32df0e5cc92f_xkirvh.gif') center/cover no-repeat",
    },
    {
      name: "Luma",
      icon: null,
      link: "https://lu.ma/codesapiens",
      badge: null,
      accentColor: "rgba(139,92,246,0.8)",
      backgroundImage:
        "url('https://res.cloudinary.com/dqudvximt/image/upload/v1767875075/users_cme79i2lk00qls401ar5qxqnc_WI6Z0HVxNMCrvfgn-ETzJoQJr1aCFL2r7-rrDC9gCyIJ77RqVW-luma_cqxcny.jpg') center/cover no-repeat",
    },
    {
      name: "WhatsApp",
      icon: null,
      link: "https://chat.whatsapp.com/LLtoddmQx5rIRNb8WE6rqC?mode=ems_copy_t",
      badge: "Join Community",
      accentColor: "rgba(37,211,102,0.8)",
      customContent: (
        <div className="w-full h-full flex items-center justify-center">
          <img
            src="https://res.cloudinary.com/dqudvximt/image/upload/v1767875047/410201-PD391H-802_h7tcfj.jpg"
            alt="WhatsApp"
            className="w-20 h-20 object-contain rounded-xl"
          />
        </div>
      ),
    },
    {
      name: "Instagram",
      icon: <Instagram size={28} />,
      link: "https://www.instagram.com/codesapiens/",
      badge: "@Codesapiens.in",
      accentColor: "rgba(225,48,108,0.8)",
      customContent: (
        <div className="w-full h-full flex items-center justify-center">
          <img
            src="https://res.cloudinary.com/dqudvximt/image/upload/v1767874489/users_cme79i2lk00qls401ar5qxqnc_3o1XM7ID2mXVDk6e-XeFzd3iFtoytJqTv-1497553304-104_84834_allkph.png"
            alt="Instagram"
            className="w-24 h-24 object-contain drop-shadow-xl"
          />
        </div>
      ),
    },
    {
      name: "Twitter",
      icon: <Twitter size={28} />,
      link: "https://twitter.com/codesapiens",
      badge: "@codesapiens_in",
      accentColor: "rgba(29,161,242,0.8)",
      customContent: (
        <div className="w-full h-full flex items-center justify-center">
          <img
            src="https://res.cloudinary.com/dqudvximt/image/upload/v1767874490/users_cme79i2lk00qls401ar5qxqnc_XgLMxxPTSSuuRKu5-users_cme5bsukl01binm014j8ioh2j_XQ7ryCBwyUFzFg6v-CLIPLY_372109260_TWITTER_LOGO_400_ptqbvv.gif"
            alt="Twitter"
            className="w-24 h-24 object-contain"
          />
        </div>
      ),
    },
    {
      name: "Volunteers Needed",
      icon: <Megaphone size={28} />,
      link: "https://forms.gle/volunteer",
      badge: "Join Us",
      accentColor: "rgba(255,45,120,0.8)",
      backgroundImage:
        "url('https://res.cloudinary.com/dqudvximt/image/upload/v1767876038/users_cme79i2lk00qls401ar5qxqnc_Hg7Si3j52FVfpQRN-image_x8wghd.png') center/cover no-repeat",
    },
    {
      name: "GitHub",
      icon: <Github size={28} />,
      link: "https://github.com/Codesapiens-in",
      badge: "@Codesapiens-in",
      accentColor: "rgba(255,255,255,0.15)",
      backgroundImage:
        "url('https://res.cloudinary.com/dqudvximt/image/upload/v1767874482/users_cme79i2lk00qls401ar5qxqnc_MOSc1bv3RXu0WL5z-users_cme5bsukl01binm014j8ioh2j_7dOv2cTCX8B86u82-users_clylc5w1v070to301jatq0e85_AdzvY5ioFqaF37x5-github_dsjpx6.gif') center/cover no-repeat",
    },
    {
      name: "YouTube",
      icon: <Youtube size={28} />,
      link: "https://youtube.com/@codesapiens-in?si=90EaPMYHcSZIHtMi",
      badge: "@Codesapiens",
      accentColor: "rgba(255,0,0,0.8)",
      backgroundImage:
        "url('https://res.cloudinary.com/dqudvximt/image/upload/v1767874488/users_cme79i2lk00qls401ar5qxqnc_Ov9Ygh4NAQfPGktu-users_cme5bsukl01binm014j8ioh2j_5JQAosdeiVappI2y-users_clylc5w1v070to301jatq0e85_CCuEsN5SSMlu4LAN-youtube_aky1f3.gif') center/cover no-repeat",
    },
  ];

  return (
    <section
      className="relative py-20 md:py-28 overflow-hidden"
      style={{ background: "#0D0D1A" }}
    >
      {/* Ambient glows */}
      <div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255,45,120,0.07) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* Top divider */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(255,45,120,0.3), rgba(0,212,255,0.3), transparent)",
        }}
      />

      <div
        className="mx-auto px-4 sm:px-6 relative z-10"
        style={{ maxWidth: "1200px" }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-xs font-semibold tracking-widest uppercase"
            style={{
              background: "rgba(255,45,120,0.08)",
              border: "1px solid rgba(255,45,120,0.2)",
              color: "#FF2D78",
            }}
          >
            <Globe size={12} />
            Connect With Us
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <h2
              className="font-extrabold leading-none tracking-tight"
              style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)" }}
            >
              <span className="text-white">SOCIAL </span>
              <span
                style={{
                  background: "linear-gradient(135deg, #FF2D78, #00D4FF)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                LINKS
              </span>
            </h2>
            <p className="text-sm pb-1" style={{ color: "#9BA3C7" }}>
              Follow us everywhere we exist.
            </p>
          </div>
          <div
            className="mt-5"
            style={{
              height: "1px",
              background:
                "linear-gradient(90deg, rgba(255,45,120,0.4), rgba(0,212,255,0.3), transparent)",
            }}
          />
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] gap-4">
          {socials.map((social, idx) => (
            <motion.a
              key={idx}
              href={social.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="group relative rounded-2xl overflow-hidden flex flex-col justify-between p-4"
              style={{
                background: "rgba(26,26,46,0.9)",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
                backdropFilter: "blur(12px)",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `rgba(255,45,120,0.3)`;
                e.currentTarget.style.boxShadow =
                  "0 8px 40px rgba(255,45,120,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.3)";
              }}
            >
              {/* Background image */}
              {social.backgroundImage && (
                <div
                  className="absolute inset-0 opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                  style={{ background: social.backgroundImage }}
                />
              )}

              {/* Dark scrim over bg image */}
              {social.backgroundImage && (
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(13,13,26,0.85) 0%, rgba(13,13,26,0.3) 60%, transparent 100%)",
                  }}
                />
              )}

              {/* Gradient top line */}
              <div
                className="absolute top-0 left-0 right-0"
                style={{
                  height: "2px",
                  background:
                    idx % 2 === 0
                      ? "linear-gradient(90deg, #FF2D78, #00D4FF)"
                      : "linear-gradient(90deg, #00D4FF, #FF2D78)",
                }}
              />

              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(255,45,120,0.08), transparent 70%)",
                }}
              />

              {/* Top row: icon + arrow */}
              <div className="relative z-10 flex items-start justify-between">
                {social.icon && (
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                    style={{
                      background: social.accentColor,
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    {social.icon}
                  </div>
                )}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "white",
                  }}
                >
                  <ArrowUpRight size={13} />
                </div>
              </div>

              {/* Custom content (images) */}
              {social.customContent && (
                <div className="relative z-10 flex-1 flex items-center justify-center">
                  {social.customContent}
                </div>
              )}

              {/* Bottom: name + badge */}
              <div className="relative z-10 flex flex-col gap-1">
                <p className="text-white font-bold text-sm">{social.name}</p>
                {social.badge && (
                  <span
                    className="self-start px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "#9BA3C7",
                    }}
                  >
                    {social.badge}
                  </span>
                )}
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

const NoticeSection = () => {
  return (
    <section
      className="relative py-16 md:py-20 overflow-hidden"
      style={{ background: "#0D0D1A" }}
    >
      {/* Top divider */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(255,45,120,0.3), rgba(0,212,255,0.3), transparent)",
        }}
      />

      <div
        className="mx-auto px-4 sm:px-6 relative z-10"
        style={{ maxWidth: "1200px" }}
      >
        {/* Header — centered */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-semibold tracking-widest uppercase"
            style={{
              background: "rgba(255,45,120,0.08)",
              border: "1px solid rgba(255,45,120,0.2)",
              color: "#FF2D78",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D78] animate-pulse" />
            Latest Updates
          </div>
          <h2
            className="font-extrabold text-white"
            style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
          >
            What's{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #FF2D78, #00D4FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Happening
            </span>
          </h2>
          <p className="text-sm mt-3" style={{ color: "#9BA3C7" }}>
            Stay up to date with the latest from CodeSapiens.
          </p>
        </motion.div>

        {/* Cards — centered grid */}
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -6 }}
            className="group rounded-2xl overflow-hidden"
            style={{
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
              width: "100%",
              maxWidth: "380px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,45,120,0.35)";
              e.currentTarget.style.boxShadow =
                "0 12px 40px rgba(255,45,120,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
              e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.3)";
            }}
          >
            <div
              style={{
                height: "2px",
                background: "linear-gradient(90deg, #FF2D78, #00D4FF)",
              }}
            />
            <img
              src="https://res.cloudinary.com/dqudvximt/image/upload/v1767877162/users_cme79i2lk00qls401ar5qxqnc_N0bIjmMP0Ybxoznz-1753684368888_jda3us.jpg"
              alt="Call for Speakers"
              className="w-full h-auto object-cover"
              loading="lazy"
            />
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ background: "rgba(26,26,46,0.9)" }}
            >
              <p className="text-white text-xs font-semibold">Speakers Call</p>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: "rgba(255,45,120,0.12)",
                  border: "1px solid rgba(255,45,120,0.25)",
                  color: "#FF2D78",
                }}
              >
                Open
              </span>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -6 }}
            className="group rounded-2xl overflow-hidden"
            style={{
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
              width: "100%",
              maxWidth: "380px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(0,212,255,0.35)";
              e.currentTarget.style.boxShadow =
                "0 12px 40px rgba(0,212,255,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
              e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.3)";
            }}
          >
            <div
              style={{
                height: "2px",
                background: "linear-gradient(90deg, #00D4FF, #FF2D78)",
              }}
            />
            <img
              src="https://res.cloudinary.com/dqudvximt/image/upload/v1767877178/users_cme79i2lk00qls401ar5qxqnc_KB4hFvAzhyqJF0xf-3a61cb74-01c9-4880-be04-a4036f32c4f9_t64kt9.jpg"
              alt="Call for Sponsors and Venue"
              className="w-full h-auto object-cover"
              loading="lazy"
            />
            <div
              className="px-4 py-3 flex items-center justify-between"
              style={{ background: "rgba(26,26,46,0.9)" }}
            >
              <p className="text-white text-xs font-semibold">
                Call for Sponsors & Venue
              </p>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: "rgba(0,212,255,0.12)",
                  border: "1px solid rgba(0,212,255,0.25)",
                  color: "#00D4FF",
                }}
              >
                Open
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// --- Main Hero Component ---
const CodeSapiensHero = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hallOfFameEntries, setHallOfFameEntries] = useState([]);
  const [communityPhotos, setCommunityPhotos] = useState([]);

  // Data Fetching
  useEffect(() => {
    const fetchData = async () => {
      const { data: hof } = await supabase
        .from("hall_of_fame")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (hof) setHallOfFameEntries(hof);

      const { data: photos } = await supabase
        .from("community_photos")
        .select("*")
        .eq("is_active", true)
        .order("order_number", { ascending: true });
      if (photos) setCommunityPhotos(photos);
    };
    fetchData();
  }, []);

  // Scroll Progress
  const { scrollY } = useScroll();

  // Geometric Shape Animation
  const shapeScale = useTransform(scrollY, [0, 600], [1, 0.2]);
  const shapeY = useTransform(scrollY, [0, 600], [0, 200]);
  const shapeOpacity = useTransform(scrollY, [0, 400], [0.8, 0]);

  // Content for Sticky Scroll

  const volunteers = [
    {
      photo:
        "https://res.cloudinary.com/druvxcll9/image/upload/v1761122516/2ABMHfqOsrpoL3OV-WhatsApp202025-08-312010.33.52_a8a27bbd_vzcgzq_1_bm8zch.jpg",
      name: "Keerthana M G",
      link: "https://in.linkedin.com/in/keerthana-m-g-12ba59256",
    },
    {
      photo:
        "https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/iAckgTxMcALuPbEx-IMG-20250112-WA0012_1_fwyhoa_oxegdx.jpg",
      name: "Mahaveer A",
      link: "https://www.linkedin.com/in/mahaveer1013",
    },
    {
      photo:
        "https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/4SrLYdwh0tpuLlkt-team_2.a2a0c6917be79e15dc29_wjosq7_ftgm6j.jpg",
      name: "Justin Benito",
      link: "https://www.linkedin.com/in/justinbenito",
    },
    {
      photo:
        "https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/nLDGxnsr6bZkCx0A-team_3.d2fd9099126beb0b86a1_vxhpxo_z3eods.jpg",
      name: "Koushik ram",
      link: "https://www.linkedin.com/in/koushik-ram-118495239",
    },
    {
      photo:
        "https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/Tlgueu6loMYMKJMs-team_1.150894ea4376f6423091_vrf0fr_weljyi.jpg",
      name: "Athiram R S",
      link: "https://www.linkedin.com/in/athi-ram-rs",
    },
    {
      photo:
        "https://res.cloudinary.com/druvxcll9/image/upload/v1761122516/5NmVUZRZI8sRCrZA-1735300455766_h8dhm2_dnully.jpg",
      name: "Pranav Vikraman",
      link: "https://www.linkedin.com/in/pranav-vikraman-322020242",
    },
    {
      photo:
        "https://res.cloudinary.com/druvxcll9/image/upload/v1761122531/JWz1OvtKurqSRsC7-WhatsApp202025-08-312011.22.52_bff7c8bd_mrok7q_b6meyd.jpg",
      name: "Vignesh R",
      link: "https://www.linkedin.com/in/vignesh-r-7727582b7",
    },
    {
      photo:
        "https://res.cloudinary.com/druvxcll9/image/upload/v1761122532/3S8YnOu77Rt2wDJD-WhatsApp202025-08-312010.32.42_9b5cee10_puasao_zekkfa.jpg",
      name: "Anand S",
      link: "https://codesapiens-management-website.vercel.app",
    },
    {
      photo:
        "https://res.cloudinary.com/druvxcll9/image/upload/v1761122531/q5tsA3KUOwgSOpIa-team_5.efc764325a5ffbaf1b6e_1_sidv9r_fhxmqv.jpg",
      name: "Subhaharini P",
      link: "https://www.linkedin.com/in/subhaharini-p-938568254",
    },
    {
      photo:
        "https://res.cloudinary.com/druvxcll9/image/upload/v1761122531/1732031130575_b834gr_1_slc9fw.jpg",
      name: "Jayasurya R",
      link: "https://www.linkedin.com/in/jayasurya-r-b37997279/",
    },
  ];

  return (
    <div className="bg-cs-bg text-cs-white min-h-screen font-sans overflow-x-hidden selection:bg-cs-pink selection:text-white">
      {/* Navigation - Dark Mode for Hero */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 w-full z-50"
        style={{
          background: "rgba(13, 13, 26, 0.75)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        <div
          className="mx-auto px-6 py-4 flex justify-between items-center"
          style={{ maxWidth: "1200px" }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full blur-md opacity-40"
                style={{
                  background: "linear-gradient(135deg, #FF2D78, #00D4FF)",
                }}
              />
              <img
                src="https://res.cloudinary.com/dqudvximt/image/upload/v1756797708/WhatsApp_Image_2025-09-02_at_12.45.18_b15791ea_rnlwrz.jpg"
                alt="CodeSapiens Logo"
                className="relative w-9 h-9 rounded-full object-cover"
                style={{ border: "1.5px solid rgba(255,45,120,0.4)" }}
              />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Code
              <span
                style={{
                  background: "linear-gradient(135deg, #FF2D78, #00D4FF)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Sapiens
              </span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-7">
            {[
              { label: "Vision", href: "#vision" },
              { label: "Programs", href: "/programs" },
              { label: "Meetups", href: "/meetups" },
              { label: "Events", href: "#events" },
              { label: "Community", href: "#community" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="relative text-sm font-medium group"
                style={{ color: "#9BA3C7" }}
                onMouseEnter={(e) => (e.target.style.color = "#FFFFFF")}
                onMouseLeave={(e) => (e.target.style.color = "#9BA3C7")}
              >
                {item.label}
                <span
                  className="absolute -bottom-0.5 left-0 w-0 h-px group-hover:w-full transition-all duration-300"
                  style={{
                    background: "linear-gradient(90deg, #FF2D78, #00D4FF)",
                  }}
                />
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate("/auth")}
              className="text-sm font-medium transition-all duration-200"
              style={{ color: "#9BA3C7" }}
              onMouseEnter={(e) => (e.target.style.color = "#FFFFFF")}
              onMouseLeave={(e) => (e.target.style.color = "#9BA3C7")}
            >
              Log in
            </button>
            <motion.button
              onClick={() => navigate("/auth")}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="text-sm font-semibold text-white px-5 py-2.5"
              style={{
                background: "linear-gradient(135deg, #FF2D78, #00D4FF)",
                borderRadius: "50px",
                boxShadow: "0 0 20px rgba(255, 45, 120, 0.35)",
              }}
            >
              Get Started
            </motion.button>
          </div>

          {/* Mobile Toggle */}
          <motion.button
            className="md:hidden text-white p-1"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileTap={{ scale: 0.9 }}
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </motion.button>
        </div>

        {/* Gradient line at bottom */}
        <div
          style={{
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(255,45,120,0.3), rgba(0,212,255,0.3), transparent)",
          }}
        />
      </motion.nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-40 md:hidden pt-20 px-6"
          style={{
            background: "rgba(13, 13, 26, 0.97)",
            backdropFilter: "blur(24px)",
          }}
        >
          <div className="flex flex-col gap-1 mt-4">
            {[
              { label: "Vision", href: "#vision" },
              { label: "Programs", href: "/programs" },
              { label: "Meetups", href: "/meetups" },
              { label: "Events", href: "#events" },
              { label: "Community", href: "#community" },
            ].map((item, i) => (
              <motion.a
                key={item.label}
                href={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => setIsMenuOpen(false)}
                className="text-xl font-semibold py-4 text-white border-b"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
              >
                {item.label}
              </motion.a>
            ))}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col gap-3 mt-6"
            >
              <button
                onClick={() => navigate("/auth")}
                className="w-full py-3 text-sm font-medium rounded-full border text-white"
                style={{ borderColor: "rgba(255,255,255,0.15)" }}
              >
                Log in
              </button>
              <button
                onClick={() => navigate("/auth")}
                className="w-full py-3 text-sm font-semibold rounded-full text-white"
                style={{
                  background: "linear-gradient(135deg, #FF2D78, #00D4FF)",
                  boxShadow: "0 0 20px rgba(255, 45, 120, 0.35)",
                }}
              >
                Get Started
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{ background: "#0D0D1A" }}
      >
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 z-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Ambient glow blobs */}
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(255,45,120,0.12) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(0,212,255,0.10) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        <div
          className="mx-auto px-4 sm:px-6 relative z-10 pt-28 pb-20 w-full"
          style={{ maxWidth: "1200px" }}
        >
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="w-full text-center lg:text-left"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-medium"
                style={{
                  background: "rgba(255,45,120,0.08)",
                  border: "1px solid rgba(255,45,120,0.2)",
                  color: "#FF2D78",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D78] animate-pulse" />
                Tamil Nadu's Biggest Student Tech Community
              </motion.div>

              {/* Brand heading with shimmer */}
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="font-extrabold leading-[1] tracking-tighter mb-6"
                style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)" }}
              >
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, #FFFFFF 0%, #FFFFFF 40%, #FF2D78 50%, #00D4FF 60%, #FFFFFF 70%, #FFFFFF 100%)",
                    backgroundSize: "300% 100%",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    animation: "shimmer 4s ease-in-out infinite",
                  }}
                >
                  CodeSapiens
                </span>
                <span style={{ color: "#FF2D78" }}>.</span>
              </motion.h1>

              {/* Subtext */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.25 }}
                className="mb-8 space-y-3"
              >
                <p className="font-semibold text-white text-base sm:text-lg">
                  The only 'Inter-college students community' by the students
                  for the students
                </p>
                <p
                  className="text-sm leading-relaxed italic"
                  style={{ color: "#9BA3C7" }}
                >
                  We're here for students who say,{" "}
                  <span className="text-white not-italic font-medium">
                    "Perusa Pannanum, but enna Pannanum Therla"
                  </span>
                  <br />
                  <span style={{ color: "#9BA3C7" }}>
                    ("Want to do something big, but don't know what to do").
                  </span>
                </p>
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35 }}
                className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3"
              >
                <motion.button
                  onClick={() => navigate("/auth")}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-semibold text-white px-7 py-3.5"
                  style={{
                    background: "linear-gradient(135deg, #FF2D78, #00D4FF)",
                    borderRadius: "50px",
                    boxShadow: "0 0 24px rgba(255,45,120,0.4)",
                  }}
                >
                  Join Now <ArrowRight size={16} />
                </motion.button>
                <motion.a
                  href="#vision"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-medium text-white px-7 py-3.5"
                  style={{
                    borderRadius: "50px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  Explore Vision
                </motion.a>
              </motion.div>
            </motion.div>

            {/* Right: Floating UI Cards */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.9,
                delay: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative w-full flex items-center justify-center"
              style={{ minHeight: "360px", height: "420px" }}
            >
              {/* Ambient glow */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(255,45,120,0.12) 0%, rgba(0,212,255,0.08) 50%, transparent 70%)",
                  filter: "blur(30px)",
                }}
              />

              {/* Main center card */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 5,
                  ease: "easeInOut",
                }}
                className="relative z-10 p-6 rounded-2xl text-center"
                style={{
                  background: "rgba(26,26,46,0.9)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow:
                    "0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,45,120,0.08)",
                  width: "200px",
                }}
              >
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,45,120,0.2), rgba(0,212,255,0.2))",
                    border: "1.5px solid rgba(255,45,120,0.3)",
                  }}
                >
                  <img
                    src="https://res.cloudinary.com/dqudvximt/image/upload/v1756797708/WhatsApp_Image_2025-09-02_at_12.45.18_b15791ea_rnlwrz.jpg"
                    alt="CodeSapiens"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </div>
                <p className="text-white font-bold text-base mb-1">
                  CodeSapiens
                </p>
                <p className="text-xs mb-4" style={{ color: "#9BA3C7" }}>
                  Student Tech Community
                </p>
                <div
                  style={{
                    height: "1px",
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,45,120,0.4), rgba(0,212,255,0.4), transparent)",
                    marginBottom: "16px",
                  }}
                />
                <div className="flex justify-around">
                  {[
                    { val: "2K+", label: "Members" },
                    { val: "15+", label: "Events" },
                  ].map((s) => (
                    <div key={s.label}>
                      <p
                        className="font-bold text-sm"
                        style={{
                          background:
                            "linear-gradient(135deg, #FF2D78, #00D4FF)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        {s.val}
                      </p>
                      <p className="text-xs" style={{ color: "#9BA3C7" }}>
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Top-left floating card */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  delay: 0.5,
                  ease: "easeInOut",
                }}
                className="absolute top-4 left-2 sm:left-0 px-3 py-2.5 rounded-xl flex items-center gap-2"
                style={{
                  background: "rgba(26,26,46,0.95)",
                  border: "1px solid rgba(255,45,120,0.2)",
                  boxShadow: "0 4px 24px rgba(255,45,120,0.1)",
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,45,120,0.15)" }}
                >
                  <Rocket size={14} style={{ color: "#FF2D78" }} />
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">
                    Open Source
                  </p>
                  <p className="text-xs" style={{ color: "#9BA3C7" }}>
                    Real projects
                  </p>
                </div>
              </motion.div>

              {/* Top-right floating card */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 4.5,
                  delay: 1,
                  ease: "easeInOut",
                }}
                className="absolute top-8 right-2 sm:right-0 px-3 py-2.5 rounded-xl flex items-center gap-2"
                style={{
                  background: "rgba(26,26,46,0.95)",
                  border: "1px solid rgba(0,212,255,0.2)",
                  boxShadow: "0 4px 24px rgba(0,212,255,0.1)",
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(0,212,255,0.15)" }}
                >
                  <Zap size={14} style={{ color: "#00D4FF" }} />
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">Workshops</p>
                  <p className="text-xs" style={{ color: "#9BA3C7" }}>
                    Learn by doing
                  </p>
                </div>
              </motion.div>

              {/* Bottom-left floating card */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 5,
                  delay: 1.5,
                  ease: "easeInOut",
                }}
                className="absolute bottom-8 left-2 sm:left-0 px-3 py-2.5 rounded-xl flex items-center gap-2"
                style={{
                  background: "rgba(26,26,46,0.95)",
                  border: "1px solid rgba(0,212,255,0.2)",
                  boxShadow: "0 4px 24px rgba(0,212,255,0.1)",
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(0,212,255,0.15)" }}
                >
                  <Globe size={14} style={{ color: "#00D4FF" }} />
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">Networking</p>
                  <p className="text-xs" style={{ color: "#9BA3C7" }}>
                    Inter-college
                  </p>
                </div>
              </motion.div>

              {/* Bottom-right floating card */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 4.2,
                  delay: 0.8,
                  ease: "easeInOut",
                }}
                className="absolute bottom-4 right-2 sm:right-0 px-3 py-2.5 rounded-xl flex items-center gap-2"
                style={{
                  background: "rgba(26,26,46,0.95)",
                  border: "1px solid rgba(255,45,120,0.2)",
                  boxShadow: "0 4px 24px rgba(255,45,120,0.1)",
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,45,120,0.15)" }}
                >
                  <Award size={14} style={{ color: "#FF2D78" }} />
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">Hackathons</p>
                  <p className="text-xs" style={{ color: "#9BA3C7" }}>
                    Win & grow
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          style={{ color: "rgba(255,255,255,0.2)" }}
        >
          <ChevronDown size={28} />
        </motion.div>
      </section>

      <style>{`
    @keyframes shimmer {
        0%   { background-position: 100% 0; }
        50%  { background-position: 0% 0; }
        100% { background-position: 100% 0; }
    }
`}</style>

      {/* Vision Section */}
      <section
        id="vision"
        className="relative py-20 md:py-28 overflow-hidden"
        style={{ background: "#0D0D1A" }}
      >
        {/* Ambient glows */}
        <div
          className="absolute top-0 left-0 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(255,45,120,0.08) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        {/* Top divider */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(255,45,120,0.3), rgba(0,212,255,0.3), transparent)",
          }}
        />

        <div
          className="mx-auto px-4 sm:px-6 relative z-10"
          style={{ maxWidth: "1200px" }}
        >
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="md:sticky md:top-28"
            >
              {/* Label */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-semibold tracking-widest uppercase"
                style={{
                  background: "rgba(255,45,120,0.08)",
                  border: "1px solid rgba(255,45,120,0.2)",
                  color: "#FF2D78",
                }}
              >
                Our Vision
              </div>

              {/* Heading */}
              <h2
                className="font-extrabold leading-tight tracking-tight mb-6"
                style={{
                  fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                  color: "#FFFFFF",
                }}
              >
                <span
                  style={{
                    background: "linear-gradient(135deg, #FF2D78, #FF6B6B)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Non-profit
                </span>{" "}
                community built by{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #FF2D78, #00D4FF)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  students
                </span>
                , for{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #FF2D78, #00D4FF)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  students
                </span>
                .
              </h2>

              {/* Description */}
              <p
                className="text-sm leading-relaxed mb-10"
                style={{ color: "#9BA3C7" }}
              >
                Our vision is to bring students together to collaborate, share,
                and grow. We envision a platform managed by students, for
                students, where you can build your career based on your
                interests.
              </p>

              {/* Stats */}
              <div
                className="grid grid-cols-2 gap-6 pt-8"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
              >
                {[
                  { val: "2000+", label: "Active Members" },
                  { val: "15+", label: "Events Hosted" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                  >
                    <p
                      className="font-extrabold mb-1"
                      style={{
                        fontSize: "clamp(2rem, 5vw, 2.8rem)",
                        background: "linear-gradient(135deg, #FF2D78, #00D4FF)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      {stat.val}
                    </p>
                    <p
                      className="text-xs font-semibold tracking-widest uppercase"
                      style={{ color: "#9BA3C7" }}
                    >
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right: Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              {/* Glow behind image */}
              <div
                className="absolute -inset-2 rounded-2xl pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(255,45,120,0.12) 0%, transparent 70%)",
                  filter: "blur(20px)",
                }}
              />

              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
                }}
              >
                {/* Gradient top line */}
                <div
                  style={{
                    height: "2px",
                    background: "linear-gradient(90deg, #FF2D78, #00D4FF)",
                  }}
                />

                <img
                  src="https://res.cloudinary.com/dqudvximt/image/upload/v1767535873/1760365837828_vyrmco.jpg"
                  alt="CodeSapiens Vision"
                  className="w-full object-cover"
                  style={{ height: "360px" }}
                  loading="lazy"
                />

                {/* Overlay label */}
                <div className="absolute bottom-4 left-4">
                  <div
                    className="px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{
                      background: "rgba(13,13,26,0.85)",
                      border: "1px solid rgba(255,45,120,0.3)",
                      color: "#FF2D78",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    📍 Tamil Nadu, India
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Community Moments Section */}
      <section
        id="events"
        className="relative py-20 md:py-28 overflow-hidden"
        style={{ background: "#0D0D1A" }}
      >
        {/* Ambient glows */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(255,45,120,0.07) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />

        {/* Top divider */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(255,45,120,0.3), rgba(0,212,255,0.3), transparent)",
          }}
        />

        <div
          className="mx-auto px-4 sm:px-6 relative z-10"
          style={{ maxWidth: "1200px" }}
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12"
          >
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-semibold tracking-widest uppercase"
                style={{
                  background: "rgba(255,45,120,0.08)",
                  border: "1px solid rgba(255,45,120,0.2)",
                  color: "#FF2D78",
                }}
              >
                📸 Real Moments
              </div>
              <h2
                className="font-extrabold text-white"
                style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)" }}
              >
                Community{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #FF2D78, #00D4FF)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Moments
                </span>
              </h2>
            </div>

            {/* Nav arrows */}
            <div className="flex gap-2">
              {[
                {
                  icon: <ArrowRight className="rotate-180" size={18} />,
                  label: "prev",
                },
                { icon: <ArrowRight size={18} />, label: "next" },
              ].map((btn) => (
                <motion.button
                  key={btn.label}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,45,120,0.5)";
                    e.currentTarget.style.boxShadow =
                      "0 0 12px rgba(255,45,120,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {btn.icon}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Photo Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {communityPhotos.slice(0, 6).map((photo, i) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group relative overflow-hidden cursor-pointer"
                style={{
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,45,120,0.25)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 40px rgba(255,45,120,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 24px rgba(0,0,0,0.4)";
                }}
              >
                {/* Gradient top line */}
                <div
                  className="absolute top-0 left-0 right-0 z-10"
                  style={{
                    height: "2px",
                    background:
                      i % 2 === 0
                        ? "linear-gradient(90deg, #FF2D78, #00D4FF)"
                        : "linear-gradient(90deg, #00D4FF, #FF2D78)",
                  }}
                />

                {/* Image */}
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={photo.image_url}
                    alt={photo.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  {/* Dark overlay */}
                  <div
                    className="absolute inset-0 transition-opacity duration-500"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(13,13,26,0.92) 0%, rgba(13,13,26,0.3) 50%, transparent 100%)",
                      opacity: 0.8,
                    }}
                  />
                  {/* Hover pink tint */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: "rgba(255,45,120,0.06)" }}
                  />
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 w-full p-5 z-10">
                  <div className="flex items-end justify-between">
                    <div>
                      <h4 className="text-white font-bold text-sm mb-1">
                        {photo.title}
                      </h4>
                      <p className="text-xs" style={{ color: "#9BA3C7" }}>
                        {photo.description || photo.date}
                      </p>
                    </div>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 flex-shrink-0 ml-3"
                      style={{
                        background: "linear-gradient(135deg, #FF2D78, #00D4FF)",
                      }}
                    >
                      <ArrowUpRight size={14} className="text-white" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Stats Section */}
      {/* Stats Section */}
      <StatsSection />

      {/* Sponsor Section */}
      {/* Sponsor Section */}
      <SponsorSection />
      <CommunityPartners />
      <SocialMediaSection />
      <NoticeSection />

      {/* Hall of Fame */}
      <section
        className="relative py-20 md:py-28 overflow-hidden"
        style={{ background: "#0D0D1A" }}
      >
        {/* Ambient glows */}
        <div
          className="absolute top-0 left-1/3 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(255,45,120,0.08) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />
        <div
          className="absolute bottom-0 right-1/3 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />

        {/* Top divider */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(255,45,120,0.3), rgba(0,212,255,0.3), transparent)",
          }}
        />

        <div
          className="mx-auto px-4 sm:px-6 relative z-10"
          style={{ maxWidth: "1200px" }}
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-xs font-semibold tracking-widest uppercase"
              style={{
                background: "rgba(255,45,120,0.08)",
                border: "1px solid rgba(255,45,120,0.2)",
                color: "#FF2D78",
              }}
            >
              <Crown size={12} />
              Hall of Fame
            </div>
            <h2
              className="font-extrabold text-white mb-4"
              style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
            >
              Community{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #FF2D78, #00D4FF)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Achievers
              </span>
            </h2>
            <p
              className="text-sm max-w-xl mx-auto"
              style={{ color: "#9BA3C7" }}
            >
              Celebrating the outstanding achievements of our community members.
            </p>
          </motion.div>

          {/* Cards */}
          {hallOfFameEntries.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {hallOfFameEntries.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="group relative rounded-2xl overflow-hidden"
                  style={{
                    background: "rgba(26,26,46,0.8)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
                    backdropFilter: "blur(12px)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,45,120,0.3)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 40px rgba(255,45,120,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.07)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 24px rgba(0,0,0,0.3)";
                  }}
                >
                  {/* Gradient top line */}
                  <div
                    style={{
                      height: "2px",
                      background:
                        i % 2 === 0
                          ? "linear-gradient(90deg, #FF2D78, #00D4FF)"
                          : "linear-gradient(90deg, #00D4FF, #FF2D78)",
                    }}
                  />

                  {/* Image */}
                  <div
                    className="relative overflow-hidden"
                    style={{ height: "220px" }}
                  >
                    <img
                      src={entry.image_url}
                      alt={entry.student_name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* Gradient scrim */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(26,26,46,1) 0%, rgba(26,26,46,0.2) 60%, transparent 100%)",
                      }}
                    />

                    {/* Crown badge */}
                    <div className="absolute top-3 right-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{
                          background:
                            "linear-gradient(135deg, #FF2D78, #00D4FF)",
                          boxShadow: "0 0 12px rgba(255,45,120,0.4)",
                        }}
                      >
                        <Crown size={14} className="text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="px-5 pb-5 pt-2">
                    <h3 className="text-white font-bold text-base mb-1">
                      {entry.student_name}
                    </h3>
                    <div
                      className="mb-3"
                      style={{
                        height: "1px",
                        background:
                          "linear-gradient(90deg, rgba(255,45,120,0.4), transparent)",
                      }}
                    />
                    <p
                      className="text-xs leading-relaxed italic"
                      style={{ color: "#9BA3C7" }}
                    >
                      "{entry.description}"
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            /* Empty state — shows when no DB credentials */
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center py-16"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{
                  background: "rgba(255,45,120,0.1)",
                  border: "1px solid rgba(255,45,120,0.2)",
                }}
              >
                <Crown size={28} style={{ color: "#FF2D78" }} />
              </div>
              <p className="font-semibold text-white mb-1">
                Achievers loading soon
              </p>
              <p className="text-xs" style={{ color: "#9BA3C7" }}>
                Our community stars will appear here.
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Team / Mafia Gang */}
      {/* Team / Mafia Gang */}
      <section
        id="community"
        className="relative py-20 md:py-28 overflow-hidden"
        style={{ background: "#0D0D1A" }}
      >
        {/* Ambient glows */}
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(255,45,120,0.08) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        {/* Top divider */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(255,45,120,0.3), rgba(0,212,255,0.3), transparent)",
          }}
        />

        <div
          className="mx-auto px-4 sm:px-6 relative z-10"
          style={{ maxWidth: "1200px" }}
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-xs font-semibold tracking-widest uppercase"
              style={{
                background: "rgba(255,45,120,0.08)",
                border: "1px solid rgba(255,45,120,0.2)",
                color: "#FF2D78",
              }}
            >
              Community
            </div>
            <h2
              className="font-extrabold text-white mb-4"
              style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}
            >
              The{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #FF2D78, #00D4FF)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Mafia Gang
              </span>
            </h2>
            <p
              className="text-sm max-w-xl mx-auto"
              style={{ color: "#9BA3C7" }}
            >
              Meet the core members who run the community. We are students, just
              like you.
            </p>
          </motion.div>

          {/* Founder — special card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-12"
          >
            <div
              className="group relative flex flex-col items-center p-8 rounded-2xl text-center"
              style={{
                background: "rgba(26,26,46,0.9)",
                border: "1px solid rgba(255,45,120,0.25)",
                boxShadow: "0 8px 40px rgba(255,45,120,0.12)",
                backdropFilter: "blur(12px)",
                minWidth: "200px",
              }}
            >
              {/* Gradient top line */}
              <div
                className="absolute top-0 left-0 right-0 rounded-t-2xl"
                style={{
                  height: "2px",
                  background: "linear-gradient(90deg, #FF2D78, #00D4FF)",
                }}
              />

              {/* Avatar with glow ring */}
              <div className="relative mb-4">
                <div
                  className="absolute inset-0 rounded-full blur-md opacity-60"
                  style={{
                    background: "linear-gradient(135deg, #FF2D78, #00D4FF)",
                    transform: "scale(1.15)",
                  }}
                />
                <div
                  className="relative w-24 h-24 rounded-full overflow-hidden"
                  style={{ border: "2.5px solid #FF2D78" }}
                >
                  <img
                    src="https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/1679197646322_n1svjq_s5w42a.jpg"
                    alt="Thiyaga B"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <p className="text-white font-bold text-base mb-1">Thiyaga B</p>
              <div
                className="px-3 py-0.5 rounded-full text-xs font-bold tracking-widest uppercase mb-3"
                style={{
                  background: "rgba(255,45,120,0.15)",
                  border: "1px solid rgba(255,45,120,0.3)",
                  color: "#FF2D78",
                }}
              >
                Founder
              </div>
              <a
                href="https://www.linkedin.com/in/thiyagab/"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#9BA3C7",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,45,120,0.5)";
                  e.currentTarget.style.color = "#FF2D78";
                  e.currentTarget.style.boxShadow =
                    "0 0 10px rgba(255,45,120,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.color = "#9BA3C7";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <Linkedin size={14} />
              </a>
            </div>
          </motion.div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-12">
            <div
              className="flex-1"
              style={{
                height: "1px",
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.08))",
              }}
            />
            <span
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "#9BA3C7" }}
            >
              Core Team
            </span>
            <div
              className="flex-1"
              style={{
                height: "1px",
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0.08), transparent)",
              }}
            />
          </div>

          {/* Team grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {volunteers.map((vol, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                whileHover={{ y: -6 }}
                className="group flex flex-col items-center p-5 rounded-2xl text-center relative"
                style={{
                  background: "rgba(26,26,46,0.6)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  backdropFilter: "blur(8px)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,45,120,0.25)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 32px rgba(255,45,120,0.1)";
                  e.currentTarget.style.background = "rgba(26,26,46,0.9)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "rgba(26,26,46,0.6)";
                }}
              >
                {/* Gradient top line on hover */}
                <div
                  className="absolute top-0 left-0 right-0 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    height: "2px",
                    background:
                      i % 2 === 0
                        ? "linear-gradient(90deg, #FF2D78, #00D4FF)"
                        : "linear-gradient(90deg, #00D4FF, #FF2D78)",
                  }}
                />

                {/* Avatar */}
                <div className="relative mb-3">
                  <div
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-500 blur-sm"
                    style={{
                      background: "linear-gradient(135deg, #FF2D78, #00D4FF)",
                      transform: "scale(1.1)",
                    }}
                  />
                  <div
                    className="relative w-16 h-16 rounded-full overflow-hidden transition-all duration-500"
                    style={{ border: "2px solid rgba(255,255,255,0.1)" }}
                  >
                    <img
                      src={vol.photo}
                      alt={vol.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                </div>

                <p className="text-white font-semibold text-xs mb-2 leading-tight">
                  {vol.name}
                </p>

                {vol.link && (
                  <a
                    href={vol.link}
                    target="_blank"
                    rel="noreferrer"
                    className="w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#9BA3C7",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(255,45,120,0.5)";
                      e.currentTarget.style.color = "#FF2D78";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(255,255,255,0.08)";
                      e.currentTarget.style.color = "#9BA3C7";
                    }}
                  >
                    <Linkedin size={11} />
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tagline Section */}
      <section
        className="relative py-20 overflow-hidden flex items-center justify-center"
        style={{ background: "#0D0D1A" }}
      >
        {/* Top divider */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(255,45,120,0.3), rgba(0,212,255,0.3), transparent)",
          }}
        />

        {/* Ambient glows */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            style={{
              width: "600px",
              height: "200px",
              background:
                "radial-gradient(ellipse, rgba(255,45,120,0.08) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center px-4"
        >
          <h2
            className="font-black tracking-tighter uppercase leading-none"
            style={{ fontSize: "clamp(2.2rem, 7vw, 3rem)" }}
          >
            <span className="text-white">Building Community</span>
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #FF2D78, #00D4FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "shimmer 4s ease-in-out infinite",
                backgroundSize: "300% 100%",
              }}
            >
              Since 2023
            </span>
          </h2>
        </motion.div>

        {/* Bottom divider */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(0,212,255,0.3), rgba(255,45,120,0.3), transparent)",
          }}
        />
      </section>

      {/* Footer */}
      {/* Footer */}
      <footer
        className="relative"
        style={{
          background: "#0D0D1A",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Top gradient divider */}
        <div
          style={{
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(255,45,120,0.4), rgba(0,212,255,0.4), transparent)",
          }}
        />

        <div className="mx-auto px-6 py-16" style={{ maxWidth: "1200px" }}>
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            {/* Brand */}
            <div className="max-w-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="relative">
                  <div
                    className="absolute inset-0 rounded-full blur-md opacity-40"
                    style={{
                      background: "linear-gradient(135deg, #FF2D78, #00D4FF)",
                    }}
                  />
                  <img
                    src="https://res.cloudinary.com/druvxcll9/image/upload/v1761122530/WhatsApp_Image_2025-09-02_at_12.45.18_b15791ea_rnlwrz_3_r4kp2u.jpg"
                    alt="CodeSapiens Logo"
                    className="relative w-9 h-9 rounded-full object-cover"
                    style={{ border: "1.5px solid rgba(255,45,120,0.4)" }}
                  />
                </div>
                <span className="text-lg font-bold tracking-tight text-white">
                  Code
                  <span
                    style={{
                      background: "linear-gradient(135deg, #FF2D78, #00D4FF)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Sapiens
                  </span>
                </span>
              </div>

              <p
                className="text-sm leading-relaxed mb-8"
                style={{ color: "#9BA3C7" }}
              >
                Empowering students to build, learn, and grow together. Join the
                biggest student tech community in Tamil Nadu.
              </p>

              {/* Social Icons */}
              <div className="flex gap-4">
                <motion.a
                  href="https://github.com/Codesapiens-in"
                  target="_blank"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#9BA3C7",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,45,120,0.5)";
                    e.currentTarget.style.color = "#FF2D78";
                    e.currentTarget.style.boxShadow =
                      "0 0 12px rgba(255,45,120,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.08)";
                    e.currentTarget.style.color = "#9BA3C7";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <Github size={18} />
                </motion.a>
                <motion.a
                  href="https://www.linkedin.com/company/codesapiens-community/posts/"
                  target="_blank"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#9BA3C7",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,45,120,0.5)";
                    e.currentTarget.style.color = "#FF2D78";
                    e.currentTarget.style.boxShadow =
                      "0 0 12px rgba(255,45,120,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.08)";
                    e.currentTarget.style.color = "#9BA3C7";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <Linkedin size={18} />
                </motion.a>
                <motion.a
                  href="https://youtube.com/@codesapiens-in?si=90EaPMYHcSZIHtMi"
                  target="_blank"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#9BA3C7",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,45,120,0.5)";
                    e.currentTarget.style.color = "#FF2D78";
                    e.currentTarget.style.boxShadow =
                      "0 0 12px rgba(255,45,120,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.08)";
                    e.currentTarget.style.color = "#9BA3C7";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <Youtube size={18} />
                </motion.a>
                <motion.a
                  href="https://discord.gg/codesapiens"
                  target="_blank"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#9BA3C7",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,45,120,0.5)";
                    e.currentTarget.style.color = "#FF2D78";
                    e.currentTarget.style.boxShadow =
                      "0 0 12px rgba(255,45,120,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.08)";
                    e.currentTarget.style.color = "#9BA3C7";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <Users size={18} />
                </motion.a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4
                className="text-sm font-semibold tracking-widest uppercase mb-6"
                style={{
                  background: "linear-gradient(135deg, #FF2D78, #00D4FF)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Community
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#vision"
                    className="text-sm transition-all duration-200 flex items-center gap-2 group"
                    style={{ color: "#9BA3C7" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#FFFFFF")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#9BA3C7")
                    }
                  >
                    <span
                      className="w-0 h-px group-hover:w-3 transition-all duration-300 inline-block"
                      style={{
                        background: "linear-gradient(90deg, #FF2D78, #00D4FF)",
                      }}
                    />
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#events"
                    className="text-sm transition-all duration-200 flex items-center gap-2 group"
                    style={{ color: "#9BA3C7" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#FFFFFF")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#9BA3C7")
                    }
                  >
                    <span
                      className="w-0 h-px group-hover:w-3 transition-all duration-300 inline-block"
                      style={{
                        background: "linear-gradient(90deg, #FF2D78, #00D4FF)",
                      }}
                    />
                    Events
                  </a>
                </li>
                <li>
                  <a
                    href="#community"
                    className="text-sm transition-all duration-200 flex items-center gap-2 group"
                    style={{ color: "#9BA3C7" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#FFFFFF")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#9BA3C7")
                    }
                  >
                    <span
                      className="w-0 h-px group-hover:w-3 transition-all duration-300 inline-block"
                      style={{
                        background: "linear-gradient(90deg, #FF2D78, #00D4FF)",
                      }}
                    />
                    Team
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm transition-all duration-200 flex items-center gap-2 group"
                    style={{ color: "#9BA3C7" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#FFFFFF")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#9BA3C7")
                    }
                  >
                    <span
                      className="w-0 h-px group-hover:w-3 transition-all duration-300 inline-block"
                      style={{
                        background: "linear-gradient(90deg, #FF2D78, #00D4FF)",
                      }}
                    />
                    Join Discord
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            <p className="text-xs" style={{ color: "#9BA3C7" }}>
              © 2026 CodeSapiens Community. All rights reserved.
            </p>
            <p className="text-xs" style={{ color: "#9BA3C7" }}>
              Designed & Built by Students.
            </p>
          </div>
        </div>
      </footer>
      <LandingPopup />
    </div>
  );
};

export default CodeSapiensHero;
