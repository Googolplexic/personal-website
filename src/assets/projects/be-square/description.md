---
title: Be Square
summary: AI element generation/modification in Adobe Express. Winner of best AI hack!
SEOdescription: Portfolio showcase of Be Square - an award-winning Adobe Express AI plugin developed at StormHacks V2. View the implementation details of this hackathon project utilizing OpenAI's GPT and Whisper APIs.
keywords:
- Adobe Express plugin
- AI design tool
- OpenAI integration
- voice-to-text design
- hackathon winner
- AI assistant Doug
- creative design automation
- Adobe add-on
technologies:
- JavaScript
- HTML/CSS
- Adobe SDK
- OpenAI Whisper
- OpenAI GPT
- Node.js
- WebSocket
githubUrl: https://github.com/Googolplexic/beSquare
startDate: 2024-10
endDate: 2024-10
tags:
- hackathon
- ai
- full-stack
---

## AI element generation in Adobe Express

### Winner of best Artificial Intelligence hack at StormHacks V2 2024

This is an Adobe Express add-on that utilizes OpenAI's function calling capabilities to dynamically generate elements. Say hi to Doug!

Doug is the AI assistant that interprets natural language to process requests. It runs on OpenAI's GPT platform through a Node server using function calling capabilities. There's also voice-to-text input via OpenAI's Whisper API, and the transcription is editable so you can refine things before sending.

The add-on supports context, so you can build on previous requests. There's a lot of potential for further customizability since the source code can be modified to add more functions like specific shapes or custom templates. We only implemented a small amount since it was a hackathon project, but it could also potentially integrate with other add-ons.

### Challenges

Adobe doesn't allow external modules on the client side, which prevented an easy way to make OpenAI API calls. Functions had to be called through the Node server, which required a different approach since the function calling capabilities couldn't call these functions directly. Add in the usual hackathon chaos and learning new technologies on the fly, and it was quite the experience.
