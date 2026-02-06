# Content Guide

This site is a Jekyll site that stores all editable content in a few clear locations.

## Project Structure (Source Of Truth)

All source content lives under:
- `/Users/isaacbenaka/Documents/GitHub/ikebenaka.github.io/site/`

Design components live under:
- `/Users/isaacbenaka/Documents/GitHub/ikebenaka.github.io/component-library/`

Everything else at the repo root is project tooling or documentation.

## Where To Edit

### Homepage Bio + Image
Edit:
- `/Users/isaacbenaka/Documents/GitHub/ikebenaka.github.io/site/_data/home.yml`

Fields:
- `hero.title`
- `hero.description_html`
- `hero.image`
- `hero.image_alt`

### Top Navigation
Edit:
- `/Users/isaacbenaka/Documents/GitHub/ikebenaka.github.io/site/_data/navigation.yml`

### Projects
Add/edit project pages here:
- `/Users/isaacbenaka/Documents/GitHub/ikebenaka.github.io/site/collections/_projects/*.md`

Each project file is a Markdown file with front matter like:
```
---
date: 2024-01-05 05:20:35 +0000
title: Project Title
subtitle: Category
image: /images/project-1.jpg
---
Markdown content here...
```

### Blog Posts
Add/edit posts here:
- `/Users/isaacbenaka/Documents/GitHub/ikebenaka.github.io/site/collections/_posts/*.markdown`

Each post file is a Markdown file with front matter like:
```
---
date: 2024-01-05 05:20:35 +0000
title: Post Title
description: Short summary
tags: [tag1, tag2]
image: /images/post-1.jpg
---
Markdown content here...
```

### Pages (About, Gallery, etc.)
Edit static pages here:
- `/Users/isaacbenaka/Documents/GitHub/ikebenaka.github.io/site/collections/_pages/*.html`

### Gallery Images
Add images and captions here:
- `/Users/isaacbenaka/Documents/GitHub/ikebenaka.github.io/site/_data/gallery.yml`

Images should live in:
- `/Users/isaacbenaka/Documents/GitHub/ikebenaka.github.io/site/images/`
- `/Users/isaacbenaka/Documents/GitHub/ikebenaka.github.io/site/images/uploads/`

Legacy assets that were previously in the repo root were moved to:
- `/Users/isaacbenaka/Documents/GitHub/ikebenaka.github.io/site/images/legacy/`
- `/Users/isaacbenaka/Documents/GitHub/ikebenaka.github.io/site/images/uploads/legacy/`

Example entry:
```
items:
  - image: /images/uploads/drone-01.jpg
    alt: Over the lake
    caption: "Morning flight, July 2024"
```

## Common Tasks

### Add A New Project
1. Create a new file in `/Users/isaacbenaka/Documents/GitHub/ikebenaka.github.io/site/collections/_projects/`
2. Use the front matter format above
3. Add images to `/Users/isaacbenaka/Documents/GitHub/ikebenaka.github.io/site/images/uploads/`

### Add A New Blog Post
1. Create a new file in `/Users/isaacbenaka/Documents/GitHub/ikebenaka.github.io/site/collections/_posts/`
2. Use the front matter format above
3. Add images to `/Users/isaacbenaka/Documents/GitHub/ikebenaka.github.io/site/images/uploads/`
