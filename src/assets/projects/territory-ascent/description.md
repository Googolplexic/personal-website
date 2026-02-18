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

### Made for CMPT 371: Networking

Territory Ascent is a multiplayer platformer where up to 8 players compete to reach the top of a challenging map. The gameplay is similar to Jump King: you navigate a 2D tile map by timing precise jumps across platforms.

The twist is that platforms change color to match whoever is standing on them, and those sections become exclusive to that player. If you land on someone else's platform, you fall and respawn at the bottom. Movement uses A and D keys, and jumping works with a slingshot-style mechanism where you drag the mouse to aim with a visual trajectory indicator.

The multiplayer runs on a custom networking protocol using TCP sockets in a hub-and-spoke model between the server and clients, with efficient data synchronization for shared game objects.
