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

Currently this is just a demo of the project; porting it to a live version may prove to be quite difficult. If you'd like to test it, clone the repo and add an OpenAI API key and MongoDB URI to the `.env` file.

### How it works

Users create or join lecture-specific note-taking sessions and write in their own formatting style. The AI analyzes your personal style and identifies gaps in your notes by cross-referencing with other users' notes. When it generates suggestions to fill those gaps, it matches your existing formatting so the additions feel seamless.

### Technical details

We used QuillJS and its Delta format for consistent rich text handling, which let us preserve formatting styles across different user contributions and track exactly where suggestions should be placed. The AI integration runs through OpenAI's API with prompting techniques designed to maintain format consistency. The backend uses MongoDB for storing note sessions and user data.

### Challenges

The hardest part was training the AI to output correctly styled content and place it in the right position. Setting up MongoDB and designing the data structure was also tricky, along with simulating multiple users within the hackathon's time constraints and developing a reliable method to analyze individual formatting styles.
