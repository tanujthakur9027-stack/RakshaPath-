# 🎬 RAKSHAPATH (रक्षापथ) — 5-MINUTE VIDEO RECORDING MASTER SCRIPT
### Screen-2: Technical Pitch & Demo • Team Techies • Track: Diploma & Higher Education
**Total Target Duration:** 4 Minutes 35 Seconds *(Guaranteed to stay safely under the 5-minute hard limit)*

---

## 💡 Quick Tips for Recording:
* **Tools to record:** OBS Studio (recommended) or Windows Game Bar (`Win + G`).
* **Setup:** Open your browser at `http://localhost:5173` on one screen, and have this script on your phone or second monitor.
* **Format:** You can record solo as Team Lead **Tanuj Kumar Singh**, or take turns speaking with your team members.
* **Timer Rule:** Keep an eye on the timestamp brackets `[0:00]`, `[0:40]`, etc., to pace your voice naturally.

---

## 🎬 SCENE 0: HOOK & THE FATAL GPS BLINDSPOT [0:00 – 0:40]
*(Duration: 40 seconds | Rubric: Problem Understanding & Alignment)*

* **[ACTION ON SCREEN / WEBCAM]:**  
  *Start with your camera on your face, or full-screen title slide. Look directly into the camera with confident, serious tone.*

* **🗣️ PRESENTER SPEAKS:**  
  > *"Respected judges, during natural disasters and severe monsoon floods, commercial navigation apps like Google Maps turn into fatal traps.*  
  >  
  > *Google Maps is engineered to minimize static road distance and normal traffic congestion. It is **completely blind** to physical floodwater depth.*  
  >  
  > *When an urban underpass or river road submerges under sixty to seventy centimeters of floodwater, standard ambulances drive blindly into it. Because emergency ambulances fail and suffer catastrophic engine hydrolock at water depths exceeding thirty centimeters, vehicles stall, critical cardiac and trauma patients are trapped in rising water, and response times double.*  
  >  
  > *To solve this national crisis, we engineered **RakshaPath (रक्षापथ)**: India's first autonomous multi-hazard emergency mobility and hospital bed-reservation network."*

---

## 🎬 SCENE 1: EARLY WORKING PROTOTYPE & LIVE DEMO [0:40 – 1:30]
*(Duration: 50 seconds | Rubric Point 1: Early working prototype / software demo)*

* **[ACTION ON SCREEN]:**  
  *Switch to screen share of your live browser at `http://localhost:5173`. Click on the city switcher (**Lucknow / Delhi**), then click **🏆 Hackathon Tour ➔ Scenario 1: Gomti River Breach**.*

* **🗣️ PRESENTER SPEAKS:**  
  > *"Addressing **Point 1: our Early Working Prototype**. RakshaPath is not a concept design; it is a fully functional, production-grade GIS platform live on screen right now.*  
  >  
  > *Observe this live scenario in Lucknow: The Gomti River has overflowed, submerging the barrage road under sixty-five centimeters of water.*  
  >  
  > *Notice what happens: The standard naive shortest route—shown here in the **red dashed line**—directs the ambulance straight into the sixty-five centimeter flood trap. For an ambulance with thirty-centimeter clearance, this would mean complete vehicle destruction.*  
  >  
  > *In contrast, RakshaPath's physics engine calculates segment water resistance and plots this **emerald green safe corridor** via the elevated Shaheed Path flyover—achieving an **eighty-eight percent net risk reduction** with guaranteed passability.*  
  >  
  > *When we toggle vehicle profiles to an NDRF heavy truck or tactical flood boat, the graph solver instantly recalculates segment traversability. And our client-side embedded router runs entirely inside a browser Web Worker, guaranteeing **one hundred percent offline navigation** inside ambulance tablets even if cellular towers collapse."*

---

## 🎬 SCENE 2: ENGINEERING DRAWINGS & IOT SCHEMATICS [1:30 – 2:10]
*(Duration: 40 seconds | Rubric Point 2: Engineering drawings, CAD/schematics & design files)*

* **[ACTION ON SCREEN]:**  
  *Show the Architecture Diagram (`docs/architecture_schematic.png` or presentation slide).*

* **🗣️ PRESENTER SPEAKS:**  
  > *"Addressing **Point 2: Engineering Drawings and IoT Schematics**.*  
  >  
  > *RakshaPath operates on a decoupled three-tier system architecture: Tier 1 IoT Edge Perception, Tier 2 Algorithmic Optimization Core, and Tier 3 Edge Delivery.*  
  >  
  > *To capture ground-truth river elevation during storms, we engineered this autonomous solar-powered IoT river gauge station.*  
  >  
  > *It features an **ESP32-S3 dual-core microcontroller** running Kalman wave-filtering algorithms, paired with an industrial **JSN-SR04T waterproof ultrasonic transducer** measuring water surface distance from bridge piers with plus-minus one millimeter accuracy.*  
  >  
  > *Telemetry is transmitted via a long-range **SX1262 LoRaWAN module** up to twelve kilometers with automated four-G cellular fallback. Powered by a ten-watt solar panel and an MPPT-managed LiFePO4 battery pack, each station operates autonomously for **fourteen continuous days** without any sunlight."*

---

## 🎬 SCENE 3: CALCULATIONS & SIMULATION VALIDATION [2:10 – 2:55]
*(Duration: 45 seconds | Rubric Point 3: Detailed calculations & simulation validation)*

* **[ACTION ON SCREEN]:**  
  *Show the Calculations & SimPy Benchmark Slide (`evidence/ambulance_wading_risk_curve.png` and simulation table).*

* **🗣️ PRESENTER SPEAKS:**  
  > *"Addressing **Point 3: Detailed Calculations and Simulation Validation**.*  
  >  
  > *Our platform replaces guesswork with deterministic physics equations. For vehicle passability, we formulated a soft-sigmoid resistance multiplier, **M-water**. The moment flood depth exceeds vehicle intake clearance, an exponential penalty factor of five thousand marks the road segment impassable.*  
  >  
  > *Simultaneously, we formulated a **Hungarian Bipartite Matching cost matrix** that pairs casualty triage priorities to capable vehicles while pre-reserving verified hospital ICU and trauma beds before vehicle wheels turn.*  
  >  
  > *We rigorously validated this using a discrete-event **SimPy Monte Carlo simulation** over two hundred flood emergency calls:*  
  > *• P90 emergency arrival time was reduced by **twenty-five point nine percent**.*  
  > *• Vehicle submersion and stall rate was reduced from forty-one percent to **zero percent**.*  
  > *• And secondary hospital diversions were completely eliminated through real-time bed matching."*

---

## 🎬 SCENE 4: BILL OF MATERIALS & UNIT COST REALISM [2:55 – 3:30]
*(Duration: 35 seconds | Rubric Point 4: Itemized Bill of Materials & cost breakdown)*

* **[ACTION ON SCREEN]:**  
  *Show the Bill of Materials (BOM) Table slide.*

* **🗣️ PRESENTER SPEAKS:**  
  > *"Addressing **Point 4: Itemized Bill of Materials and Cost Realism**.*  
  >  
  > *Proprietary disaster monitoring systems cost lakhs of rupees. RakshaPath is built using commercial-off-the-shelf components to ensure mass deployment viability.*  
  >  
  > *Our complete solar-powered IoT river gauge station costs just **three thousand six hundred and eighty rupees**—or approximately **forty-four US dollars**.*  
  >  
  > *In-cab navigation uses ruggedized Android tablets at eighty-five hundred rupees, and our cloud routing runs on Vercel's global edge network at zero initial server cost.*  
  >  
  > *A complete municipal pilot covering twelve critical bridges and twenty emergency ambulances costs under **two point one four lakh rupees**—less than two percent of the cost of one single new ambulance."*

---

## 🎬 SCENE 5: TEAM ROLES & 75-DAY MILESTONES [3:30 – 4:05]
*(Duration: 35 seconds | Rubric Points 5 & 6: Team roles & 75-day milestone chart)*

* **[ACTION ON SCREEN]:**  
  *Show the Team Matrix and 75-Day Gantt Roadmap slide.*

* **🗣️ PRESENTER SPEAKS:**  
  > *"Addressing **Points 5 and 6: Team Roles and our 75-Day Roadmap**.*  
  >  
  > *Our team, **Techies**, brings specialized engineering execution to the Diploma and Higher Education track:*  
  > *• I, **Tanuj Kumar Singh**, lead the AI algorithms, routing mathematics, and SimPy simulation.*  
  > *• Our co-developers specialize in Full-Stack GIS edge development, embedded IoT hardware firmware, and disaster operations with NDMA protocol integration.*  
  >  
  > *Our **seventy-five day execution roadmap** is divided into five fifteen-day phases:*  
  > *• **Phase 1**—the core algorithmic engine and live GIS deployment—is **one hundred percent completed** with twenty-two passing unit tests.*  
  > *• **Phase 2** hardware lab testing is currently sixty-five percent complete.*  
  > *• Followed by bridge field pilots in Phase 3, civil defense blackout drills in Phase 4, and formal National Dial one-one-two handover in Phase 5."*

---

## 🎬 SCENE 6: BOTTLENECKS, RISKS & CONCLUSION [4:05 – 4:35]
*(Duration: 30 seconds | Rubric Points 7 & 8: Technical bottlenecks, risks & mitigations)*

* **[ACTION ON SCREEN / WEBCAM]:**  
  *Show the Risk Matrix slide briefly, then switch camera back to your face for a strong, confident closing.*

* **🗣️ PRESENTER SPEAKS:**  
  > *"Addressing **Points 7 and 8: Technical Bottlenecks and Risk Mitigation**.*  
  >  
  > *We tackled critical real-world challenges: GPS drift during cloudbursts is corrected using **dead-reckoning vector snapping**; river silt noise is removed using **fifty-sample sliding median filters**; and cellular grid blackouts are handled by **offline PWA edge solvers**.*  
  >  
  > *Our five-tier risk matrix incorporates triple sensor redundancy, in-cab audio-tactile deviation alarms, and one-tap closed-loop rerouting.*  
  >  
  > *In conclusion, RakshaPath delivers a battle-ready, verified solution that saves critical lives and protects emergency fleets during India's worst disasters.*  
  >  
  > *Thank you, respected judges, and we look forward to your questions!"*

---

## 🏁 STOP RECORDING! [Final Time: ~4:35]
*(Well within the 5:00 maximum limit)*
