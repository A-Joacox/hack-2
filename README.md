# Ahorrista - Personal Expense Tracker

Ahorrista is a web application that helps young Peruvians visualize and control their personal expenses. Built with React, TypeScript, and ChakraUI.

## Features

- User authentication (register/login)
- Monthly expense summary by category
- Detailed expense view per category
- Add and delete expenses
- Monthly savings goals
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ahorrista
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
  ├── components/     # Reusable components
  ├── contexts/       # React contexts
  ├── pages/         # Page components
  ├── services/      # API services
  ├── types/         # TypeScript interfaces
  ├── App.tsx        # Main App component
  └── main.tsx       # Entry point
```

## API Endpoints

The application connects to the following API endpoints:

- Authentication:
  - POST `/authentication/register`
  - POST `/authentication/login`

- Expenses:
  - GET `/expenses_summary`
  - GET `/expenses/detail`
  - POST `/expenses`
  - DELETE `/expenses/:id`

- Categories:
  - GET `/expenses_category`

- Goals:
  - GET `/goals`
  - POST `/goals`
  - PATCH `/goals/:id`

## Technologies Used

- React
- TypeScript
- ChakraUI
- React Router
- Axios

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
