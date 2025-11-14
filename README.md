# ThesisForge

[中文版](README.zh-CN.md)

## Overview

ThesisForge is an AI-powered academic article and thesis generation platform that helps users create structured, high-quality academic content through an interactive, step-by-step process. The application leverages AI to assist with outline creation, content generation, and article refinement.

## Features

- **Interactive Article Creation**: Step-by-step guided process for creating academic articles
  - Fill in article information (title, subject area, purpose, target audience)
  - Define article structure with customizable sections
  - Generate content for each section using AI assistance
  - Review and refine the complete article

- **AI-Powered Content Generation**: Leverage OpenAI models to generate high-quality academic content
- **Flexible Structure**: Create custom article outlines with multiple sections and subsections
- **Real-time Preview**: Review and edit generated content in real-time
- **Markdown Support**: Rich text editing with Milkdown editor
- **Modern UI**: Clean, responsive interface built with Vue 3 and Vuetify

## Tech Stack

### Frontend
- **Framework**: Vue 3 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Vuetify 3
- **State Management**: Vuex
- **Routing**: Vue Router
- **Editor**: Milkdown (Markdown editor)
- **Styling**: Tailwind CSS, SASS

### Backend
- **Framework**: Sanic (Python async web framework)
- **AI Integration**: OpenAI API
- **Data Validation**: Pydantic

## Project Structure

```
ThesisForge/
├── front/                 # Frontend Vue application
│   ├── src/
│   │   ├── pages/        # Application pages
│   │   │   └── create-article/  # Article creation workflow
│   │   ├── components/   # Reusable Vue components
│   │   ├── store/        # Vuex store modules
│   │   ├── api/          # API client
│   │   └── router.ts     # Vue Router configuration
│   ├── package.json
│   └── vite.config.ts
├── back/                  # Backend Python application
│   ├── handler/          # API route handlers
│   │   └── aritcle/     # Article-related endpoints
│   ├── model/            # Data models
│   ├── utils/            # Utility functions
│   └── app.py            # Main application entry
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Python 3.8+
- Yarn or npm
- OpenAI API key

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd front
```

2. Install dependencies:
```bash
yarn install
# or
npm install
```

3. Start the development server:
```bash
yarn dev
# or
npm run dev
```

4. Build for production:
```bash
yarn build
# or
npm run build
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd back
```

2. Install Python dependencies:
```bash
pip install sanic pydantic openai
```

3. Configure your OpenAI API key (set as environment variable or in configuration)

4. Start the backend server:
```bash
python app.py
```

The backend server will start on `http://localhost:8080`

## Usage

1. **Access the Application**: Open your browser and navigate to the frontend development server (typically `http://localhost:5173`)

2. **Create a New Article**:
   - **Step 1 - Fill Info**: Enter article details including title, subject area, purpose, target audience, and language
   - **Step 2 - Define Structure**: Create your article outline with sections and subsections
   - **Step 3 - Complete Content**: Generate content for each section using AI assistance
   - **Step 4 - Review Article**: Review and finalize your complete article

3. **Generate Content**: Use the AI-powered content generation to create high-quality academic text based on your outline and requirements

## API Endpoints

### Article Management

- `POST /article/generate-content/get-prompt` - Get AI prompt for content generation
- `POST /article/generate-content/manual` - Parse manually provided content
- `POST /article/generate-content` - Generate content using AI
- Additional endpoints for outline and structure management

## Development

### Frontend Development

The frontend uses Vue 3 with Composition API and TypeScript. Key features:

- Hot module replacement (HMR) for instant feedback
- TypeScript for type safety
- Vuetify components for consistent UI
- Milkdown for rich markdown editing

### Backend Development

The backend is built with Sanic, an async Python web framework:

- RESTful API design
- Async request handling for improved performance
- Pydantic models for data validation
- OpenAI integration for AI-powered features

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is available for use under the terms specified by the repository owner.

## Support

For issues, questions, or contributions, please open an issue on the GitHub repository.
