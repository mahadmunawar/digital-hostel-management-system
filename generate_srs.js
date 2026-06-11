import { 
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
  VerticalAlign, LevelFormat, PageBreak, Header, Footer,
  PageNumber
} from 'docx';
import fs from 'fs';

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const CONTENT_WIDTH = 9360; // US Letter 8.5" - 2x1" margins
const COL = (frac) => Math.round(CONTENT_WIDTH * frac);
const BLUE = "1F4E79";
const LIGHT_BLUE = "D6E4F0";
const MID_BLUE = "2E75B6";
const WHITE = "FFFFFF";
const GREY = "F2F2F2";
const DARK = "1A1A1A";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function h(level, text, opts = {}) {
  return new Paragraph({
    heading: level,
    children: [new TextRun({ text, bold: true, font: "Arial" })],
    spacing: { before: 240, after: 120 },
    ...opts
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Arial", size: 22 })],
    spacing: { before: 60, after: 60 },
    ...opts
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    children: [new TextRun({ text, font: "Arial", size: 22 })],
    spacing: { before: 40, after: 40 }
  });
}

function numbered(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "numbers", level },
    children: [new TextRun({ text, font: "Arial", size: 22 })],
    spacing: { before: 40, after: 40 }
  });
}

function space(pts = 120) {
  return new Paragraph({ children: [new TextRun("")], spacing: { before: 0, after: pts } });
}

function cell(text, { bg = WHITE, bold = false, width = COL(0.5), color = DARK, center = false, vAlign = VerticalAlign.CENTER } = {}) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: bg, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: vAlign,
    children: [new Paragraph({
      alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: [new TextRun({ text, bold, font: "Arial", size: 20, color })]
    })]
  });
}

function hCell(text, width = COL(0.5)) {
  return cell(text, { bg: BLUE, bold: true, width, color: WHITE });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function divider() {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: MID_BLUE } },
    children: [new TextRun("")],
    spacing: { before: 80, after: 80 }
  });
}

function ucTable(rows) {
  return new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [COL(0.3), COL(0.7)],
    rows: rows.map(([label, value, isHeader = false]) =>
      isHeader
        ? new TableRow({
            children: [new TableCell({
              borders, columnSpan: 2,
              width: { size: CONTENT_WIDTH, type: WidthType.DXA },
              shading: { fill: BLUE, type: ShadingType.CLEAR },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [new Paragraph({
                children: [new TextRun({ text: label, bold: true, font: "Arial", size: 20, color: WHITE })]
              })]
            })]
          })
        : new TableRow({
            children: [
              cell(label, { bg: LIGHT_BLUE, bold: true, width: COL(0.3) }),
              cell(value, { width: COL(0.7) })
            ]
          })
    )
  });
}

// ─── COVER PAGE ───────────────────────────────────────────────────────────────
function coverPage() {
  return [
    space(600),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "FAST NUCES — Karachi Campus", bold: true, font: "Arial", size: 24, color: MID_BLUE })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Department of Computer Science", font: "Arial", size: 22, color: "444444" })]
    }),
    space(240),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      border: {
        top: { style: BorderStyle.SINGLE, size: 8, color: MID_BLUE },
        bottom: { style: BorderStyle.SINGLE, size: 8, color: MID_BLUE }
      },
      spacing: { before: 160, after: 160 },
      children: [new TextRun({ text: "SOFTWARE REQUIREMENTS SPECIFICATION", bold: true, font: "Arial", size: 40, color: BLUE })]
    }),
    space(200),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Digital Hostel Management System", bold: true, font: "Arial", size: 36, color: DARK })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "(DHMS)", bold: true, font: "Arial", size: 28, color: "555555" })]
    }),
    space(240),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Version: 1.0", font: "Arial", size: 22, color: "555555" })]
    }),
    space(480),
    new Table({
      width: { size: CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: [COL(0.35), COL(0.65)],
      rows: [
        new TableRow({ children: [hCell("Project Title", COL(0.35)), cell("Digital Hostel Management System", { width: COL(0.65) })] }),
        new TableRow({ children: [hCell("Version", COL(0.35)), cell("1.0", { width: COL(0.65) })] }),
        new TableRow({ children: [hCell("Project Code", COL(0.35)), cell("CS491 – FYP I", { width: COL(0.65) })] }),
        new TableRow({ children: [hCell("Supervisor", COL(0.35)), cell("[Supervisor Name]", { width: COL(0.65) })] }),
        new TableRow({ children: [hCell("Co-Supervisor", COL(0.35)), cell("[Co-Supervisor Name]", { width: COL(0.65) })] }),
        new TableRow({ children: [hCell("Project Team", COL(0.35)), cell("Mahad Munawar – 24I-0065\nDev Kumar – 24K-0028", { width: COL(0.65) })] }),
        new TableRow({ children: [hCell("Submission Date", COL(0.35)), cell("May 2026", { width: COL(0.65) })] }),
      ]
    }),
    pageBreak()
  ];
}

// ─── DOCUMENT HISTORY & DISTRIBUTION ─────────────────────────────────────────
function frontMatter() {
  return [
    h(HeadingLevel.HEADING_1, "Document History"),
    new Table({
      width: { size: CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: [COL(0.15), COL(0.25), COL(0.2), COL(0.4)],
      rows: [
        new TableRow({ children: [hCell("Version", COL(0.15)), hCell("Author", COL(0.25)), hCell("Date", COL(0.2)), hCell("Description of Change", COL(0.4))] }),
        new TableRow({ children: [cell("1.0", { width: COL(0.15) }), cell("Mahad Munawar", { width: COL(0.25) }), cell("May 2026", { width: COL(0.2) }), cell("Initial SRS Document Created", { width: COL(0.4) })] }),
        new TableRow({ children: [cell("", { width: COL(0.15) }), cell("", { width: COL(0.25) }), cell("", { width: COL(0.2) }), cell("", { width: COL(0.4) })] }),
      ]
    }),
    space(200),
    h(HeadingLevel.HEADING_1, "Distribution List"),
    new Table({
      width: { size: CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: [COL(0.5), COL(0.5)],
      rows: [
        new TableRow({ children: [hCell("Name", COL(0.5)), hCell("Role", COL(0.5))] }),
        new TableRow({ children: [cell("[Supervisor Name]", { width: COL(0.5) }), cell("Supervisor", { width: COL(0.5) })] }),
        new TableRow({ children: [cell("[Co-Supervisor Name]", { width: COL(0.5) }), cell("Co-Supervisor", { width: COL(0.5) })] }),
        new TableRow({ children: [cell("Mahad Munawar", { width: COL(0.5) }), cell("Project Team Member", { width: COL(0.5) })] }),
        new TableRow({ children: [cell("Dev Kumar", { width: COL(0.5) }), cell("Project Team Member", { width: COL(0.5) })] }),
      ]
    }),
    space(200),
    h(HeadingLevel.HEADING_1, "Document Sign-Off"),
    new Table({
      width: { size: CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: [COL(0.2), COL(0.5), COL(0.3)],
      rows: [
        new TableRow({ children: [hCell("Version", COL(0.2)), hCell("Sign-off Authority", COL(0.5)), hCell("Sign-off Date", COL(0.3))] }),
        new TableRow({ children: [cell("", { width: COL(0.2) }), cell("", { width: COL(0.5) }), cell("", { width: COL(0.3) })] }),
        new TableRow({ children: [cell("", { width: COL(0.2) }), cell("", { width: COL(0.5) }), cell("", { width: COL(0.3) })] }),
        new TableRow({ children: [cell("", { width: COL(0.2) }), cell("", { width: COL(0.5) }), cell("", { width: COL(0.3) })] }),
      ]
    }),
    pageBreak()
  ];
}

// ─── SECTION 1: INTRODUCTION ──────────────────────────────────────────────────
function section1() {
  return [
    h(HeadingLevel.HEADING_1, "1. Introduction"),
    divider(),
    h(HeadingLevel.HEADING_2, "1.1 Purpose of Document"),
    p("This Software Requirements Specification (SRS) document formally defines the functional and non-functional requirements of the Digital Hostel Management System (DHMS). The document serves as the authoritative reference for the project team, supervisor, and any stakeholder involved in the design, development, and evaluation of the system."),
    p("DHMS is a role-based web application developed as a final year project for FAST NUCES Karachi. This SRS covers all modules planned for the Minimum Viable Product (MVP), including User Management, Room and Inventory Management, Complaint Management, Visitor Management, Payment Management, Mess Management, and the Emergency Broadcast module."),
    space(),
    h(HeadingLevel.HEADING_2, "1.2 Intended Audience"),
    p("This document is intended for the following audiences:"),
    bullet("Project Team (Mahad Munawar, Dev Kumar) — for implementation guidance"),
    bullet("Project Supervisor and Co-Supervisor — for review, approval, and sign-off"),
    bullet("Course Evaluators (CS491 FYP I) — for milestone assessment"),
    bullet("Future Maintainers — for understanding the system's original requirements"),
    bullet("Hostel Administrators and Wardens — as stakeholder representatives for validation"),
    space(),
    h(HeadingLevel.HEADING_2, "1.3 Abbreviations"),
    new Table({
      width: { size: CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: [COL(0.2), COL(0.8)],
      rows: [
        new TableRow({ children: [hCell("Abbreviation", COL(0.2)), hCell("Full Form", COL(0.8))] }),
        ...[
          ["DHMS", "Digital Hostel Management System"],
          ["SRS", "Software Requirements Specification"],
          ["RBAC", "Role-Based Access Control"],
          ["MVP", "Minimum Viable Product"],
          ["FR", "Functional Requirement"],
          ["NFR", "Non-Functional Requirement"],
          ["API", "Application Programming Interface"],
          ["CNIC", "Computerized National Identity Card"],
          ["UI", "User Interface"],
          ["NUCES", "National University of Computer and Emerging Sciences"],
          ["FAST", "Foundation for Advancement of Science and Technology"],
          ["FYP", "Final Year Project"],
          ["DB", "Database"],
          ["HTTP", "Hypertext Transfer Protocol"],
          ["REST", "Representational State Transfer"],
        ].map(([abbr, full]) => new TableRow({
          children: [cell(abbr, { bg: GREY, bold: true, width: COL(0.2) }), cell(full, { width: COL(0.8) })]
        }))
      ]
    }),
    space(),
    h(HeadingLevel.HEADING_2, "1.4 Document Convention"),
    p("This document uses the following formatting conventions:"),
    bullet("Font: Arial, 12pt for body text"),
    bullet("Headings: Arial Bold — Section (16pt), Sub-section (14pt), Sub-sub-section (12pt)"),
    bullet("Tables: Used for structured data, use cases, and comparative information"),
    bullet("Functional requirements are referenced using the format FR-XX (e.g., FR-01)"),
    bullet("Non-functional requirements are referenced using the format NFR-XX (e.g., NFR-01)"),
    bullet("Use cases are referenced using the format UC-XX (e.g., UC-01)"),
    pageBreak()
  ];
}

// ─── SECTION 2: OVERALL SYSTEM DESCRIPTION ────────────────────────────────────
function section2() {
  return [
    h(HeadingLevel.HEADING_1, "2. Overall System Description"),
    divider(),
    h(HeadingLevel.HEADING_2, "2.1 Project Background"),
    p("University hostels managing hundreds of students daily encounter severe inefficiencies when relying on manual, paper-based administrative processes. At FAST NUCES Karachi, like many institutions, hostel operations — including visitor logging, room assignments, complaint handling, payment tracking, late-night arrivals, and emergency communications — are conducted via paper registers, spreadsheets, and informal messaging channels such as WhatsApp."),
    p("This creates recurring problems: visitor logs are lost or tampered with, room assignment disputes arise from the absence of digital audit trails, complaints stagnate without a centralized resolution channel, and payment records are prone to discrepancy. Emergency notices posted on physical boards fail to reach students promptly. Asset accountability at room check-in/check-out is virtually nonexistent."),
    p("DHMS is proposed as a comprehensive digital platform to eliminate these inefficiencies. It consolidates all hostel administrative operations into a single, role-secured web application accessible to four categories of users: Administrators, Wardens, Security Guards, and Students."),
    space(),
    h(HeadingLevel.HEADING_2, "2.2 Project Scope"),
    p("DHMS is a web-based hostel management system comprising eight functional modules organized under four user roles. The system provides:"),
    bullet("Role-based login and secure access control for Admin, Warden, Guard, and Student roles"),
    bullet("Warden-managed room and inventory tracking with asset register per room"),
    bullet("A categorized student complaint submission and warden resolution pipeline"),
    bullet("Student-initiated visitor requests with warden approval and guard entry/exit logging"),
    bullet("Student self-service payment submission with admin-level financial reporting"),
    bullet("A weekly mess menu accessible to students with meal preference management"),
    bullet("An Emergency Broadcast module for real-time notice delivery to all student dashboards"),
    bullet("Admin-level analytics and system-wide reporting across all modules"),
    space(),
    h(HeadingLevel.HEADING_2, "2.3 Not In Scope"),
    p("The following features are explicitly excluded from the DHMS MVP:"),
    bullet("Native mobile application (iOS or Android) — web-responsive design is provided as a substitute"),
    bullet("Integration with the university ERP system or any third-party payment gateway"),
    bullet("Biometric or RFID-based hardware access control at hostel gates"),
    bullet("Multi-hostel or multi-campus support — the system supports a single hostel instance only"),
    bullet("SMS or email notification delivery to external phone/email services"),
    bullet("AI-driven features such as predictive maintenance or occupancy forecasting"),
    space(),
    h(HeadingLevel.HEADING_2, "2.4 Project Objectives"),
    p("Primary Objectives:"),
    bullet("Develop a fully functional MVP serving all four roles: Admin, Warden, Guard, and Student"),
    bullet("Enforce input validation on every system form to guarantee data integrity"),
    bullet("Implement RBAC so each actor can only perform permitted operations"),
    bullet("Deliver a complaint-to-resolution pipeline with live status visibility"),
    bullet("Automate visitor logging and integrate late-arrival recording for guards"),
    bullet("Provide digital payment receipts and an admin-level financial dashboard"),
    p("Innovation Objectives:"),
    bullet("Emergency Broadcast Module — instant notices pushed to all student dashboards simultaneously"),
    bullet("Asset Inventory Tracking — per-room asset registers verified at check-in and check-out"),
    space(),
    h(HeadingLevel.HEADING_2, "2.5 Stakeholders"),
    new Table({
      width: { size: CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: [COL(0.2), COL(0.3), COL(0.5)],
      rows: [
        new TableRow({ children: [hCell("Role", COL(0.2)), hCell("Representative", COL(0.3)), hCell("Interest in System", COL(0.5))] }),
        new TableRow({ children: [cell("Admin", { width: COL(0.2) }), cell("Dr. Khalid Mehmood (Sample)", { width: COL(0.3) }), cell("Full system control, financial oversight, user account management, reporting", { width: COL(0.5) })] }),
        new TableRow({ children: [cell("Warden", { width: COL(0.2) }), cell("Mr. Asad Raza (Sample)", { width: COL(0.3) }), cell("Room and asset management, complaint resolution, visitor approval, broadcasts", { width: COL(0.5) })] }),
        new TableRow({ children: [cell("Security Guard", { width: COL(0.2) }), cell("Constable Nadeem (Sample)", { width: COL(0.3) }), cell("Visitor entry/exit logging, late arrival recording", { width: COL(0.5) })] }),
        new TableRow({ children: [cell("Student", { width: COL(0.2) }), cell("Hostel Residents", { width: COL(0.3) }), cell("Complaint submission, visitor requests, payment, mess menu, broadcasts", { width: COL(0.5) })] }),
        new TableRow({ children: [cell("Developer Team", { width: COL(0.2) }), cell("Mahad Munawar, Dev Kumar", { width: COL(0.3) }), cell("System design, implementation, testing, and documentation", { width: COL(0.5) })] }),
        new TableRow({ children: [cell("Supervisor", { width: COL(0.2) }), cell("[Supervisor Name]", { width: COL(0.3) }), cell("Academic oversight, milestone evaluation, document review", { width: COL(0.5) })] }),
      ]
    }),
    space(),
    h(HeadingLevel.HEADING_2, "2.6 Operating Environment"),
    bullet("Platform: Web application accessible via any modern browser (Chrome, Firefox, Edge, Safari)"),
    bullet("Backend: Python 3.x with Flask framework, served on localhost (port 5000) or PythonAnywhere for deployment"),
    bullet("Frontend: HTML5, CSS3, JavaScript with Bootstrap — responsive for desktop and mobile browsers"),
    bullet("Database: SQLite for local development; PostgreSQL-compatible schema for production deployment"),
    bullet("OS Compatibility: Any OS with a modern browser (Windows, macOS, Linux, Android, iOS)"),
    bullet("Network: Local network (intranet) for campus deployment; HTTPS over internet for cloud deployment"),
    bullet("API Communication: RESTful JSON API over HTTP between the JavaScript frontend and Flask backend"),
    space(),
    h(HeadingLevel.HEADING_2, "2.7 System Constraints"),
    bullet("Software Constraints: System requires Python 3.8+ and Flask 2.x; SQLite is used for MVP — not suitable for high-concurrency production at scale"),
    bullet("Hardware Constraints: No dedicated server hardware required; deployment on shared hosting (PythonAnywhere) is acceptable for MVP"),
    bullet("Academic Constraints: Development must be completed within the 16-week semester timeline; scope is bounded by the MVP boundaries defined in this SRS"),
    bullet("Security Constraints: Passwords are stored in plaintext for MVP demo purposes; production deployment must hash passwords using bcrypt or equivalent"),
    bullet("User Constraints: System is designed for university-educated users; no specialized training is required for basic operations"),
    bullet("Single-Hostel Constraint: All data is scoped to a single hostel instance; multi-tenant architecture is out of scope"),
    space(),
    h(HeadingLevel.HEADING_2, "2.8 Assumptions & Dependencies"),
    p("Assumptions:"),
    bullet("Each student is assigned to exactly one room at a time"),
    bullet("All users have access to a web browser and a stable internet or local network connection"),
    bullet("Payment amounts are fixed (Rs. 8,500/month) for MVP; dynamic fee structures are a future enhancement"),
    bullet("The mess menu is weekly and static — no per-day dynamic editing is required in MVP"),
    bullet("All users are pre-registered or self-register; no third-party SSO is required"),
    p("Dependencies:"),
    bullet("Flask and Flask-CORS Python packages must be installed (pip install flask flask-cors)"),
    bullet("SQLite is bundled with Python; no separate DB installation is required for development"),
    bullet("Frontend depends on Bootstrap CDN for styling — internet access required during development"),
    pageBreak()
  ];
}

// ─── SECTION 3: EXTERNAL INTERFACES ──────────────────────────────────────────
function section3() {
  return [
    h(HeadingLevel.HEADING_1, "3. External Interface Requirements"),
    divider(),
    p("DHMS is a standalone web application that communicates internally between its JavaScript frontend and its Flask RESTful backend. The primary external interfaces are the user's browser, the host operating system's filesystem (SQLite database), and the network layer."),
    space(),
    h(HeadingLevel.HEADING_2, "3.1 Hardware Interfaces"),
    p("DHMS does not interface directly with any specialized hardware components. The following hardware is required at a minimum for operation:"),
    bullet("Client Device: Any device capable of running a modern web browser (desktop PC, laptop, tablet, or smartphone)"),
    bullet("Server Machine: A machine running Python 3.8+ capable of hosting the Flask development server (localhost) or a cloud platform such as PythonAnywhere"),
    bullet("Network Hardware: Standard LAN router/switch for campus intranet deployment, or standard internet connectivity for cloud deployment"),
    bullet("No biometric scanners, RFID readers, or other physical devices are interfaced in the MVP"),
    space(),
    h(HeadingLevel.HEADING_2, "3.2 Software Interfaces"),
    new Table({
      width: { size: CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: [COL(0.25), COL(0.2), COL(0.55)],
      rows: [
        new TableRow({ children: [hCell("Component", COL(0.25)), hCell("Version", COL(0.2)), hCell("Purpose", COL(0.55))] }),
        new TableRow({ children: [cell("Python", { width: COL(0.25) }), cell("3.8+", { width: COL(0.2) }), cell("Backend runtime environment", { width: COL(0.55) })] }),
        new TableRow({ children: [cell("Flask", { width: COL(0.25) }), cell("2.x", { width: COL(0.2) }), cell("Web framework; handles routing, request/response processing, and CORS", { width: COL(0.55) })] }),
        new TableRow({ children: [cell("Flask-CORS", { width: COL(0.25) }), cell("Latest", { width: COL(0.2) }), cell("Enables cross-origin requests from the JavaScript frontend", { width: COL(0.55) })] }),
        new TableRow({ children: [cell("SQLite", { width: COL(0.25) }), cell("3.x (bundled)", { width: COL(0.2) }), cell("Relational database storing all system data in hostel.db file", { width: COL(0.55) })] }),
        new TableRow({ children: [cell("Bootstrap", { width: COL(0.25) }), cell("5.x (CDN)", { width: COL(0.2) }), cell("Frontend CSS/JS framework for responsive UI layout and components", { width: COL(0.55) })] }),
        new TableRow({ children: [cell("VS Code", { width: COL(0.25) }), cell("Latest", { width: COL(0.2) }), cell("Primary IDE for development", { width: COL(0.55) })] }),
        new TableRow({ children: [cell("GitHub", { width: COL(0.25) }), cell("N/A", { width: COL(0.2) }), cell("Version control and collaboration", { width: COL(0.55) })] }),
        new TableRow({ children: [cell("Postman", { width: COL(0.25) }), cell("Latest", { width: COL(0.2) }), cell("API endpoint testing during development", { width: COL(0.55) })] }),
      ]
    }),
    space(),
    h(HeadingLevel.HEADING_2, "3.3 Communications Interfaces"),
    bullet("Protocol: HTTP (development) / HTTPS (production deployment via PythonAnywhere)"),
    bullet("API Style: RESTful JSON API — the frontend makes fetch() calls to backend endpoints (e.g., POST /api/login, GET /api/rooms)"),
    bullet("Data Format: JSON for all request bodies and API responses"),
    bullet("CORS: Flask-CORS is configured to allow cross-origin requests from the frontend served on a different port or domain"),
    bullet("Primary API Endpoint Groups: /api/all-data, /api/login, /api/register, /api/users, /api/rooms, /api/complaints, /api/payments, /api/visitors, /api/late-arrivals, /api/broadcasts"),
    bullet("No external email, SMS, or push notification services are used in the MVP"),
    pageBreak()
  ];
}

// ─── SECTION 4: FUNCTIONAL REQUIREMENTS ──────────────────────────────────────
function section4() {
  return [
    h(HeadingLevel.HEADING_1, "4. Functional Requirements"),
    divider(),
    h(HeadingLevel.HEADING_2, "4.1 Functional Hierarchy"),
    p("DHMS is organized into the following top-level modules, each serving a distinct operational domain:"),
    new Table({
      width: { size: CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: [COL(0.06), COL(0.3), COL(0.64)],
      rows: [
        new TableRow({ children: [hCell("#", COL(0.06)), hCell("Module", COL(0.3)), hCell("Key Functions", COL(0.64))] }),
        ...[
          ["1", "User Management", "Login, student self-registration, admin-created staff accounts, profile update, RBAC enforcement"],
          ["2", "Room & Inventory Management", "Room creation/edit/delete, room assignment, asset register per room, check-in/check-out asset verification"],
          ["3", "Complaint Management", "Complaint submission (student), priority assignment (warden), status updates, admin audit"],
          ["4", "Visitor Management", "Visitor request (student), warden approval/rejection, guard entry/exit logging, late arrival recording"],
          ["5", "Payment Management", "Fee submission (student), payment status tracking, admin financial reporting and overdue notices"],
          ["6", "Mess Management", "Weekly menu publishing (warden), meal preference/opt-out (student), mess feedback"],
          ["7", "Emergency Broadcast", "Notice composition (admin/warden), real-time push to student dashboards, read-receipt tracking"],
          ["8", "Admin Analytics", "System-wide reports covering occupancy, complaints, financials, and user activity"],
        ].map(([num, mod, funcs]) => new TableRow({
          children: [
            cell(num, { bg: GREY, bold: true, width: COL(0.06), center: true }),
            cell(mod, { bg: LIGHT_BLUE, bold: true, width: COL(0.3) }),
            cell(funcs, { width: COL(0.64) })
          ]
        }))
      ]
    }),
    space(200),
    h(HeadingLevel.HEADING_2, "4.2 Actor-Feature Permission Matrix"),
    new Table({
      width: { size: CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: [COL(0.4), COL(0.15), COL(0.15), COL(0.15), COL(0.15)],
      rows: [
        new TableRow({ children: [hCell("Feature / Action", COL(0.4)), hCell("Admin", COL(0.15)), hCell("Warden", COL(0.15)), hCell("Guard", COL(0.15)), hCell("Student", COL(0.15))] }),
        ...[
          ["Create Warden / Guard Accounts", "Full", "None", "None", "None"],
          ["Student Self-Registration", "Full", "None", "None", "Full"],
          ["Room Assignment & Vacating", "View", "Full", "None", "None"],
          ["Asset Inventory Management", "View", "Full", "None", "None"],
          ["Complaint Submission", "None", "None", "None", "Full"],
          ["Complaint Resolution & Status", "View", "Full", "None", "View"],
          ["Visitor Request Submission", "None", "None", "None", "Full"],
          ["Visitor Approval / Rejection", "None", "Full", "None", "None"],
          ["Visitor Entry / Exit Logging", "None", "None", "Full", "None"],
          ["Late Arrival Logging", "None", "None", "Full", "None"],
          ["Payment Submission", "None", "None", "None", "Full"],
          ["Financial Records & Reports", "Full", "None", "None", "Own Only"],
          ["Mess Menu Management", "None", "Full", "None", "View"],
          ["Emergency Broadcast (Publish)", "Full", "Full", "None", "None"],
          ["Emergency Broadcast (View)", "Full", "Full", "None", "Full"],
          ["System-wide Reports", "Full", "None", "None", "None"],
        ].map(([feat, a, w, g, s]) => {
          const col = (v) => {
            const bg = v === "Full" ? "D5F5E3" : v === "None" ? "FADBD8" : v === "View" ? "FEF9E7" : WHITE;
            return cell(v, { width: COL(0.15), center: true, bg });
          };
          return new TableRow({ children: [cell(feat, { width: COL(0.4) }), col(a), col(w), col(g), col(s)] });
        })
      ]
    }),
    space(200),
    // USE CASES
    h(HeadingLevel.HEADING_2, "4.3 Use Cases"),
    space(),

    // UC-01
    h(HeadingLevel.HEADING_3, "4.3.1 UC-01: Student Login"),
    ucTable([
      ["Use Case ID: UC-01 — Student Login", "", true],
      ["Use Case ID", "UC-01"],
      ["Actors", "Student, Warden, Admin, Guard (all roles use the same login form)"],
      ["Feature", "User Management — Authentication"],
      ["Pre-condition", "User has a registered account in the system with valid email and password"],
    ]),
    new Table({
      width: { size: CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: [COL(0.08), COL(0.46), COL(0.46)],
      rows: [
        new TableRow({ children: [hCell("Step#", COL(0.08)), hCell("Actor Action", COL(0.46)), hCell("System Response", COL(0.46))] }),
        ...[
          ["1", "User navigates to the login page", "System displays email and password input fields with a Login button"],
          ["2", "User enters email and password and clicks Login", "System sends POST /api/login with credentials"],
          ["3", "", "System validates credentials against the users table in the DB"],
          ["4", "", "On success, system returns user object including role, name, and ID"],
          ["5", "", "System stores session data and redirects the user to the role-appropriate dashboard"],
        ].map(([step, action, reaction]) => new TableRow({
          children: [
            cell(step, { width: COL(0.08), center: true, bg: step ? GREY : WHITE }),
            cell(action, { width: COL(0.46) }),
            cell(reaction, { width: COL(0.46) })
          ]
        }))
      ]
    }),
    ucTable([
      ["Alternate Scenarios", "", true],
      ["2a", "If email or password is incorrect, system returns HTTP 401 and displays 'Invalid credentials' error message"],
      ["2b", "If email field is empty, client-side validation prevents form submission"],
      ["Post Conditions", "", true],
      ["1", "User is authenticated and their role is stored in the client session"],
      ["2", "User is redirected to the dashboard corresponding to their role"],
      ["Use Case Cross-referenced", "UC-02 (Student Registration), UC-03 (Update Profile)"],
    ]),
    space(200),

    // UC-02
    h(HeadingLevel.HEADING_3, "4.3.2 UC-02: Student Self-Registration"),
    ucTable([
      ["Use Case ID: UC-02 — Student Self-Registration", "", true],
      ["Use Case ID", "UC-02"],
      ["Actors", "Student"],
      ["Feature", "User Management — Registration"],
      ["Pre-condition", "Student does not already have an account; student has a valid student ID, CNIC, email, and phone number"],
    ]),
    new Table({
      width: { size: CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: [COL(0.08), COL(0.46), COL(0.46)],
      rows: [
        new TableRow({ children: [hCell("Step#", COL(0.08)), hCell("Actor Action", COL(0.46)), hCell("System Response", COL(0.46))] }),
        ...[
          ["1", "Student clicks 'Register' on the login page", "System displays the student registration form"],
          ["2", "Student fills in: name, email, password, student ID, phone, CNIC", "System performs client-side validation on all fields"],
          ["3", "Student submits the form", "System sends POST /api/register with student data"],
          ["4", "", "System checks for duplicate email or student ID"],
          ["5", "", "On success, system inserts student record with role='student' and returns HTTP 201"],
          ["6", "", "System displays success message and redirects to login page"],
        ].map(([step, action, reaction]) => new TableRow({
          children: [
            cell(step, { width: COL(0.08), center: true, bg: step ? GREY : WHITE }),
            cell(action, { width: COL(0.46) }),
            cell(reaction, { width: COL(0.46) })
          ]
        }))
      ]
    }),
    ucTable([
      ["Alternate Scenarios", "", true],
      ["4a", "If email or student ID already exists, system returns HTTP 409 and displays 'Email or Student ID already registered'"],
      ["2a", "If any required field is missing, system highlights the field and prevents submission"],
      ["Post Conditions", "", true],
      ["1", "A new student record is created in the users table with role='student'"],
      ["2", "Student can now log in using the registered email and password"],
      ["Use Case Cross-referenced", "UC-01 (Login)"],
    ]),
    space(200),

    // UC-03
    h(HeadingLevel.HEADING_3, "4.3.3 UC-03: Submit a Complaint"),
    ucTable([
      ["Use Case ID: UC-03 — Submit a Complaint", "", true],
      ["Use Case ID", "UC-03"],
      ["Actors", "Student"],
      ["Feature", "Complaint Management — Complaint Submission"],
      ["Pre-condition", "Student is logged in; student has a valid session"],
    ]),
    new Table({
      width: { size: CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: [COL(0.08), COL(0.46), COL(0.46)],
      rows: [
        new TableRow({ children: [hCell("Step#", COL(0.08)), hCell("Actor Action", COL(0.46)), hCell("System Response", COL(0.46))] }),
        ...[
          ["1", "Student navigates to 'Complaints' in their dashboard", "System displays list of existing complaints and a 'New Complaint' button"],
          ["2", "Student clicks 'New Complaint'", "System opens a complaint form with fields: category, subject, description"],
          ["3", "Student selects category (maintenance/food/security/administrative), fills in subject and description", "System validates that all required fields are filled"],
          ["4", "Student submits the form", "System sends POST /api/complaints with complaint data"],
          ["5", "", "System creates a new complaint record with status='received', date=today, and auto-generated ID"],
          ["6", "", "System returns the new complaint object and displays it in the student's complaint list"],
        ].map(([step, action, reaction]) => new TableRow({
          children: [
            cell(step, { width: COL(0.08), center: true, bg: step ? GREY : WHITE }),
            cell(action, { width: COL(0.46) }),
            cell(reaction, { width: COL(0.46) })
          ]
        }))
      ]
    }),
    ucTable([
      ["Alternate Scenarios", "", true],
      ["3a", "If subject or description is empty, system prevents submission and highlights the empty fields"],
      ["Post Conditions", "", true],
      ["1", "A new complaint record is created with status 'received'"],
      ["2", "The complaint appears in the warden's complaint queue for review"],
      ["Use Case Cross-referenced", "UC-04 (Warden Updates Complaint Status)"],
    ]),
    space(200),

    // UC-04
    h(HeadingLevel.HEADING_3, "4.3.4 UC-04: Warden Resolves Complaint"),
    ucTable([
      ["Use Case ID: UC-04 — Warden Resolves Complaint", "", true],
      ["Use Case ID", "UC-04"],
      ["Actors", "Warden"],
      ["Feature", "Complaint Management — Resolution"],
      ["Pre-condition", "Warden is logged in; at least one complaint exists with status 'received' or 'in-progress'"],
    ]),
    new Table({
      width: { size: CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: [COL(0.08), COL(0.46), COL(0.46)],
      rows: [
        new TableRow({ children: [hCell("Step#", COL(0.08)), hCell("Actor Action", COL(0.46)), hCell("System Response", COL(0.46))] }),
        ...[
          ["1", "Warden navigates to the Complaints module", "System displays all complaints sorted by priority and date"],
          ["2", "Warden selects a complaint to review", "System displays complaint details: category, subject, description, student name, date"],
          ["3", "Warden sets priority (high/medium/low) and updates status (in-progress / resolved)", "System validates selection"],
          ["4", "Warden confirms update", "System sends PUT /api/complaints/{id} with new status and priority"],
          ["5", "", "System updates the complaint record and sets updatedAt to current date"],
          ["6", "", "Updated complaint status is now visible to the student on their dashboard"],
        ].map(([step, action, reaction]) => new TableRow({
          children: [
            cell(step, { width: COL(0.08), center: true, bg: step ? GREY : WHITE }),
            cell(action, { width: COL(0.46) }),
            cell(reaction, { width: COL(0.46) })
          ]
        }))
      ]
    }),
    ucTable([
      ["Alternate Scenarios", "", true],
      ["4a", "If the complaint is already resolved, system still allows re-opening by changing status back to 'in-progress'"],
      ["Post Conditions", "", true],
      ["1", "Complaint record is updated with new status and priority"],
      ["2", "Student can see the updated status ('In Progress' or 'Resolved') on their complaint dashboard"],
      ["Use Case Cross-referenced", "UC-03 (Student Submits Complaint)"],
    ]),
    space(200),

    // UC-05
    h(HeadingLevel.HEADING_3, "4.3.5 UC-05: Submit Visitor Request"),
    ucTable([
      ["Use Case ID: UC-05 — Submit Visitor Request", "", true],
      ["Use Case ID", "UC-05"],
      ["Actors", "Student"],
      ["Feature", "Visitor Management — Request Submission"],
      ["Pre-condition", "Student is logged in with an active session"],
    ]),
    new Table({
      width: { size: CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: [COL(0.08), COL(0.46), COL(0.46)],
      rows: [
        new TableRow({ children: [hCell("Step#", COL(0.08)), hCell("Actor Action", COL(0.46)), hCell("System Response", COL(0.46))] }),
        ...[
          ["1", "Student navigates to 'Visitor Requests' in their dashboard", "System displays past visitor requests and a 'New Request' button"],
          ["2", "Student clicks 'New Request' and fills in: visitor name, CNIC, relationship, expected date and time", "System validates all required fields"],
          ["3", "Student submits the form", "System sends POST /api/visitors with visitor data"],
          ["4", "", "System creates a visitor record with status='pending'"],
          ["5", "", "System returns the record and displays it in the student's visitor list"],
        ].map(([step, action, reaction]) => new TableRow({
          children: [
            cell(step, { width: COL(0.08), center: true, bg: step ? GREY : WHITE }),
            cell(action, { width: COL(0.46) }),
            cell(reaction, { width: COL(0.46) })
          ]
        }))
      ]
    }),
    ucTable([
      ["Alternate Scenarios", "", true],
      ["2a", "If CNIC format is invalid, system highlights the field and prevents submission"],
      ["Post Conditions", "", true],
      ["1", "Visitor request record created with status 'pending'"],
      ["2", "Request appears in the warden's visitor approval queue"],
      ["Use Case Cross-referenced", "UC-06 (Warden Approves Visitor), UC-07 (Guard Logs Entry/Exit)"],
    ]),
    space(200),

    // UC-06
    h(HeadingLevel.HEADING_3, "4.3.6 UC-06: Guard Logs Visitor Entry/Exit"),
    ucTable([
      ["Use Case ID: UC-06 — Guard Logs Visitor Entry/Exit", "", true],
      ["Use Case ID", "UC-06"],
      ["Actors", "Security Guard"],
      ["Feature", "Visitor Management — Entry/Exit Logging"],
      ["Pre-condition", "Guard is logged in; at least one visitor request has status='approved'"],
    ]),
    new Table({
      width: { size: CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: [COL(0.08), COL(0.46), COL(0.46)],
      rows: [
        new TableRow({ children: [hCell("Step#", COL(0.08)), hCell("Actor Action", COL(0.46)), hCell("System Response", COL(0.46))] }),
        ...[
          ["1", "Guard navigates to 'Visitor Log' on their dashboard", "System displays approved visitor requests for today"],
          ["2", "Guard identifies the visiting person and clicks 'Log Entry'", "System records entryTime as current timestamp"],
          ["3", "Visitor departs; guard clicks 'Log Exit' against the same record", "System records exitTime as current timestamp"],
          ["4", "", "System sends PATCH /api/visitors/{id} with updated entryTime and/or exitTime"],
          ["5", "", "System confirms update and refreshes the visitor log"],
        ].map(([step, action, reaction]) => new TableRow({
          children: [
            cell(step, { width: COL(0.08), center: true, bg: step ? GREY : WHITE }),
            cell(action, { width: COL(0.46) }),
            cell(reaction, { width: COL(0.46) })
          ]
        }))
      ]
    }),
    ucTable([
      ["Alternate Scenarios", "", true],
      ["2a", "If visitor does not appear by expected time, guard marks a note; no automated rejection occurs in MVP"],
      ["Post Conditions", "", true],
      ["1", "Visitor record updated with actual entry and exit times"],
      ["2", "Full visit log is available to admin and warden for audit"],
      ["Use Case Cross-referenced", "UC-05 (Submit Visitor Request), UC-07 (Late Arrival Logging)"],
    ]),
    space(200),

    // UC-07
    h(HeadingLevel.HEADING_3, "4.3.7 UC-07: Guard Records Late Arrival"),
    ucTable([
      ["Use Case ID: UC-07 — Guard Records Late Arrival", "", true],
      ["Use Case ID", "UC-07"],
      ["Actors", "Security Guard"],
      ["Feature", "Visitor Management — Late Arrival Logging"],
      ["Pre-condition", "Guard is logged in; a student returns to the hostel after curfew"],
    ]),
    new Table({
      width: { size: CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: [COL(0.08), COL(0.46), COL(0.46)],
      rows: [
        new TableRow({ children: [hCell("Step#", COL(0.08)), hCell("Actor Action", COL(0.46)), hCell("System Response", COL(0.46))] }),
        ...[
          ["1", "Guard navigates to 'Late Arrivals' on their dashboard", "System shows list of previous late arrival records"],
          ["2", "Guard clicks 'Log Late Arrival' and fills in: student name/ID, room number, time, and note (reason)", "System validates required fields"],
          ["3", "Guard submits the form", "System sends POST /api/late-arrivals with the record"],
          ["4", "", "System creates a late_arrivals record with current date and the provided time"],
          ["5", "", "Record is now visible to the warden for follow-up"],
        ].map(([step, action, reaction]) => new TableRow({
          children: [
            cell(step, { width: COL(0.08), center: true, bg: step ? GREY : WHITE }),
            cell(action, { width: COL(0.46) }),
            cell(reaction, { width: COL(0.46) })
          ]
        }))
      ]
    }),
    ucTable([
      ["Alternate Scenarios", "", true],
      ["2a", "If student ID cannot be found in the system, guard can still log the arrival with the student's stated name"],
      ["Post Conditions", "", true],
      ["1", "Late arrival record persisted in the database"],
      ["2", "Warden can view the record and take disciplinary action if necessary"],
      ["Use Case Cross-referenced", "UC-06 (Visitor Entry/Exit Logging)"],
    ]),
    space(200),

    // UC-08
    h(HeadingLevel.HEADING_3, "4.3.8 UC-08: Admin Publishes Emergency Broadcast"),
    ucTable([
      ["Use Case ID: UC-08 — Publish Emergency Broadcast", "", true],
      ["Use Case ID", "UC-08"],
      ["Actors", "Admin, Warden"],
      ["Feature", "Emergency Broadcast Module"],
      ["Pre-condition", "Admin or Warden is logged in"],
    ]),
    new Table({
      width: { size: CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: [COL(0.08), COL(0.46), COL(0.46)],
      rows: [
        new TableRow({ children: [hCell("Step#", COL(0.08)), hCell("Actor Action", COL(0.46)), hCell("System Response", COL(0.46))] }),
        ...[
          ["1", "Admin/Warden navigates to 'Broadcasts' module", "System displays broadcast history and 'New Broadcast' button"],
          ["2", "Admin/Warden fills in: title, message body, urgency level (Info/Warning/Urgent)", "System validates that title and message are not empty"],
          ["3", "Admin/Warden clicks 'Publish'", "System sends POST /api/broadcasts with broadcast data"],
          ["4", "", "System creates a broadcast record with current timestamp and empty readers list"],
          ["5", "", "The broadcast immediately appears as a banner on every active student dashboard"],
          ["6", "Student reads and dismisses the broadcast", "System sends PATCH /api/broadcasts/{id} adding the student's ID to the readers array"],
        ].map(([step, action, reaction]) => new TableRow({
          children: [
            cell(step, { width: COL(0.08), center: true, bg: step ? GREY : WHITE }),
            cell(action, { width: COL(0.46) }),
            cell(reaction, { width: COL(0.46) })
          ]
        }))
      ]
    }),
    ucTable([
      ["Alternate Scenarios", "", true],
      ["2a", "If title or message is empty, system prevents submission"],
      ["Post Conditions", "", true],
      ["1", "Broadcast record stored in database with urgency, author, and timestamp"],
      ["2", "Admin can view reader count to track message reach"],
      ["Use Case Cross-referenced", "None"],
    ]),
    space(200),

    // UC-09
    h(HeadingLevel.HEADING_3, "4.3.9 UC-09: Admin Manages Room Records"),
    ucTable([
      ["Use Case ID: UC-09 — Admin/Warden Manages Room Records", "", true],
      ["Use Case ID", "UC-09"],
      ["Actors", "Warden, Admin (view only)"],
      ["Feature", "Room & Inventory Management"],
      ["Pre-condition", "Warden is logged in"],
    ]),
    new Table({
      width: { size: CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: [COL(0.08), COL(0.46), COL(0.46)],
      rows: [
        new TableRow({ children: [hCell("Step#", COL(0.08)), hCell("Actor Action", COL(0.46)), hCell("System Response", COL(0.46))] }),
        ...[
          ["1", "Warden navigates to 'Rooms' module", "System displays all rooms with floor, type, occupancy, status, and assets"],
          ["2", "Warden clicks 'Add Room' and fills in: room number, floor, type (single/double/triple), capacity, and assets list", "System validates input"],
          ["3", "Warden submits the form", "System sends POST /api/rooms; new room added with status='available'"],
          ["4", "Warden clicks 'Edit' on an existing room and updates fields or asset inventory", "System sends PUT /api/rooms/{id} with updated data"],
          ["5", "Warden deletes a room", "System sends DELETE /api/rooms/{id} and removes it from the database"],
        ].map(([step, action, reaction]) => new TableRow({
          children: [
            cell(step, { width: COL(0.08), center: true, bg: step ? GREY : WHITE }),
            cell(action, { width: COL(0.46) }),
            cell(reaction, { width: COL(0.46) })
          ]
        }))
      ]
    }),
    ucTable([
      ["Alternate Scenarios", "", true],
      ["2a", "If room number already exists, system rejects and returns an error"],
      ["Post Conditions", "", true],
      ["1", "Room records are created, updated, or removed in the rooms table"],
      ["2", "Changes are reflected immediately in the room list view"],
      ["Use Case Cross-referenced", "None"],
    ]),
    space(200),

    // UC-10
    h(HeadingLevel.HEADING_3, "4.3.10 UC-10: Student Submits Payment"),
    ucTable([
      ["Use Case ID: UC-10 — Student Submits Payment", "", true],
      ["Use Case ID", "UC-10"],
      ["Actors", "Student"],
      ["Feature", "Payment Management"],
      ["Pre-condition", "Student is logged in; fee for the selected month is not yet marked as paid"],
    ]),
    new Table({
      width: { size: CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: [COL(0.08), COL(0.46), COL(0.46)],
      rows: [
        new TableRow({ children: [hCell("Step#", COL(0.08)), hCell("Actor Action", COL(0.46)), hCell("System Response", COL(0.46))] }),
        ...[
          ["1", "Student navigates to 'Payments' module", "System displays the student's payment history with statuses"],
          ["2", "Student clicks 'Submit Payment' and selects month and amount (Rs. 8,500)", "System displays confirmation prompt"],
          ["3", "Student confirms payment", "System sends POST /api/payments with payment data"],
          ["4", "", "System creates a payment record with status='paid', current date, and generates a receipt ID"],
          ["5", "", "Digital receipt is displayed to the student"],
        ].map(([step, action, reaction]) => new TableRow({
          children: [
            cell(step, { width: COL(0.08), center: true, bg: step ? GREY : WHITE }),
            cell(action, { width: COL(0.46) }),
            cell(reaction, { width: COL(0.46) })
          ]
        }))
      ]
    }),
    ucTable([
      ["Alternate Scenarios", "", true],
      ["3a", "If a payment for the same month already exists, system warns the student before allowing duplicate submission"],
      ["Post Conditions", "", true],
      ["1", "Payment record stored with status='paid' and receipt ID"],
      ["2", "Admin can see the payment in the financial report"],
      ["Use Case Cross-referenced", "None"],
    ]),
    pageBreak()
  ];
}

// ─── SECTION 5: NON-FUNCTIONAL REQUIREMENTS ───────────────────────────────────
function section5() {
  return [
    h(HeadingLevel.HEADING_1, "5. Non-Functional Requirements"),
    divider(),
    h(HeadingLevel.HEADING_2, "5.1 Performance Requirements"),
    new Table({
      width: { size: CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: [COL(0.1), COL(0.35), COL(0.55)],
      rows: [
        new TableRow({ children: [hCell("ID", COL(0.1)), hCell("Requirement", COL(0.35)), hCell("Detail", COL(0.55))] }),
        ...[
          ["NFR-01", "Response Time", "All API calls must return a response within 3 seconds under normal load (up to 50 concurrent users)"],
          ["NFR-02", "Page Load Time", "The frontend dashboard must load fully within 5 seconds on a standard broadband connection"],
          ["NFR-03", "Concurrency", "The system must support at least 50 concurrent users without data corruption or deadlocks"],
          ["NFR-04", "Database Performance", "SQLite queries must complete within 500 milliseconds for standard read/write operations"],
          ["NFR-05", "Data Integrity", "All database write operations must be atomic — partial writes must be rolled back on failure"],
        ].map(([id, req, detail]) => new TableRow({
          children: [
            cell(id, { bg: GREY, bold: true, width: COL(0.1) }),
            cell(req, { bg: LIGHT_BLUE, width: COL(0.35) }),
            cell(detail, { width: COL(0.55) })
          ]
        }))
      ]
    }),
    space(),
    h(HeadingLevel.HEADING_2, "5.2 Safety Requirements"),
    new Table({
      width: { size: CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: [COL(0.1), COL(0.35), COL(0.55)],
      rows: [
        new TableRow({ children: [hCell("ID", COL(0.1)), hCell("Requirement", COL(0.35)), hCell("Detail", COL(0.55))] }),
        ...[
          ["NFR-06", "Data Backup", "The SQLite database file (hostel.db) must be backed up at least daily during active use to prevent data loss"],
          ["NFR-07", "Graceful Degradation", "If the backend server is unavailable, the frontend must display a clear error message rather than crashing silently"],
          ["NFR-08", "Input Validation", "All form inputs must be validated server-side (in addition to client-side) to prevent malformed data entry"],
          ["NFR-09", "Error Handling", "All unhandled exceptions must be caught and logged; the user must receive a meaningful error message"],
        ].map(([id, req, detail]) => new TableRow({
          children: [
            cell(id, { bg: GREY, bold: true, width: COL(0.1) }),
            cell(req, { bg: LIGHT_BLUE, width: COL(0.35) }),
            cell(detail, { width: COL(0.55) })
          ]
        }))
      ]
    }),
    space(),
    h(HeadingLevel.HEADING_2, "5.3 Security Requirements"),
    new Table({
      width: { size: CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: [COL(0.1), COL(0.35), COL(0.55)],
      rows: [
        new TableRow({ children: [hCell("ID", COL(0.1)), hCell("Requirement", COL(0.35)), hCell("Detail", COL(0.55))] }),
        ...[
          ["NFR-10", "Role-Based Access Control", "Each API endpoint must enforce role-based access; unauthorized role access must return HTTP 403"],
          ["NFR-11", "Password Storage", "For MVP, passwords are stored in plaintext; production deployment must use bcrypt hashing with a salt of at least 12 rounds"],
          ["NFR-12", "Session Management", "User session data (role, ID) must be maintained client-side; sensitive operations must verify session validity on each request"],
          ["NFR-13", "SQL Injection Prevention", "All database queries must use parameterized statements (SQLite3 '?' placeholders); no raw string concatenation in queries"],
          ["NFR-14", "Financial Data Isolation", "Security Guards must have zero access to any payment or financial data; enforced both at the UI and API level"],
          ["NFR-15", "Student Data Privacy", "Students can only view their own complaint, payment, and visitor records; cross-student data access is prohibited"],
        ].map(([id, req, detail]) => new TableRow({
          children: [
            cell(id, { bg: GREY, bold: true, width: COL(0.1) }),
            cell(req, { bg: LIGHT_BLUE, width: COL(0.35) }),
            cell(detail, { width: COL(0.55) })
          ]
        }))
      ]
    }),
    space(),
    h(HeadingLevel.HEADING_2, "5.4 User Documentation"),
    p("The following user documentation components will be delivered alongside the DHMS software:"),
    bullet("User Manual: A PDF guide covering login procedures, module navigation, and key workflows for each of the four roles (Admin, Warden, Guard, Student)"),
    bullet("In-App Tooltips: Contextual help text displayed within forms explaining field requirements (e.g., CNIC format, expected date format)"),
    bullet("README File: A developer-facing markdown file in the GitHub repository detailing setup instructions, environment requirements, and how to initialize the database using __init__db.py"),
    bullet("API Documentation: Inline code comments in app.py describing each endpoint's method, URL, expected request body, and response format"),
    pageBreak()
  ];
}

// ─── SECTION 6: REFERENCES ────────────────────────────────────────────────────
function section6() {
  return [
    h(HeadingLevel.HEADING_1, "6. References"),
    divider(),
    new Table({
      width: { size: CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: [COL(0.08), COL(0.45), COL(0.47)],
      rows: [
        new TableRow({ children: [hCell("#", COL(0.08)), hCell("Reference", COL(0.45)), hCell("Source / URL", COL(0.47))] }),
        ...[
          ["[1]", "IEEE Std 830-1998 — IEEE Recommended Practice for Software Requirements Specifications", "IEEE Standards Association"],
          ["[2]", "Flask Documentation — Micro Web Framework for Python", "https://flask.palletsprojects.com"],
          ["[3]", "SQLite Documentation — Serverless Relational Database", "https://www.sqlite.org/docs.html"],
          ["[4]", "Bootstrap 5 Documentation — Frontend CSS Framework", "https://getbootstrap.com/docs/5.0"],
          ["[5]", "Python 3 Official Documentation", "https://docs.python.org/3/"],
          ["[6]", "DHMS Project Proposal — Mahad Munawar & Dev Kumar, March 2026", "Internal Document — FAST NUCES Karachi"],
          ["[7]", "Flask-CORS Extension Documentation", "https://flask-cors.readthedocs.io"],
        ].map(([num, ref, src]) => new TableRow({
          children: [
            cell(num, { bg: GREY, bold: true, width: COL(0.08), center: true }),
            cell(ref, { width: COL(0.45) }),
            cell(src, { width: COL(0.47) })
          ]
        }))
      ]
    }),
    pageBreak()
  ];
}

// ─── SECTION 7: APPENDICES ────────────────────────────────────────────────────
function section7() {
  return [
    h(HeadingLevel.HEADING_1, "7. Appendices"),
    divider(),
    h(HeadingLevel.HEADING_2, "Appendix A: Database Schema"),
    p("The following tables constitute the DHMS SQLite database (hostel.db):"),
    new Table({
      width: { size: CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: [COL(0.25), COL(0.45), COL(0.3)],
      rows: [
        new TableRow({ children: [hCell("Table", COL(0.25)), hCell("Columns", COL(0.45)), hCell("Purpose", COL(0.3))] }),
        ...[
          ["users", "id, name, email, password, role, studentId, room, phone, cnic", "All system users (admin, warden, guard, student)"],
          ["rooms", "id, number, floor, type, occupied, capacity, status, assets (JSON)", "Room records with asset inventories"],
          ["complaints", "id, studentId, studentName, category, subject, description, status, priority, date, updatedAt", "Student complaint submissions"],
          ["payments", "id, studentId, studentName, amount, month, status, date, receipt", "Hostel fee payment records"],
          ["visitors", "id, studentId, studentName, visitorName, visitorCnic, relationship, expectedDate, expectedTime, status, entryTime, exitTime", "Visitor request and log records"],
          ["late_arrivals", "id, studentId, studentName, roomNo, time, date, note", "Late arrival logs recorded by guard"],
          ["broadcasts", "id, title, message, urgency, authorName, date, readers (JSON)", "Emergency broadcast notices"],
        ].map(([tbl, cols, purpose]) => new TableRow({
          children: [
            cell(tbl, { bg: LIGHT_BLUE, bold: true, width: COL(0.25) }),
            cell(cols, { width: COL(0.45) }),
            cell(purpose, { width: COL(0.3) })
          ]
        }))
      ]
    }),
    space(200),
    h(HeadingLevel.HEADING_2, "Appendix B: REST API Endpoint Summary"),
    new Table({
      width: { size: CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: [COL(0.12), COL(0.33), COL(0.55)],
      rows: [
        new TableRow({ children: [hCell("Method", COL(0.12)), hCell("Endpoint", COL(0.33)), hCell("Description", COL(0.55))] }),
        ...[
          ["GET", "/api/all-data", "Returns all system data (users, rooms, complaints, payments, visitors, late arrivals, broadcasts, mess menu) in a single response"],
          ["POST", "/api/login", "Authenticates a user; returns user object including role on success"],
          ["POST", "/api/register", "Student self-registration endpoint"],
          ["POST", "/api/users/staff", "Admin creates warden or guard account"],
          ["GET / POST", "/api/users", "List all users or add a user"],
          ["GET / PUT / DELETE", "/api/users/{id}", "Get, update, or delete a specific user"],
          ["GET / POST", "/api/rooms", "List all rooms or add a room"],
          ["PUT / DELETE", "/api/rooms/{id}", "Update or delete a specific room"],
          ["GET / POST", "/api/complaints", "List complaints or submit a new complaint"],
          ["PUT / DELETE", "/api/complaints/{id}", "Update complaint status or delete a complaint"],
          ["GET / POST", "/api/payments", "List payments or submit a new payment"],
          ["PUT", "/api/payments/{id}", "Update payment status (admin)"],
          ["GET / POST", "/api/visitors", "List visitor requests or submit a new request"],
          ["PATCH / DELETE", "/api/visitors/{id}", "Update visitor status/entry/exit or delete a request"],
          ["GET / POST", "/api/late-arrivals", "List late arrival records or add a new record"],
          ["DELETE", "/api/late-arrivals/{id}", "Delete a late arrival record"],
          ["GET / POST", "/api/broadcasts", "List broadcasts or publish a new one"],
          ["PATCH / DELETE", "/api/broadcasts/{id}", "Mark broadcast as read or delete it"],
        ].map(([method, endpoint, desc]) => new TableRow({
          children: [
            cell(method, { bg: GREY, bold: true, width: COL(0.12), center: true }),
            cell(endpoint, { bg: LIGHT_BLUE, width: COL(0.33) }),
            cell(desc, { width: COL(0.55) })
          ]
        }))
      ]
    }),
    space(200),
    h(HeadingLevel.HEADING_2, "Appendix C: Agile Sprint Plan"),
    new Table({
      width: { size: CONTENT_WIDTH, type: WidthType.DXA },
      columnWidths: [COL(0.1), COL(0.25), COL(0.45), COL(0.2)],
      rows: [
        new TableRow({ children: [hCell("Week", COL(0.1)), hCell("Milestone", COL(0.25)), hCell("Key Activities", COL(0.45)), hCell("Owner", COL(0.2))] }),
        ...[
          ["Wk 8", "Project Proposal", "Finalize scope, problem statement, objectives, timeline", "Full Team"],
          ["Wk 9", "Requirements Gathering", "Stakeholder interviews, student surveys, contextual inquiry", "Full Team"],
          ["Wk 10", "SRS Document", "Draft SRS with use cases, ER diagram, functional hierarchy", "Full Team"],
          ["Wk 11", "Design Kick-off", "Database schema, API contracts, low-fidelity wireframes", "Full Team"],
          ["Wk 12", "System Architecture", "High-fidelity mockups, architecture diagram, component design", "Full Team"],
          ["Wk 13", "Core Development", "Implement User, Room, Complaint, Visitor modules; unit testing", "Full Team"],
          ["Wk 14", "Alpha Release", "Deploy Alpha; gather feedback; submit Milestone 4", "Full Team"],
          ["Wk 15", "Feedback Iteration", "Payment, Mess, Broadcast modules; integration testing", "Full Team"],
          ["Wk 16", "Final Presentation", "Polish UI, finalize documentation, demo script", "Full Team"],
        ].map(([week, milestone, activities, owner]) => new TableRow({
          children: [
            cell(week, { bg: GREY, bold: true, width: COL(0.1) }),
            cell(milestone, { bg: LIGHT_BLUE, width: COL(0.25) }),
            cell(activities, { width: COL(0.45) }),
            cell(owner, { width: COL(0.2) })
          ]
        }))
      ]
    }),
  ];
}

// ─── DOCUMENT ASSEMBLY ────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }, {
          level: 1, format: LevelFormat.BULLET, text: "\u25CB",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 1080, hanging: 360 } } }
        }]
      },
      {
        reference: "numbers",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]
      }
    ]
  },
  styles: {
    default: {
      document: { run: { font: "Arial", size: 22 } }
    },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: BLUE },
        paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 0 }
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: MID_BLUE },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 }
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: "2E5D8E" },
        paragraph: { spacing: { before: 160, after: 80 }, outlineLevel: 2 }
      },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: "DHMS — Software Requirements Specification", font: "Arial", size: 18, color: "888888" }),
              new TextRun({ text: "   |   Version 1.0", font: "Arial", size: 18, color: "888888" }),
            ],
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" } },
            spacing: { after: 100 }
          })
        ]
      })
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "FAST NUCES Karachi — Department of Computer Science   |   Page ", font: "Arial", size: 18, color: "888888" }),
              new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: "888888" }), // CORRECTED LINE
            ],
            border: { top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" } },
            spacing: { before: 100 }
          })
        ]
      })
    },
    children: [
      ...coverPage(),
      ...frontMatter(),
      ...section1(),
      ...section2(),
      ...section3(),
      ...section4(),
      ...section5(),
      ...section6(),
      ...section7(),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('./DHMS_SRS_v1.0.docx', buffer);
  console.log('SRS document generated successfully!');
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});