---
name: 🍳 New Recipe
about: Submit a recipe via PR
title: "🍳 New recipe: [Recipe Name]"
labels: recipe
---

## Recipe Checklist

- [ ] Recipe file placed in correct category folder (`recipes/mains/`, `recipes/desserts/`, etc.)
- [ ] Filename is kebab-case (e.g. `butter-chicken.md`)
- [ ] Frontmatter includes all required fields (see template below)
- [ ] `author` field matches your GitHub username
- [ ] Ingredients listed with `-` bullet points
- [ ] Method listed with numbered steps
- [ ] Image (if included) is in `images/` folder, JPEG/WebP, under 500KB

## Frontmatter Template

```yaml
---
title: "Your Recipe Title"
author: your-github-username
category: mains | desserts | sides | breads | drinks | snacks | breakfast
cuisine: e.g. indian, south-african, italian
serves: 4
prep_time: 20min
cook_time: 45min
difficulty: easy | medium | hard
tags: [tag1, tag2, tag3]
image: images/your-recipe-slug.jpg  # optional
based_on: recipes/category/original.md  # optional, for variations
created: YYYY-MM-DD
---
```
