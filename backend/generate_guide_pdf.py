"""
Generate a clean, professional, publication-quality User Guide PDF for Raksh Path.
Zero mathematical formulas, plain-language civilian instructions.
"""
import sys
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether
)

OUTPUT_PDF = Path(r"c:\Users\Tanuj kumar singh\Desktop\Raksha Path\Raksh_Path_User_Guide.pdf")

def create_user_guide_pdf():
    doc = SimpleDocTemplate(
        str(OUTPUT_PDF),
        pagesize=letter,
        leftMargin=40,
        rightMargin=40,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom Clean Styles
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=24,
        leading=28,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#0284c7"),
        spaceAfter=14
    )

    h1_style = ParagraphStyle(
        "SectionH1",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=15,
        leading=19,
        textColor=colors.HexColor("#0f172a"),
        spaceBefore=12,
        spaceAfter=6
    )

    h2_style = ParagraphStyle(
        "SectionH2",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#1e293b"),
        spaceBefore=8,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        "BodyDark",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#334155"),
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        "BulletText",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor("#334155"),
        leftIndent=14,
        spaceAfter=4
    )

    callout_style = ParagraphStyle(
        "CalloutText",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor("#0369a1")
    )

    table_header_style = ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9.5,
        leading=13,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#1e293b")
    )

    story = []

    # Title Banner
    story.append(Paragraph("Raksh Path (रक्ष पथ) — User Guide", title_style))
    story.append(Paragraph("How to Use the All-Natural-Disasters Emergency Routing Platform across India", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#0284c7"), spaceAfter=12))

    # Quick Start Box
    quick_start_html = (
        "<b>Web Address:</b> Open your browser (Chrome/Edge/Firefox) and visit: "
        "<b><font color='#0284c7'>http://localhost:5173</font></b><br/>"
        "<b>Supported Disasters:</b> Floods, Earthquakes, Cyclones, and Landslides across India.<br/>"
        "<b>Core Promise:</b> Shows verified safe routes that avoid dangerous traps and confirms open hospital beds."
    )
    quick_start_table = Table(
        [[Paragraph(quick_start_html, callout_style)]],
        colWidths=[532]
    )
    quick_start_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f0f9ff")),
        ('BORDER', (0,0), (-1,-1), 1, colors.HexColor("#bae6fd")),
        ('PADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(quick_start_table)
    story.append(Spacer(1, 10))

    # 1. Understanding the Screen
    story.append(Paragraph("1. The Three Main Areas on Your Screen", h1_style))
    story.append(Paragraph("When the app opens, you will see a simple, clean layout divided into three parts:", body_style))
    story.append(Paragraph("• <b>Top Header Bar:</b> Pick your disaster type, switch cities, toggle Civilian Mode, or click the red Emergency SOS 112 button.", bullet_style))
    story.append(Paragraph("• <b>Center Map:</b> Shows all streets color-coded (Green for safe, Amber for caution, Red for blocked). Draws the cyan safe route when you click an emergency.", bullet_style))
    story.append(Paragraph("• <b>Right Information Panel:</b> Shows your verified safe route card, travel time, reasons why the road is safe, and step-by-step driving guidance.", bullet_style))
    story.append(Spacer(1, 6))

    # 2. Step-by-Step Instructions
    story.append(Paragraph("2. How to Use the App (Step-by-Step)", h1_style))

    # Step 1
    story.append(Paragraph("Step 1: Pick Your Disaster Type (Top Header)", h2_style))
    story.append(Paragraph("Click on any of the 4 disaster buttons at the top of the screen to match the active emergency:", body_style))

    disaster_data = [
        [Paragraph("Disaster", table_header_style), Paragraph("Hazards It Evaluates", table_header_style), Paragraph("Safe Route Action", table_header_style)],
        [Paragraph("<b>🌊 Flood</b>", table_cell_style), Paragraph("Submerged underpasses, deep river water, rising street flooding", table_cell_style), Paragraph("Diverts vehicles away from deep water to elevated, dry bridge decks.", table_cell_style)],
        [Paragraph("<b>🌋 Earthquake</b>", table_cell_style), Paragraph("Structural bridge cracks, fallen building facades, road fissures", table_cell_style), Paragraph("Avoids damaged overpasses; routes via modern reinforced concrete highways.", table_cell_style)],
        [Paragraph("<b>🌀 Cyclone</b>", table_cell_style), Paragraph("Gale winds (140 km/h), uprooted banyan trees, live electric wires", table_cell_style), Paragraph("Avoids narrow tree-lined roads; routes via broad cleared avenues.", table_cell_style)],
        [Paragraph("<b>⛰️ Landslide</b>", table_cell_style), Paragraph("Saturated mountain slopes, rockfalls, boulders blocking valley passes", table_cell_style), Paragraph("Bypasses sheer cliff roads; routes via protected valley bypasses.", table_cell_style)],
    ]
    t_disaster = Table(disaster_data, colWidths=[100, 220, 212])
    t_disaster.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0f172a")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('PADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_disaster)
    story.append(Spacer(1, 8))

    # Step 2
    story.append(Paragraph("Step 2: Choose Your City / Region", h2_style))
    story.append(Paragraph("Click the <b>Region dropdown</b> at the top and select your city: <b>Delhi NCR</b>, <b>Mumbai</b>, <b>Patna</b>, <b>Guwahati</b>, <b>Kolkata</b>, <b>Chennai</b>, or <b>Prayagraj</b>. The map will instantly center on your chosen city and load all local hospitals and emergency calls.", body_style))
    story.append(Spacer(1, 4))

    # Step 3
    story.append(Paragraph("Step 3: Click an Incident to View Your Safe Route", h2_style))
    story.append(Paragraph("In the incident list on the right (or by clicking any pin on the map):", body_style))
    story.append(Paragraph("1. Click any emergency call (e.g. <i>'Daraganj Riverbank Water Rescue'</i> or <i>'Civilian Emergency'</i>).", bullet_style))
    story.append(Paragraph("2. A <b>solid cyan route</b> will appear on the map guiding the vehicle safely to the hospital.", bullet_style))
    story.append(Paragraph("3. Read the <b>Verified Safe Evacuation Path</b> card on the right:", bullet_style))
    story.append(Paragraph("&nbsp;&nbsp;&nbsp;• <b>Estimated Travel Time:</b> Shows transit time in minutes (e.g. <i>14 min</i>).", bullet_style))
    story.append(Paragraph("&nbsp;&nbsp;&nbsp;• <b>Why This Route Is Safe:</b> Confirms that modern bridges and high, dry highways are used.", bullet_style))
    story.append(Paragraph("&nbsp;&nbsp;&nbsp;• <b>Hazard Diverted:</b> Tells you the exact danger bypassed (e.g., <i>'Bypassed 45cm flooded underpass to prevent engine stalling'</i>).", bullet_style))
    story.append(Paragraph("&nbsp;&nbsp;&nbsp;• <b>Hospital Beds Ready:</b> Confirms the hospital has free Trauma and ICU beds ready right now.", bullet_style))
    story.append(Spacer(1, 4))

    # Step 4
    story.append(Paragraph("Step 4: Step-by-Step Driving Directions", h2_style))
    story.append(Paragraph("Scroll down the right panel to view the 4-step route instructions:", body_style))
    story.append(Paragraph("• <b>Step 1 (Depart):</b> Start safely from the station using dry, wide arterial roads.", bullet_style))
    story.append(Paragraph("• <b>Step 2 (Bridge Transit):</b> Cross elevated bridge decks safely standing above river surge crests.", bullet_style))
    story.append(Paragraph("• <b>Step 3 (Hazard Avoidance):</b> Detour around blocked lowlands or fallen tree hazards.", bullet_style))
    story.append(Paragraph("• <b>Step 4 (Hospital Arrival):</b> Arrive at the emergency bay with verified beds pre-allocated.", bullet_style))
    story.append(Spacer(1, 6))

    # Step 5
    story.append(Paragraph("Step 5: How to Use the Emergency SOS 112 Button", h2_style))
    story.append(Paragraph("Click the bright red <b>'Emergency SOS 112'</b> button at the top right to open the emergency modal:", body_style))
    story.append(Paragraph("• <b>One-Touch Emergency Calling:</b> Tap any phone number to dial 24x7 government crisis lines (112, 108, 1078 NDRF).", bullet_style))
    story.append(Paragraph("• <b>Report a Danger on Your Street:</b> Select the problem (<i>Flooded Road</i>, <i>Collapsed Building</i>, <i>Fallen Tree</i>, or <i>Landslide</i>) $\\rightarrow$ type a short note $\\rightarrow$ click <b>Submit Citizen Hazard Report</b>. The danger will immediately be marked on the map so ambulances steer clear of it.", bullet_style))
    story.append(Spacer(1, 6))

    # Step 6 & 7 in KeepTogether
    step67 = [
        Paragraph("Step 6: See Future Water Levels (Bottom Time Slider)", h2_style),
        Paragraph("Look at the slider at the bottom of the map labeled <b>0h to 6h</b>:", body_style),
        Paragraph("• Drag the slider to the right (e.g. to 3h or 5h).", bullet_style),
        Paragraph("• You will see rain intensify and river water rise.", bullet_style),
        Paragraph("• Watch lower roads turn red, and watch the app automatically move routes onto higher bridges!", bullet_style),
        Spacer(1, 6),
        Paragraph("Step 7: Testing an Instant Roadblock Failover (Crew View)", h2_style),
        Paragraph("To test what happens if an unexpected fallen tree blocks the road:", body_style),
        Paragraph("1. Switch to <b>Dispatcher Mode</b> using the toggle at the top.", bullet_style),
        Paragraph("2. Click the <b>'Crew'</b> button in the top bar.", bullet_style),
        Paragraph("3. Click <b>'REPORT ROAD BLOCKED'</b> on any road segment.", bullet_style),
        Paragraph("4. The system will immediately switch to the backup route in under 1 second with zero delay.", bullet_style),
        Spacer(1, 8),
    ]
    story.append(KeepTogether(step67))

    # 3. Quick Reference Card
    story.append(Paragraph("3. Quick Reference: Helplines & Road Color Codes", h1_style))

    ref_data = [
        [Paragraph("Emergency Helpline", table_header_style), Paragraph("Phone Number", table_header_style), Paragraph("Purpose / Department", table_header_style)],
        [Paragraph("National Emergency Helpline", table_cell_style), Paragraph("<b>112</b>", table_cell_style), Paragraph("All-India unified crisis response (Police, Fire, Ambulance, NDRF)", table_cell_style)],
        [Paragraph("Ambulance Medical Transport", table_cell_style), Paragraph("<b>108</b>", table_cell_style), Paragraph("Emergency hospital transport & medical triage", table_cell_style)],
        [Paragraph("NDRF Disaster Control", table_cell_style), Paragraph("<b>1078</b>", table_cell_style), Paragraph("National Disaster Response Force search & rescue", table_cell_style)],
        [Paragraph("State Disaster Relief", table_cell_style), Paragraph("<b>1070</b>", table_cell_style), Paragraph("State Emergency Operations Centre (SEOC)", table_cell_style)],
    ]
    t_ref = Table(ref_data, colWidths=[150, 90, 292])
    t_ref.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0f172a")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('PADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_ref)
    story.append(Spacer(1, 8))

    # Road Colors Summary
    color_data = [
        [Paragraph("Map Color", table_header_style), Paragraph("Status", table_header_style), Paragraph("What It Means for You", table_header_style)],
        [Paragraph("🟢 <b>Green</b>", table_cell_style), Paragraph("Safe & Open (100%)", table_cell_style), Paragraph("Dry or very low water surface. Normal driving speed allowed.", table_cell_style)],
        [Paragraph("🟡 <b>Amber</b>", table_cell_style), Paragraph("Caution Needed", table_cell_style), Paragraph("Minor surface water (15–25cm) or scattered debris. Drive slowly.", table_cell_style)],
        [Paragraph("🔴 <b>Red</b>", table_cell_style), Paragraph("Blocked / Dangerous", table_cell_style), Paragraph("Deep water, building rubble, or fallen wires. Do NOT enter.", table_cell_style)],
        [Paragraph("🟣 <b>Purple</b>", table_cell_style), Paragraph("Reported Roadblock", table_cell_style), Paragraph("Blocked by verified citizen SOS or emergency crew report.", table_cell_style)],
    ]
    t_color = Table(color_data, colWidths=[100, 140, 292])
    t_color.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0f172a")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('PADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_color)
    story.append(Spacer(1, 10))

    # Footer note
    footer_text = (
        "<i>Raksh Path — Government & Citizen Disaster Safety Platform. "
        "Generated for local operation at http://localhost:5173.</i>"
    )
    story.append(Paragraph(footer_text, ParagraphStyle("Footer", parent=styles["Normal"], fontSize=8, textColor=colors.HexColor("#64748b"), alignment=1)))

    # Build PDF
    doc.build(story)
    print(f"Successfully generated PDF at: {OUTPUT_PDF}")

if __name__ == "__main__":
    create_user_guide_pdf()
