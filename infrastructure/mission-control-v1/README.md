# Mission Control Dashboard v1

## Project Description
A lightweight dashboard to monitor the 72-agent operation in real-time. Built with NextJS and React, using simple JSON file storage for the Minimum Viable Product (MVP).

## Tech Stack
- NextJS
- React
- TypeScript (implicitly via Next.js defaults)
- JSON file storage (for MVP)

## Features v1
1.  **Agent Count by Division:** Displays the number of agents in each division (e.g., BD, Research, Content, Design, Engineering).
2.  **Recent Activity Feed:** Shows the last 5 completed tasks across the operation.
3.  **Content Output Counter:** Tracks the number of posts produced today.
4.  **Active Projects List:** Lists current projects with their status and lead.

## Setup Instructions

### Prerequisites
- Node.js (v18 or later recommended)
- npm, yarn, or pnpm package manager

### Installation
1.  Clone the repository (if applicable, otherwise navigate to the project directory):
    ```bash
    # Assuming you are in the parent directory of infrastructure/
    cd infrastructure/mission-control-v1
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    # yarn install
    # or
    # pnpm install
    ```

### Running the Development Server
1.  Start the Next.js development server:
    ```bash
    npm run dev
    # or
    # yarn dev
    # or
    # pnpm dev
    ```
2.  Open your browser and navigate to `http://localhost:3000` (or the port displayed in your terminal).

### Data Storage (MVP)
For this MVP, data is simulated or stored in plain JSON files within the `data/` directory. For a production system, a database would be integrated.

## Timeline
MVP target: 2 hours. Functional over perfect.
