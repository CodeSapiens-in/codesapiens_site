import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Github, Instagram, Linkedin, Twitter, Calendar, Users, Code, Award, Mail, Phone, MapPin, Clock, UserPlus, ArrowRight, Youtube } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const CodeSapiensHero = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();
  // Updated past events data from bento.me and web sources
  const pastEvents = [
    { 
      id: 1, 
      title: "August Meetup 2025", 
      image: "https://creatorspace.imgix.net/users/cme79i2lk00qls401ar5qxqnc/tYvYry0ll1qJY9Cr-sZlcWmpyKLCEVr3R-WhatsApp%252520Image%2525202025-08-10%252520at%25252015.15.02_25567a3d.jpg?w=750&h=750", 
      date: "August 2025", 
      description: "A 3-hour mini hackathon with mentors, developers, and certificates for participants.",
      participants: 75
    },
    { 
      id: 2, 
      title: "July Meetup 2025", 
      image: "https://creatorspace.imgix.net/users/cme79i2lk00qls401ar5qxqnc/dC8c5AeuyLulrDlu-WhatsApp%2520Image%25202025-08-18%2520at%252017.57.10_1135c6f6.jpg?w=750&h=750", 
      date: "July 2025", 
      description: "Online session introducing security concepts via Google hacking and CTFs.",
      participants: 44
    },
    { 
      id: 3, 
      title: "Summer of code 2024", 
      image: "https://creatorspace.imgix.net/users/cme79i2lk00qls401ar5qxqnc/Elth5VQLAvoEm02T-1UTOfxIl6lQsvPuA-Image_Editor%252520(5).png?w=750&h=750", 
      date: "Summer 2024", 
      description: "Session on building AI accelerators using VLSI and RTL coding.",
      participants: 50
    },
    { 
      id: 4, 
      title: "Mentorship Programme 2024", 
      image: "https://creatorspace.imgix.net/users/cme79i2lk00qls401ar5qxqnc/sHoKIUM22yN6cHBX-nO7EHUY6fAHtfxrH-Image_Editor%252520(2).png?w=750&h=750", 
      date: "2024", 
      description: "Student-run program for contributing to open-source projects.",
      participants: 100
    }
  ];

  // Updated upcoming events with volunteer requirements from sources
  const upcomingEvents = [
    {
      id: 1,
      title: "September Meetup 2025",
      image: "https://res.cloudinary.com/dqudvximt/image/upload/v1756808600/WhatsApp_Image_2025-08-31_at_07.50.01_b61d2154_jymwvs.jpg",
      date: "August 2025",
      time: "10:00 AM - 2:00 PM",
      location: "ContentStack,  Velachery, Chennai, Tamil Nadu",
      description: "Reserve your spot now at https://bento.me/codesapiens to join us for an exciting meetup filled with tech talks, networking, and hands-on workshops.",
      volunteersNeeded: [
        { role: "Event Coordination", count: 5, skills: "Organization, Communication" },
        { role: "Technical Support", count: 8, skills: "AV Equipment, Troubleshooting" },
        { role: "Registration Desk", count: 6, skills: "Customer Service, Attention to Detail" }
      ]
    }
  ];

  // Volunteers with photos, names, and separate LinkedIn links
  const volunteers = [
    {
      photo: "https://res.cloudinary.com/dqudvximt/image/upload/v1756997855/2ABMHfqOsrpoL3OV-WhatsApp202025-08-312010.33.52_a8a27bbd_vzcgzq.jpg",
      name: "Keerthana M G",
      link: "https://in.linkedin.com/in/keerthana-m-g-12ba59256"
    },
    {
      photo: "https://res.cloudinary.com/dqudvximt/image/upload/v1756997855/iAckgTxMcALuPbEx-IMG-20250112-WA0012_ym2grt.jpg",
      name: "Mahaveer A",
      link: "https://www.linkedin.com/in/mahaveer1013"
    },
    {
      photo: "https://res.cloudinary.com/dqudvximt/image/upload/v1756997855/4SrLYdwh0tpuLlkt-team_2.a2a0c6917be79e15dc29_wjosq7.jpg",
      name: "Justin Benito",
      link: "https://www.linkedin.com/in/justinbenito"
    },
    {
      photo: "https://res.cloudinary.com/dqudvximt/image/upload/v1756997855/nLDGxnsr6bZkCx0A-team_3.d2fd9099126beb0b86a1_vxhpxo.jpg",
      name: "Koushik ram",
      link: "https://www.linkedin.com/in/koushik-ram-118495239"
    },
    {
      photo: "https://res.cloudinary.com/dqudvximt/image/upload/v1756997855/Tlgueu6loMYMKJMs-team_1.150894ea4376f6423091_vrf0fr.jpg",
      name: "Athiram R S",
      link: "https://www.linkedin.com/in/athi-ram-rs"
    },
    {
      photo: "https://res.cloudinary.com/dqudvximt/image/upload/v1756997855/5NmVUZRZI8sRCrZA-1735300455766_h8dhm2.jpg",
      name: "Pranav Vikraman",
      link: "https://www.linkedin.com/in/pranav-vikraman-322020242"
    },
    {
      photo: "https://res.cloudinary.com/dqudvximt/image/upload/v1756997855/JWz1OvtKurqSRsC7-WhatsApp202025-08-312011.22.52_bff7c8bd_mrok7q.jpg",
      name: "Vignesh R",
      link: "https://www.linkedin.com/in/vignesh-r-7727582b7"
    },
    {
      photo: "https://res.cloudinary.com/dqudvximt/image/upload/v1756997855/3S8YnOu77Rt2wDJD-WhatsApp202025-08-312010.32.42_9b5cee10_puasao.jpg",
      name: "Anand S",
      link: "https://codesapiens-management-website.vercel.app"
    },
    {
      photo: "https://res.cloudinary.com/dqudvximt/image/upload/v1756998060/q5tsA3KUOwgSOpIa-team_5.efc764325a5ffbaf1b6e_1_sidv9r.jpg",
      name: "Subhaharini P",
      link: "https://www.linkedin.com/in/subhaharini-p-938568254"
    }
  ];

  // Updated stats based on real data
  const stats = [
    { icon: Users, number: "1500+", label: "Active Members" },
    { icon: Calendar, number: "7+", label: "Events Hosted" }
  ];

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

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: 'easeOut' } }
  };

  const staggerVariants = {
    visible: { transition: { staggerChildren: 0.2 } }
  };

  const childVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-stone-100 text-zinc-900 overflow-x-hidden">
      {/* Header Navigation with animation */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="fixed top-0 w-full z-50 bg-zinc-50/90 backdrop-blur-md border-b border-zinc-200/50"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 flex items-center justify-center ">
               <img src="https://res.cloudinary.com/dqudvximt/image/upload/v1756797708/WhatsApp_Image_2025-09-02_at_12.45.18_b15791ea_rnlwrz.jpg" alt="Logo" className="w-10 h-10 " />
              </div>
              <span className="text-xl font-light tracking-wider">CodeSapiens</span>
            </div>
            
          </nav>
        </div>
      </motion.header>

      {/* Hero Section - Enhanced with motion */}
      <motion.section 
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative min-h-screen flex items-center justify-center pt-20"
      >
        {/* Background Pattern with subtle animation */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-zinc-100 via-zinc-50 to-stone-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
          ></motion.div>
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center max-w-6xl mx-auto"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          >
            {/* Main Headline */}
            <div className="mb-16">
              <div className="mb-8">
                <h1 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-extralight tracking-wider text-zinc-900 mb-4 leading-none">
                  Codesapiens
                </h1>
                <h1 className="text-6xl sm:text-7xl lg:text-4xl xl:text-5xl font-light tracking-wider text-zinc-700 mb-8 leading-none italic">
                  A Student community
                </h1>
              </div>
              
              <p className="text-lg sm:text-xl lg:text-2xl font-light text-zinc-600 mb-12 max-w-3xl mx-auto leading-relaxed tracking-wide">
                A student-run community in Tamil Nadu fostering technical excellence through events, meetups, and mentorship.
              </p>

              <button 
                onClick={() => navigate('/auth')}
                className="group inline-flex items-center space-x-3 px-8 py-4 border border-zinc-300 text-zinc-700 font-light tracking-widest uppercase text-sm hover:bg-zinc-900 hover:text-zinc-50 hover:border-zinc-900 transition-all duration-500"
              >
                <span>Login</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>

            {/* Scroll Indicator with bounce animation */}
            <motion.div 
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="flex flex-col items-center">
                <span className="text-xs font-light tracking-widest uppercase mb-2 text-zinc-400">Scroll</span>
                <ChevronDown className="w-5 h-5 text-zinc-400" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Journey Section - Enhanced animation */}
      <motion.section 
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-32 bg-white"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center max-w-6xl mx-auto">
            <motion.div 
              className="space-y-8"
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <div>
                <span className="text-sm font-light tracking-widest uppercase text-zinc-400 mb-4 block">A Journey</span>
                <h2 className="text-4xl lg:text-5xl xl:text-6xl font-extralight text-zinc-900 mb-8 leading-tight">
                  Through <span className="italic font-light">Time</span>
                </h2>
              </div>
              <p className="text-lg font-light text-zinc-600 leading-relaxed mb-8">
                Founded by Thiyaga B., CodeSapiens is a vibrant student community in Tamil Nadu with over 1,200 members, organizing technical meetups and webinars led by a 10-member student team.
              </p>
              
            </motion.div>
            <motion.div 
              className="relative"
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <img
                src="https://res.cloudinary.com/dqudvximt/image/upload/v1756797708/WhatsApp_Image_2025-09-02_at_12.45.18_b15791ea_rnlwrz.jpg"
                alt="Coding workspace"
                className="w-full h-auto rounded-lg shadow-xl"
              />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Stats Section - Staggered animation */}
      <motion.section 
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-24 bg-zinc-900 text-zinc-50"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-sm font-light tracking-widest uppercase text-zinc-400 mb-8 block">CodeSapiens</span>
            <h2 className="text-4xl lg:text-5xl font-extralight tracking-wide mb-8">
              Impressions <span className="italic">Of Heritage</span>
            </h2>
            <div className="text-lg font-light text-zinc-300 mb-12">
              Timeless <span className="italic">Masterpieces</span>
            </div>
            
          </motion.div>

          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-16 max-w-4xl mx-auto"
            variants={staggerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div 
                  key={index}
                  variants={childVariants}
                  className="text-center"
                >
                  <Icon className="w-8 h-8 text-zinc-400 mx-auto mb-4" />
                  <div className="text-4xl font-extralight text-zinc-50 mb-2">{stat.number}</div>
                  <div className="text-zinc-400 text-sm font-light tracking-widest uppercase">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* Our Collection Section - Animated gallery */}
      <motion.section 
        id="collection"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-32 bg-white"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="text-sm font-light tracking-widest uppercase text-zinc-400 mb-8 block">Our Collection</span>
            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-extralight text-zinc-900 mb-12 leading-tight">
              Reflection <span className="italic font-light">Of Art</span>
            </h2>
          </div>

          {/* Featured Project with fade transition */}
          <div className="max-w-5xl mx-auto mb-24">
            <div className="relative overflow-hidden rounded-lg shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={pastEvents[currentImageIndex].image}
                  alt={pastEvents[currentImageIndex].title}
                  className="w-full h-96 lg:h-[500px] object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 text-white">
                <h3 className="text-2xl lg:text-3xl font-light mb-2">{pastEvents[currentImageIndex].title}</h3>
                <p className="text-zinc-200 font-light">{pastEvents[currentImageIndex].date}</p>
              </div>
            </div>
          </div>

          {/* Grid Gallery with hover effects and stagger */}
         <motion.div 
  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-4"
  variants={staggerVariants}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
>
  {pastEvents.map((event, index) => (
    <motion.div
      key={index}
      variants={childVariants}
      className="group cursor-pointer transform transition-all duration-700 hover:scale-105"
      onClick={() => setCurrentImageIndex(index)}
    >
      <div className="relative overflow-hidden bg-zinc-100 rounded-md shadow-md">
        <img
          src={event.image}
          alt={event.title}
          className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </motion.div>
  ))}
</motion.div>
        </div>
      </motion.section>

      {/* Upcoming Events Section - Animated cards */}
      <motion.section 
        id="upcoming"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-32 bg-zinc-50"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="text-sm font-light tracking-widest uppercase text-zinc-400 mb-8 block">Upcoming</span>
            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-extralight text-zinc-900 mb-12 leading-tight">
              Future <span className="italic font-light">Exhibitions</span>
            </h2>
          </div>

          <motion.div 
            className="space-y-16 max-w-5xl mx-auto"
            variants={staggerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {upcomingEvents.map((event, index) => (
              <motion.div
                key={event.id}
                variants={childVariants}
                className="group bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-700 hover:shadow-2xl"
              >
                <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 p-6">
                  {/* Event Image */}
                  <div className="lg:col-span-2">
                    <div className="relative overflow-hidden rounded-md">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  </div>
                  
                  {/* Event Details */}
                  <div className="lg:col-span-2 flex flex-col justify-center">
                    <h3 className="text-2xl lg:text-3xl font-light text-zinc-900 mb-4">
                      {event.title}
                    </h3>
                    <p className="text-zinc-600 font-light leading-relaxed mb-6">
                      {event.description}
                    </p>
                    
                    <div className="space-y-2 text-sm font-light text-zinc-500 mb-6">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-4 h-4" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="w-4 h-4" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                  </div>
                  
                 
                
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Founder Section */}
      <motion.section 
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-32 bg-zinc-50"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="text-sm font-light tracking-widest uppercase text-zinc-400 mb-8 block">Leadership</span>
            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-extralight text-zinc-900 mb-12 leading-tight">
              Our <span className="italic font-light">Founder</span>
            </h2>
          </div>

          <div className="flex justify-center">
            <motion.div
              variants={childVariants}
              className="transform transition-all duration-700 hover:scale-105 cursor-pointer flex flex-col items-center text-center"
              onClick={() => window.open('https://www.linkedin.com/in/thiyagab/', '_blank')}
            >
              <div className="relative group mb-4 w-full max-w-[200px] md:max-w-[300px]">
                <div className="aspect-square overflow-hidden rounded-full shadow-xl">
                  <img
                    src="https://res.cloudinary.com/dqudvximt/image/upload/v1757828688/1679197646322_n1svjq.jpg"
                    alt="Thiyaga B"
                    className="w-full h-full object-cover"
                  />
                </div>
                <Linkedin 
                  className="absolute bottom-2 right-2 w-6 h-6 md:w-8 md:h-8 text-white bg-blue-700 rounded-full p-1 md:p-2 opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                />
              </div>
              <p className="text-lg md:text-2xl font-light text-zinc-900 mt-2">Thiyaga B</p>
              <p className="text-md md:text-lg text-zinc-500 italic">Founder</p>
              <a 
                href="https://www.linkedin.com/in/thiyagab/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm md:text-md text-zinc-500 hover:text-zinc-700 transition-colors mt-2"
              >
                View LinkedIn
              </a>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Our Members Section - Grid animation */}
      <motion.section 
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-32 bg-white"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="text-sm font-light tracking-widest uppercase text-zinc-400 mb-8 block">Community</span>
            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-extralight text-zinc-900 mb-12 leading-tight">
              Our <span className="italic font-light">Curators</span>
            </h2>
          </div>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 max-w-6xl mx-auto"
            variants={staggerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {volunteers.map((volunteer, index) => (
              <motion.div
                key={index}
                variants={childVariants}
                className="transform transition-all duration-700 hover:scale-105 cursor-pointer flex flex-col items-center text-center"
                onClick={() => window.open(volunteer.link, '_blank')}
              >
                <div className="relative group mb-2 w-full max-w-[120px] sm:max-w-[150px]">
                  <div className="aspect-square overflow-hidden rounded-full shadow-md w-full">
                    <img
                      src={volunteer.photo}
                      alt={volunteer.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Linkedin 
                    className="absolute bottom-1 right-1 w-4 h-4 sm:w-5 sm:h-5 text-white bg-blue-700 rounded-full p-0.5 sm:p-1 opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                  />
                </div>
                <p className="text-xs sm:text-sm font-light text-zinc-900 mt-1 line-clamp-2">{volunteer.name}</p>
                {volunteer.position && (
                  <p className="text-xs text-zinc-500 italic">{volunteer.position}</p>
                )}
                <a 
                  href={volunteer.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-zinc-500 hover:text-zinc-700 transition-colors mt-1 hidden sm:block"
                >
                  View LinkedIn
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Contact Section - Fade in */}
      <motion.section 
        id="contact"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-32 bg-zinc-900 text-zinc-50"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-sm font-light tracking-widest uppercase text-zinc-400 mb-8 block">CodeSapiens</span>
              <h2 className="text-4xl lg:text-5xl font-extralight tracking-wide mb-8">
                Building  <span className="italic">Community</span> since
              </h2>
              <div className="text-6xl lg:text-7xl font-extralight text-zinc-400 mb-12">©2017</div>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              {/* Social Media - Updated real links */}
              <div className="space-y-6 mx-auto">
                <h3 className="text-xl font-light tracking-wide mb-6">Follow</h3>
                <div className="space-y-4">
                  {[
                    { icon: Instagram, href: "https://www.instagram.com/codesapiens.in/", label: "Instagram" },
                    { icon: Linkedin, href: "https://www.linkedin.com/company/codesapiens-community/posts/", label: "LinkedIn" },
                    { icon: Twitter, href: "https://x.com/codesapiens_in", label: "Twitter" },
                    { icon: Youtube, href: "https://youtube.com/@codesapiens-in?si=90EaPMYHcSZIHtMi", label: "Youtube" },
                    { icon: Github, href: "https://github.com/Codesapiens-in", label: "Github" }
                  ].map((social, index) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={index}
                        href={social.href}
                        className="flex items-center space-x-3 text-sm font-light text-zinc-300 hover:text-zinc-50 transition-colors duration-300"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{social.label}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-16 mt-16 border-t border-zinc-800">
              <p className="text-xs font-light text-zinc-500 tracking-wider">
                © 2025 CodeSapiens. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default CodeSapiensHero;