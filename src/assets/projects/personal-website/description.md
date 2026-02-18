---
title: Personal Website
summary: This site, right here!
SEOdescription: Portfolio entry detailing the development and features of colemanlai.com. Learn about the technical implementation of this personal website built with React, TypeScript, and modern web technologies.
keywords:
- personal portfolio
- software developer portfolio
- React TypeScript website
- dark gallery theme
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

### Project Portfolio

The portfolio page has filtering and search capabilities. The search bar does real-time text highlighting across project titles, descriptions, and technologies, and the highlights persist even after clicking into a project. You can also filter by tags, technologies, and date, or sort by various criteria.

Project pages are dynamically generated. To add a new project, I just drop in a markdown file, any images, and update the SEO metadata. It automatically shows up in the [portfolio](https://www.colemanlai.com/portfolio) page and gets its own detail page. Each project page supports image galleries with thumbnails and renders descriptions from markdown using [`react-markdown`](https://github.com/remarkjs/react-markdown).

### Origami Gallery

The gallery is also dynamically generated. Just plug in images and metadata and it gets added automatically. It supports grouped and list views for browsing by category, and crease patterns are displayed separately (detected automatically by checking for a `pattern` ending in the image filename). The gallery also links to origami-related software projects in the portfolio.

### Other stuff

Dark gallery theme using Tailwind CSS, responsive design that works on mobile and desktop, clean navigation, a homepage with a featured project section, resume, skills, about, contact, and so on. The site uses React Router for navigation, React Helmet for SEO metadata, frontmatter for project and origami metadata, Vite as the build tool, and Vercel for deployment.

### In Progress

Building the origami gallery further. Maybe a FOLD visualization for crease patterns instead of just displaying the image.
