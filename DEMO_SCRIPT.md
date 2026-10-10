# Raksh Path (रक्ष पथ) — Presentation & Live Demonstration Script

## Executive Overview
**Raksh Path** is an operational predictive emergency routing and dispatch platform engineered specifically for monsoon flood disasters in India. 

### Why Traditional Systems Fail in Floods:
1. **Commercial Navigation (Google Maps / Apple Maps)**: Blind to flood water depth. They guide ambulances into 60cm submerged streets, causing engine hydrolocking and patient entrapment.
2. **Naive Emergency Dispatch (108 / 112)**: Dispatches the nearest ambulance regardless of vehicle wading capability (30cm max) and sends ambulances to the nearest hospital without knowing if Trauma/ICU beds are already saturated.

### The Raksh Path Solution:
1. **Hour-by-Hour Physical & ML Passability**: Calibrated LightGBM model predicting road water depth and soft-sigmoid passability per vehicle class (Ambulance 30cm, Fire Tender 50cm, High-Clearance Truck 60cm, Boat Carrier 70cm+).
2. **Primary & Geographically Diverse Backup Routing**: Time-dependent Dijkstra evaluating segment water levels at the exact arrival time ($t_e$), outputting routes with multiplicative reliability scores ($R = \prod p_e$) and topological diversity.
3. **Understandable Turn-by-Turn Guidance**: Plain-language step-by-step navigation explaining *why* bridges and high-elevation corridors were selected and calling out specific submerged hazards that were bypassed.
4. **Multi-Criteria Hungarian Dispatch**: Joint optimization simultaneously assigning capable emergency units and pre-reserving verified hospital beds.
5. **Dynamic Resiliency**: Real-time crew roadblock reporting and automated failover to diverse backup routes.
6. **Pan-India Nationwide Scale**: 7 regional basin command zones (Prayagraj, Patna, Guwahati, Mumbai, Delhi, Chennai, Kolkata) with 1-click national command switching.

---

## Live Demonstration Flow (4 Realistic Scenarios)

### Scenario 0: Pan-India National Flood Command Center & City Switching
**Objective**: Show that Raksh Path operates across the whole country, not just a single city.

#### Step-by-Step Actions:
1. In the top navigation bar, click the **"🇮🇳 Pan-India Command"** button.
2. In the modal, review all 7 river basin command zones with live river surge levels and disaster vulnerability statuses.
3. Type `"Delhi"` in the search bar, then click **"Deploy Command & Routing"**.
4. Observe the interface automatically pivot to **Delhi NCR (Upper Yamuna Floodplain)**:
   - Map re-centers over the National Capital region.
   - Seeded incidents load: Yamuna floodplain breach at Kashmere Gate Monastery market & ITO Vikas Marg emergency.
   - Hospitals (AIIMS New Delhi, LNJP, Safdarjung) and fleet (NDRF 4x4 trucks & ALS ambulances) update instantly.
5. Switch back to **Prayagraj (UP)** or **Mumbai (Mithi Basin)** with 1 click.

### Demonstration Setup
1. **Launch Backend**:
   ```bash
   cd "c:\Users\Tanuj kumar singh\Desktop\Raksha Path"
   py -3.11 -m uvicorn raksh_path.api.app:app --port 8000
   ```
2. **Launch Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

### Scenario 1: Critical Water Rescue at Daraganj Lowland Ghat (P1 Life Threat)
**Background**: Heavy monsoon rainfall has caused the Ganga and Yamuna rivers to breach low-lying ghats in Daraganj. An elderly family is trapped on the ground floor with water rising above 45 cm.

#### Step-by-Step Actions:
1. In the **Incident Queue**, click on `INC-001` (**Daraganj Lowland Water Rescue**).
2. **Observe AI Recommendation Card**:
   - **Assigned Vehicle**: Raksh Path assigns `UP-70-HR-01` (**High-Clearance Rescue Truck**) with a 60 cm wading depth instead of a standard ambulance (which would fail at 30 cm).
   - **Target Hospital**: `Swaroop Rani Nehru (SRN) Hospital` is selected because its verified Trauma beds (8 available) match the critical P1 status.
   - **Primary Route**: Plotted in solid cyan via Curzon Bridge Approach. Reliability score: **94%**.
   - **Backup Route**: Plotted in dashed amber via Civil Lines elevated corridor. Diversity ratio: **82% non-overlapping edges**.
   - **AI Explainability**: Notice the plain-language justification explaining why the high-clearance truck and bridge corridor were chosen.
   - **Step-by-Step Navigation Guidance (Plain Language)**:
     - Review the turn-by-turn guidance accordion card below the AI recommendation.
     - Note the hazard breakdown: *Step 2 (Transiting Elevated Bridge)*, *Step 3 (Critical Flood Hazard Bypassed — avoided 45cm underpass)*, *Step 4 (Hospital Arrival with pre-verified Trauma and ICU bed reservations)*.
3. **Presenter Talking Point**:
   > *"Notice how Raksh Path avoided sending a standard ambulance down the low-lying Daraganj embankment road where water is 42 cm deep. A standard GPS app would have sent an ambulance straight into the water; Raksh Path proactively dispatched a rescue truck and reserved a trauma bed at SRN before the vehicle left the station."*

---

### Scenario 2: Urgent Cardiac Emergency in Civil Lines (P1 Medical)
**Background**: A 58-year-old patient suffers acute myocardial infarction in Civil Lines. Roads in this commercial district have only mild surface runoff (< 8 cm).

#### Step-by-Step Actions:
1. In the **Incident Queue**, click on `INC-002` (**Civil Lines Cardiac ALS**).
2. **Observe AI Recommendation Card**:
   - **Assigned Vehicle**: Raksh Path assigns `UP-70-AMB-01` (**Standard ALS Ambulance**) because roads on this corridor are well within the 30 cm wading limit.
   - **Destination**: `MLN District Hospital` (ICU capacity: 6 available).
   - **Primary Route**: Direct high-speed transit (ETA: 4.8 min, Reliability: **99%**).
3. **Presenter Talking Point**:
   > *"By distinguishing between dry urban corridors and flooded floodplains, Raksh Path preserves high-clearance rescue trucks and boats for deep water, dispatching standard ambulances for dry medical emergencies where speed is paramount."*

---

### Scenario 3: River Surge Progression & 1-Tap Field Crew Roadblock Reroute
**Background**: Peak river surge arrives at Hour T+2. A dispatched crew encounters a fallen electrical pole submerged under 55 cm of water on the primary route.

#### Step-by-Step Actions:
1. **Advance Scenario Timeline**:
   - On the bottom **Time Slider**, click the **Fast Forward (+1h)** button or scrub to `T+2.0h`.
   - Watch the map road segments transition dynamically: Lowland Daraganj and Sangam roads turn from Amber to Crimson Red.
2. **Open Mobile Crew View**:
   - In the top header, click **Crew View**.
   - In the simulated in-cab terminal, view the active route for `UP-70-AMB-01`.
   - Click the prominent red button: **REPORT ROAD BLOCKED**.
   - Select segment `Civil Lines ➔ Daraganj Lowland Road`, choose *"Water submerged > 50cm, impassable for ambulance"*, and click **Transmit Immediate Roadblock**.
3. **Observe Automated System Failover**:
   - In the top header, the **Alerts** badge lights up in red (`Alerts (1)`).
   - Click **Alerts**: See the real-time notification:
     > *"Primary route degraded from 94% to 42% due to crew roadblock. Automated switch to Backup Route engaged."*
   - On the map, the active dispatch route automatically pivots to the elevated Curzon Bridge corridor.
4. **Presenter Talking Point**:
   > *"In an evolving flood, road conditions change in minutes. The 1-tap crew reporting feature closes the loop between first responders on the ground and the routing engine. The system didn't wait for a dispatcher; it immediately re-routed the vehicle onto its verified backup corridor."*

---

## Discrete-Event Simulation Validation (SimPy Analysis)
Click **SimPy Evaluation** in the top navigation bar to open the quantitative simulation results:
- **P90 Response Time**: Baseline (24.3 min) ➔ Raksh Path (18.0 min) (**25.9% reduction in worst-case delays**).
- **Hospital Diversions**: Baseline had 4 patients turned away at hospital doors due to zero bed availability ➔ Raksh Path had **0 diversions** (**100% capacity verification**).
- **Blocked Route Impasses**: Eliminated vehicle hydrolocking in flooded underpasses.

---

## Summary Checklist
- [x] Pan-India region switcher (Prayagraj Pilot, Patna, Guwahati, Mumbai)
- [x] Interactive MapLibre GL map with OSM tiles (no Mapbox API key required)
- [x] Hour-by-hour flood depth and passability prediction
- [x] Primary and Backup diverse routes with reliability scores
- [x] Hungarian dispatch with vehicle wading depth and hospital bed reservation
- [x] In-cab mobile crew view with 1-tap roadblock reporting
- [x] Automated route degradation alerts and backup failover
- [x] SimPy discrete-event simulation dashboard
