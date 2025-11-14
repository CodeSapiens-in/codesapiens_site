import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Github, Instagram, Linkedin, Twitter, Calendar, Users, Code, Award, Mail, Phone, MapPin, Clock, UserPlus, ArrowRight, Youtube, Users2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CodeSapiensHero = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [sectionsInView, setSectionsInView] = useState({});
  const navigate = useNavigate();

  // Updated past events data from bento.me and web sources
  const pastEvents = [
    { 
      id: 1, 
      title: "August Meetup 2025", 
      image: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122531/users_cme79i2lk00qls401ar5qxqnc_tYvYry0ll1qJY9Cr-sZlcWmpyKLCEVr3R-WhatsApp25202025-08-10252015.15.02_25567a3d_c0frk5_dpl25k.jpg", 
      date: "August 2025", 
      description: "A 3-hour mini hackathon with mentors, developers, and certificates for participants.",
      participants: 75
    },
    { 
      id: 2,
      title: "July Meetup 2024", 
      image: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122532/width_800_pmtms3_cqtzrn.webp", 
      date: "July 2025", 
      description: "Online session introducing security concepts via Google hacking and CTFs.",
      participants: 44
    },
    { 
      id: 3,
      title: "Summer of code 2024",
      image: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122534/codesapiens_3_md0nvd_ceyry4.png", 
      date: "Summer 2024", 
      description: "Session on building AI accelerators using VLSI and RTL coding.",
      participants: 50
    },
    { 
      id: 4,
      title: "Mentorship Programme 2024", 
      image: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122917/codesapiens_2_mqadi2_h1bbbi.png", 
      date: "2024", 
      description: "Student-run program for contributing to open-source projects.",
      participants: 100
    },
    {
      id: 5,
      title: "September Meetup 2025",
      image: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122957/users_cme79i2lk00qls401ar5qxqnc_OadwAYSr5ySuegEn-IMG-20250914-WA0012_gvyeye_n1s3az.jpg",
      date: "September 2025",
      description: "Exciting meetup filled with tech talks, networking, and hands-on workshops at ContentStack, Velachery, Chennai.",
      participants: 80
    },
    {
      id: 6,
      title: "Github Contest",
      image: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122991/1753106111524_wqepam_wam1st.jpg",
      date: "July 2025",
      description: "Exciting meetup filled with tech talks, networking, and hands-on workshops at ContentStack, Velachery, Chennai.",
      participants: 100
    }
  ];

  // Testimonials
  const testimonials = [
    {
      name: "Hayes Vincent",
      quote: "The event featured several engaging sessions: Reshma G.V.S. introduced artificial intelligence and guided participants in building a chatbot using Chatling, which was a notable highlight. Koushik Ram delivered a thrilling live demonstration on Wi-Fi hacking and cybersecurity. Ashik D showcased his creative design work, inspiring the attendees. The event's highlight was a fun Developers vs Cybersecurity battle hosted by Keerthana M G. Overall, the event combined learning, networking, and fun, leaving me inspired to continue building, learning, and pushing boundaries as a developer."
    }
  ];

  // Activities for What We Do
  const activities = [
    {
      title: "Meetups",
      description: "We organize offline events and mini-hackathons where you can build and launch a project in minutes with the help of mentors and developers.",
      icon: Users
    },
    {
      title: "Hackathons",
      description: "Engage in fun, minimal hackathons to get hands-on experience and win prizes.",
      icon: Code
    },
    {
      title: "Curated Online Sessions",
      description: "We provide sessions focused on practical skills, with a mix of code examples and presentations, based on community feedback. Our two broader areas are 'Learn' (courses, sessions, soft skills) and 'Do' (projects, hackathons).",
      icon: Calendar
    },
    {
      title: "Nurturing New Talents",
      description: "We help students discover their interests and build a unique profile that stands out from the crowd.",
      icon: Award
    },
    {
      title: "Debates & Discussions",
      description: "We are not just a formal tech community; we discuss everything from EV cars and Rajni movies to social media detox, because we care for our students.",
      icon: UserPlus
    }
  ];

  // Volunteers with original links from previous code
  const volunteers = [
    {
      photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122516/2ABMHfqOsrpoL3OV-WhatsApp202025-08-312010.33.52_a8a27bbd_vzcgzq_1_bm8zch.jpg",
      name: "Keerthana M G",
      link: "https://in.linkedin.com/in/keerthana-m-g-12ba59256"
    },
    {
      photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/iAckgTxMcALuPbEx-IMG-20250112-WA0012_1_fwyhoa_oxegdx.jpg",
      name: "Mahaveer A",
      link: "https://www.linkedin.com/in/mahaveer1013"
    },
    {
      photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/4SrLYdwh0tpuLlkt-team_2.a2a0c6917be79e15dc29_wjosq7_ftgm6j.jpg",
      name: "Justin Benito",
      link: "https://www.linkedin.com/in/justinbenito"
    },
    {
      photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/nLDGxnsr6bZkCx0A-team_3.d2fd9099126beb0b86a1_vxhpxo_z3eods.jpg",
      name: "Koushik ram",
      link: "https://www.linkedin.com/in/koushik-ram-118495239"
    },
    {
      photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/Tlgueu6loMYMKJMs-team_1.150894ea4376f6423091_vrf0fr_weljyi.jpg",
      name: "Athiram R S",
      link: "https://www.linkedin.com/in/athi-ram-rs"
    },
    {
      photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122516/5NmVUZRZI8sRCrZA-1735300455766_h8dhm2_dnully.jpg",
      name: "Pranav Vikraman",
      link: "https://www.linkedin.com/in/pranav-vikraman-322020242"
    },
    {
      photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122531/JWz1OvtKurqSRsC7-WhatsApp202025-08-312011.22.52_bff7c8bd_mrok7q_b6meyd.jpg",
      name: "Vignesh R",
      link: "https://www.linkedin.com/in/vignesh-r-7727582b7"
    },
    {
      photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122532/3S8YnOu77Rt2wDJD-WhatsApp202025-08-312010.32.42_9b5cee10_puasao_zekkfa.jpg",
      name: "Anand S",
      link: "https://codesapiens-management-website.vercel.app"
    },
    {
      photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122531/q5tsA3KUOwgSOpIa-team_5.efc764325a5ffbaf1b6e_1_sidv9r_fhxmqv.jpg",
      name: "Subhaharini P",
      link: "https://www.linkedin.com/in/subhaharini-p-938568254"
    },
    {
      photo: "https://res.cloudinary.com/druvxcll9/image/upload/v1761122531/1732031130575_b834gr_1_slc9fw.jpg",
      name: "Jayasurya R",
      link: "https://www.linkedin.com/in/jayasurya-r-b37997279/"
    }
  ];

  // Updated stats based on real data
  const stats = [
    { icon: Users, number: "1500+", label: "Active Members" },
    { icon: Calendar, number: "7+", label: "Events Hosted" }
  ];

  // Custom hook for intersection observer
  const useInView = (id) => {
    const ref = useRef(null);
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setSectionsInView(prev => ({ ...prev, [id]: true }));
            observer.unobserve(entry.target);
          }
        },
        { threshold: 0.1 }
      );

      if (ref.current) {
        observer.observe(ref.current);
      }

      return () => observer.disconnect();
    }, [id]);

    return { ref, inView: sectionsInView[id] || false };
  };

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % pastEvents.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-stone-100 text-zinc-900 overflow-x-hidden">
      {/* Global Styles for Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from {
            transform: translateY(-100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(10px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 1s ease-out forwards;
        }
        .animate-slideDown {
          animation: slideDown 0.8s ease-out forwards;
        }
        .animate-bounce {
          animation: bounce 1.5s infinite ease-in-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }
        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out forwards;
        }
        .stagger-child:nth-child(1) { animation-delay: 0.1s; }
        .stagger-child:nth-child(2) { animation-delay: 0.2s; }
        .stagger-child:nth-child(3) { animation-delay: 0.3s; }
        .stagger-child:nth-child(4) { animation-delay: 0.4s; }
        .stagger-child:nth-child(5) { animation-delay: 0.5s; }
        .stagger-child:nth-child(6) { animation-delay: 0.6s; }
        .stagger-child:nth-child(7) { animation-delay: 0.7s; }
        .stagger-child:nth-child(8) { animation-delay: 0.8s; }
        .stagger-child:nth-child(9) { animation-delay: 0.9s; }
        .image-fade-enter { opacity: 0; transition: opacity 0.8s ease-in-out; }
        .image-fade-enter-active { opacity: 1; }
        .image-fade-exit { opacity: 1; transition: opacity 0.8s ease-in-out; }
        .image-fade-exit-active { opacity: 0; }
      `}</style>

      {/* Header Navigation with CSS animation - Responsive */}
      <header
        className={`fixed top-0 w-full z-50 bg-zinc-50/90 backdrop-blur-md border-b border-zinc-200/50 transition-all duration-300 ${isVisible ? 'animate-slideDown' : ''}`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex justify-between items-center py-4 sm:py-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
                <img
                  src="https://res.cloudinary.com/druvxcll9/image/upload/v1761122530/WhatsApp_Image_2025-09-02_at_12.45.18_b15791ea_rnlwrz_3_r4kp2u.jpg"
                  alt="Logo"
                  className="w-full h-full rounded-full object-cover transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                />
              </div>
              <span className="text-lg sm:text-xl font-light tracking-wider">CodeSapiens</span>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section - Adjusted text sizes for better alignment on mobile/laptop */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 sm:pt-20">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 via-zinc-50 to-stone-100 transition-opacity duration-2000 opacity-100"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className={`text-center max-w-4xl sm:max-w-5xl lg:max-w-6xl mx-auto transition-all duration-1500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            {/* Main Headline */}
            <div className="mb-8 sm:mb-12 lg:mb-16">
              <div className="mb-4 sm:mb-6 lg:mb-8">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extralight tracking-wider text-zinc-900 mb-2 sm:mb-4 leading-tight">
                  CodeSapiens: The Biggest Student-Run Tech Community in TN.
                </h1>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light tracking-wider text-zinc-700 mb-4 sm:mb-6 lg:mb-8 leading-tight italic">
                  The only 'Inter-college students community' by the students for the students
                </h2>
              </div>
              
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-light text-zinc-600 mb-8 sm:mb-10 lg:mb-12 max-w-3xl mx-auto leading-relaxed tracking-wide px-4">
                We are here to help students build a career in Tech who say, “Perusa Pannanum, but enna Pannanum Therla” ("Want to do something big, but don't know what to do").
              </p>

              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 px-4">
                <button 
                  onClick={() => navigate('/auth')}
                  className="group inline-flex items-center justify-center space-x-3 px-6 sm:px-8 py-3 sm:py-4 border border-zinc-300 text-zinc-700 font-light tracking-widest uppercase text-sm hover:bg-zinc-900 hover:text-zinc-50 hover:border-zinc-900 transition-all duration-500 w-full sm:w-auto"
                >
                  <span>Join Our Community</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
                <button 
                  onClick={() => scrollToSection('events')}
                  className="group inline-flex items-center justify-center space-x-3 px-6 sm:px-8 py-3 sm:py-4 border border-zinc-300 text-zinc-700 font-light tracking-widest uppercase text-sm hover:bg-zinc-900 hover:text-zinc-50 hover:border-zinc-900 transition-all duration-500 w-full sm:w-auto"
                >
                  <span>View Upcoming Events</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Vision Section (repurposed from Journey) - Responsive grid */}
      <section className="py-16 sm:py-24 lg:py-32 bg-white" ref={useInView('vision').ref}>
        <div className={`container mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-1000 ${useInView('vision').inView ? 'opacity-100' : 'opacity-0'}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 lg:gap-24 items-center max-w-6xl mx-auto">
            <div className={`space-y-4 sm:space-y-6 lg:space-y-8 transition-all duration-1000 delay-200 ${useInView('vision').inView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
              <div>
                <span className="text-xs sm:text-sm font-light tracking-widest uppercase text-zinc-400 mb-2 sm:mb-4 block">Our Vision</span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl xl:text-6xl font-extralight text-zinc-900 mb-4 sm:mb-6 lg:mb-8 leading-tight">
                  Our Vision
                </h2>
              </div>
              <p className="text-base sm:text-lg font-light text-zinc-600 leading-relaxed mb-4 sm:mb-6 lg:mb-8">
                Our vision is to bring our students to collaborate, share, grow and in the process have lots of fun together. We envision a platform managed and grown by students themselves, where they can build their career based on their interests and skills. We strive to Help, Empower, and ensure everything is Fun.
              </p>
            </div>
            <div className={`relative transition-all duration-1000 order-first lg:order-last ${useInView('vision').inView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
              <img
                src="https://res.cloudinary.com/druvxcll9/image/upload/v1761122530/WhatsApp_Image_2025-09-02_at_12.45.18_b15791ea_rnlwrz_3_r4kp2u.jpg"
                alt="Coding workspace"
                className="w-full h-auto rounded-lg shadow-xl transition-transform duration-700 hover:scale-105"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section - Responsive grid */}
      <section className="py-16 sm:py-24 lg:py-32 bg-zinc-50" ref={useInView('whatwedo').ref}>
        <div className={`container mx-auto px-4 sm:px-6 lg:px-8 ${useInView('whatwedo').inView ? 'opacity-100' : 'opacity-0 transition-opacity duration-700'}`}>
          <div className="text-center mb-12 sm:mb-16 lg:mb-20 transition-all duration-1000">
            <span className="text-xs sm:text-sm font-light tracking-widest uppercase text-zinc-400 mb-4 sm:mb-8 block">What We Do</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl xl:text-6xl font-extralight text-zinc-900 mb-6 sm:mb-8 lg:mb-12 leading-tight">
              What We Do
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {activities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div
                  key={index}
                  className={`bg-white p-4 sm:p-6 rounded-lg shadow-md transition-all duration-700 stagger-child ${useInView('whatwedo').inView ? 'animate-scaleIn opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Icon className="w-8 h-8 sm:w-12 sm:h-12 text-zinc-700 mb-3 sm:mb-4 mx-auto" />
                  <h3 className="text-lg sm:text-xl font-light mb-3 sm:mb-4 text-center">{activity.title}</h3>
                  <p className="text-zinc-600 font-light text-sm sm:text-base text-center">{activity.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section - Responsive */}
      <section className="py-16 sm:py-20 lg:py-24 bg-zinc-900 text-zinc-50" ref={useInView('stats').ref}>
        <div className={`container mx-auto px-4 sm:px-6 lg:px-8 ${useInView('stats').inView ? 'animate-fadeInUp' : ''}`}>
          <div className="text-center mb-12 sm:mb-16 transition-all duration-800">
            <span className="text-xs sm:text-sm font-light tracking-widest uppercase text-zinc-400 mb-4 sm:mb-8 block">Our Impact</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl lg:text-5xl font-extralight tracking-wide mb-4 sm:mb-6 lg:mb-8">
              Numbers that Matter
            </h2>
          </div>

          <div className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-16 max-w-4xl mx-auto ${useInView('stats').inView ? 'opacity-100' : 'opacity-0'}`}>
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className={`text-center transition-all duration-700 stagger-child ${useInView('stats').inView ? 'animate-scaleIn opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-zinc-400 mx-auto mb-3 sm:mb-4 transition-colors duration-300 hover:text-zinc-300" />
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-extralight text-zinc-50 mb-2">{stat.number}</div>
                  <div className="text-zinc-400 text-xs sm:text-sm font-light tracking-widest uppercase">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Events Section (combined past and upcoming) - Responsive */}
      <section
        id="events"
        className="py-16 sm:py-24 lg:py-32 bg-white"
        ref={useInView('events').ref}
      >
        <div className={`container mx-auto px-4 sm:px-6 lg:px-8 ${useInView('events').inView ? 'opacity-100' : 'opacity-0'}`}>
          <div className="text-center mb-12 sm:mb-16 lg:mb-20 transition-all duration-1000">
            <span className="text-xs sm:text-sm font-light tracking-widest uppercase text-zinc-400 mb-4 sm:mb-8 block">Events</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl xl:text-6xl font-extralight text-zinc-900 mb-6 sm:mb-8 lg:mb-12 leading-tight">
              Events
            </h2>
          </div>

          {/* Upcoming Events */}
          <div className="mb-12 sm:mb-16 lg:mb-24">
            <h3 className="text-xl sm:text-2xl sm:text-3xl font-light text-zinc-900 mb-6 sm:mb-8 text-center">Upcoming Events</h3>
            <div className="w-full max-w-4xl mx-auto">
              <iframe 
                src="https://lu.ma/embed/calendar/cal-wqMPYDIELcTaigI/events" 
                width="100%" 
                height="400" 
                className="sm:h-96 lg:h-[450px]"
                frameBorder="0" 
                style={{border: '1px solid #bfcbda88', borderRadius: '4px'}} 
                allowFullScreen="" 
                aria-hidden="false" 
                tabIndex="0"
              ></iframe>
            </div>
          </div>

          {/* Past Events Gallery */}
          <h3 className="text-xl sm:text-2xl sm:text-3xl font-light text-zinc-900 mb-6 sm:mb-8 text-center">Past Events</h3>
          <div className="max-w-4xl sm:max-w-5xl mx-auto mb-8 sm:mb-12">
            <div className="relative overflow-hidden rounded-lg shadow-2xl">
              <img
                key={currentImageIndex}
                src={pastEvents[currentImageIndex].image}
                alt={pastEvents[currentImageIndex].title}
                className={`w-full h-64 sm:h-80 lg:h-96 xl:h-[500px] object-cover transition-opacity duration-800`}
                style={{ opacity: 1 }}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 text-white transition-all duration-500">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-light mb-1 sm:mb-2">{pastEvents[currentImageIndex].title}</h3>
                <p className="text-zinc-200 font-light text-sm sm:text-base">{pastEvents[currentImageIndex].date}</p>
              </div>
            </div>
          </div>

          <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 ${useInView('events').inView ? 'opacity-100' : 'opacity-0 transition-opacity duration-700'}`}>
            {pastEvents.map((event, index) => (
              <div
                key={index}
                className={`group cursor-pointer transform transition-all duration-700 hover:scale-105 stagger-child ${useInView('events').inView ? 'animate-fadeIn opacity-100' : 'opacity-0'}`}
                onClick={() => setCurrentImageIndex(index)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative overflow-hidden bg-zinc-100 rounded-md shadow-md">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonials - Responsive */}
          <div className="mt-12 sm:mt-16">
            <h3 className="text-xl sm:text-2xl sm:text-3xl font-light text-zinc-900 mb-6 sm:mb-8 text-center">What Attendees Say</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-zinc-50 p-4 sm:p-6 rounded-lg shadow-md">
                  <p className="text-zinc-600 font-light mb-4 italic text-sm sm:text-base leading-relaxed">"{testimonial.quote}"</p>
                  <p className="text-zinc-900 font-light text-sm sm:text-base">- {testimonial.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section - Responsive */}
      <section
        className="py-16 sm:py-24 lg:py-32 bg-zinc-50"
        ref={useInView('founder').ref}
      >
        <div className={`container mx-auto px-4 sm:px-6 lg:px-8 ${useInView('founder').inView ? 'opacity-100' : 'opacity-0 transition-opacity duration-700'}`}>
          <div className="text-center mb-12 sm:mb-16 lg:mb-20 transition-all duration-1000">
            <span className="text-xs sm:text-sm font-light tracking-widest uppercase text-zinc-400 mb-4 sm:mb-8 block">Leadership</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl xl:text-6xl font-extralight text-zinc-900 mb-6 sm:mb-8 lg:mb-12 leading-tight">
              Our <span className="italic font-light">Founder</span>
            </h2>
          </div>

          <div className="flex justify-center">
            <div
              className={`transform transition-all duration-700 hover:scale-105 cursor-pointer flex flex-col items-center text-center ${useInView('founder').inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              onClick={() => window.open('https://www.linkedin.com/in/thiyagab/', '_blank')}
            >
              <div className="relative group mb-3 sm:mb-4 w-full max-w-[150px] sm:max-w-[200px] md:max-w-[300px]">
                <div className="aspect-square overflow-hidden rounded-full shadow-xl transition-transform duration-500 group-hover:scale-105">
                  <img
                    src="https://res.cloudinary.com/druvxcll9/image/upload/v1761122517/1679197646322_n1svjq_s5w42a.jpg"
                    alt="Thiyaga B"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <Linkedin 
                  className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white bg-blue-700 rounded-full p-0.5 sm:p-1 md:p-2 opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                />
              </div>
              <p className="text-base sm:text-lg md:text-2xl font-light text-zinc-900 mt-2">Thiyaga B</p>
              <p className="text-sm sm:text-md md:text-lg text-zinc-500 italic">Founder</p>
              <a 
                href="https://www.linkedin.com/in/thiyagab/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs sm:text-sm md:text-md text-zinc-500 hover:text-zinc-700 transition-colors mt-2"
              >
                View LinkedIn
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mafia Gang Section - Responsive grid */}
      <section
        className="py-16 sm:py-24 lg:py-32 bg-white"
        ref={useInView('team').ref}
      >
        <div className={`container mx-auto px-4 sm:px-6 lg:px-8 ${useInView('team').inView ? 'opacity-100' : 'opacity-0 transition-opacity duration-700'}`}>
          <div className="text-center mb-12 sm:mb-16 lg:mb-20 transition-all duration-1000">
            <span className="text-xs sm:text-sm font-light tracking-widest uppercase text-zinc-400 mb-4 sm:mb-8 block">Community</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl xl:text-6xl font-extralight text-zinc-900 mb-6 sm:mb-8 lg:mb-12 leading-tight">
              Our <span className="italic font-light">Mafia Gang</span>
            </h2>
            <p className="text-base sm:text-lg font-light text-zinc-600 mb-6 sm:mb-8 lg:mb-12 max-w-3xl mx-auto px-4">
              Meet the family and the core members who run the community. We need genuine, consistent people to lead and administer this community.
            </p>
          </div>

          <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6 max-w-6xl mx-auto ${useInView('team').inView ? 'opacity-100' : 'opacity-0'}`}>
            {volunteers.map((volunteer, index) => (
              <div
                key={index}
                className={`transform transition-all duration-700 hover:scale-105 cursor-pointer flex flex-col items-center text-center stagger-child ${useInView('team').inView ? 'animate-scaleIn opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                onClick={() => window.open(volunteer.link.startsWith('http') ? volunteer.link : undefined, volunteer.link.startsWith('http') ? '_blank' : undefined) || (volunteer.link && navigate(volunteer.link))}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative group mb-2 w-full max-w-[100px] sm:max-w-[120px] md:max-w-[150px]">
                  <div className="aspect-square overflow-hidden rounded-full shadow-md w-full transition-transform duration-500 group-hover:scale-105">
                    <img
                      src={volunteer.photo}
                      alt={volunteer.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <Linkedin 
                    className="absolute bottom-0.5 sm:bottom-1 right-0.5 sm:right-1 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white bg-blue-700 rounded-full p-0.5 sm:p-0.5 md:p-1 opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                  />
                </div>
                <p className="text-xs sm:text-sm font-light text-zinc-900 mt-1 line-clamp-2 text-center px-1">{volunteer.name}</p>
                <a 
                  href={volunteer.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-zinc-500 hover:text-zinc-700 transition-colors mt-1 hidden sm:block"
                >
                  View Profile
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Section - Single column for better mobile, updated social links */}
      <section
        id="contact"
        className="py-16 sm:py-24 lg:py-32 bg-zinc-900 text-zinc-50"
        ref={useInView('contact').ref}
      >
        <div className={`container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto ${useInView('contact').inView ? 'opacity-100' : 'opacity-0 transition-opacity duration-700'}`}>
          <div className="text-center mb-12 sm:mb-16 transition-all duration-1000">
            <span className="text-xs sm:text-sm font-light tracking-widest uppercase text-zinc-400 mb-4 sm:mb-8 block">CodeSapiens</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl lg:text-5xl font-extralight tracking-wide mb-4 sm:mb-6 lg:mb-8">
              Building <span className="italic">Community</span> since
            </h2>
            <div className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extralight text-zinc-400 mb-6 sm:mb-8 lg:mb-12">©2023</div>
          </div>

          {/* Social Media - Single column responsive */}
          <div className="space-y-6 mx-auto transition-all duration-700 text-center">
            <h3 className="text-lg sm:text-xl font-light tracking-wide mb-6">Follow</h3>
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-6">
              {[
                { icon: Linkedin, href: "https://www.linkedin.com/company/codesapiens-community/posts/", label: "LinkedIn" },
                { icon: Github, href: "https://github.com/Codesapiens-in", label: "Github" },
                { icon: Youtube, href: "https://youtube.com/@codesapiens-in?si=90EaPMYHcSZIHtMi", label: "Youtube" },
                { icon: Users2, href: "https://discord.gg/codesapiens", label: "Discord" }
              ].map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    className="flex items-center justify-center space-x-3 text-sm font-light text-zinc-300 hover:text-zinc-50 transition-colors duration-300 stagger-child w-full sm:w-auto"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Icon className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
                    <span>{social.label}</span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Footer Links - Responsive flex */}
          <div className="text-center pt-12 sm:pt-16 mt-12 sm:mt-16 border-t border-zinc-800 transition-all duration-700">
            <div className="flex flex-wrap justify-center space-x-4 sm:space-x-6 mb-4 px-4">
              <a href="#vision" className="text-zinc-300 hover:text-zinc-50 text-sm font-light py-1">About Us</a>
              <a href="#events" className="text-zinc-300 hover:text-zinc-50 text-sm font-light py-1">Events</a>
              <a href="#contact" className="text-zinc-300 hover:text-zinc-50 text-sm font-light py-1">Contact Us</a>
              <a href="/privacy" className="text-zinc-300 hover:text-zinc-50 text-sm font-light py-1">Privacy Policy</a>
              <a href="/terms" className="text-zinc-300 hover:text-zinc-50 text-sm font-light py-1">Terms of Use</a>
            </div>
            <p className="text-xs font-light text-zinc-500 tracking-wider">
              © 2025 CodeSapiens. All rights reserved.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CodeSapiensHero;