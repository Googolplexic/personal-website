---
title: SFU Scheduler
summary: A web app for SFU students to plan their courses. Made for CMPT 276 at SFU.
technologies:
- JavaScript
- Node.js
- REST API
- HTML/CSS
- Bootstrap CSS
- Firebase Functions
- Firebase Realtime Database
- Firebase Hosting
liveUrl: https://sfuscheduler.web.app
startDate: 2024-09
endDate: 2024-12
---

## A web app for SFU students to plan their courses and view course offerings and information

### Made for CMPT 276: Introduction to Software Engineering at SFU

This project was a group project with 4 other students. We wanted to create a web app that would allow SFU students to plan their courses and view course offerings and information.

Here are some of the features and functions of the project:

- **Schedule Planning**
  - Schedule view displaying course timeslots
    - Automatic conflict detection when adding courses
    - Generate all possible schedule combinations
    - Pin or hide courses to customize schedule generation
  - Schedule management with user accounts
    - Save and load schedules to a secure database
    - Semester-specific schedule storage

- **Course Information**
  - See all of SFU's course offerings
    - Access current, previous, and future semester offerings
    - Search and filter course listings
  - Detailed course information
    - Prerequisites and corequisites
    - Course descriptions and requirements
    - Section-specific details
      - Instructor information
      - Class times and locations
      - Current enrollment and capacity
- **User Accounts**
  - Multiple login methods
    - Email and password login
      - Email verification
      - Password reset
    - Google sign-in
    - Guest mode for quick access
  - Account deletion
  - Secure user data storage
- **Database and Backend**
  - Firebase Realtime Database
    - Secure user data storage
    - Course information storage
  - Firebase Functions
    - Backend for secure data handling
    - Course information retrieval and processing
  - Firebase Hosting
    - Web hosting for the project
    - Custom domain support
- **Other**
  - Mobile responsiveness
  - User-friendly interface
  - Robust error handling
  - Complex algorithm implementation for schedule generation
  