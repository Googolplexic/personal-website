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

## Automated Asynchronous REST API Monitoring for AI Agents and Humans

### Built for the MCP (Model Context Protocol) Hackathon 2024

Hermes is a comprehensive API monitoring system designed primarily for AI agents (like Claude) but also usable by humans. It allows users to input any API configuration and monitor responses over time, enabling data collection, tracking, and API performance analysis.

### 🏆 Hackathon Achievement

Created as part of the MCP Hackathon by a team of 4 CS students, this was our first experience with many technologies including database management, servers, and hosting platforms.

### Key Features

#### 🔍 API Validation & Configuration

- Test API endpoints before monitoring
- Verify response data matches expectations
- Support for GET, POST, PUT, DELETE methods
- Custom headers and parameters configuration
- JSON body support for complex requests

#### ⚡ Automated Monitoring

- Background task scheduling (15 minutes to 1 week intervals)
- Asynchronous API calls at specified intervals
- Automatic data collection and storage
- Start immediately or schedule for future activation

#### 📊 Flexible Data Retrieval

- **Summary mode**: Quick overview with recent results (optimized for LLMs)
- **Details mode**: Full API responses with minimal metadata
- **Full mode**: Complete data including all metadata and debug info

#### 🔐 Secure User Management

- Google OAuth authentication
- MCP API key generation and validation
- User data isolation and privacy protection
- 14-day automatic data cleanup for privacy

### Technical Architecture

#### Frontend (Key Generation Portal)

- Next.js with TypeScript
- Tailwind CSS for modern neumorphic design
- Firebase Authentication (Google OAuth)
- Deployed on Vercel

#### Backend Services

- Python with Gradio for the main monitoring interface
- Node.js/Express API server for key management
- PostgreSQL database with Prisma ORM
- Docker containerization
- Deployed on Render and Hugging Face Spaces

#### Database Design

- PostgreSQL for production data storage
- Prisma for type-safe database operations
- User authentication and API key management
- Monitoring configuration and results storage

### Workflow Process

**Step 1: Get MCP API Key**
Visit the [key generation portal](https://mcp-hackathon.vercel.app/main) to create your unique API key using Google authentication.

#### Step 2: Validate API Configuration

- Input your API endpoint details (URL, method, headers, parameters)
- Set monitoring schedule (interval and duration)
- Test the API call and verify response data
- Receive a `config_id` for the next steps

#### Step 3: Activate Monitoring

- Use the `config_id` to start background monitoring
- Monitoring begins immediately or at scheduled time
- API calls made automatically at specified intervals

#### Step 4: Retrieve Data

- Access collected data anytime using the `config_id`
- Choose data format based on your needs
- Monitor progress and API performance

### Use Cases

#### For AI Agents

- Monitor external APIs for data changes
- Track API availability and performance
- Collect data for analysis and decision making
- Automated API health checking

#### For Developers

- API uptime monitoring
- Performance benchmarking
- Data collection for analysis
- Integration testing automation

### Technical Challenges Solved

#### Stateless Architecture

Overcame Gradio's stateless nature by using MCP API keys as user identifiers, enabling secure data persistence across sessions.

#### Data Validation

Implemented multi-step validation process to ensure users are satisfied with API responses before activating monitoring.

#### Scalable Design

Built with microservices architecture allowing independent scaling of authentication, monitoring, and data retrieval services.

#### Security & Privacy

- Strict CORS policies
- User data isolation
- Automatic data cleanup
- Secure API key generation

### Future Enhancements

- **Response Formatting**: Allow users to specify custom response formats to save storage space
- **Infrastructure Optimization**: Move from Render to eliminate cold start delays
- **Advanced Analytics**: Add trend analysis and anomaly detection
- **Webhook Integration**: Real-time notifications for API changes
- **Team Collaboration**: Multi-user access to monitoring configurations

### Demo & Links

- **Live Application**: [Hermes on Hugging Face](https://huggingface.co/spaces/Agents-MCP-Hackathon/hermes)
- **API Key Portal**: [Generate MCP API Key](https://mcp-hackathon.vercel.app/main)
- **Demo Video**: [Watch on YouTube](https://youtu.be/NldpnfHg6eg)
- **Source Code**: [GitHub Repository](https://github.com/IsithaT/MCP-Hackathon)

This project showcases our ability to rapidly learn new technologies, build scalable full-stack applications, and create tools that bridge the gap between human and AI interactions with APIs.
