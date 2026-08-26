import React,{useEffect,useRef,useState} from "react";
import {createRoot} from "react-dom/client";
import "./styles.css";
import Workspace from "./Workspace";

const media=[
  "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1526481280695-3c687fd643ed?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=85"
];

function Logo(){
 return <a className="logo" href="#top"><span className="logoIcon"><i/><i/><i/></span><span>DRONYDRIVE</span></a>
}

function useProgress(ref){
 const [p,setP]=useState(0);
 useEffect(()=>{
  const update=()=>{
   const el=ref.current;if(!el)return;
   const r=el.getBoundingClientRect(), total=el.offsetHeight-innerHeight;
   setP(Math.min(1,Math.max(0,(-r.top)/Math.max(1,total))));
  };
  addEventListener("scroll",update,{passive:true}); update();
  return()=>removeEventListener("scroll",update);
 },[ref]);
 return p;
}

function SmartImage({src,alt,className=""}){
 return <img className={className} src={src} alt={alt} loading="lazy" onError={e=>{e.currentTarget.style.display="none"}}/>
}

function MediaWall({progress}){
 const positions=[
  [-26,-30,-12,-7],[-4,-35,7,5],[18,-29,10,3],[34,-13,14,6],
  [-34,2,-8,2],[-13,5,4,-4],[11,5,10,5],[30,5,7,-4],
  [-25,28,-12,7],[-4,30,6,-6],[19,27,13,4],[37,30,8,-7]
 ];
 const expand=Math.min(1,Math.max(0,(progress-.08)/.42));
 const gather=1-Math.min(1,Math.max(0,(progress-.66)/.28));
 return <div className="mediaWall">
   {media.map((src,i)=>{
    const [x,y,r,s]=positions[i];
    const scatter=1-expand*.92;
    const gx=x*scatter, gy=y*scatter;
    const scale=.76+expand*.3;
    const settle=gather*.12;
    return <div key={src} className="mediaTile" style={{
      "--x":`${gx+settle*(i%3)}%`,"--y":`${gy+settle*(i%2)}%`,
      "--r":`${r*(1-expand*.35)}deg`,"--s":scale,
      zIndex:i
    }}><SmartImage src={src} alt="Drone project asset"/></div>
   })}
   <div className="wallShadow"/>
 </div>
}

function IntelligenceScene({progress}){
 const q=progress<.78 ? "Files that understand your work." : progress<.9 ? "What will you ask next?" : "Drone data that talks back.";
 return <div className="intelligence">
   <div className="intGlow"/>
   <div className="intelEyebrow">DRONYDRIVE INTELLIGENCE</div>
   <h2 key={q}>{q}</h2>
   <div className="intelActions"><button>Ask your drone data <span>↗</span></button><button>Schedule a demo</button></div>
   <div className="intelHint">SCROLL TO EXPLORE</div>
 </div>
}

function Showcase(){
 const ref=useRef(null),p=useProgress(ref);
 const phase=p<.23?"organize":p<.48?"expand":p<.68?"intelligence":"return";
 const prompt=phase==="organize"?"organize these":phase==="return"?"crop & remove background":"";
 return <section ref={ref} className="showcase">
   <div className="showcaseSticky">
    <div className="showcaseBg"/>
    <MediaWall progress={p}/>
    <div className={`floatingPrompt ${prompt?"show":""}`}>{prompt}</div>
    <div className={`showcaseCenter ${phase==="intelligence"?"hide":""}`}>
      <div className="centerKicker">YOUR DRONE DATA</div>
      <h2>{p<.48?"One place for every project.":"A workspace that moves with you."}</h2>
    </div>
    <IntelligenceScene progress={p}/>
    <div className="showcaseProgress"><span style={{transform:`scaleX(${p})`}}/></div>
   </div>
 </section>
}

function VideoLikeScene(){
 return <section className="videoSection">
   <div className="videoFrame">
     <div className="fakeVideo">
       <div className="fakeSky"/><div className="fakeGround"/><div className="fakeDrone"/>
       <div className="playCircle">▶</div>
       <div className="videoCaption">PROJECT / HYDERABAD · 01:24</div>
     </div>
   </div>
   <div className="videoMeta"><span>01</span><strong>Review the flight.</strong><button>Open 360° viewer ↗</button></div>
 </section>
}

function Landing({onWorkspace}){
 const [menu,setMenu]=useState(false);
 const scrollTo=id=>{setMenu(false);document.getElementById(id)?.scrollIntoView({behavior:"smooth"})};
 useEffect(()=>{
   const onMove=e=>document.documentElement.style.setProperty("--mx",`${e.clientX}px`);
   addEventListener("pointermove",onMove); return()=>removeEventListener("pointermove",onMove);
 },[]);
 return <div id="top">
  <header className="header"><div className="nav">
    <Logo/>
    <button className="hamb" onClick={()=>setMenu(!menu)}><span/><span/></button>
    <div className={`links ${menu?"open":""}`}>
      <button onClick={()=>scrollTo("showcase")}>Platform <small>⌄</small></button>
      <button onClick={()=>scrollTo("workflow")}>Solutions <small>⌄</small></button>
      <button onClick={()=>scrollTo("features")}>Features</button>
      <button onClick={()=>scrollTo("pricing")}>Pricing</button>
    </div>
    <div className="navCtas"><button className="ghost" onClick={()=>scrollTo("contact")}>Schedule a demo</button><button onClick={onWorkspace}>Get started</button></div>
  </div></header>

  <main>
   <section className="hero2">
    <div className="heroAura"/>
    <div className="heroText">
      <div className="tiny">DRONYDRIVE / DRONE DATA CLOUD</div>
      <h1>The cloud for<br/><span>drone data.</span></h1>
      <p>Store, organize, view and deliver every dataset from a workspace built around the way drone teams actually work.</p>
      <div className="heroBtns"><button onClick={()=>scrollTo("showcase")}>Explore Dronydrive <b>↓</b></button><button className="secondary" onClick={()=>scrollTo("contact")}>Talk to our team</button></div>
    </div>
    <div className="heroWall"><MediaWall progress={.12}/><div className="heroPill">organize these</div></div>
    <div className="heroFoot"><span>PROJECT-FIRST STORAGE</span><span>360° / 3D VIEWING</span><span>SECURE DELIVERY</span></div>
   </section>

   <section className="marquee"><div>DRONE DATA MANAGEMENT <i>✦</i> BUILT FOR THE INDUSTRY <i>✦</i> DRONE DATA MANAGEMENT <i>✦</i></div></section>

   <section id="showcase"><Showcase/></section>

   <VideoLikeScene/>

   <section id="workflow" className="conversation">
    <div className="conversationTop"><div className="tiny">YOUR WHOLE BRAND LIBRARY</div><h2>In a single<br/><span>conversation.</span></h2><p>Search your project data in plain language. Find the right flight, report, panorama or model without digging through folders.</p></div>
    <div className="conversationUi">
      <div className="chatBubble">Show me the 3D files from the Hyderabad project.</div>
      <div className="results">
       {media.slice(0,6).map((x,i)=><SmartImage key={x} src={x} alt="Project search result"/>)}
      </div>
      <div className="chatBubble user">Create a client-ready collection.</div>
    </div>
   </section>

   <section id="features" className="features2">
    <div className="tiny">BUILT AROUND YOUR DATA</div><h2>Simple on the surface.<br/><span>Serious underneath.</span></h2>
    <div className="featureRows">
      {[
       ["01","Project memory","Every project keeps its files, context and metadata together."],
       ["02","Visual review","Photos, video, 360° panoramas and 3D models stay in the workflow."],
       ["03","Client delivery","Create controlled links with expiry, passwords and download tracking."],
       ["04","Black Box","Archive old datasets at lower cost without losing the project."],
      ].map(r=><div className="featureRow" key={r[0]}><span>{r[0]}</span><h3>{r[1]}</h3><p>{r[2]}</p><b>↗</b></div>)}
    </div>
   </section>

   <section id="pricing" className="pricing2">
    <div className="tiny">PLANS THAT SCALE</div><h2>More flights.<br/><span>More space.</span></h2>
    <div className="plans">
      {[
       ["Starter","500 GB","₹2,499","For freelancers & individual pilots"],
       ["Pro","2 TB","₹7,499","For drone companies & teams"],
       ["Black Box","20 TB","₹3,499","Long-term drone data storage"]
      ].map((p,i)=><article className={i===1?"plan featured":"plan"} key={p[0]}>{i===1&&<label>MOST POPULAR</label>}<h3>{p[0]}</h3><p>{p[3]}</p><strong>{p[1]}</strong><div>{p[2]}<small>/mo</small></div><button>Choose {p[0]} ↗</button></article>)}
    </div>
   </section>

   <section id="contact" className="end">
    <div className="endAura"/>
    <div className="tiny">DRONYDRIVE</div>
    <h2>Your drone data<br/><span>deserves a better home.</span></h2>
    <p>Premium cloud storage, visual intelligence and delivery for the drone industry.</p>
    <button onClick={onWorkspace}>Open workspace ↗</button>
   </section>
  </main>
  <footer><Logo/><span>Drone data infrastructure, beautifully designed.</span><small>© 2026 Dronydrive</small></footer>
 </div>
}
function App(){
 const [workspace,setWorkspace]=useState(() => window.location.hash === "#workspace");
 useEffect(()=>{
   const sync = () => setWorkspace(window.location.hash === "#workspace");
   sync();
   addEventListener("hashchange", sync);
   return () => removeEventListener("hashchange", sync);
 },[]);

 const openWorkspace = () => {
   window.location.hash = "workspace";
   setWorkspace(true);
 };

 const closeWorkspace = () => {
   window.location.hash = "";
   setWorkspace(false);
 };

 if(workspace) return <Workspace onBack={closeWorkspace}/>;
 return <Landing onWorkspace={openWorkspace}/>;
}


export default App;
