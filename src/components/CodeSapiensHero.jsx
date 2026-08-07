import React from "react";
import CountUp from "react-countup";

import {
BarChart,
Bar,
XAxis,
YAxis,
Tooltip,
ResponsiveContainer,
PieChart,
Pie,
Cell,
Legend
} from "recharts";



/* ================= STATS SECTION ================= */

const StatsSection = () => {

const collegeData = [
{ name: "SSN", students: 320 },
{ name: "VIT", students: 280 },
{ name: "SRM", students: 240 },
{ name: "MIT", students: 200 },
{ name: "Others", students: 960 }
];

const pieData = [
{ name: "SSN", value: 320 },
{ name: "VIT", value: 280 },
{ name: "SRM", value: 240 },
{ name: "MIT", value: 200 },
{ name: "Others", value: 960 }
];

const COLORS = [
"#7C3AED",
"#A855F7",
"#C084FC",
"#DDD6FE",
"#4C1D95"
];

return (

<section style={statsSection}>

<div style={statsTitleBox}>
<h2 style={statsTitle}>Community Impact</h2>
<p style={statsSubtitle}>
CodeSapiens is growing across colleges and communities
</p>
</div>


<div style={statsGrid}>

<div style={statCard}>
<h1 style={statNumber}>
<CountUp end={2000} duration={3}/>+
</h1>
<p style={statText}>Total Members</p>
</div>

<div style={statCard}>
<h1 style={statNumber}>
<CountUp end={50} duration={3}/>+
</h1>
<p style={statText}>Colleges Reached</p>
</div>

<div style={statCard}>
<h1 style={statNumber}>
<CountUp end={15} duration={3}/>+
</h1>
<p style={statText}>Events Hosted</p>
</div>

</div>


<div style={chartsContainer}>

<div style={chartBox}>

<ResponsiveContainer width="100%" height="100%">
<BarChart data={collegeData}>
<XAxis dataKey="name" stroke="#E5E7EB"/>
<YAxis stroke="#E5E7EB"/>
<Tooltip/>
<Bar dataKey="students" fill="#7C3AED"/>
</BarChart>
</ResponsiveContainer>

</div>


<div style={chartBox}>

<ResponsiveContainer width="100%" height="100%">
<PieChart>

<Pie
data={pieData}
dataKey="value"
nameKey="name"
cx="50%"
cy="50%"
outerRadius={120}
innerRadius={70}
label
>

{pieData.map((entry,index)=>(
<Cell key={index} fill={COLORS[index % COLORS.length]}/>
))}

</Pie>

<Tooltip/>
<Legend/>

</PieChart>
</ResponsiveContainer>

</div>

</div>

</section>

);
};



/* ================= MAIN COMPONENT ================= */

function CodeSapiensHero(){

return(

<div
  style={{
    minHeight: "100vh",
    color: "#E5E7EB",
    background: "linear-gradient(270deg,#0A0A0A,#3b0066,#7C3AED,#1a0033)",
    backgroundSize: "600% 600%",
    animation: "gradientMove 12s ease infinite",
    position: "relative",
    overflow: "hidden"
  }}
>
{/* FLOATING SHAPES */}

<div className="floating-shapes">
  <span></span>
  <span></span>
  <span></span>
  <span></span>
  <span></span>
  <span></span>
  <span></span>
  <span></span>
</div>

{/* NAVBAR */}

<nav style={navStyle}>

<div style={logoSection}>
<img src="/logo.jpg" alt="logo" style={logoStyle}/>
<span style={titleStyle}>CodeSapiens</span>
</div>

<div style={menuSection}>
<a href="#" style={linkStyle}>Vision</a>
<a href="#" style={linkStyle}>Programs</a>
<a href="#" style={linkStyle}>Events</a>
<a href="#" style={linkStyle}>Community</a>
</div>

<div style={rightSection}>
<button style={loginStyle}>Login</button>
<button style={buttonStyle}>Get Started</button>
</div>

</nav>



{/* HERO */}

<section style={heroSection}>


<h1 style={heroTitle}>CodeSapiens</h1>

<h3>The biggest student-run tech community in Tamil Nadu</h3>

<p style={heroSubtitle}>
A student-powered developer community where programmers,
innovators and builders collaborate and grow together.
</p>

<p style={{fontStyle:"italic",color:"#C084FC"}}>
“Perusa Pannanum, but enna Pannanum Therla”
</p>

<p style={{color:"#6B7280"}}>
("Want to do something big, but don't know what to do")
</p>

<div style={heroButtons}>

<button style={heroPrimaryBtn}>
Join Community 🚀
</button>

<button style={heroSecondaryBtn}>
Explore Events
</button>

</div>

</section>



{/* FEATURES */}

<section style={featuresSection}>

<h2 style={featuresTitle}>What We Do</h2>

<div style={featuresGrid}>

<div style={featureCard}>
<img src="https://cdn-icons-png.flaticon.com/512/2721/2721297.png" style={featureImage}/>
<h3 style={featureHeading}>Workshops</h3>
<p style={featureText}>Hands-on coding workshops.</p>
</div>

<div style={featureCard}>
<img src="https://cdn-icons-png.flaticon.com/512/1055/1055687.png" style={featureImage}/>
<h3 style={featureHeading}>Hackathons</h3>
<p style={featureText}>Build innovative projects.</p>
</div>

<div style={featureCard}>
<img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" style={featureImage}/>
<h3 style={featureHeading}>Mentorship</h3>
<p style={featureText}>Guidance from experienced developers.</p>
</div>

<div style={featureCard}>
<img src="https://cdn-icons-png.flaticon.com/512/681/681494.png" style={featureImage}/>
<h3 style={featureHeading}>Community</h3>
<p style={featureText}>Connect with developers.</p>
</div>

</div>

</section>



{/* STATS */}

<StatsSection/>




{/* EVENTS */}

<section style={eventsSection}>

<h2 style={eventsTitle}>Community Events</h2>

<p style={eventsSubtitle}>
Meetups, hackathons and workshops conducted by CodeSapiens.
</p>

<div style={eventsGrid}>

<div style={eventCard}>
<img src="https://images.unsplash.com/photo-1518770660439-4636190af475" style={eventImage}/>
<h3 style={eventHeading}>AI Workshop</h3>
<p style={eventText}>Hands-on session on AI applications.</p>
<span style={eventDate}>March 2025</span>
</div>

<div style={eventCard}>
<img src="https://images.unsplash.com/photo-1531482615713-2afd69097998" style={eventImage}/>
<h3 style={eventHeading}>Hackathon</h3>
<p style={eventText}>24-hour coding competition.</p>
<span style={eventDate}>April 2025</span>
</div>

<div style={eventCard}>
<img src="https://images.unsplash.com/photo-1556761175-b413da4baf72" style={eventImage}/>
<h3 style={eventHeading}>Developer Meetup</h3>
<p style={eventText}>Networking and collaboration.</p>
<span style={eventDate}>May 2025</span>
</div>

</div>

</section>




{/* SPONSORS */}

<section style={sponsorsSection}>

<h2 style={sponsorsTitle}>Our Sponsors</h2>

<p style={sponsorsSubtitle}>
Organizations supporting the CodeSapiens community
</p>

<div style={sponsorsGrid}>

<div style={sponsorCard}>
<img
src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png"
style={sponsorLogo}
/>
<p style={sponsorName}>Notion</p>
</div>

<div style={sponsorCard}>
<img
src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
style={sponsorLogo}
/>
<p style={sponsorName}>GitHub</p>
</div>

<div style={sponsorCard}>
<img
src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg"
style={sponsorLogo}
/>
<p style={sponsorName}>Google</p>
</div>

<div style={sponsorCard}>
<img
src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
style={sponsorLogo}
/>
<p style={sponsorName}>Microsoft</p>
</div>

</div>

</section>

{/* PARTNERS */}

<section style={partnersSection}>

  <h2 style={partnersTitle}>
    Community Partners
  </h2>

  <p style={partnersSubtitle}>
    Organizations collaborating with CodeSapiens
  </p>

  <div style={partnersGrid}>

    {/* NOTION */}
    <div style={partnerCard}>
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png"
        alt="Notion"
        style={partnerLogo}
      />
      <p style={partnerName}>Notion</p>
    </div>


    {/* CONTENTSTACK */}
    <div style={partnerCard}>
      <img
        src="https://cdn.worldvectorlogo.com/logos/contentstack.svg"
        alt="Contentstack"
        style={partnerLogo}
      />
      <p style={partnerName}>Contentstack</p>
    </div>


    {/* AWS */}
    <div style={partnerCard}>
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg"
        alt="AWS"
        style={partnerLogo}
      />
      <p style={partnerName}>AWS</p>
    </div>


    {/* GOOGLE DEVELOPERS */}
    <div style={partnerCard}>
      <img
        src="https://developers.google.com/static/community/images/gdg-logo.png"
        alt="Google Developers"
        style={partnerLogo}
      />
      <p style={partnerName}>Google Developers</p>
    </div>


    {/* GITHUB */}
    <div style={partnerCard}>
      <img
        src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
        alt="GitHub"
        style={partnerLogo}
      />
      <p style={partnerName}>GitHub</p>
    </div>


    {/* MICROSOFT */}
    <div style={partnerCard}>
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
        alt="Microsoft"
        style={partnerLogo}
      />
      <p style={partnerName}>Microsoft</p>
    </div>

  </div>

</section>

{/* SOCIAL LINKS */}

<section style={socialSection}>

  <h2 style={socialTitle}>
    Social <span style={{color:"#C084FC"}}>Links</span>
  </h2>

  <p style={socialSubtitle}>
    Connect with the CodeSapiens community
  </p>

  <div style={socialGrid}>

    {/* Instagram */}
    <a href="#" style={socialCard}>
      <img
        src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png"
        style={socialIcon}
      />
      <span style={socialHandle}>@codesapiens.in</span>
    </a>

    {/* LinkedIn */}
    <a href="#" style={socialCard}>
      <img
        src="https://cdn-icons-png.flaticon.com/512/3536/3536505.png"
        style={socialIcon}
      />
      <span style={socialHandle}>CodeSapiens</span>
    </a>

    {/* Discord */}
    <a href="#" style={socialCard}>
      <img
        src="https://cdn-icons-png.flaticon.com/512/2111/2111370.png"
        style={socialIcon}
      />
      <span style={socialHandle}>Discord Community</span>
    </a>

    {/* GitHub */}
    <a href="#" style={socialCard}>
      <img
        src="https://cdn-icons-png.flaticon.com/512/733/733553.png"
        style={socialIcon}
      />
      <span style={socialHandle}>codesapiens</span>
    </a>

    {/* YouTube */}
    <a href="#" style={socialCard}>
      <img
        src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png"
        style={socialIcon}
      />
      <span style={socialHandle}>CodeSapiens</span>
    </a>

    {/* Twitter / X */}
    <a href="#" style={socialCard}>
      <img
        src="https://cdn-icons-png.flaticon.com/512/733/733579.png"
        style={socialIcon}
      />
      <span style={socialHandle}>@codesapiens_in</span>
    </a>

    {/* WhatsApp */}
    <a href="#" style={socialCard}>
      <img
        src="https://cdn-icons-png.flaticon.com/512/733/733585.png"
        style={socialIcon}
      />
      <span style={socialHandle}>WhatsApp Community</span>
    </a>

    {/* Events / Luma */}
    <a href="#" style={socialCard}>
      <img
        src="https://cdn-icons-png.flaticon.com/512/3659/3659898.png"
        style={socialIcon}
      />
      <span style={socialHandle}>Events & Meetups</span>
    </a>

  </div>

</section>

{/* TEAM SECTION */}

<section style={teamSection}>

  <p style={teamTag}>COMMUNITY</p>

  <h2 style={teamTitle}>The Mafia Gang</h2>

  <p style={teamSubtitle}>
    Meet the core members who run the community.
  </p>

  <div style={teamGrid}>

    <TeamMember name="Member 1" seed="1" />
    <TeamMember name="Member 2" seed="2" />
    <TeamMember name="Member 3" seed="3" />
    <TeamMember name="Member 4" seed="4" />
    <TeamMember name="Member 5" seed="5" />
    <TeamMember name="Member 6" seed="6" />
    <TeamMember name="Member 7" seed="7" />
    <TeamMember name="Member 8" seed="8" />
    <TeamMember name="Member 9" seed="9" />
    <TeamMember name="Member 10" seed="10" />
    <TeamMember name="Member 11" seed="11" />

  </div>

</section>

{/* CTA SECTION */}

<section style={ctaSection}>

  <h2 style={ctaTitle}>
    Ready to Build Something Big?
  </h2>

  <p style={ctaSubtitle}>
    Join CodeSapiens and connect with developers, innovators, and creators across colleges.
  </p>

  <div style={ctaButtons}>

    <button style={ctaPrimary}>
      Join Community 🚀
    </button>

    <button style={ctaSecondary}>
      Explore Events
    </button>

  </div>

</section>

{/* FOOTER */}

<footer style={footerSection}>

  <div style={footerContainer}>

    {/* LEFT SIDE */}

    <div style={footerLeft}>

      <div style={footerLogoBox}>
        <img src="/logo.jpg" style={footerLogo} alt="logo"/>
        <h3 style={footerTitle}>CodeSapiens</h3>
      </div>

      <p style={footerDescription}>
        A student-run tech community helping developers learn,
        build and grow together.
      </p>

    </div>


    {/* QUICK LINKS */}

    <div>

      <h4 style={footerHeading}>Quick Links</h4>

      <ul style={footerList}>
        <li><a href="#" style={footerLink}>Vision</a></li>
        <li><a href="#" style={footerLink}>Programs</a></li>
        <li><a href="#" style={footerLink}>Events</a></li>
        <li><a href="#" style={footerLink}>Community</a></li>
      </ul>

    </div>


    {/* SOCIAL MEDIA */}

    <div>

      <h4 style={footerHeading}>Follow Us</h4>

      <div style={footerSocial}>

        <a href="#">
          <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" style={footerIcon}/>
        </a>

        <a href="#">
          <img src="https://cdn-icons-png.flaticon.com/512/3536/3536505.png" style={footerIcon}/>
        </a>

        <a href="#">
          <img src="https://cdn-icons-png.flaticon.com/512/733/733553.png" style={footerIcon}/>
        </a>

        <a href="#">
          <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" style={footerIcon}/>
        </a>

      </div>

    </div>

  </div>


  {/* COPYRIGHT */}

  <div style={footerBottom}>
    © {new Date().getFullYear()} CodeSapiens Community. All rights reserved.
  </div>

</footer>

</div>

);

}



/* ================= STYLES ================= */

const navStyle={
display:"flex",
justifyContent:"space-between",
padding:"18px 60px"
};

const logoSection={display:"flex",alignItems:"center",gap:"10px"};

const logoStyle={width:"42px",borderRadius:"50%"};

const titleStyle={fontSize:"22px",color:"#A855F7"};

const menuSection={display:"flex",gap:"32px"};

const rightSection={display:"flex",gap:"16px"};

const linkStyle={color:"#E5E7EB",textDecoration:"none"};

const loginStyle={background:"transparent",border:"none",color:"#E5E7EB"};

const buttonStyle={border:"1px solid #7C3AED",padding:"8px 18px",background:"transparent",color:"#C084FC"};

const heroSection={textAlign:"center",padding:"80px 20px"};

const heroTitle={fontSize:"72px",color:"#C084FC"};

const heroSubtitle={color:"#9CA3AF"};

const heroButtons={display:"flex",justifyContent:"center",gap:"20px"};

const heroPrimaryBtn={background:"#7C3AED",padding:"14px 28px",color:"white"};

const heroSecondaryBtn={border:"1px solid #A855F7",padding:"14px 28px",color:"#A855F7",background:"transparent"};

const featuresSection={padding:"100px 60px",textAlign:"center"};

const featuresTitle={fontSize:"40px",color:"#C084FC"};

const featuresGrid={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:"40px"};

const featureCard={background:"#111",padding:"30px",border:"1px solid #7C3AED"};

const featureImage={width:"60px"};

const featureHeading={color:"#A855F7"};

const featureText={color:"#9CA3AF"};

const statsSection={padding:"120px 20px"};

const statsTitleBox={textAlign:"center"};

const statsTitle={fontSize:"42px",color:"#C084FC"};

const statsSubtitle={color:"#9CA3AF"};

const statsGrid={display:"flex",justifyContent:"center",gap:"40px"};

const statCard={background:"#111",padding:"40px",border:"1px solid #7C3AED"};

const statNumber={fontSize:"48px",color:"#C084FC"};

const statText={color:"#9CA3AF"};

const chartsContainer={display:"flex",justifyContent:"center",gap:"80px"};

const chartBox={width:"400px",height:"350px"};

const eventsSection={padding:"120px 40px",textAlign:"center"};

const eventsTitle={fontSize:"42px",color:"#C084FC"};

const eventsSubtitle={color:"#9CA3AF"};

const eventsGrid={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:"40px"};

const eventCard={background:"#111",border:"1px solid #7C3AED"};

const eventImage={width:"100%",height:"200px",objectFit:"cover"};

const eventHeading={color:"#C084FC"};

const eventText={color:"#9CA3AF"};

const eventDate={color:"#A855F7"};

const sponsorsSection={padding:"120px 40px",textAlign:"center"};

const sponsorsTitle={fontSize:"42px",color:"#C084FC"};

const sponsorsSubtitle={color:"#9CA3AF"};

const sponsorsGrid={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"40px"};

const sponsorCard={
background:"#111",
padding:"40px",
border:"1px solid #7C3AED",
display:"flex",
flexDirection:"column",
alignItems:"center",
gap:"15px"
};

const sponsorLogo={width:"100px",height:"80px",objectFit:"contain"};

const sponsorName={color:"#C084FC"};

const partnersSection = {
  padding: "120px 40px",
  textAlign: "center",
  background: "#0A0A0A"
};

const partnersTitle = {
  fontSize: "42px",
  color: "#C084FC",
  marginBottom: "10px"
};

const partnersSubtitle = {
  color: "#9CA3AF",
  marginBottom: "60px"
};

const partnersGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))",
  gap: "40px"
};

const partnerCard = {
  background: "#111",
  padding: "40px",
  borderRadius: "12px",
  border: "1px solid #7C3AED",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "20px"
};

const partnerLogo = {
  width: "140px",
  height: "80px",
  objectFit: "contain"
};

const partnerName = {
  color: "#C084FC",
  fontWeight: "600",
  fontSize: "18px"
};

const socialSection = {
  padding: "120px 40px",
  background: "#0A0A0A",
  textAlign: "center"
};

const socialTitle = {
  fontSize: "42px",
  marginBottom: "10px",
  color: "#E5E7EB"
};

const socialSubtitle = {
  color: "#9CA3AF",
  marginBottom: "60px"
};

const socialGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px,1fr))",
  gap: "40px"
};

const socialCard = {
  background: "#111",
  border: "1px solid #7C3AED",
  borderRadius: "14px",
  padding: "40px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "20px",
  textDecoration: "none",
  transition: "0.3s"
};

const socialIcon = {
  width: "70px",
  height: "70px",
  objectFit: "contain"
};

const socialHandle = {
  color: "#C084FC",
  fontWeight: "600"
};

function TeamMember({ name, role, seed }) {

  const avatar =
    `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${seed}`;

  return (
    <div style={teamMember}>
      <img src={avatar} style={teamImage} alt={name} />
      <h3 style={teamName}>{name}</h3>
      {role && <p style={teamRole}>{role}</p>}
    </div>
  );
}

const teamSection = {
  padding: "120px 40px",
  textAlign: "center",
  background: "#0A0A0A"
};

const teamTag = {
  color: "#3B82F6",
  fontWeight: "600",
  letterSpacing: "2px"
};

const teamTitle = {
  fontSize: "48px",
  marginTop: "10px",
  marginBottom: "10px"
};

const teamSubtitle = {
  color: "#9CA3AF",
  marginBottom: "80px"
};

const teamGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))",
  gap: "50px"
};

const teamMember = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "10px"
};

const teamImage = {
  width: "130px",
  height: "130px",
  borderRadius: "50%",
  border: "4px solid #7C3AED",
  background: "#fff"
};

const teamName = {
  fontSize: "16px",
  fontWeight: "600"
};

const teamRole = {
  color: "#F97316",
  fontSize: "12px",
  letterSpacing: "2px"
};

const ctaSection = {
  padding: "120px 40px",
  textAlign: "center",
  background: "linear-gradient(135deg,#0A0A0A,#1a0033)"
};

const ctaTitle = {
  fontSize: "48px",
  color: "#C084FC",
  marginBottom: "20px"
};

const ctaSubtitle = {
  color: "#9CA3AF",
  fontSize: "18px",
  marginBottom: "40px",
  maxWidth: "700px",
  marginLeft: "auto",
  marginRight: "auto"
};

const ctaButtons = {
  display: "flex",
  justifyContent: "center",
  gap: "20px",
  flexWrap: "wrap"
};

const ctaPrimary = {
  background: "#7C3AED",
  color: "white",
  padding: "16px 32px",
  borderRadius: "8px",
  border: "none",
  fontSize: "16px",
  fontWeight: "600",
  cursor: "pointer"
};

const ctaSecondary = {
  background: "transparent",
  border: "1px solid #7C3AED",
  color: "#C084FC",
  padding: "16px 32px",
  borderRadius: "8px",
  fontSize: "16px",
  fontWeight: "600",
  cursor: "pointer"
};

const footerSection = {
  background: "#050505",
  paddingTop: "80px",
  borderTop: "1px solid #1F2937"
};

const footerContainer = {
  maxWidth: "1200px",
  margin: "auto",
  padding: "0 40px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px,1fr))",
  gap: "40px",
  marginBottom: "40px"
};

const footerLeft = {
  display: "flex",
  flexDirection: "column",
  gap: "15px"
};

const footerLogoBox = {
  display: "flex",
  alignItems: "center",
  gap: "10px"
};

const footerLogo = {
  width: "40px",
  borderRadius: "50%"
};

const footerTitle = {
  color: "#C084FC"
};

const footerDescription = {
  color: "#9CA3AF",
  fontSize: "14px"
};

const footerHeading = {
  color: "#E5E7EB",
  marginBottom: "15px"
};

const footerList = {
  listStyle: "none",
  padding: 0,
  display: "flex",
  flexDirection: "column",
  gap: "10px"
};

const footerLink = {
  color: "#9CA3AF",
  textDecoration: "none",
  fontSize: "14px"
};

const footerSocial = {
  display: "flex",
  gap: "15px"
};

const footerIcon = {
  width: "28px",
  height: "28px"
};

const footerBottom = {
  textAlign: "center",
  padding: "20px",
  borderTop: "1px solid #1F2937",
  color: "#6B7280",
  fontSize: "14px"
};




export default CodeSapiensHero;