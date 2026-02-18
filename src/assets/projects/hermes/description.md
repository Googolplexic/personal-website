---
title: Hermes - API Monitoring System
summary: Automated asynchronous REST API monitoring tool designed for AI agents and humans. Monitor API responses over time with validation, activation, and data retrieval features.
SEOdescription: Portfolio showcase of Hermes - an automated API monitoring system for tracking REST endpoints. Built for the MCP Hackathon with Python, Gradio, Firebase, and PostgreSQL.
keywords:
- API monitoring
- REST API automation
- MCP hackathon
- Gradio interface
- Firebase authentication
- PostgreSQL database
- API performance tracking
- asynchronous monitoring
- API validation
- model context protocol
technologies:
- Python
- Gradio
- Firebase Auth
- PostgreSQL
- Prisma ORM
- TypeScript
- Next.js
- Tailwind CSS
- Docker
- Vercel
- Render
githubUrl: https://github.com/IsithaT/MCP-Hackathon
liveUrl: https://huggingface.co/spaces/Agents-MCP-Hackathon/hermes
startDate: 2025-06
tags:
- hackathon
- full-stack
- ai-tools
---

## Automated asynchronous REST API monitoring for AI agents and humans

### Built for the MCP (Model Context Protocol) Hackathon

Hermes is an API monitoring system designed primarily for AI agents (like Claude) but also usable by humans. You input any API configuration and it monitors responses over time, enabling data collection, tracking, and performance analysis.

This was created by a team of 4 CS students, and it was our first experience with many of the technologies involved, including database management, servers, and hosting platforms.

### How it works

You start by getting an MCP API key through the [key generation portal](https://mcp-hackathon.vercel.app/main) using Google authentication. Then you input your API endpoint details and set a monitoring schedule (anywhere from every 15 minutes to once a week). After testing the API call and verifying the response, you get a `config_id` that you use to activate monitoring and retrieve collected data.

Data retrieval has three modes: summary (quick overview optimized for LLMs), details (full API responses with minimal metadata), and full (everything including debug info).

### Architecture

The frontend is a Next.js app with Tailwind CSS deployed on Vercel, handling API key generation through Firebase Authentication with Google OAuth. The monitoring backend runs on Python with Gradio, deployed on Hugging Face Spaces. There's also a Node.js/Express API server for key management. Everything sits on PostgreSQL with Prisma ORM, and the monitoring service is containerized with Docker on Render.

### Challenges

The biggest challenge was working around Gradio's stateless nature. We ended up using MCP API keys as user identifiers to enable secure data persistence across sessions. We also implemented a multi-step validation process so users can verify API responses look right before committing to a monitoring schedule. Data gets automatically cleaned up after 14 days for privacy.

### Links

The [live application](https://huggingface.co/spaces/Agents-MCP-Hackathon/hermes) is on Hugging Face, and there's a [demo video](https://youtu.be/NldpnfHg6eg) on YouTube.
