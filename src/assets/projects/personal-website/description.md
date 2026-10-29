---
title: Personal Website
summary: This site, right here!
SEOdescription: Portfolio showcase of colemanlai.com - my personal website and gallery of software projects and origami. Built with React, React Router, TypeScript and Tailwind CSS, prerendered at build time and hosted on Vercel.
keywords:
- personal portfolio
- software developer portfolio
- origami gallery
- React TypeScript website
- React Router
- prerendered website
- view transitions
- dark gallery theme
- Coleman Lai
- web development
technologies:
- TypeScript
- React
- React Router
- Tailwind CSS
- Vite
- Node.js
- GitHub API
- Vercel
- Vitest
- Playwright
githubUrl: https://github.com/googolplexic/personal-website
liveUrl: https://www.colemanlai.com
startDate: 2024-12
tags:
- personal-project
- frontend
---

## My own personal website and gallery, made via TypeScript + React

This website serves as my personal portfolio and origami gallery, and is hosted on Vercel (under my domain *colemanlai.com*). Thematically, I wanted it to feel like walking through a gallery or a theatre, hence the spotlight effects and the dark and gold colour scheme. It's been through a few rewrites by now; this is version 3, which rebuilt most of the site around that gallery idea. Some key features I was focussing on:

### Project Portfolio

Every project is an "exhibit", with its own exhibit code and a wall-label style placard. The portfolio has one filter bar with search, technologies, tags and sorting, and all of it is kept in the URL, so a filtered view can be shared as a link. The search does real-time text highlighting across titles, descriptions and technologies, and the highlights carry over into the project page after clicking in.

Project pages are generated from markdown. To add a new project, I just drop in a markdown file with some frontmatter and any images, and it automatically shows up in the [portfolio](https://www.colemanlai.com/portfolio) and gets its own page. Images get converted to WebP in three sizes at build time (so phones don't download the giant ones), and each one shows a tiny blurred version of itself while the real image loads.

### Origami Gallery

The [origami gallery](https://www.colemanlai.com/origami) works the same way: plug in images and an info file and it gets added automatically. It has grouped and list views for browsing by collection (my own designs, other artists' designs, and origami-related software), and crease patterns are shown separately on each piece's page (detected by `pattern` in the image filename).

I also built a small password-protected admin page so I can add new models straight from my phone. It talks to a few Vercel functions that commit the images and markdown to the repository through the GitHub API, which then triggers a rebuild.

### The Gallery Feel

Most of the fun went into the small details:

- A spotlight that follows your cursor around the page, and dims the other exhibits when you hover one (it can be turned off in the footer)
- A custom cursor that turns into the scrollbar when you move it to the right edge of the screen
- Clicking a project's image grows it into the project page (using the View Transitions API), and going back puts you where you were in the gallery
- A Ctrl+K (or ⌘K) menu to jump to any project, origami piece or page
- A lightbox for the images that you can swipe through or swipe away on mobile

### Under the Hood

The site runs on React with React Router in framework mode, which prerenders every page to plain HTML at build time. Pages show up before any JavaScript runs and search engines can read them properly. Styling is Tailwind CSS on top of a 12-column page grid, and Vite is the build tool. There are also RSS feeds for new projects and origami.

To make sure I don't break anything (again), there are unit tests with Vitest and browser tests with Playwright that also check every main page for accessibility issues, all run by GitHub Actions on each push. I've also been trying to keep the Lighthouse scores high, which is harder than it sounds with this many animations.

### In Progress

Building the origami gallery further. Maybe a FOLD visualization for crease patterns instead of just displaying the image.
