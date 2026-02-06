# GroupTrip - Group Travel Coordination Platform

A modern, production-ready web application for coordinating group travel. Plan trips together, share travel details, build collaborative itineraries, and stay connected with your travel companions.

## Features

### Core Functionality

- **Group Management**
  - Create and join travel groups with unique invite codes
  - Group dashboard with member status overview
  - Role system (admin/member)
  - Set destination and trip dates

- **Travel Details Tracking**
  - Flight information with airport autocomplete
  - Drive details with departure/arrival times
  - Accommodation booking details
  - Support for multiple travel segments per member

- **Shared Itinerary**
  - Collaborative timeline with all group activities
  - Event categories (meals, activities, sightseeing, etc.)
  - List view and calendar view options
  - Export to PDF or calendar formats (ICS)

- **Real-Time Notifications**
  - Member arrival/departure updates
  - Itinerary change alerts
  - Configurable reminder settings (24hr, 1hr before events)
  - Status update notifications

- **Interactive Features**
  - One-tap status updates (traveling, arrived, exploring, etc.)
  - AI trip planning assistant powered by Claude
  - Countdown timers to trip start and events
  - Member directory with travel details

## Tech Stack

- **Frontend**: React 18 with modern hooks
- **Routing**: React Router v6
- **Styling**: Tailwind CSS with custom components
- **Icons**: Lucide React
- **Date Handling**: date-fns with timezone support
- **PDF Generation**: jsPDF
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd GroupTrip
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
GroupTrip/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── AirportAutocomplete.jsx
│   │   ├── Avatar.jsx
│   │   ├── ChatAssistant.jsx
│   │   ├── ConfirmDialog.jsx
│   │   ├── CountdownTimer.jsx
│   │   ├── EmptyState.jsx
│   │   ├── Layout.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── Modal.jsx
│   │   └── QuickStatus.jsx
│   ├── context/          # React context providers
│   │   ├── GroupContext.jsx
│   │   ├── NotificationContext.jsx
│   │   └── UserContext.jsx
│   ├── hooks/            # Custom React hooks
│   │   └── useClaude.js
│   ├── pages/            # Page components
│   │   ├── Dashboard.jsx
│   │   ├── Itinerary.jsx
│   │   ├── Landing.jsx
│   │   ├── Members.jsx
│   │   ├── Notifications.jsx
│   │   ├── Settings.jsx
│   │   └── TravelDetails.jsx
│   ├── utils/            # Utility functions
│   │   ├── airports.js
│   │   ├── dateUtils.js
│   │   ├── exportUtils.js
│   │   ├── helpers.js
│   │   └── storage.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

## Key Pages

1. **Landing Page** (`/`) - Create or join trips
2. **Dashboard** (`/dashboard`) - Trip overview and quick actions
3. **My Travel** (`/travel`) - Add flights, drives, accommodations
4. **Itinerary** (`/itinerary`) - Shared schedule with calendar view
5. **Members** (`/members`) - Group member directory
6. **Notifications** (`/notifications`) - Activity feed
7. **Settings** (`/settings`) - Profile and preferences

## Data Storage

The app uses `window.storage` API when available (for shared real-time data) with localStorage fallback for development:

- **User data** (private): Profile, preferences
- **Group data** (shared): Trip info, members, itinerary
- **Travel details** (shared): Flights, drives, accommodations

## Claude AI Integration

The app includes an AI trip planning assistant that can:

- Suggest itineraries based on destination
- Parse natural language travel details
- Recommend restaurants and activities
- Detect scheduling conflicts
- Provide packing suggestions

The AI features work with the Claude API when available, with mock responses for development.

## Customization

### Theme Colors

Edit `tailwind.config.js` to customize the color palette:

```js
colors: {
  primary: { ... },
  accent: { ... },
  success: { ... },
  warning: { ... },
  danger: { ... },
}
```

### Adding Event Categories

Edit the `CATEGORIES` array in `src/pages/Itinerary.jsx`:

```js
const CATEGORIES = [
  { id: 'meal', label: 'Meal', icon: Utensils, color: '...' },
  // Add more categories
];
```

### Adding Airports

Edit `src/utils/airports.js` to add more airports to the autocomplete database.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Mobile Support

The app is fully responsive with:
- Mobile-first design
- Bottom navigation for mobile
- Touch-friendly interactions
- Safe area support for notched devices

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues and feature requests, please open an issue on GitHub.
