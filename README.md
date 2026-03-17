# Hertz 2026 Leave Tracker

A premium, interactive leave tracking system built with React, TypeScript, and Tailwind CSS.

## Features
- **Quarterly Calendar**: View and manage leaves in a 3-month grid.
- **Manager Dashboard**: KPI tiles and team availability visualizations.
- **Business Logic**: Status resolution (Holiday > Sick > Planned) and conflict detection.
- **Excel Support**: Import/Export capabilities for tracking data.
- **Premium UI**: Glassmorphism, smooth animations, and a curated color palette.

## Getting Started
```bash
cd hertz-leave-tracker
npm install
npm run dev
```

## Project Structure
- `src/components`: UI components (Layout, Calendar, Dashboard).
- `src/logic`: Business logic for status and conflicts.
- `src/store`: State management via Context.
- `src/utils`: Utilities like Excel processing.
- `src/constants`: Static data like holidays.
- `src/types`: TypeScript interfaces.
