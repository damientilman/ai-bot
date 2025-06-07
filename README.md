OutboundGPT is a standalone AI assistant designed to accelerate outbound marketing campaign creation.

It acts as a digital marketing copywriter, generating high-quality, structured, and persuasive content based on the campaign theme and product URLs provided by the user.

Marketing teams—especially in regulated industries—often face bottlenecks when creating campaign content from scratch. OutboundGPT helps solve this by:
	•	Generating structured copy using proven frameworks (e.g. AIDA)
	•	Extracting and synthesizing product benefits from live URLs
	•	Producing multilingual, tone-compliant content
	•	Automating repetitive writing tasks with consistent quality

Key Features
	•	Up to 18 product URLs accepted and analyzed
	•	Extracts benefits from each product page
	•	Generates a benefit summary across all products
	•	Writes an AIDA-style introduction based on extracted insights
	•	Supports file upload, image preview, and conversational memory
	•	Clean and responsive chat UI
	•	Right-side panel for input (campaign theme + product URLs)
	•	Regenerate and reset buttons for quick iteration

How It Works
	1.	Fill in the campaign theme and product URLs via the sidebar
	2.	Click “Generate” to send your input to the backend
	3.	OutboundGPT:
	•	Visits each URL
	•	Extracts product benefits
	•	Synthesizes key takeaways
	•	Writes a compelling, structured intro based on AIDA
	4.	Review, refresh, or reset content as needed

Changelog – Version 2.0

Date: June 7, 2025
Status: Stable Release

🔧 Major Updates
	•	Migrated from modal menu to right-side panel layout
	•	Added support for up to 18 product URLs (grouped into 6 expandable blocks)
	•	Implemented automatic URL parsing + benefit extraction logic (via route.js)
	•	Agent now creates a synthesized benefit summary and injects it into AIDA intro

💬 Chat Interface Improvements
	•	Fixed scroll issues during assistant output (no more page jumping)
	•	Increased chat bubble width for improved readability
	•	Adjusted padding and spacing between messages
	•	Set default assistant response to show full message (no typing effect)

🧪 Tools & Buttons
	•	Added “Reset conversation” button
	•	Updated button styling and order: Refresh / Generate / Reset
	•	Sidebar toggle via floating button (bottom-right)
	•	Refined visual hierarchy and spacing in sidebar inputs
