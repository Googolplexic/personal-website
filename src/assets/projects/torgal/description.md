---
title: Torgal
summary: Local-first AI presentation assistant that listens to your talk and advances slides automatically.
SEOdescription: Portfolio showcase of Torgal - a local-first AI presentation assistant built for nwHacks 2026. It uses on-device transcription and semantic slide matching to automate slide transitions in real time.
keywords:
- presentation assistant
- slide automation
- on-device AI
- speech-to-text
- real-time transcription
- Electron app
- faster-whisper
- sentence-transformers
- hackathon project
technologies:
- Electron
- JavaScript
- Python
- faster-whisper
- sentence-transformers
- PyMuPDF
githubUrl: https://github.com/TMZero-c/Torgal
liveUrl: https://github.com/TMZero-c/Torgal/releases/latest
startDate: 2026-01
endDate: 2026-01
tags:
- hackathon
- ai
- full-stack
---

## A local-first AI presenter that follows your speech

### Built for nwHacks 2026

Torgal is a desktop presentation assistant that automates slide transitions based on live speech. I got kind of annoyed watching A/V people forget to press the arrow keys or speakers having to manually ask for slide advancement, so my friend and I made this.

It runs entirely on the user's machine for privacy and low latency (though requires a bit too heavy of a GPU). It uses `faster-whisper` for real-time speech-to-text transcription and `sentence-transformers` to convert both the transcribed speech and the text content of each slide into embeddings. By calculating cosine similarity between the speech embedding and each slide's embedding, it determines which slide is being talked about and advances to it automatically. The app itself is built with Electron for cross-platform desktop support, and uses PyMuPDF to extract text from PDF slides.

Currently it requires a decent non-integrated GPU to even function properly, though there are a whole bunch of configs that we've added, such as some nuclear options to reduce GPU usage at the cost of accuracy. Though we're trying to remedy that.-rotate-90

Go check it out; I think it's pretty cool especially when surrounded by a landscape filled with LLM-drived apps.
