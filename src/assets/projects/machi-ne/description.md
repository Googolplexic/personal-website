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

The project features:

- **Emergency Reporting System**
  - A user can report an incident with the following parameters:
    - Incident type
      - Allows for custom incident types
    - Location
      - Both name and coordinates
      - Coordinates are input through a map interface
    - Description
    - Image attachment
    - Contact information
  - Incident list view
    - Sortable by time, region, type, and status

- **Interactive Map Interface**
  - Leaflet integration with OpenStreetMaps
    - Full pan and zoom functionality
    - Custom markers for incident locations
  - Sidebar incident list
    - Shows incidents on the map
      - Can toggle to show all or only map-visible incidents
    - Clickable incident markers
    - Incident details and focus on click

- **Incident Management**
  - Password-protected operations
    - MD5 hashed passwords
    - Operators can edit incidents and change status
  - Password changing functionality
    - Passwords are hashed and stored in local storage
    - Password change requires old password verification

- **Technical Implementation**
  - Client-side architecture
    - DOM Storage API for data persistence
    - Responsive design patterns
    - TypeScript type safety
  - Security features
    - MD5 hash verification
    - Input sanitization
    - Error handling
  - User interface
    - React components
    - Tailwind CSS styling
    - Mobile responsiveness
    - Intuitive navigation
