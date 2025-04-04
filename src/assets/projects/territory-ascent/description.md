---
title: Territory Ascent
summary: Jump King style multiplayer platformer game made with Pygame and socket programming.
SEOdescription: Portfolio showcase of Territory Ascent - a multiplayer platformer game inspired by Jump King, developed using Pygame and socket programming. Explore the project details, features, and implementation of this engaging gaming experience.
keywords:
- multiplayer game
- platformer
- socket programming
- Pygame
technologies: 
- Python
- Pygame
- Socket programming
githubUrl: https://github.com/AshtonMorrison/Territory-Ascent
startDate: 2025-02
endDate: 2025-04
tags:
- school-project
- game-dev
---

## Jump King style multiplayer platformer game made with Pygame and socket programming

## Made for CMPT 371: Networking

### Game Description

Territory Ascent is a multiplayer platformer game where up to 8 players compete to reach the top of a challenging map. The game features a 2D tile map with platforms that players must navigate by timing precise jumps, similar to the popular game Jump King.

### Key Features

- **Competitive Multiplayer**
  - Free-for-all gameplay for up to 8 players
  - LAN connectivity with simplified connection process
  - Real-time synchronization between all players

- **Unique Platform Mechanics**
  - Platforms change color to match the player currently standing on them
  - Platform sections become exclusive to the occupying player
  - Players who land on occupied platforms fall and respawn at the bottom

- **Intuitive Controls**
  - "A" and "D" keys for left and right movement
  - Slingshot-style jumping mechanism with visual trajectory indicator
  - Varying jump power based on mouse drag distance

- **Technical Implementation**
  - Custom networking protocol using TCP sockets
  - Hub-and-spoke communication model between server and clients
  - Efficient data synchronization for shared game objects

The game was developed as a project for CMPT 371: Networking, focusing on implementing reliable multiplayer functionality through socket programming while creating an engaging gameplay experience.