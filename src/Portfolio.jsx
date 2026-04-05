import { useState, useEffect, useRef, useCallback } from "react";

function useEmailJS() {
  useEffect(() => {
    if (document.getElementById("ejs")) return;
    const s = document.createElement("script");
    s.id = "ejs";
    s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    s.onload = () => window.emailjs?.init({ publicKey: "Gpcd8rwqRtpdhpw0V" });
    document.head.appendChild(s);
  }, []);
}

function useFonts() {
  useEffect(() => {
    if (document.getElementById("pf")) return;
    const l = document.createElement("link");
    l.id = "pf"; l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Mono:wght@300;400&display=swap";
    document.head.appendChild(l);
  }, []);
}

function useMagnetic(strength = 0.35) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const onMove = useCallback((e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setPos({ x: (e.clientX - r.left - r.width / 2) * strength, y: (e.clientY - r.top - r.height / 2) * strength });
  }, [strength]);
  const onLeave = useCallback(() => setPos({ x: 0, y: 0 }), []);
  return { ref, pos, onMove, onLeave };
}

function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const rp = useRef({ x: 0, y: 0 });
  const raf = useRef(null);
  useEffect(() => {
    const move = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (dot.current) dot.current.style.transform = `translate(${e.clientX - 4}px,${e.clientY - 4}px)`;
    };
    const loop = () => {
      rp.current.x += (mouse.current.x - rp.current.x) * 0.11;
      rp.current.y += (mouse.current.y - rp.current.y) * 0.11;
      if (ring.current) ring.current.style.transform = `translate(${rp.current.x - 20}px,${rp.current.y - 20}px)`;
      raf.current = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", move);
    raf.current = requestAnimationFrame(loop);
    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(raf.current); };
  }, []);
  return (
    <>
      <div ref={dot} style={{ position:"fixed",top:0,left:0,width:8,height:8,background:"#111",borderRadius:"50%",pointerEvents:"none",zIndex:9999,mixBlendMode:"difference" }} />
      <div ref={ring} style={{ position:"fixed",top:0,left:0,width:40,height:40,border:"1.5px solid rgba(0,0,0,0.2)",borderRadius:"50%",pointerEvents:"none",zIndex:9998 }} />
    </>
  );
}

function Particles() {
  const canvas = useRef(null);
  useEffect(() => {
    const c = canvas.current; if (!c) return;
    const ctx = c.getContext("2d");
    const resize = () => { c.width = c.offsetWidth; c.height = c.offsetHeight; };
    resize(); window.addEventListener("resize", resize);
    const pts = Array.from({ length: 24 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.5 + 0.5, a: Math.random() * 0.5 + 0.1
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = c.width; if (p.x > c.width) p.x = 0;
        if (p.y < 0) p.y = c.height; if (p.y > c.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(155,145,130,${p.a})`; ctx.fill();
      });
      pts.forEach((p, i) => pts.slice(i+1).forEach(q => {
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 90) { ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.strokeStyle = `rgba(155,145,130,${(1-d/90)*0.1})`; ctx.lineWidth=0.5; ctx.stroke(); }
      }));
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(raf); };
  }, []);
  return <canvas ref={canvas} style={{ position:"fixed",inset:0,width:"100%",height:"100%",pointerEvents:"none",zIndex:0 }} />;
}

function TiltCard({ children, style = {} }) {
  const ref = useRef(null);
  const [t, setT] = useState({ rx:0, ry:0, gx:50, gy:50, scale:1 });
  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect(); if (!r) return;
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    setT({ rx:(y-0.5)*-18, ry:(x-0.5)*18, gx:x*100, gy:y*100, scale:1.04 });
  };
  const onLeave = () => setT({ rx:0, ry:0, gx:50, gy:50, scale:1 });
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ ...style, transform:`perspective(600px) rotateX(${t.rx}deg) rotateY(${t.ry}deg) scale(${t.scale})`, transition:"transform 0.4s cubic-bezier(.22,1,.36,1)", transformStyle:"preserve-3d", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute",inset:0,background:`radial-gradient(circle at ${t.gx}% ${t.gy}%, rgba(255,255,255,0.28) 0%, transparent 65%)`, pointerEvents:"none",zIndex:1,borderRadius:"inherit" }} />
      <div style={{ position:"relative",zIndex:2 }}>{children}</div>
    </div>
  );
}

function Reveal({ children, delay=0, y=28 }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold:0.05 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity:vis?1:0, transform:vis?`translateY(0)`:`translateY(${y}px)`, transition:`opacity 0.75s ease ${delay}ms, transform 0.75s cubic-bezier(.22,1,.36,1) ${delay}ms` }}>
      {children}
    </div>
  );
}

function Counter({ to, suffix="" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; obs.disconnect();
      const target = parseInt(to)||0, dur=1800, step=16;
      const inc = target/(dur/step); let cur=0;
      const id = setInterval(() => { cur=Math.min(cur+inc,target); setVal(Math.floor(cur)); if(cur>=target)clearInterval(id); }, step);
    },{ threshold:0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  },[to]);
  return <span ref={ref}>{val}{suffix}</span>;
}

const NAV = [
  { id:"inicio", label:"Inicio" },
  { id:"servicios", label:"Servicios" },
  { id:"sobre-mi", label:"Sobre mí" },
  { id:"contacto", label:"Contacto" },
];

const SERVICES_EMPRESA = [
  { n:"01", title:"Web corporativa", desc:"Presencia digital profesional que genera confianza y capta clientes B2B", price:"1.500 – 5.000 €" },
  { n:"02", title:"Aplicación web a medida", desc:"Panel de gestión, CRM, intranet o herramienta interna para tu equipo", price:"3.000 – 12.000 €" },
  { n:"03", title:"Landing page de campaña", desc:"Página de conversión optimizada para publicidad o lanzamiento de producto", price:"600 – 1.800 €" },
  { n:"04", title:"E-commerce B2B / tienda empresa", desc:"Catálogo online, pedidos mayoristas o tienda multi-perfil con gestión", price:"2.000 – 6.000 €" },
  { n:"05", title:"Rediseño y optimización", desc:"Modernización de web existente con mejoras de rendimiento y conversión", price:"1.200 – 4.000 €" },
  { n:"06", title:"Mantenimiento mensual", desc:"Soporte técnico, actualizaciones, seguridad y mejoras continuas", price:"150 – 400 €/mes" },
];
const SERVICES_PARTICULAR = [
  { n:"07", title:"Portfolio para artistas", desc:"Espacio digital único para que tu obra hable sola", price:"350 – 700 €" },
  { n:"08", title:"Web para autónomos", desc:"Presencia profesional rápida y sin complicaciones", price:"400 – 900 €" },
  { n:"09", title:"Tienda online pequeña", desc:"E-commerce funcional y atractivo para empezar a vender", price:"900 – 2.000 €" },
];
const TAGS = ["HTML / CSS","JavaScript","React","Node.js","WordPress","Figma","E-commerce","SEO","B2B","UI/UX"];

function TopNav({ active, navigate }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const el = document.getElementById("main-scroll");
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 20);
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 clamp(24px, 5vw, 80px)",
      height: 64,
      background: scrolled ? "rgba(248,247,245,0.92)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      transition: "background 0.4s, backdrop-filter 0.4s",
    }}>
      {/* Logo */}
      <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"default" }}
        onClick={() => navigate("inicio")}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "linear-gradient(135deg,#e8e4dc,#ccc9c0)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 600, color: "#6b6a67",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.65)",
          cursor: "pointer",
          transition: "transform 0.4s cubic-bezier(.22,1,.36,1)"
        }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.12) rotate(-5deg)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1) rotate(0deg)"}>
          AS
        </div>
        <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize: 14, fontWeight: 600, color: "#111" }}>Antonio Sánchez</span>
      </div>

      {/* Nav links */}
      <nav style={{ display: "flex", gap: 4 }}>
        {NAV.map(n => {
          const isActive = active === n.id;
          return (
            <button key={n.id} onClick={() => navigate(n.id)}
              style={{
                fontFamily: "'DM Sans',sans-serif", fontSize: 14,
                fontWeight: isActive ? 500 : 400,
                color: isActive ? "#111" : "#9a9995",
                background: isActive ? "rgba(0,0,0,0.06)" : "transparent",
                border: "none", cursor: "pointer",
                padding: "7px 16px", borderRadius: 8,
                transition: "all 0.3s cubic-bezier(.22,1,.36,1)",
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = "#555"; e.currentTarget.style.background = "rgba(0,0,0,0.04)"; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = "#9a9995"; e.currentTarget.style.background = "transparent"; } }}>
              {n.label}
            </button>
          );
        })}
      </nav>

      {/* CTA */}
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#eef6f0", border:"1px solid #d4ead9", padding:"4px 12px 4px 10px", borderRadius:999, fontSize:12, color:"#2d6a3f", fontFamily:"'DM Sans',sans-serif" }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"#2d6a3f", animation:"pulseGreen 2s ease-in-out infinite", display:"inline-block" }} />
          Disponible
        </div>
        <button onClick={() => navigate("contacto")}
          style={{
            fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500,
            background: "#111", color: "#fff", border: "none",
            padding: "8px 18px", borderRadius: 8, cursor: "pointer",
            transition: "all 0.3s", boxShadow: "0 2px 8px rgba(0,0,0,0.14)"
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#1a1a1a"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 5px 16px rgba(0,0,0,0.22)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#111"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.14)"; }}>
          Presupuesto →
        </button>
      </div>
    </header>
  );
}

function Inicio({ setActive }) {
  const [hov, setHov] = useState(null);
  const mag = useMagnetic(0.4);
  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", display:"flex", flexDirection:"column", alignItems:"center", width:"100%", maxWidth:720, position:"relative", zIndex:1, textAlign:"center" }}>
      <Reveal delay={0}>
        <p style={{ fontFamily:"'DM Mono',monospace", fontSize:12, letterSpacing:"0.22em", color:"#b0afa9", textTransform:"uppercase", marginBottom:28 }}>✦ Disponible para proyectos</p>
      </Reveal>
      <Reveal delay={100}>
        <h1 style={{ fontSize:"clamp(2.6rem,5vw,4.2rem)", fontWeight:300, lineHeight:1.08, letterSpacing:"-2.5px", color:"#111", marginBottom:24 }}>
          Webs que{" "}
          <span style={{ fontWeight:600, position:"relative", display:"inline-block" }}>
            funcionan
            <svg style={{ position:"absolute", bottom:-5, left:0, width:"100%", overflow:"visible" }} height="6" viewBox="0 0 100 6">
              <path d="M0 5 Q25 0 50 5 Q75 10 100 5" stroke="#111" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </span>{" "}
          <em style={{ fontStyle:"italic", color:"#b0afa9", fontWeight:300 }}>de verdad</em>
        </h1>
      </Reveal>
      <Reveal delay={200}>
        <p style={{ fontSize:16, color:"#6b6a67", lineHeight:1.85, marginBottom:28, maxWidth:520 }}>
          Diseño y desarrollo webs para <strong style={{ color:"#111", fontWeight:500 }}>empresas y negocios</strong> que quieren resultados reales — webs corporativas, aplicaciones a medida y e-commerce que convierten visitas en clientes.
        </p>
      </Reveal>
      <Reveal delay={300}>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:40, justifyContent:"center" }}>
          {TAGS.map((t) => (
            <span key={t} onMouseEnter={()=>setHov(t)} onMouseLeave={()=>setHov(null)}
              style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:hov===t?"#111":"#888",
                background:hov===t?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.55)",
                border:`1px solid ${hov===t?"#bbb":"#e5e5e3"}`,
                padding:"5px 14px", borderRadius:999, backdropFilter:"blur(4px)",
                transform:hov===t?"translateY(-3px) scale(1.08)":"none",
                transition:"all 0.3s cubic-bezier(.22,1,.36,1)", cursor:"default" }}>
              {t}
            </span>
          ))}
        </div>
      </Reveal>
      <Reveal delay={420}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:40, width:"100%" }}>
          {[{n:20,suf:"+",label:"Proyectos entregados"},{n:null,raw:"3–5d",label:"Entrega media"},{n:100,suf:"%",label:"Satisfacción cliente"}].map((s,i) => (
            <TiltCard key={i} style={{ background:"rgba(255,255,255,0.7)", border:"1px solid rgba(232,231,228,0.6)", borderRadius:16, padding:"22px 20px", backdropFilter:"blur(8px)" }}>
              <div style={{ fontSize:32, fontWeight:600, letterSpacing:"-1px", color:"#111", marginBottom:6 }}>
                {s.n!==null ? <Counter to={s.n} suffix={s.suf} /> : s.raw}
              </div>
              <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#b8b7b2", letterSpacing:"0.06em" }}>{s.label}</div>
            </TiltCard>
          ))}
        </div>
      </Reveal>
      <Reveal delay={540}>
        <div style={{ display:"flex", gap:12, alignItems:"center", flexWrap:"wrap", justifyContent:"center" }}>
          <div ref={mag.ref} onMouseMove={mag.onMove} onMouseLeave={mag.onLeave} style={{ display:"inline-block" }}>
            <button onClick={()=>setActive("contacto")}
              style={{ transform:`translate(${mag.pos.x}px,${mag.pos.y}px)`, transition:"transform 0.4s cubic-bezier(.22,1,.36,1)",
                display:"flex", alignItems:"center", gap:10, padding:"14px 28px", borderRadius:12, border:"none",
                background:"#111", color:"#fff", fontSize:16, fontWeight:500, cursor:"pointer",
                fontFamily:"'DM Sans',sans-serif", boxShadow:"0 4px 20px rgba(0,0,0,0.16)" }}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 8px 32px rgba(0,0,0,0.28)";e.currentTarget.style.background="#1a1a1a";}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 4px 20px rgba(0,0,0,0.16)";e.currentTarget.style.background="#111";}}>
              Hablemos <span style={{ display:"inline-block", transition:"transform 0.3s", fontSize:17 }}
                onMouseEnter={e=>e.currentTarget.style.transform="translateX(6px)"}
                onMouseLeave={e=>e.currentTarget.style.transform="translateX(0)"}>→</span>
            </button>
          </div>
          <button onClick={()=>setActive("servicios")}
            style={{ display:"flex", alignItems:"center", gap:8, padding:"14px 24px", borderRadius:12,
              border:"1px solid #e5e5e3", background:"transparent", color:"#555", fontSize:15, fontWeight:400,
              cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.3s" }}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.7)";e.currentTarget.style.color="#111";}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#555";}}>
            Ver servicios
          </button>
        </div>
      </Reveal>

      {/* Social links */}
      <Reveal delay={640}>
        <div style={{ display:"flex", gap:8, marginTop:36 }}>
          {[{label:"Discord",url:"https://discord.com/users/antoniosanchez"},{label:"GitHub",url:"https://github.com/00010-0"},{label:"Instagram",url:"https://www.instagram.com/antoniosanchezzgz/"}].map(s=>(
            <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
              style={{ padding:"7px 16px", fontSize:12, fontFamily:"'DM Mono',monospace", color:"#9a9995",
                background:"rgba(255,255,255,0.5)", border:"1px solid rgba(232,231,228,0.7)",
                borderRadius:8, textDecoration:"none", transition:"all 0.3s", backdropFilter:"blur(4px)" }}
              onMouseEnter={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.85)";e.currentTarget.style.color="#111";e.currentTarget.style.transform="translateY(-2px)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.5)";e.currentTarget.style.color="#9a9995";e.currentTarget.style.transform="none"; }}>
              {s.label}
            </a>
          ))}
        </div>
      </Reveal>
    </div>
  );
}

function ServiceRow({ s, i, hov, setHov }) {
  return (
    <Reveal key={s.n} delay={i*60}>
      <div onMouseEnter={()=>setHov(s.n)} onMouseLeave={()=>setHov(null)}
        style={{ display:"grid", gridTemplateColumns:"40px 1fr auto", alignItems:"center", gap:18,
          padding:"18px 0", paddingLeft:hov===s.n?14:0,
          borderBottom:"1px solid rgba(200,198,193,0.3)",
          transition:"padding 0.35s cubic-bezier(.22,1,.36,1)" }}>
        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:hov===s.n?"#111":"#c5c4c0", transition:"color 0.3s" }}>{s.n}</span>
        <div>
          <h3 style={{ fontSize:16, fontWeight:500, color:"#111", marginBottom:4 }}>{s.title}</h3>
          <p style={{ fontSize:13.5, color:"#a8a7a3", lineHeight:1.5 }}>{s.desc}</p>
        </div>
        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:13, color:hov===s.n?"#111":"#c5c4c0", whiteSpace:"nowrap", transition:"color 0.3s, transform 0.3s", transform:hov===s.n?"translateX(-5px)":"none", display:"inline-block" }}>{s.price}</span>
      </div>
    </Reveal>
  );
}

function Servicios({ setActive }) {
  const [hov, setHov] = useState(null);
  const [tab, setTab] = useState("empresa");
  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", width:"100%", maxWidth:780 }}>
      <Reveal><p style={{ fontFamily:"'DM Mono',monospace", fontSize:12, letterSpacing:"0.22em", color:"#b0afa9", textTransform:"uppercase", marginBottom:20, textAlign:"center" }}>✦ Servicios</p></Reveal>
      <Reveal delay={40}>
        <h2 style={{ fontSize:"clamp(1.8rem,3vw,2.6rem)", fontWeight:300, letterSpacing:"-1.5px", color:"#111", marginBottom:28, textAlign:"center" }}>¿Qué necesitas?</h2>
      </Reveal>
      <Reveal delay={60}>
        <div style={{ display:"flex", gap:6, marginBottom:28, padding:4, background:"rgba(245,244,241,0.8)", borderRadius:10, width:"fit-content", margin:"0 auto 28px" }}>
          {[{id:"empresa",label:"Para empresas ✦"},{id:"particular",label:"Particulares"}].map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{ padding:"8px 20px", borderRadius:8, border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:14,
                fontWeight:tab===t.id?500:400, background:tab===t.id?"#fff":"transparent", color:tab===t.id?"#111":"#9a9995",
                boxShadow:tab===t.id?"0 1px 4px rgba(0,0,0,0.08)":"none", transition:"all 0.35s cubic-bezier(.22,1,.36,1)" }}>
              {t.label}
            </button>
          ))}
        </div>
      </Reveal>
      {tab === "empresa" && (
        <div key="empresa">
          <Reveal delay={80}>
            <div style={{ marginBottom:16, padding:"14px 18px", background:"#111", borderRadius:10, display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:12, color:"rgba(255,255,255,0.5)", fontFamily:"'DM Mono',monospace", letterSpacing:"0.08em", flexShrink:0 }}>ENFOQUE PRINCIPAL</span>
              <span style={{ fontSize:13.5, color:"rgba(255,255,255,0.85)", lineHeight:1.5 }}>Trabajamos principalmente con empresas que necesitan presencia digital sólida, herramientas a medida y resultados medibles.</span>
            </div>
          </Reveal>
          <div style={{ borderTop:"1px solid rgba(200,198,193,0.3)" }}>
            {SERVICES_EMPRESA.map((s,i) => <ServiceRow key={s.n} s={s} i={i} hov={hov} setHov={setHov} />)}
          </div>
        </div>
      )}
      {tab === "particular" && (
        <div key="particular">
          <div style={{ borderTop:"1px solid rgba(200,198,193,0.3)" }}>
            {SERVICES_PARTICULAR.map((s,i) => <ServiceRow key={s.n} s={s} i={i} hov={hov} setHov={setHov} />)}
          </div>
        </div>
      )}
      <Reveal delay={500}>
        <div style={{ marginTop:20, padding:"16px 20px", background:"rgba(245,244,241,0.7)", borderRadius:12, backdropFilter:"blur(4px)" }}>
          <span style={{ fontSize:14, color:"#6b6a67", lineHeight:1.6 }}>
            ¿Tienes un proyecto específico en mente?{" "}
            <button onClick={()=>setActive("contacto")} style={{ color:"#111", fontWeight:500, background:"none", border:"none", cursor:"pointer", padding:0, textDecoration:"underline", textUnderlineOffset:3, fontFamily:"'DM Sans',sans-serif", fontSize:14 }}>
              Hablamos y te damos presupuesto sin compromiso →
            </button>
          </span>
        </div>
      </Reveal>
    </div>
  );
}

function SobreMi({ setActive }) {
  const items = [
    { label:"Formación", title:"Autodidacta", sub:"Aprendizaje continuo y práctico" },
    { label:"Experiencia", title:"1–2 años", sub:"Proyectos reales para clientes" },
    { label:"Estilo", title:"Cercano y directo", sub:"Hablas conmigo, no con una agencia" },
    { label:"Ubicación", title:"Madrid, España", sub:"Disponible en remoto" },
  ];
  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", width:"100%", maxWidth:680 }}>
      <Reveal><p style={{ fontFamily:"'DM Mono',monospace", fontSize:12, letterSpacing:"0.22em", color:"#b0afa9", textTransform:"uppercase", marginBottom:20, textAlign:"center" }}>✦ Sobre mí</p></Reveal>
      <Reveal delay={40}>
        <h2 style={{ fontSize:"clamp(1.8rem,3vw,2.6rem)", fontWeight:300, letterSpacing:"-1.5px", color:"#111", marginBottom:28, textAlign:"center" }}>La persona detrás del código</h2>
      </Reveal>
      <Reveal delay={80}>
        <div style={{ display:"flex", alignItems:"center", gap:18, marginBottom:28, justifyContent:"center" }}>
          <div style={{ width:64, height:64, borderRadius:"50%", background:"linear-gradient(135deg,#e8e4dc,#d0ccc4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:600, color:"#6b6a67", flexShrink:0, boxShadow:"inset 0 1px 0 rgba(255,255,255,0.6),0 2px 8px rgba(0,0,0,0.08)" }}>AS</div>
          <div>
            <p style={{ fontSize:17, fontWeight:600, color:"#111", marginBottom:2 }}>Antonio Sánchez</p>
            <p style={{ fontSize:13, color:"#a8a7a3" }}>Programador & Diseñador Web · Madrid</p>
          </div>
        </div>
      </Reveal>
      <Reveal delay={160}>
        <p style={{ fontSize:15.5, color:"#6b6a67", lineHeight:1.85, marginBottom:12 }}>
          Soy un desarrollador web autodidacta con 1–2 años de experiencia construyendo páginas que combinan{" "}
          <strong style={{ color:"#111", fontWeight:500 }}>diseño cuidado y código limpio</strong>. Aprendí por mi cuenta porque me apasiona crear cosas que funcionan y se ven bien.
        </p>
        <p style={{ fontSize:15.5, color:"#6b6a67", lineHeight:1.85, marginBottom:28 }}>
          Me especializo en webs para <strong style={{ color:"#111", fontWeight:500 }}>empresas que quieren resultados</strong> — webs corporativas, apps internas y e-commerce B2B. También trabajo con autónomos y artistas que necesitan presencia digital sin complicaciones.
        </p>
      </Reveal>
      <Reveal delay={260}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
          {items.map(it => (
            <TiltCard key={it.label} style={{ background:"rgba(255,255,255,0.65)", border:"1px solid rgba(232,231,228,0.6)", borderRadius:16, padding:"18px 20px", backdropFilter:"blur(8px)" }}>
              <p style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:"#b8b7b2", textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:6 }}>{it.label}</p>
              <p style={{ fontSize:15, fontWeight:500, color:"#111", marginBottom:2 }}>{it.title}</p>
              <p style={{ fontSize:13, color:"#a8a7a3" }}>{it.sub}</p>
            </TiltCard>
          ))}
        </div>
      </Reveal>
      <Reveal delay={380}>
        <div style={{ display:"flex", alignItems:"center", gap:12, padding:"16px 20px", background:"#eef6f0", border:"1px solid #d4ead9", borderRadius:12 }}>
          <span style={{ width:8, height:8, borderRadius:"50%", background:"#2d6a3f", flexShrink:0, animation:"pulseGreen 2s ease-in-out infinite", display:"inline-block" }} />
          <p style={{ fontSize:14, color:"#2d6a3f", lineHeight:1.6 }}>
            Actualmente disponible para nuevos proyectos.{" "}
            <button onClick={()=>setActive("contacto")} style={{ fontWeight:500, color:"#1a4d2c", background:"none", border:"none", cursor:"pointer", padding:0, textDecoration:"underline", textUnderlineOffset:3, fontFamily:"'DM Sans',sans-serif", fontSize:14 }}>Hablamos →</button>
          </p>
        </div>
      </Reveal>
    </div>
  );
}

function SuccessScreen({ name, onReset }) {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 50); return () => clearTimeout(t); }, []);
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:24, textAlign:"center", fontFamily:"'DM Sans',sans-serif",
      opacity:show?1:0, transform:show?"translateY(0)":"translateY(20px)", transition:"all 0.8s cubic-bezier(.22,1,.36,1)" }}>
      <div style={{ width:80, height:80, borderRadius:"50%", background:"#eef6f0", border:"1px solid #d4ead9", display:"flex", alignItems:"center", justifyContent:"center", animation:"bounceIn 0.9s cubic-bezier(.22,1,.36,1)" }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2d6a3f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div>
        <h2 style={{ fontSize:26, fontWeight:500, letterSpacing:"-0.5px", color:"#111", marginBottom:8 }}>¡Mensaje enviado{name ? `, ${name}` : ""}!</h2>
        <p style={{ fontSize:15, color:"#6b6a67", maxWidth:280, lineHeight:1.75, margin:"0 auto" }}>Te respondo en menos de 24 horas. Mientras tanto, echa un ojo a mis servicios 👀</p>
      </div>
      <button onClick={onReset}
        style={{ padding:"10px 24px", borderRadius:10, border:"1px solid #e5e5e3", background:"rgba(255,255,255,0.7)", fontSize:14, fontFamily:"'DM Sans',sans-serif", cursor:"pointer", color:"#6b6a67", transition:"all 0.3s" }}
        onMouseEnter={e=>{e.currentTarget.style.background="#f5f4f1";e.currentTarget.style.color="#111";e.currentTarget.style.borderColor="#bbb";}}
        onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.7)";e.currentTarget.style.color="#6b6a67";e.currentTarget.style.borderColor="#e5e5e3";}}>
        Enviar otro mensaje →
      </button>
    </div>
  );
}

function Contacto() {
  const [form, setForm] = useState({ name:"", email:"", type:"Diseño web", msg:"" });
  const [status, setStatus] = useState(null);
  const [focused, setFocused] = useState(null);
  const [sent, setSent] = useState(false);
  const [shake, setShake] = useState(false);
  const change = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };
  const handleSend = async () => {
    setStatus(null);
    if (!form.name || !form.email || !form.msg) { setStatus("error_fields"); triggerShake(); return; }
    if (!form.email.includes("@")) { setStatus("error_email"); triggerShake(); return; }
    setStatus("loading");
    try {
      if (!window.emailjs) throw new Error("EmailJS not ready");
      await window.emailjs.send("service_kr4zfyb", "template_0q2ldup", { from_name: form.name, from_email: form.email, project_type: form.type, message: form.msg, to_email: "8corama@gmail.com" });
      setSent(true);
    } catch (err) { console.error(err); setStatus("error_send"); triggerShake(); }
  };
  if (sent) return <SuccessScreen name={form.name} onReset={() => { setSent(false); setStatus(null); }} />;
  const fieldStyle = (name) => ({
    width:"100%", fontFamily:"'DM Sans',sans-serif", fontSize:15, color:"#111",
    background:"rgba(255,255,255,0.75)",
    border:`1px solid ${focused===name?"#888":"rgba(229,229,227,0.8)"}`,
    borderRadius:10, padding:"12px 16px", outline:"none",
    transition:"border-color 0.3s, box-shadow 0.3s",
    boxShadow:focused===name?"0 0 0 3px rgba(0,0,0,0.05)":"none",
    backdropFilter:"blur(4px)"
  });
  const errMsg = status==="error_fields" ? "Por favor rellena todos los campos."
    : status==="error_email" ? "Introduce un email válido."
    : status==="error_send" ? "Error al enviar. Escríbeme a 8corama@gmail.com" : null;
  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", width:"100%", maxWidth:520 }}>
      <Reveal><p style={{ fontFamily:"'DM Mono',monospace", fontSize:12, letterSpacing:"0.22em", color:"#b0afa9", textTransform:"uppercase", marginBottom:16, textAlign:"center" }}>✦ Contacto</p></Reveal>
      <Reveal delay={40}>
        <h2 style={{ fontSize:"clamp(1.8rem,3vw,2.6rem)", fontWeight:300, letterSpacing:"-1.5px", color:"#111", marginBottom:12, textAlign:"center" }}>Hablemos</h2>
      </Reveal>
      <Reveal delay={80}><p style={{ fontSize:15.5, color:"#6b6a67", lineHeight:1.75, marginBottom:28, textAlign:"center" }}>¿Tienes un proyecto en mente? Cuéntame qué necesitas — te respondo en menos de 24 horas.</p></Reveal>
      <Reveal delay={160}>
        <div style={{ animation: shake ? "shakeX 0.45s ease" : "none" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
            {[{label:"Nombre",name:"name",ph:"Tu nombre",type:"text"},{label:"Email",name:"email",ph:"tu@correo.com",type:"email"}].map(f => (
              <div key={f.name}>
                <label style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:"#b8b7b2", textTransform:"uppercase", letterSpacing:"0.12em", display:"block", marginBottom:7 }}>{f.label}</label>
                <input name={f.name} type={f.type} value={form[f.name]} onChange={change} placeholder={f.ph} onFocus={()=>setFocused(f.name)} onBlur={()=>setFocused(null)} style={fieldStyle(f.name)} />
              </div>
            ))}
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:"#b8b7b2", textTransform:"uppercase", letterSpacing:"0.12em", display:"block", marginBottom:7 }}>Tipo de proyecto</label>
            <select name="type" value={form.type} onChange={change} onFocus={()=>setFocused("type")} onBlur={()=>setFocused(null)}
              style={{ ...fieldStyle("type"), cursor:"pointer", WebkitAppearance:"none", backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%23aaa'/%3E%3C/svg%3E\")", backgroundRepeat:"no-repeat", backgroundPosition:"right 14px center", paddingRight:34 }}>
              {["Diseño web","Desarrollo web","Portfolio artístico","Tienda online","Mantenimiento","Otro"].map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ fontFamily:"'DM Mono',monospace", fontSize:10.5, color:"#b8b7b2", textTransform:"uppercase", letterSpacing:"0.12em", display:"block", marginBottom:7 }}>Mensaje</label>
            <textarea name="msg" value={form.msg} onChange={change} placeholder="Cuéntame en qué puedo ayudarte..." rows={4} onFocus={()=>setFocused("msg")} onBlur={()=>setFocused(null)} style={{ ...fieldStyle("msg"), resize:"none", lineHeight:1.65 }} />
          </div>
          <button onClick={handleSend} disabled={status==="loading"}
            style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"13px 0", borderRadius:11, border:"none",
              background:status==="loading"?"#555":"#111", color:"#fff", fontSize:15, fontWeight:500, cursor:status==="loading"?"not-allowed":"pointer",
              fontFamily:"'DM Sans',sans-serif", transition:"background 0.3s, transform 0.15s, box-shadow 0.3s", boxShadow:"0 4px 16px rgba(0,0,0,0.12)" }}
            onMouseEnter={e=>{ if(status!=="loading"){e.currentTarget.style.background="#1a1a1a";e.currentTarget.style.boxShadow="0 6px 24px rgba(0,0,0,0.22)";} }}
            onMouseLeave={e=>{ e.currentTarget.style.background=status==="loading"?"#555":"#111";e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.12)"; }}
            onMouseDown={e=>e.currentTarget.style.transform="scale(0.98)"}
            onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
            {status==="loading" ? (<><svg style={{ animation:"spin 0.7s linear infinite" }} width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" /><path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" /></svg>Enviando...</>) : "Enviar mensaje →"}
          </button>
          {errMsg && <div style={{ marginTop:14, padding:"12px 16px", background:"#fdf0f0", border:"1px solid #f5d5d5", borderRadius:10, fontSize:14, color:"#a03030", textAlign:"center" }}>{errMsg}</div>}
        </div>
      </Reveal>
    </div>
  );
}

export default function Portfolio() {
  useEmailJS();
  useFonts();
  const [active, setActive] = useState("inicio");
  const [exiting, setExiting] = useState(false);

  const navigate = useCallback((id) => {
    if (id === active || exiting) return;
    setExiting(true);
    setTimeout(() => { setActive(id); setExiting(false); }, 550);
  }, [active, exiting]);

  const panels = {
    inicio:     <Inicio setActive={navigate} />,
    servicios:  <Servicios setActive={navigate} />,
    "sobre-mi": <SobreMi setActive={navigate} />,
    contacto:   <Contacto />,
  };

  return (
    <>
      <style>{`
        @keyframes pulseGreen { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.45;transform:scale(1.35)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes shakeX { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-7px)} 40%{transform:translateX(7px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
        @keyframes bounceIn { 0%{transform:scale(0) rotate(-8deg);opacity:0} 60%{transform:scale(1.2) rotate(3deg)} 80%{transform:scale(0.95)} 100%{transform:scale(1) rotate(0);opacity:1} }
        @keyframes slideIn3D {
          from { opacity:0; transform:perspective(1200px) translateY(40px) translateZ(-60px) scale(0.96); }
          to   { opacity:1; transform:perspective(1200px) translateY(0) translateZ(0) scale(1); }
        }
        @keyframes slideOut3D {
          from { opacity:1; transform:perspective(1200px) translateY(0) translateZ(0) scale(1); }
          to   { opacity:0; transform:perspective(1200px) translateY(-40px) translateZ(-60px) scale(0.96); }
        }
        * { box-sizing:border-box; margin:0; padding:0; }
        html, body { width:100%; height:100%; }
        input::placeholder,textarea::placeholder { color:#c5c4c0; }
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:#d1d0cc;border-radius:99px}
        ::-webkit-scrollbar-track{background:transparent}
      `}</style>

      <Cursor />
      <Particles />

      {/* Background blobs */}
      <div style={{ position:"fixed", top:-120, right:-80, width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(220,215,205,0.32) 0%, transparent 70%)", pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", bottom:-100, left:"10%", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle, rgba(200,220,210,0.22) 0%, transparent 70%)", pointerEvents:"none", zIndex:0 }} />

      {/* Full page layout */}
      <div style={{ minHeight:"100vh", width:"100vw", background:"#f8f7f5", position:"relative" }}>

        <TopNav active={active} navigate={navigate} />

        <main id="main-scroll" style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"96px clamp(24px,5vw,80px) 60px", position:"relative", zIndex:1 }}>
          <div key={active} style={{
            width:"100%", display:"flex", justifyContent:"center",
            animation: `${exiting?"slideOut3D":"slideIn3D"} 0.55s cubic-bezier(.22,1,.36,1) forwards`
          }}>
            {panels[active]}
          </div>
        </main>

      </div>
    </>
  );
}
