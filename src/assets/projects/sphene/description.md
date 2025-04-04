---
title: Project SPHENE
summary: Asynchronous collaborative note-taking web application through formatted AI suggestions. Winner of Most Original award at DreamHacks 2025.
SEOdescription: Portfolio showcase of Project SPHENE - an asynchronous collaborative note-taking web application that utilizes AI to provide formatted suggestions to fill in gaps in notes based on notes of other users. 
keywords:
- AI note-taking
- collaborative writing
- formatted suggestions
- lecture notes
- student collaboration
- personalized formatting
- asynchronous learning
technologies: 
- HTML/CSS
- TypeScript
- React
- MongoDB
- OpenAI GPT
- QuillJS
- Vite
githubUrl: https://github.com/TMZero-c/Dreamhacks2025-ProjectSphene
startDate: 2025-03
endDate: 2025-03
tags:
- hackathon
- ai
- full-stack
---

## Project SPHENE: Asynchronous AI-powered collaborative note-taking application

### Winner of Most Original award at DreamHacks 2025

Project SPHENE, short for "(a)Synchronous Peer-Help Engine for Note Enhancement," addresses a common problem among students: missing parts of lecture notes and having to fill in the gaps with notes from classmates who might format their content completely differently. SPHENE solves this by preserving each user's unique note-taking style while filling in missing content through AI analysis of other students' notes.

Currently this is just a demo of the project; porting it to a live version may prove to be quite difficult. If you'd like to test it, out clone the repo and add OpenAI API key and MongoDB URI to the `.env` file.

### Key Features

- **Style-Preserving Note Suggestions**
  - AI analyzes your personal note-taking style and formatting
  - Generates missing content that matches your existing notes
  - Seamlessly integrates suggested content with your own writing

- **Collaborative Session Management**
  - Create and join lecture-specific note-taking sessions
  - Users write on their own notes, allowing for them to use their own formatting styles
  - AI suggestions are tailored to each user's notes, ensuring consistency

- **Smart Content Analysis**
  - Identifies gaps in individual note sets
  - Cross-references with other users' notes
  - Prioritizes essential information from multiple sources

### Technical Implementation

- **Rich Text Editing**
  - Utilized QuillJS and its Delta format for consistent rich text handling
  - Preserved formatting styles across different user contributions
  - Enabled precise position tracking for suggestion placement

- **AI Integration**
  - OpenAI API processes and formats note suggestions
  - Format preservation through advanced prompting techniques
  - Context-aware content generation

- **Data Architecture**
  - MongoDB for storing note sessions and user data
  - React/TypeScript/Vite frontend for responsive UI
  - Comprehensive style analysis for personalized content generation

### Challenges Encountered

- Training the AI to output correctly styled content and place it in the appropriate position
- Setting up MongoDB and designing an efficient data structure
- Creating a simulation of multiple users within the hackathon's time constraints
- Developing a reliable method to analyze and preserve individual formatting styles
