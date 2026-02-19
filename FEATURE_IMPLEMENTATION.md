# Rectangle Drawing Feature Implementation

## Overview
This implementation adds the ability to draw rectangles on maps rendered in the application, save them as named extents, store them in a local cache, and make them accessible to the chat system.

## Key Components Added/Modified

### 1. DrawableMap Component (`src/components/DrawableMap.tsx`)
A new map component that extends the functionality of CollarMap with drawing capabilities:

**Features:**
- Uses MapLibre GL Draw for rectangle drawing
- Provides a "Draw Rectangle" button to activate drawing mode
- Shows a modal dialog to name drawn rectangles
- Calculates bounding box coordinates (north, south, east, west)
- Triggers callback when extent is saved
- Maintains all existing CollarMap functionality (clustering, popups, etc.)

**Key Implementation Details:**
```typescript
- Uses @mapbox/mapbox-gl-draw library for drawing controls
- Listens to 'draw.create' events to capture completed rectangles
- Calculates bounds from polygon coordinates
- Provides interactive naming dialog with Enter/Escape key support
- Saves extent with structured data: { id, name, bounds, geometry }
```

### 2. Enhanced useChat Hook (`src/hooks/useChat.ts`)
Extended to manage saved extents:

**New Functionality:**
- `savedExtents` state: Array to store named extent objects
- `addExtent` callback: Adds new extent to cache
- `chatInstanceId` exposure: Provides chat instance ID for API calls
- Automatic API integration: Calls `saveData` API when extent is added

**Extent Structure:**
```typescript
interface SavedExtent {
  id: string;
  name: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  geometry: GeoJSON.Feature;
}
```

### 3. Save Data API (`src/api/chat.ts`)
New API function to send extent data to backend:

**Function:**
```typescript
saveData(chatId: string, name: string, shape: unknown): Promise<void>
```

**Behavior:**
- Makes POST request to `/save_data` endpoint
- Sends: `{ chatId, name, shape }`
- Includes authentication headers from Supabase session
- Throws error if request fails

### 4. Chat Panel Enhancement (`src/components/ChatPanel.tsx`)
Updated to display and use saved extents:

**New Features:**
- Collapsible "Saved Extents" section showing count
- List of all saved extents with their bounding box coordinates
- Click to insert extent reference into chat input
- Formats extent as: `[Extent: {name} - N:{north}, S:{south}, E:{east}, W:{west}]`

**UI Elements:**
- Toggle button to show/hide extent list
- Scrollable list (max 150px) with hover effects
- Each extent shows name and coordinates

### 5. Component Wiring
Updated components to pass through extent functionality:

**Flow:**
```
DashboardPage
  └─> AppLayout (+ savedExtents, addExtent, chatInstanceId)
      ├─> Sidebar (+ savedExtents)
      │   └─> ChatPanel (+ savedExtents)
      │       └─> Displays extents, allows insertion into messages
      └─> ChatDataTable (+ chatInstanceId, onExtentSaved)
          └─> DrawableMap (for 'collar_map' type)
              └─> Triggers onExtentSaved when rectangle drawn
```

## User Workflow

1. **View Map**: User sends chat message that triggers map display
2. **Draw Rectangle**: User clicks "Draw Rectangle" button on map
3. **Draw Shape**: User draws a polygon/rectangle on the map
4. **Name Extent**: Modal appears asking for extent name
5. **Save**: User enters name and clicks Save
6. **Stored**: Extent is added to local cache
7. **API Call**: Backend receives extent data via `/save_data` endpoint
8. **Available in Chat**: Extent appears in "Saved Extents" section
9. **Use in Chat**: User can click extent to insert coordinates into chat message

## Technical Details

### Dependencies Added
- `@mapbox/mapbox-gl-draw`: Drawing library compatible with MapLibre GL
- `@types/mapbox__mapbox-gl-draw`: TypeScript definitions

### Data Flow
1. DrawableMap captures drawn rectangle
2. Calculates bounding box from geometry coordinates
3. Calls `onExtentSaved` callback with extent object
4. `addExtent` in useChat hook receives extent
5. Extent added to `savedExtents` state
6. `saveData` API called with chatInstanceId
7. ChatPanel re-renders with new extent in list

### API Contract
**Endpoint:** `POST /save_data`

**Request Body:**
```json
{
  "chatId": "string",
  "name": "string",
  "shape": {
    "id": "string",
    "name": "string",
    "bounds": {
      "north": number,
      "south": number,
      "east": number,
      "west": number
    },
    "geometry": GeoJSON.Feature
  }
}
```

**Response:** 200 OK (or error status)

### Type Safety
All new code is fully typed with TypeScript:
- SavedExtent interface exported from useChat hook
- Props properly typed across all components
- GeoJSON types used for geometry data

## Future Enhancements
Potential improvements that could be added:
- Edit/delete saved extents
- Visual highlighting of extent on map when selected
- Export extents to various formats (GeoJSON, WKT, etc.)
- Server-side persistence and retrieval of extents
- Sharing extents between users
- Extent-based filtering of map data
