---
title: SFU Scheduler
summary: A web app for SFU students to plan their courses. Made for CMPT 276 at SFU.
SEOdescription: Portfolio showcase of SFU Scheduler - a comprehensive course planning tool created for Simon Fraser University students. View project details, features, and implementation of this academic scheduling application.
keywords:
- SFU course planner
- university schedule maker
- Simon Fraser University
- course registration tool
- academic planning
- student timetable
- university course scheduler
- SFU class finder
- SFU scheduler
technologies:
- JavaScript
- Node.js
- REST API
- HTML/CSS
- Bootstrap CSS
- Firebase Functions
- Firebase Realtime Database
- Firebase Hosting
liveUrl: https://sfuscheduler.colemanlai.com/
startDate: 2024-09
endDate: 2024-12
tags:
- school-project
- full-stack
---

## A web app for SFU students to plan their courses and view course offerings and information

### Made for CMPT 276: Introduction to Software Engineering at SFU

This project was a group project with 4 other students. We wanted to create a web app that would allow SFU students to plan their courses and view course offerings and information.

### Schedule Planning

The schedule view displays course timeslots with automatic conflict detection when adding courses. You can generate all possible schedule combinations and pin or hide courses to customize the generation. Schedules can be saved and loaded to a secure database tied to your account, with semester-specific storage.

### Course Information

You can browse all of SFU's course offerings across current, previous, and future semesters, with search and filtering. Each course shows prerequisites, corequisites, descriptions, and requirements, plus section-specific details like instructor information, class times and locations, and current enrollment and capacity.

### User Accounts

The app supports email/password login (with verification and password reset), Google sign-in, and a guest mode for quick access. Users can delete their accounts and all data is stored securely.

### Technical Details

The backend runs on Firebase with Realtime Database for data storage, Firebase Functions for secure data handling and course information processing, and Firebase Hosting with custom domain support. We also put work into mobile responsiveness, error handling, and the schedule generation algorithm.
