# CMA Zone

Unified CMA learning platform for web and Android.

## Architecture

- Student Portal
- MCQ Practice
- PYQ Portal
- Full-fledged Exam Engine
- Bell / Notification Center
- Admin CMS
- JSON Import / Export
- Global Design System
- Firebase-ready data layer

The same frontend design system is used across subjects, chapters, MCQs, PYQs, exams and admin interfaces. Content is data-driven rather than hard-coded.

## Repository rule

Content and presentation are separated. Subject-specific pages must not introduce their own theme or CSS.

## Planned deployment

GitHub Pages for the web frontend, with GitHub Actions for deployment. Firebase will be used for live data, authentication and storage when configured.
