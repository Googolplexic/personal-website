---
title: MACHI-NE-
summary: Client-side emergency reporting system. Made for CMPT 272 at SFU.
SEOdescription: Portfolio showcase of MACHI-NE- - a client-side emergency reporting system created for CMPT 272 at SFU. View project details, features, and implementation of this emergency reporting application.
keywords:
- emergency response system
- incident reporting
- web-based emergency management
- interactive map application
- React emergency system
- leaflet map integration
- client-side storage
- incident tracking
- emergency dispatch
technologies: 
- TypeScript
- React
- Tailwind CSS
- HTML/CSS
- MD5 Hashing
- Leaflet
- DOM Storage API
githubUrl: https://github.com/MACHI-NE/MACHI-NE-
liveUrl: https://machine.colemanlai.com/
startDate: 2024-11
endDate: 2024-12
tags:
- school-project
- frontend
---

## A web-based emergency reporting system

### Made for CMPT 272: Client-Side Development at SFU

MACHI-NE- is a client-side emergency reporting system developed for CMPT 272 at Simon Fraser University. As it is purely client-side, it is more of a proof-of-concept than a fully-fledged emergency response system.

### Reporting

Users can report an incident by specifying the type (including custom types), location (both name and coordinates selected through a map interface), a description, an image attachment, and contact information. Reported incidents show up in a list view that can be sorted by time, region, type, and status.

### Map Interface

The map uses Leaflet with OpenStreetMaps and supports full pan and zoom with custom markers for incident locations. There's a sidebar that lists incidents on the map, with the option to show all incidents or just the ones currently visible. Clicking a marker focuses on that incident and shows its details.

### Incident Management

Operators can edit incidents and change their status through password-protected operations. Passwords are MD5 hashed and stored in local storage, and changing a password requires verification of the old one.

The whole thing is built with React and TypeScript, styled with Tailwind CSS, and uses the DOM Storage API for data persistence since there's no backend.
