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
import Lenis from "lenis";

// --- Stats Section ---
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
      .catch((err) => {
        console.error("Stats fetch error:", err);

        setStats({
          totalUsers: 2000,
          totalColleges: 50,
          topColleges: [
            { name: "SRM Institute of Science and Technology", count: 312 },
            { name: "Anna University", count: 245 },
            { name: "VIT Chennai", count: 198 },
            { name: "SSN College of Engineering", count: 156 },
            { name: "Sathyabama University", count: 134 },
          ],
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const colleges = stats.topColleges.filter(
    (c) => c.name && c.name !== "Not specified",
  );

  return (
    <section className="max-w-7xl mx-6 xl:mx-auto pt-10 sm:pt-14 pb-10 mt-10 bg-section rounded-xl px-3 sm:px-10">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="flex items-center gap-3 sm:gap-4 mb-6"
      >
        <span className="text-xs sm:text-sm font-medium tracking-[0.3em] uppercase text-gray-400 font-dm-sans shrink-0">
          03
        </span>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ transformOrigin: "left" }}
          className="h-px bg-[#27187eb3] w-8 sm:w-12 shrink-0"
        />

        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-dm-sans font-medium tracking-tight leading-none">
          By The <span className="italic text-primary">Numbers</span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-10">
        {/* LEFT SIDE */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="md:col-span-2 flex flex-col justify-between font-dm-sans"
        >
          <p className="text-lg sm:text-xl tracking-wide leading-snug">
            We are growing fast. Join the movement.
          </p>

          <div className="flex flex-row md:flex-col gap-8 md:gap-6 pt-6">
            <div>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight">
                2000+
              </h3>
              <p className="text-sm sm:text-base text-gray-500 tracking-wider mt-1">
                Total Members
              </p>
            </div>

            <div>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight">
                50+
              </h3>
              <p className="text-sm sm:text-base text-gray-500 tracking-wider mt-1">
                Colleges Reached
              </p>
            </div>
          </div>
        </motion.div>

        {/* RIGHT SIDE */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="md:col-span-3 font-dm-sans"
        >
          <h4 className="text-lg sm:text-xl font-medium tracking-tight mb-4">
            Top Active Colleges
          </h4>

          {loading ? (
            <div className="text-center text-gray-400 py-10 animate-pulse">
              Loading leaderboards...
            </div>
          ) : colleges.length > 0 ? (
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.12 } },
              }}
              className="space-y-3"
            >
              {colleges.slice(0, 5).map((college, index) => (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.7 },
                    },
                  }}
                  className={`flex items-center gap-4 p-4 rounded-lg ${
                    index === 0
                      ? "bg-main border border-[#27187e15]"
                      : "hover:bg-main"
                  }`}
                >
                  {/* Rank Icon */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      index === 0
                        ? "bg-primary text-white"
                        : "border border-gray-200 text-gray-400"
                    }`}
                  >
                    {index === 0 ? <Crown size={18} /> : index + 1}
                  </div>

                  {/* College */}
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium tracking-tight truncate">
                      {college.name}
                    </h5>
                  </div>

                  {/* Count */}
                  <span className="text-sm text-gray-500 shrink-0">
                    {college.count} Students
                  </span>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center text-gray-400 py-10">
              Stats will update soon
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

// --- Sponsor Section ---

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
    <section className="max-w-7xl mx-6 xl:mx-auto pt-10 sm:pt-14 pb-10 mt-10">
      {/* Section Heading */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="flex items-center gap-3 sm:gap-4 mb-6"
      >
        <span className="text-xs sm:text-sm font-medium tracking-[0.3em] uppercase text-gray-400 font-dm-sans shrink-0">
          04
        </span>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ transformOrigin: "left" }}
          className="h-px bg-[#27187eb3] w-8 sm:w-12 shrink-0"
        />

        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-dm-sans font-medium tracking-tight leading-none">
          Our <span className="italic text-primary">Sponsors</span>
        </h2>
      </motion.div>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="text-lg sm:text-xl tracking-wide leading-snug font-dm-sans max-w-2xl mb-8"
      >
        Backed by companies who believe in student-led innovation.
      </motion.p>

      {/* Sponsor Grid */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.12,
            },
          },
        }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4"
      >
        {sponsors.map((sponsor, idx) => (
          <motion.a
            key={idx}
            href={sponsor.link}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-section rounded-lg px-3 sm:px-4 pt-4 flex flex-col items-center justify-center aspect-[4/3] hover:shadow-md hover:-translate-y-1 transition duration-300"
          >
            <img
              src={sponsor.image}
              alt={sponsor.name}
              className="max-w-[80%] max-h-[80%] object-contain"
            />

            <div className="flex items-center justify-between px-4 sm:px-5 py-2.5">
              <span className="text-xs sm:text-sm font-dm-sans font-medium tracking-tight border border-gray-500/40 rounded-xl px-1.5 py-0.5 font-medium">
                {sponsor.name}
              </span>
            </div>
          </motion.a>
        ))}
      </motion.div>
    </section>
  );
};

// --- Community Partners Section ---
const CommunityPartners = () => {
  const partners = [
    {
      name: "Circle",
      image:
        "https://res.cloudinary.com/dqudvximt/image/upload/v1767817843/users_cme79i2lk00qls401ar5qxqnc_OGGz5HgXCzS9rI8H-users_clylc5w1v070to301jatq0e85_bNj4z9CoW02cMzqm-circle_rs5ttj.png",
      link: "#",
    },
    {
      name: "Blue Tech",
      image:
        "https://res.cloudinary.com/dqudvximt/image/upload/v1767817844/users_cme79i2lk00qls401ar5qxqnc_EMRqmDnatuO4Rk38-users_cm9cf3ngn02erro015wogiktk_8CHW9Warth4BkBG9-Blue_2520Minimalist_2520Simple_2520Technology_2520Logo_2520_2520_1_mqig9s.png",
      link: "#",
    },
    {
      name: "Community Hub",
      image:
        "https://res.cloudinary.com/dqudvximt/image/upload/v1767817846/users_cme79i2lk00qls401ar5qxqnc_1KwVf1Iz3NmGXUQP-176333249_mhbrlj.webp",
      link: "#",
    },
  ];

  return (
    <section className="max-w-7xl mx-6 xl:mx-auto pt-10 sm:pt-14 pb-10 mt-10">
      {/* Section Heading */}
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="flex items-center gap-3 sm:gap-4 mb-6"
      >
        <span className="text-xs sm:text-sm font-medium tracking-[0.3em] uppercase text-gray-400 font-dm-sans shrink-0">
          05
        </span>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ transformOrigin: "left" }}
          className="h-px bg-[#27187eb3] w-8 sm:w-12 shrink-0"
        />

        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-dm-sans font-medium tracking-tight leading-none">
          Community <span className="italic text-primary">Partners</span>
        </h2>
      </motion.div>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="text-lg sm:text-xl tracking-wide leading-snug font-dm-sans max-w-2xl mb-8"
      >
        Communities and organizations collaborating with us to grow the student
        developer ecosystem.
      </motion.p>

      {/* Partner Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {partners.map((partner, idx) => (
          <a
            key={idx}
            href={partner.link}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-section rounded-lg px-3 sm:px-4 pt-4 flex flex-col items-center justify-center aspect-[4/3] hover:shadow-md hover:-translate-y-1 transition duration-300"
          >
            <img
              src={partner.image}
              alt={partner.name}
              className="max-w-[80%] max-h-[80%] object-contain"
            />

            <div className="flex items-center justify-between px-4 sm:px-5 py-2.5">
              <span className="text-xs sm:text-sm font-dm-sans tracking-tight border border-gray-500/40 rounded-xl px-1.5 py-0.5">
                {partner.name}
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

// --- Social Media Bento Grid ---
const SocialMediaSection = () => {
  const socials = [
    {
      name: "LinkedIn",
      icon: <Linkedin size={40} />,
      link: "https://www.linkedin.com/company/codesapiens-community/posts/",
      color: "bg-[#0077b5]",
      textColor: "text-white",
      span: "col-span-1",
      badge: "@codesapiens-community",
      isLarge: true,
      backgroundImage:
        "url('https://res.cloudinary.com/dqudvximt/image/upload/v1767874220/users_cme79i2lk00qls401ar5qxqnc_n74cMGsKIBuvEzzj-users_cme5bsukl01binm014j8ioh2j_2SNEHA31eEqsxFRS-original-33f53dcd2f48e068523d32df0e5cc92f_xkirvh.gif') center/cover no-repeat",
    },
    {
      name: "Luma",
      icon: null,
      link: "https://lu.ma/codesapiens",
      color: "bg-black",
      textColor: "text-white",
      span: "col-span-1",
      badge: null,
      backgroundImage:
        "url('https://res.cloudinary.com/dqudvximt/image/upload/v1767875075/users_cme79i2lk00qls401ar5qxqnc_WI6Z0HVxNMCrvfgn-ETzJoQJr1aCFL2r7-rrDC9gCyIJ77RqVW-luma_cqxcny.jpg') center/cover no-repeat",
    },
    {
      name: "WhatsApp",
      icon: null,
      link: "https://chat.whatsapp.com/LLtoddmQx5rIRNb8WE6rqC?mode=ems_copy_t",
      color: "bg-[#25D366]",
      textColor: "text-white",
      span: "col-span-1",
      badge: null,
      customContent: (
        <div className="relative w-full h-full flex items-center justify-center">
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
      icon: <Instagram size={32} />,
      link: "https://www.instagram.com/codesapiens/",
      color: "bg-white",
      textColor: "text-black",
      span: "col-span-1",
      badge: null,
      border: "border-gray-100 border",
      customContent: (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center pb-6">
            <img
              src="https://res.cloudinary.com/dqudvximt/image/upload/v1767874489/users_cme79i2lk00qls401ar5qxqnc_3o1XM7ID2mXVDk6e-XeFzd3iFtoytJqTv-1497553304-104_84834_allkph.png"
              alt="Instagram"
              className="w-84 h-84 object-contain drop-shadow-xl"
            />
          </div>
          <div className="absolute bottom-0 left-0">
            <span className="inline-block px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-800">
              @Codesapiens.in
            </span>
          </div>
        </div>
      ),
    },
    {
      name: "Twitter",
      icon: <Twitter size={32} className="text-[#1DA1F2]" />,
      link: "https://twitter.com/codesapiens",
      color: "bg-white",
      textColor: "text-black",
      span: "col-span-1",
      badge: null,
      border: "border-gray-100 border",
      customContent: (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center pb-6">
            <img
              src="https://res.cloudinary.com/dqudvximt/image/upload/v1767874490/users_cme79i2lk00qls401ar5qxqnc_XgLMxxPTSSuuRKu5-users_cme5bsukl01binm014j8ioh2j_XQ7ryCBwyUFzFg6v-CLIPLY_372109260_TWITTER_LOGO_400_ptqbvv.gif"
              alt="Twitter"
              className="w-32 h-32 object-contain"
            />
          </div>
          <div className="absolute bottom-0 left-0">
            <span className="inline-block px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-800">
              @codesapiens_in
            </span>
          </div>
        </div>
      ),
    },
    {
      name: "Volunteers Needed",
      icon: null,
      link: "https://forms.gle/volunteer",
      color: "bg-black",
      textColor: "text-white",
      span: "col-span-1",
      badge: null,
      isLarge: false,
      backgroundImage:
        "url('https://res.cloudinary.com/dqudvximt/image/upload/v1767876038/users_cme79i2lk00qls401ar5qxqnc_Hg7Si3j52FVfpQRN-image_x8wghd.png') center/cover no-repeat",
    },
    {
      name: "GitHub",
      icon: <Github size={40} />,
      link: "https://github.com/Codesapiens-in",
      color: "bg-black",
      textColor: "text-white",
      span: "col-span-1",
      badge: "@Codesapiens-in",
      isLarge: true,
      backgroundImage:
        "url('https://res.cloudinary.com/dqudvximt/image/upload/v1767874482/users_cme79i2lk00qls401ar5qxqnc_MOSc1bv3RXu0WL5z-users_cme5bsukl01binm014j8ioh2j_7dOv2cTCX8B86u82-users_clylc5w1v070to301jatq0e85_AdzvY5ioFqaF37x5-github_dsjpx6.gif') center/cover no-repeat",
    },
    {
      name: "YouTube",
      icon: <Youtube size={40} className="text-red-600" />,
      link: "https://youtube.com/@codesapiens-in?si=90EaPMYHcSZIHtMi",
      color: "bg-white",
      textColor: "text-black",
      span: "col-span-1",
      badge: "@Codesapiens",
      border: "border-gray-100 border",
      isLarge: true,
      backgroundImage:
        "url('https://res.cloudinary.com/dqudvximt/image/upload/v1767874488/users_cme79i2lk00qls401ar5qxqnc_Ov9Ygh4NAQfPGktu-users_cme5bsukl01binm014j8ioh2j_5JQAosdeiVappI2y-users_clylc5w1v070to301jatq0e85_CCuEsN5SSMlu4LAN-youtube_aky1f3.gif') center/cover no-repeat",
    },
  ];

  return (
    <section className="max-w-7xl mx-6 xl:mx-auto pt-10 sm:pt-14 pb-10 mt-10">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="flex items-center gap-3 sm:gap-4 mb-6"
      >
        <span className="text-xs sm:text-sm font-medium tracking-[0.3em] uppercase text-gray-400 font-dm-sans shrink-0">
          06
        </span>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ transformOrigin: "left" }}
          className="h-px bg-[#27187eb3] w-8 sm:w-12 shrink-0"
        />

        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-dm-sans font-medium tracking-tight leading-none">
          Connect <span className="italic text-primary">With Us</span>
        </h2>
      </motion.div>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-lg sm:text-xl tracking-wide leading-snug font-dm-sans max-w-2xl mb-8"
      >
        Follow us everywhere. Stay in the loop.
      </motion.p>

      {/* Bento Grid */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.08,
            },
          },
        }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 auto-rows-[160px] sm:auto-rows-[180px] gap-3 sm:gap-4"
      >
        {socials.map((social, idx) => (
          <motion.a
            key={idx}
            href={social.link}
            target="_blank"
            rel="noopener noreferrer"
            variants={{
              hidden: {
                opacity: 0,
                scale: 0.94,
                filter: "blur(6px)",
              },
              show: {
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
                transition: {
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                },
              },
            }}
            className={`${social.span} ${social.color} ${social.textColor} ${social.border || ""} rounded-lg p-4 sm:p-5 relative overflow-hidden group flex flex-col justify-between transition-shadow duration-300 hover:shadow-lg`}
            style={
              social.backgroundImage
                ? {
                    backgroundImage: social.color.includes("gradient")
                      ? social.color
                      : undefined,
                  }
                : {}
            }
          >
            {/* Background Image */}
            {social.backgroundImage && (
              <div
                className="absolute inset-0"
                style={{ background: social.backgroundImage }}
              ></div>
            )}

            {/* Content */}
            {social.customContent ? (
              social.customContent
            ) : (
              <>
                <div className="mb-auto z-10">
                  {social.customIcon || social.icon}
                </div>

                <div className="z-10 mt-auto flex items-center justify-between">
                  {social.badge && (
                    <span
                      className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${
                        social.textColor === "text-white"
                          ? "bg-white/90 text-black"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {social.badge}
                    </span>
                  )}

                  <ArrowUpRight
                    size={14}
                    className={`${
                      social.textColor === "text-white"
                        ? "text-white/60"
                        : "text-gray-400"
                    } ml-auto`}
                  />
                </div>
              </>
            )}
          </motion.a>
        ))}
      </motion.div>
    </section>
  );
};

// --- Notice Section (Call for Speakers/Sponsors) ---
const NoticeSection = () => {
  return (
    <section className="max-w-7xl mx-6 xl:mx-auto pt-10 sm:pt-14 pb-10 mt-10">
      {/* Section Heading */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="flex items-center gap-3 sm:gap-4 mb-6"
      >
        <span className="text-xs sm:text-sm font-medium tracking-[0.3em] uppercase text-gray-400 font-dm-sans shrink-0">
          07
        </span>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ transformOrigin: "left" }}
          className="h-px bg-[#27187eb3] w-8 sm:w-12 shrink-0"
        />

        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-dm-sans font-medium tracking-tight leading-none">
          Latest <span className="italic text-primary">Updates</span>
        </h2>
      </motion.div>

      {/* Images Grid */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.12,
            },
          },
        }}
        className="grid grid-cols-2 gap-3 sm:gap-4 max-w-3xl mx-auto"
      >
        <motion.div
          variants={{
            hidden: { opacity: 0, scale: 0.94, filter: "blur(6px)" },
            show: {
              opacity: 1,
              scale: 1,
              filter: "blur(0px)",
              transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
            },
          }}
          className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
        >
          <img
            src="https://res.cloudinary.com/dqudvximt/image/upload/v1767877162/users_cme79i2lk00qls401ar5qxqnc_N0bIjmMP0Ybxoznz-1753684368888_jda3us.jpg"
            alt="Call for Speakers"
            className="w-full h-auto object-cover"
          />
        </motion.div>

        <motion.div
          variants={{
            hidden: { opacity: 0, scale: 0.94, filter: "blur(6px)" },
            show: {
              opacity: 1,
              scale: 1,
              filter: "blur(0px)",
              transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
            },
          }}
          className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
        >
          <img
            src="https://res.cloudinary.com/dqudvximt/image/upload/v1767877178/users_cme79i2lk00qls401ar5qxqnc_KB4hFvAzhyqJF0xf-3a61cb74-01c9-4880-be04-a4036f32c4f9_t64kt9.jpg"
            alt="Call for Sponsors and Venue"
            className="w-full h-auto object-cover"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

// --- Main Hero Component ---
const CodeSapiensHero = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hallOfFameEntries, setHallOfFameEntries] = useState([]);
  const [communityPhotos, setCommunityPhotos] = useState([]);

  // Smooth Scroll — Lenis
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

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
    <div className="min-h-screen font-inter  bg-main">
      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="sticky bg-[#eef0ff81] shadow border border-gray-500/10 top-3 z-50 backdrop-blur-md max-w-7xl mx-2 xl:mx-auto rounded-[0.75rem] px-4 sm:px-6 py-2.5"
      >
        <div className="flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center gap-1.5 sm:gap-2"
          >
            <img
              src="https://res.cloudinary.com/dqudvximt/image/upload/v1756797708/WhatsApp_Image_2025-09-02_at_12.45.18_b15791ea_rnlwrz.jpg"
              alt="CodeSapiens Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full object-cover ring ring-[#27187e80]"
            />
            <span className="text-lg sm:text-xl md:text-2xl font-inter font-bold tracking-tight">
              CodeSapiens
            </span>
          </motion.div>

          <div className="hidden lg:flex items-center gap-4 xl:gap-8 font-medium text-golden-1">
            {[
              { name: "Vision", href: "#vision" },
              { name: "Programs", href: "/programs" },
              { name: "Meetups", href: "/meetups" },
              { name: "Events", href: "#events" },
              { name: "Community", href: "#community" },
            ].map((link, i) => (
              <motion.a
                key={link.name}
                href={link.href}
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{
                  duration: 0.4,
                  delay: 0.4 + i * 0.06,
                  ease: "easeOut",
                }}
                className="transition-colors"
              >
                {link.name}
              </motion.a>
            ))}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.75 }}
              onClick={() => navigate("/auth")}
            >
              Log in
            </motion.button>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.4,
                delay: 0.85,
                ease: [0.22, 1, 0.36, 1],
              }}
              onClick={() => navigate("/auth")}
              className="px-4 xl:px-5 py-2 xl:py-2.5 bg-primary text-white rounded-md transition-colors font-semibold duration-150 cursor-pointer"
            >
              Get Started
            </motion.button>
          </div>

          {/* Custom two-bar hamburger */}
          <button
            className="lg:hidden flex flex-col justify-center items-center gap-[5px] sm:gap-1.5 w-8 h-8 sm:w-10 sm:h-10"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span
              className={`block h-[2px] sm:h-[2.5px] w-5 sm:w-6 rounded-full transition-transform duration-300 ${
                isMenuOpen
                  ? "rotate-45 translate-y-[3.5px] sm:translate-y-[4.5px]"
                  : ""
              }`}
              style={{ backgroundColor: "var(--text-main)" }}
            />
            <span
              className={`block h-[2px] sm:h-[2.5px] w-5 sm:w-6 rounded-full transition-transform duration-300 ${
                isMenuOpen
                  ? "-rotate-45 -translate-y-[4.5px] sm:-translate-y-[4.0px]"
                  : ""
              }`}
              style={{ backgroundColor: "var(--text-main)" }}
            />
          </button>
        </div>
      </motion.nav>
      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-4 top-[80px] z-40 lg:hidden bg-[#eef0ff81] backdrop-blur-md border border-soft shadow-[0_8px_32px_0_rgba(39,24,126,0.15)] rounded-2xl overflow-hidden font-inter"
        >
          <div className="flex flex-col p-6 space-y-2">
            {[
              { name: "Vision", href: "#vision" },
              { name: "Programs", href: "/programs" },
              { name: "Meetups", href: "/meetups" },
              { name: "Events", href: "#events" },
              { name: "Community", href: "#community" },
            ].map((link, i) => (
              <motion.a
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.35,
                  delay: 0.08 + i * 0.06,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="text-main font-semibold text-lg py-3 border-b border-soft flex items-center justify-between"
              >
                {link.name}
                <ArrowRight size={16} className="text-gray-300" />
              </motion.a>
            ))}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.45 }}
              className="flex flex-col gap-3 pt-6"
            >
              <button
                onClick={() => navigate("/auth")}
                className="w-full py-3 text-primary font-bold rounded-xl bg-primary/5 border border-primary/10 transition-colors"
              >
                Log in
              </button>
              <button
                onClick={() => navigate("/auth")}
                className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-md cursor-pointer"
              >
                Get Started
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
      {/* HERO SECTION */}
      <section className="max-w-7xl mx-6 xl:mx-auto pt-14 sm:pt-16 sm:pb-20 pb-5">
        {/* TITLE */}
        <div className="overflow-hidden">
          <motion.h1
            initial={{ y: 120 }}
            animate={{ y: 0 }}
            transition={{
              duration: 1.6,
              delay: 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="flex items-baseline text-5xl min-[450px]:text-[4rem] min-[650px]:text-[5.5rem] min-[950px]:text-[7rem] min-[1200px]:text-[8rem] xl:text-[9rem] font-dm-sans font-medium"
          >
            <motion.span
              initial={{ clipPath: "inset(0 0 100% 0)" }}
              animate={{ clipPath: "inset(0 0 0% 0)" }}
              transition={{
                duration: 1.8,
                delay: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              CodeSapiens
            </motion.span>

            {/* DOT */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                duration: 0.5,
                delay: 1.8,
                ease: [0.34, 1.56, 0.64, 1],
              }}
              className="bg-primary w-3 h-3 sm:w-5 sm:h-5 rounded-full ml-1 "
            />
          </motion.h1>
        </div>

        {/* DIVIDER */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{
            duration: 1.0,
            delay: 1.9,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ transformOrigin: "left" }}
          className="w-full h-0.5 bg-[#27187eb3] mb-4 mt-6"
        />

        <div className="flex justify-between flex-col md:flex-row">
          {/* LEFT TEXT */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 1.2,
              delay: 2.4,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-xl pt-5 max-w-2xl tracking-wide leading-snug font-dm-sans"
          >
            <p>The Biggest Student-Run Tech Community in TN.</p>
            <p className="pt-1.5">
              The only{" "}
              <span className="italic">'Inter-college students community'</span>{" "}
              by the students for the students
            </p>
          </motion.div>

          {/* RIGHT TEXT */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 1.2,
              delay: 2.6,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="pt-5 pb-10 max-w-sm tracking-wider font-dm-sans"
          >
            <p className="text-gray-800">
              We are here to help students build a career in Tech who say,
              <span className="italic font-medium">
                "Perusa Pannanum, but enna Pannanum Therla"
              </span>{" "}
              ("Want to do something big, but don't know what to do").
            </p>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 1,
            delay: 3.1,
            ease: [0.22, 1, 0.36, 1],
          }}
          onClick={() => navigate("/auth")}
          className="px-4 xl:px-5 py-2 xl:py-2.5 bg-primary text-white rounded-md hover:bg-[#1F1366] transition-colors font-medium duration-150 cursor-pointer inline-flex items-center gap-2"
        >
          Join Now
          <ArrowRight size={18} />
        </motion.button>
      </section>
      <section
        id="vision"
        className="max-w-7xl mx-6 xl:mx-auto pt-10 sm:pt-14 pb-10 bg-section rounded-xl px-3 sm:px-10 mt-10"
      >
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="flex items-center gap-3 sm:gap-4 mb-6"
        >
          <span className="text-xs sm:text-sm font-medium tracking-[0.3em] uppercase text-gray-400 font-dm-sans shrink-0">
            01
          </span>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.9,
              delay: 0.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ transformOrigin: "left" }}
            className="h-px bg-[#27187eb3] w-8 sm:w-12 shrink-0"
          />

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-dm-sans font-medium tracking-tight leading-none">
            Our <span className="italic text-primary">Vision</span>
          </h2>
        </motion.div>

        {/* Content + Image grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 md:gap-8">
          {/* Text + Stats column */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.9,
              delay: 0.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="md:col-span-3 flex flex-col justify-between font-dm-sans"
          >
            <div className="text-lg sm:text-xl tracking-wide leading-snug">
              <p>
                A <span className="font-semibold">non-profit</span> community
                built by students, for students.
              </p>
              <p className="pt-2.5">
                Our vision is to bring students together to collaborate, share,
                and grow. We envision a platform managed by students, for
                students, where you can build your career based on your
                interests.
              </p>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex gap-8 md:gap-16 pt-6 md:pt-0"
            >
              <div>
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight">
                  2000+
                </h3>
                <p className="text-sm sm:text-base text-gray-500 tracking-wider mt-1">
                  Active Members
                </p>
              </div>

              <div>
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight">
                  15+
                </h3>
                <p className="text-sm sm:text-base text-gray-500 tracking-wider mt-1">
                  Events Hosted
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Image column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 1,
              delay: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="md:col-span-3 w-full aspect-[16/9] md:aspect-auto rounded-lg overflow-hidden"
          >
            <img
              src="https://res.cloudinary.com/dqudvximt/image/upload/v1767535873/1760365837828_vyrmco.jpg"
              alt="CodeSapiens Community"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </section>
      {/* Events Section - Community Moments */}
      <section
        id="events"
        className="max-w-7xl mx-6 xl:mx-auto pt-10 sm:pt-14 md:pt-20 pb-10 mt-10 "
      >
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-3 sm:gap-4 mb-6"
        >
          <span className="text-xs sm:text-sm font-medium tracking-[0.3em] uppercase text-gray-400 font-dm-sans shrink-0">
            02
          </span>
          <div className="h-px bg-[#27187eb3] w-8 sm:w-12 shrink-0"></div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-dm-sans font-medium tracking-tight leading-none">
            Community <span className="italic text-primary">Moments</span>
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-lg sm:text-xl tracking-wide leading-snug font-dm-sans max-w-2xl mb-8"
        >
          Snapshots from our meetups, hackathons, and everything in between.
        </motion.p>

        {/* Photo Grid */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          transition={{ staggerChildren: 0.12 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
        >
          {(communityPhotos.length > 0
            ? communityPhotos.slice(0, 6)
            : [
                {
                  id: 1,
                  image_url:
                    "https://res.cloudinary.com/dqudvximt/image/upload/v1767535873/1760365837828_vyrmco.jpg",
                  title: "HackSapiens 2.0",
                  description: "24-hour hackathon with 200+ participants",
                },
                {
                  id: 2,
                  image_url:
                    "https://res.cloudinary.com/dqudvximt/image/upload/v1767877162/users_cme79i2lk00qls401ar5qxqnc_N0bIjmMP0Ybxoznz-1753684368888_jda3us.jpg",
                  title: "Tech Talk — AI & ML",
                  description: "Industry experts sharing real-world insights",
                },
                {
                  id: 3,
                  image_url:
                    "https://res.cloudinary.com/dqudvximt/image/upload/v1767877178/users_cme79i2lk00qls401ar5qxqnc_KB4hFvAzhyqJF0xf-3a61cb74-01c9-4880-be04-a4036f32c4f9_t64kt9.jpg",
                  title: "Open Source Day",
                  description:
                    "Students contributing to real open-source projects",
                },
                {
                  id: 4,
                  image_url:
                    "https://res.cloudinary.com/dqudvximt/image/upload/v1767876038/users_cme79i2lk00qls401ar5qxqnc_Hg7Si3j52FVfpQRN-image_x8wghd.png",
                  title: "Community Meetup #5",
                  description: "Networking and knowledge sharing session",
                },
                {
                  id: 5,
                  image_url:
                    "https://res.cloudinary.com/dqudvximt/image/upload/v1767875075/users_cme79i2lk00qls401ar5qxqnc_WI6Z0HVxNMCrvfgn-ETzJoQJr1aCFL2r7-rrDC9gCyIJ77RqVW-luma_cqxcny.jpg",
                  title: "Workshop — Web Dev",
                  description: "Hands-on React & Tailwind workshop",
                },
                {
                  id: 6,
                  image_url:
                    "https://res.cloudinary.com/dqudvximt/image/upload/v1767874220/users_cme79i2lk00qls401ar5qxqnc_n74cMGsKIBuvEzzj-users_cme5bsukl01binm014j8ioh2j_2SNEHA31eEqsxFRS-original-33f53dcd2f48e068523d32df0e5cc92f_xkirvh.gif",
                  title: "LinkedIn Live",
                  description: "Career guidance session with 500+ viewers",
                },
              ]
          ).map((photo) => (
            <motion.div
              key={photo.id}
              variants={{
                hidden: { opacity: 0, y: 40, scale: 0.96 },
                show: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    duration: 0.7,
                    ease: [0.22, 1, 0.36, 1],
                  },
                },
              }}
              className="group relative overflow-hidden rounded-lg"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={photo.image_url}
                  alt={photo.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Content — visible on hover */}
              <div className="absolute bottom-0 left-0 w-full p-4 sm:p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <h4 className="text-white font-dm-sans font-medium text-base sm:text-lg leading-tight">
                  {photo.title}
                </h4>
                <p className="text-white/70 text-sm font-dm-sans mt-1">
                  {photo.description || photo.date}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>
      {/* Stats Section */}
      <StatsSection />
      {/* Sponsor Section */}
      <SponsorSection />
      <CommunityPartners />
      <SocialMediaSection />
      <NoticeSection />

      {/* Hall of Fame */}
      <section className="max-w-7xl mx-6 xl:mx-auto pt-10 sm:pt-14 pb-10 mt-10 bg-section rounded-xl px-3 sm:px-10">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-3 sm:gap-4 mb-6"
        >
          <span className="text-xs sm:text-sm font-medium tracking-[0.3em] uppercase text-gray-400 font-dm-sans shrink-0">
            08
          </span>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ transformOrigin: "left" }}
            className="h-px bg-[#27187eb3] w-8 sm:w-12 shrink-0"
          />

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-dm-sans font-medium tracking-tight leading-none">
            Hall of <span className="italic text-primary">Fame</span>
          </h2>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg sm:text-xl tracking-wide leading-snug font-dm-sans max-w-2xl mb-8"
        >
          Celebrating the outstanding achievements of our community members.
        </motion.p>

        {/* Grid */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.12,
              },
            },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
        >
          {(hallOfFameEntries.length > 0
            ? hallOfFameEntries
            : [
                {
                  id: 1,
                  image_url:
                    "https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/4SrLYdwh0tpuLlkt-team_2.a2a0c6917be79e15dc29_wjosq7_ftgm6j.jpg",
                  student_name: "Justin Benito",
                  description:
                    "Built an open-source CLI tool that got 500+ GitHub stars in a week.",
                },
                {
                  id: 2,
                  image_url:
                    "https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/iAckgTxMcALuPbEx-IMG-20250112-WA0012_1_fwyhoa_oxegdx.jpg",
                  student_name: "Mahaveer A",
                  description:
                    "Selected for Google Summer of Code 2025 — contributed to TensorFlow.",
                },
                {
                  id: 3,
                  image_url:
                    "https://res.cloudinary.com/druvxcll9/image/upload/v1761122516/2ABMHfqOsrpoL3OV-WhatsApp202025-08-312010.33.52_a8a27bbd_vzcgzq_1_bm8zch.jpg",
                  student_name: "Keerthana M G",
                  description:
                    "Won 1st place at HackSapiens 2.0 with an AI-powered accessibility tool.",
                },
              ]
          ).map((entry, i) => (
            <motion.div
              key={entry.id}
              variants={{
                hidden: {
                  opacity: 0,
                  scale: 0.94,
                  filter: "blur(6px)",
                },
                show: {
                  opacity: 1,
                  scale: 1,
                  filter: "blur(0px)",
                  transition: {
                    duration: 0.7,
                    ease: [0.22, 1, 0.36, 1],
                  },
                },
              }}
              className="bg-main rounded-lg overflow-hidden"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={entry.image_url}
                  alt={entry.student_name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4 sm:p-5 font-dm-sans">
                <h3 className="text-lg sm:text-xl font-medium tracking-tight mb-1">
                  {entry.student_name}
                </h3>

                <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
                  "{entry.description}"
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Team / Mafia Gang */}
      <section
        id="community"
        className="max-w-7xl mx-6 xl:mx-auto pt-10 sm:pt-14 pb-10 mt-10"
      >
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-3 sm:gap-4 mb-6"
        >
          <span className="text-xs sm:text-sm font-medium tracking-[0.3em] uppercase text-gray-400 font-dm-sans shrink-0">
            09
          </span>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ transformOrigin: "left" }}
            className="h-px bg-[#27187eb3] w-8 sm:w-12 shrink-0"
          />

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-dm-sans font-medium tracking-tight leading-none">
            The <span className="italic text-primary">Mafia Gang</span>
          </h2>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg sm:text-xl tracking-wide leading-snug font-dm-sans max-w-2xl mb-8"
        >
          Meet the core members who run the community. We are students, just
          like you.
        </motion.p>

        {/* Everyone in one grid */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.06,
              },
            },
          }}
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-x-4 sm:gap-x-5 gap-y-8"
        >
          {/* Founder */}
          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 0.92, filter: "blur(6px)" },
              show: {
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
                transition: {
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                },
              },
            }}
            className="flex flex-col items-center font-dm-sans"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden mb-2 ring-2 ring-primary">
              <img
                src="https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/1679197646322_n1svjq_s5w42a.jpg"
                alt="Thiyaga B"
                className="w-full h-full object-cover"
              />
            </div>

            <h3 className="text-xs sm:text-sm font-medium tracking-tight text-center leading-tight">
              Thiyaga B
            </h3>

            <span className="text-[10px] sm:text-xs text-primary font-medium mt-0.5">
              Founder
            </span>

            <a
              href="https://www.linkedin.com/in/thiyagab/"
              target="_blank"
              rel="noreferrer"
              className="text-gray-400 hover:text-primary transition-colors mt-1"
            >
              <Linkedin size={12} />
            </a>
          </motion.div>

          {/* Volunteers */}
          {volunteers.map((vol, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, scale: 0.92, filter: "blur(6px)" },
                show: {
                  opacity: 1,
                  scale: 1,
                  filter: "blur(0px)",
                  transition: {
                    duration: 0.7,
                    ease: [0.22, 1, 0.36, 1],
                  },
                },
              }}
              className="flex flex-col items-center font-dm-sans"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden mb-2">
                <img
                  src={vol.photo}
                  alt={vol.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="text-xs sm:text-sm font-medium tracking-tight text-center leading-tight">
                {vol.name}
              </h3>

              {vol.link && (
                <a
                  href={vol.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-400 hover:text-primary transition-colors mt-1"
                >
                  <Linkedin size={12} />
                </a>
              )}
            </motion.div>
          ))}
        </motion.div>
      </section>
      {/* CTA / Tagline */}
      <section className="max-w-7xl mx-6 xl:mx-auto mt-10 bg-primary rounded-xl py-16 px-6 sm:px-10 text-center font-dm-sans">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white leading-tight">
          Building Community <br />
          <span className="italic text-white/60">Since 2023</span>
        </h2>
      </section>
      {/* Footer */}
      <footer className="max-w-7xl mx-6 xl:mx-auto py-10 sm:py-14 mt-10 font-dm-sans bg-section px-10 rounded-xl mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-10">
          {/* Left — Logo + Description + Socials */}
          <div className="max-w-sm">
            <div className="flex items-center gap-2 mb-4">
              <img
                src="https://res.cloudinary.com/druvxcll9/image/upload/v1761122530/WhatsApp_Image_2025-09-02_at_12.45.18_b15791ea_rnlwrz_3_r4kp2u.jpg"
                alt="CodeSapiens Logo"
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-xl font-medium tracking-tight">
                CodeSapiens
              </span>
            </div>
            <p className="text-sm sm:text-base text-gray-500 leading-relaxed mb-6">
              Empowering students to build, learn, and grow together. Join the
              biggest student tech community in Tamil Nadu.
            </p>
            <div className="flex gap-5">
              <a
                href="https://github.com/Codesapiens-in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <Github size={18} />
              </a>
              <a
                href="https://www.linkedin.com/company/codesapiens-community/posts/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="https://youtube.com/@codesapiens-in?si=90EaPMYHcSZIHtMi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <Youtube size={18} />
              </a>
              <a
                href="https://discord.gg/codesapiens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <Users size={18} />
              </a>
            </div>
          </div>

          {/* Right — Links */}
          <div>
            <h4 className="font-medium tracking-tight mb-4">Community</h4>
            <ul className="space-y-3 text-sm sm:text-base text-gray-500">
              <li>
                <a
                  href="#vision"
                  className="hover:text-primary transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#events"
                  className="hover:text-primary transition-colors"
                >
                  Events
                </a>
              </li>
              <li>
                <a
                  href="#community"
                  className="hover:text-primary transition-colors"
                >
                  Team
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg/codesapiens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  Join Discord
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-[#27187e20] flex flex-col sm:flex-row justify-between items-center gap-2 text-xs sm:text-sm text-gray-400">
          <p>&copy; 2025 CodeSapiens Community. All rights reserved.</p>
          <p>
            Designed & Built by Students /{" "}
            <a
              href="https://www.linkedin.com/in/prakash"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Prakash
            </a>
          </p>
        </div>
      </footer>
      <LandingPopup />
    </div>
  );
};

export default CodeSapiensHero;
