 ![opengraph-image](https://github.com/user-attachments/assets/e2008566-f7b4-4571-b8ab-9dfdb54c4c55)


## Introduction

PortfoliosHub is a web application that serves as a comprehensive directory of portfolios from a diverse group of professionals, including developers, designers, YouTubers, and more. This platform allows individuals to showcase their work and skills by submitting their own portfolios, making it easier for potential employers and collaborators to find talented professionals.

## Tech Stack

- **Next.js**: A React framework for building user-friendly single-page applications.
- **Convex**: Used for backend management. It manages the app's data and interactions efficiently.
- **ShadUI**: A UI component library that ensures a smooth and visually appealing user interface.
- **TailwindCSS**: A utility-first CSS framework for rapid UI development.

## Getting Started

### Setting Up Your Environment

1. **Set Up Convex:**
   - Create a Convex account if you don't already have one.
   - Once logged in, create a new project.
   - Upon creating your project, you will receive environment variables required for the application's configuration.

2. **Environment Variables:**
   - Create a `.env.local` file in the root of your project.
   - Add the following environment variables you obtained from Convex:
     ```
     CONVEX_DEPLOYMENT=<your_convex_deployment>
     NEXT_PUBLIC_CONVEX_URL=<your_convex_url>
     ```

### Installation

1. Install all the necessary dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
This command will start the local development server on http://localhost:3000. If your Convex project is not set up yet, you will be prompted in the terminal to go through the setup process.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

1. Fork the Project
2. Create your Feature Branch (git checkout -b feature/AmazingFeature)
3. Commit your Changes (git commit -m 'Add some AmazingFeature')
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a PR
