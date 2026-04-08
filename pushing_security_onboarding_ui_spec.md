# PushingSecurity Universal Onboarding UI Specification

## Purpose
This document defines the user interface and interaction model for `PushingSecurity`, the universal onboarding "front door" for the Pushing Capital ecosystem.

## Design Principles
- **Clarity & Focus**: Minimalist design to reduce cognitive load during sensitive data entry.
- **Professional & Secure**: Trust-building aesthetics (clean typography, subtle security indicators).
- **Progressive Disclosure**: Only show fields relevant to the selected onboarding mode.
- **Interactive Feedback**: Real-time validation and OCR status updates.

---

## 1. Landing / Entry Screen
The initial screen where users identify their intent.

### Components:
- **Hero Header**: "Welcome to Pushing Capital. Let's get you started."
- **Mode Selection (Cards)**:
    - **Customer**: "I need service (Transport, Inspection, Parts, Finance)."
    - **Worker / Subcontractor**: "I want to join the network (Field Worker, Carrier, Vendor)."
    - **Partner / Operator**: "I am an internal operator or channel partner."
- **Security Footer**: "Securely managed by PushingSecurity. All data is encrypted."

---

## 2. Intake Classification (The "Classification" Step)
Refines the intent after the mode is selected.

### Components:
- **Mode: Customer**:
    - Select Service: [Transport] [Inspection] [Parts Sales] [Finance/Lender Matching] [DMV/Compliance]
- **Mode: Worker**:
    - Select Type: [Field Worker] [Carrier] [Service Vendor]
- **Dynamic Form Trigger**: Loading the correct `PushingForms` matrix based on selection.

---

## 3. Data Entry & Evidence Capture
The core intake interface.

### Components:
- **Personal/Business Info**: Standard fields (Name, Email, Phone, Company).
- **Document Capture Widget**:
    - "Upload or Snap Photo of ID / License"
    - **OCR Status Bar**: [Scanning...] [Extracting...] [Verified ✅]
- **Face Presence Check**: Simple UI circle for headshot alignment.
- **Progress Indicator**: [Intent] -> [Details] -> [Documents] -> [Review]

---

## 4. Review & Handoff
Final confirmation and lane binding.

### Components:
- **Summary View**: Grouped display of all entered data and extracted OCR facts.
- **Terms & Consent**: Legal template binding (E-signature).
- **Final CTA**: "Submit and Start Onboarding"
- **Success State**: "Success! Your [Lane] record has been created. A P worker will contact you shortly."

---

## UI Color Palette (The "Security" Aesthetic)
- **Primary**: Deep Navy (`#0A192F`) - Stability and trust.
- **Accent**: Pushing Blue (`#007BFF`) - Action and connectivity.
- **Surface**: Off-White / Light Gray (`#F8F9FA`) - Cleanliness.
- **Success**: Emerald Green (`#28A745`) - Verification.
- **Alert**: Safety Orange (`#FD7E14`) - Attention to data gaps.

---

## Next Moves for Implementation
1. **Mockup Design**: Create high-fidelity wireframes in the `pushing-architecture` repo.
2. **Form Binding**: Map the UI fields to the `p242835887_service_requests` object.
3. **Worker Handoff**: Ensure `Push P` receives the `onboarding_complete` signal.
