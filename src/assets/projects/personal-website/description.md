---
title: Personal Website
summary: This site, right here!
SEOdescription: Portfolio entry detailing the development and features of colemanlai.com. Learn about the technical implementation of this personal website built with React, TypeScript, and modern web technologies.
keywords:
- personal portfolio
- software developer portfolio
- React TypeScript website
- dark mode portfolio
- origami artist
- Coleman Lai
- web development
- responsive design
technologies:
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- React Helmet
githubUrl: https://github.com/googolplexic/personal-website
liveUrl: https://www.colemanlai.com
startDate: 2024-12
tags:
- personal-project
- frontend
---

## My own personal website, made via TypeScript + React

This website serves as my personal portfolio and was built using TypeScript and React. The site is hosted on Vercel (and my domain *colemanlai.com*). Some key features I was focussing on:

- Dark mode support using Tailwind CSS
  - Easy access button to switch between modes
- Responsive design that works well on both mobile and desktop
- Project portfolio showcase
  - Project listing with filtering and search capabilities
    - Search bar
      - With real-time text highlighting
        - Searches in project titles, descriptions, and technologies
        - Highlights even after clicking on a project
    - Filter projects by tags, technologies, and date
    - Sort projects by various criteria
  - Project tagging system for better organization
  - Image galleries with thumbnails
  - Markdown support for project descriptions
    - Using [`react-markdown`](https://github.com/remarkjs/react-markdown) for content rendering
  - **Project pages are dynamically generated!**
    - No need to manually create a new page for each project
    - Just add a new markdown file + any images to the project directory + update the SEO metadata
      - It will automatically be added to the project listing, showing up in the [portfolio](https://www.colemanlai.com/portfolio) page, and have its own page with the project details as well
- Clean and simple navigation
- Homepage with:
  - Featured project section
  - Resume
  - Skills, about, contact, etc.
- **Dynamically generated origami gallery**
  - Automatic album generation from image collections
    - Just plug in images + metadata and it will be added to the gallery automatically
  - Separate sections for original designs and folded models
  - Allow for crease patterns to be displayed separately
    - This is done automatically by checking for a `pattern` ending in the image filename
  - Integration with portfolio for origami-related software projects

### Technical Implementation

The project uses several modern web technologies and practices:

- **TypeScript** for type-safe development
- **React** with functional components and hooks
- **Tailwind CSS** for styling and dark mode implementation
- **React Router** for client-side navigation
- **React Markdown** for rendering project descriptions without the hassle of HTML
- **React Helmet** for managing SEO metadata
- **Frontmatter** for project and origami gallery metadata
- **Vite** as the build tool for faster development
- **Vercel** for automated deployment
- **GitHub Copilot** for doing some of the tedious work for me

### In Progress

- Building the origami gallery
  - Maybe a FOLD visualization for crease patterns instead of just displaying the image
- Currently this looks a bit simple. In the future, I want to make this look unique and themed. However, this is a low priority for now as the main focus is on functionality and content.
