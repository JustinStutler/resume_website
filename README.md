# Justin's Portfolio AI Assistant

[![Generic badge](https://img.shields.io/badge/LLM-Gemini-blue.svg)](https://gemini.google.com/)
[![Generic badge](https://img.shields.io/badge/Interface-Chatbot-green.svg)](https://shields.io/)
[![Generic badge](https://img.shields.io/badge/Purpose-Resume/Portfolio-orange.svg)](https://shields.io/)

## About

This is my personal portfolio site, but instead of static pages I built it around an AI chatbot. You can ask it questions about my background, projects, coursework, or anything you'd normally look for in a resume. It pulls from my actual resume content and responds conversationally using Google's Gemini.

I wanted something more engaging than a typical portfolio and also wanted to get hands on with building a full stack AI application from scratch.

**Live Demo:** https://justinstutlerai.netlify.app/

## Preview

![Portfolio AI Assistant](readme_image.png)

## Features

The interface is organized into tabs so you can quickly find what you're looking for:

* **Info** Personal background, a photo gallery, and a page explaining how the site works
* **Academics** Courses I've taken, GRE scores, and academic history
* **Projects** Technical projects like housing price prediction, facial recognition, and music genre classification from album art
* **Research** Research papers including robot localization with particle filtering and uninformed/informed search
* **Links** GitHub and other external profiles
* **Docs** Resume, statement of purpose, and other documents

You can also just type a question in the chat box and the AI will answer based on my actual resume data.

## Tech Stack

This project touches a lot of what I work with day to day:

* **Python, Flask** for the backend API server
* **JavaScript (ES6), HTML, CSS** for the frontend (no frameworks, vanilla JS modules)
* **Google Gemini API** for the LLM powering the chatbot
* **RESTful API** design connecting the frontend and backend
* **Git** for version control
* **Netlify** for frontend deployment, **Render** for backend deployment

## How It Works

The backend uses a two stage pipeline when you ask a question:

1. Your question hits the Flask API
2. A first Gemini call figures out which pieces of my resume content are relevant to your question (context selection)
3. A second Gemini call generates an answer using only the relevant content
4. The response comes back to the frontend and renders with markdown formatting

This keeps answers grounded in real data rather than letting the model make things up.

## What's New

**Latest: UI Redesign**
Rebuilt the entire interface with a dark theme, navigation tabs, and a cleaner chat experience. Much more intuitive to browse through different sections now.

**Coming Up**
* Integrating the latest projects (AI interface, song genre from album art, and more)
* Continued interface and UX improvements
* Improving RAG (retrieval augmented generation) for better context selection and more accurate responses

## Acknowledgements

* Google for the Gemini API
