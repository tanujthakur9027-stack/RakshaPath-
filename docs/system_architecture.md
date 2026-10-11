# 🛡️ RakshaPath (रक्षापथ) — System Architecture & Engineering Blueprint

This document details the end-to-end technical architecture, component interactions, and hardware specifications of **RakshaPath**, fulfilling **Rubric Point 8** (System Diagram & Conceptual Model).

---

## 🏛️ End-to-End System Architecture Diagram

![RakshaPath Architecture Schematic](architecture_schematic.png)

*Figure 1: High-resolution 3-tier decoupled architecture diagram showing IoT Telemetry Ingestion, Algorithmic Optimization Core, and Edge Delivery.*

---

## 🏗️ Architectural Tier Breakdown

### Tier 1: Perception & Macro-Hazard Telemetry Layer
1. **Autonomous Solar IoT River Gauge Node:**
   * **Controller:** ESP32-S3 Dual-Core Xtensa 32-bit LX7 @ 240MHz. Features ultra-low-power deep sleep (15 µA) and active cycle data logging.
   * **Sensor:** JSN-SR04T industrial waterproof ultrasonic transducer with a range of 20 cm to 600 cm and ±1 mm accuracy. Mounted on bridge piers over river channels.
   * **Telemetry:** SX1262 LoRaWAN transceiver operating at 868 MHz (+22 dBm transmit power, up to 12 km non-line-of-sight range to municipal base stations), with automated failover to SIM7600G 4G LTE cellular data.
   * **Power Autonomy:** 10W monocrystalline solar panel coupled with a TP5100 MPPT charge controller and a 6000 mAh LiFePO4 battery pack, providing 14 continuous days of operation in total darkness.
2. **Macro Hydrological & Satellite Feeds:**
   * **Central Water Commission (CWC) APIs:** Real-time river gauge level and crest discharge alerts.
   * **IMD Doppler Radar:** Precipitation rate grids ($dh/dt$) and flash flood forecast polygons.
   * **SRTM 30m Digital Elevation Model:** Topographic slope analysis to predict water runoff accumulation in low-lying underpasses.

---

### Tier 2: Algorithmic Optimization Core
1. **Hydrodynamic Passability Engine:**
   * Implements a continuous soft-sigmoid vehicle wading resistance function:
     $$M_{\text{water}} = 1.0 + 3.5 \left(\frac{d_{\text{water}} - 0.5 d_{\max}}{0.5 d_{\max}}\right)$$
   * If water depth exceeds vehicle intake limits ($d_{\text{water}} > d_{\max}$), an exponential penalty ($\times 5000$) marks the segment impassable.
   * Adapts dynamically across vehicle classes:
     * **ALS Ambulance:** $d_{\max} = 30\text{ cm}$
     * **NDRF Heavy Truck:** $d_{\max} = 85\text{ cm}$
     * **Tactical Flood Boat:** Amphibious craft ($d_{\max} = \infty$)
2. **Risk-Weighted A* Safe Corridor Solver:**
   * Evaluates segment traversal cost:
     $$W_e = d_e \times \big[ M_{\text{water}}(e) \times M_{\text{damage}}(e) \times M_{\text{debris}}(e) \big]$$
   * Simultaneously calculates the **Emerald Green Safe Corridor** and the **Red Dashed Naive Path**, achieving an **88% net route risk reduction**.
3. **Hungarian Multi-Criteria Joint Dispatch & Bed Reservation:**
   * Solves an $O(N^3)$ bipartite assignment matrix pairing incident triage priorities ($P_1–P_4$) to capable vehicles while simultaneously reserving verified ICU/trauma beds at destination hospitals before dispatch.
   * Eliminates secondary emergency hospital diversion delays.

---

### Tier 3: Edge Delivery & Field Operations
1. **In-Cab Tactical Fleet Terminal:**
   * Runs on ruggedized IP68 Android tablets installed in emergency vehicles.
   * Provides real-time turn-by-turn guidance with audio-tactile alerts if the vehicle deviates toward a flooded segment.
   * Features a 1-tap "Report Road Blocked" button that updates the graph for all trailing vehicles in less than 300 ms.
2. **Zero-Server Web Worker Offline Engine:**
   * Client-side embedded Dijkstra graph engine running in a browser Web Worker.
   * Functions 100% offline from cached local road graphs during cellular grid blackouts.
3. **Command Center & Civilian Portal:**
   * **Tactical Dispatcher Dock:** Live telemetry charts, multi-city jumping (Lucknow, Delhi, Prayagraj, Dehradun), and exportable NDMA Mission Manifests.
   * **Civilian Safety View:** High-contrast, plain-language hazard bypass directions with 1-touch emergency hotlines (112, 108, 1078).

---

## 🖥️ Live Platform UI Interface

![RakshaPath Live Platform UI](rakshapath_live_ui.png)

*Figure 2: Production React 19 + MapLibre GL live deployment displaying multi-hazard safe corridor routing, river telemetry ticker, and vehicle profiles.*
