# LLM Resume Chatbox: An Interactive Portfolio

[![Generic badge](https://img.shields.io/badge/LLM-Gemini-blue.svg)](https://gemini.google.com/)
[![Generic badge](https://img.shields.io/badge/Interface-Chatbot-green.svg)](https://shields.io/)
[![Generic badge](https://img.shields.io/badge/Purpose-Resume/Portfolio-orange.svg)](https://shields.io/)

## 👋 Introduction

Welcome to Justin's interactive resume! This project is a unique take on the traditional portfolio website. Instead of just static pages, you can chat directly with an AI assistant, powered by Google's Gemini, to learn about Justin's skills, experience, and aspirations.

The goal is to provide a more engaging and dynamic way for you to get to know Justin. Ask anything you'd typically ask in an interview or while reviewing a resume, or use the quick action buttons!

**Live Demo:** <https://resumellm.netlify.app/>

## 🖼️ Screenshot

*This is what the interface looks like:*
![resumellm_demo_img](https://github.com/user-attachments/assets/7ada553f-3256-4192-abc7-875b697862db)

## ✨ Features

* **🤖 AI-Powered Chat ("Ask about Justin"):** Engage in a natural language conversation. Ask specific questions about Justin's professional background, projects, skills, education, or anything else you'd find in a comprehensive portfolio. The AI assistant, powered by Google's Gemini, responds based on provided context data.
* **Quick Actions:**
    * **💡 Tell me about Justin:** Get a concise, AI-generated summary about Justin with a single click.
    * **📚 Tell me about a class:** Click to view examples of classes Justin has taken. The interface will display details such as the class name, institution, term, year, and description for the showcased coursework.
    * **📄 View Resume:** A dedicated button to quickly access and view Justin's full, traditional resume document.
    * **🎯 View Statement of Purpose:** A button to display Justin's Statement of Purpose, offering insights into his career goals and motivations.
    * **📊 View GRE Scores:** Access Justin's GRE scores through a dedicated button.
    * **🖼️ View Justin:** Displays an image of Justin.
* **💬 Conversational Interface:** Engaging and interactive way to learn about a candidate.
* **Responsive Design:** Accessible and user-friendly across various devices.

## 🛠️ Technologies Used

* **Large Language Model (LLM):** Google Gemini
* **Frontend:** HTML, CSS, Javascript
* **Backend:** Python Flask
* **API Integration:** Gemini API
* **Deployment Platform:** Netlify, Render

## ⚙️ How It Works

The application integrates with the Gemini API. When a user types a question into the 'Ask about Justin...' chat box or clicks one of the pre-defined buttons:
1.  The user's input (either a typed question or a predefined prompt associated with a button) is sent to the Gemini LLM.
2.  The LLM processes the input, referencing the context data it has been provided with (Justin's resume information, statement of purpose, class details, etc.).
3.  Gemini generates a relevant response, which could be text, a link to a document, or trigger the display of an image.
4.  The response is then displayed in the chat interface or the relevant action is performed (e.g., showing the resume).

## 🙏 Acknowledgements

* Google for the Gemini API.
