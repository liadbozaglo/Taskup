# Google Maps Location Setup Guide

This guide will help you set up Google Maps API for Israeli address autocomplete and location-based features.

## Overview

Your app now includes:
- ✅ Israeli address autocomplete with Hebrew and English support
- ✅ Location input during signup/onboarding
- ✅ Location autocomplete when creating tasks
- ✅ Location-based task filtering with distance calculation
- ✅ "Near me" feature with radius slider
- ✅ Distance display on task cards
- ✅ City-based filtering
- ✅ Sort tasks by proximity

## Step 1: Get Google Maps API Key

### 1.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" (or select existing project)
3. Name your project (e.g., "Taski App")
4. Click "Create"

### 1.2 Enable Required APIs
1. In the Cloud Console, go to **APIs & Services** → **Library**
2. Search for and enable these APIs:
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API**

### 1.3 Create API Key
1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **API Key**
3. Copy your API key (looks like: `AIzaSyA...`)

### 1.4 Restrict API Key (Important for Security)
1. Click on your API key to edit it
2. Under **Application restrictions**:
   - Select "HTTP referrers (web sites)"
   - Add your domains:
     - `localhost:*` (for development)
     - `yourdomain.com/*` (for production)
3. Under **API restrictions**:
   - Select "Restrict key"
   - Select only:
     - Maps JavaScript API
     - Places API
     - Geocoding API
4. Click **Save**

## Step 2: Add API Key to Your Project

1. Open the `.env` file in your project root
2. Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` with your actual API key:

```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyA_your_actual_key_here
```

3. Save the file

**⚠️ Important:** Never commit your `.env` file to git! It's already in `.gitignore`.

## Step 3: Set Up Billing (Free Tier)

1. In Google Cloud Console, go to **Billing**
2. Add a payment method
3. Don't worry - you get **$200 FREE per month**!

### Free Tier Details:
- $200 monthly credit (renews every month)
- Places Autocomplete: ~17,000 free sessions/month
- Geocoding: ~40,000 free requests/month
- Most apps stay within free tier

### Cost Examples:
- 100 users/day = ~$9/month (FREE with $200 credit)
- 500 users/day = ~$42/month (FREE with $200 credit)
- You only pay if you exceed $200/month (thousands of users)

## Step 4: Test the Features

### 4.1 Test Task Creation
1. Run your app: `npm run dev`
2. Go to "Post Task" page
3. Click in the Location field
4. Start typing an Israeli address (e.g., "דיזנגוף תל אביב")
5. You should see autocomplete suggestions

### 4.2 Test Location Search
1. Go to "Browse Tasks" page
2. Click the navigation icon (📍) next to location search
3. Allow location access when prompted
4. You should see tasks with distance from you
5. Use the radius slider to filter by distance

### 4.3 Test Sorting
1. In task list, click "Sort" button
2. Select "הכי קרוב אלי" (Closest to me)
3. Tasks should sort by distance

## Features Implemented

### 1. LocationAutocomplete Component
- Israeli address search with Hebrew/English
- Google Places autocomplete integration
- Extracts: full address, coordinates, city name
- Used in: Task creation, Profile settings (future)

### 2. Distance Calculations
- Haversine formula for accurate distances
- Displays distance in km/meters
- Efficient bounding box queries for performance

### 3. Location Filtering
- Search by city or address
- Radius-based filtering (1-100 km)
- "Use my location" button
- Browser geolocation support

### 4. Database Enhancements
- Added `city` column to profiles and tasks
- Created indexes on lat/lng for fast queries
- Optimized for location-based searches

### 5. Task List Features
- Distance display on each task card
- Sort by proximity
- Filter by radius from your location
- City-based filtering

## Troubleshooting

### API Key Not Working
1. Check that all 3 APIs are enabled (Maps, Places, Geocoding)
2. Verify API key restrictions match your domain
3. Wait 5 minutes after creating key (propagation delay)
4. Check browser console for specific error messages

### Autocomplete Not Showing
1. Verify `.env` file has correct API key
2. Restart dev server after changing `.env`
3. Check network tab for API calls
4. Ensure billing is set up (required even for free tier)

### "Use My Location" Not Working
1. Browser must be on HTTPS (or localhost)
2. User must allow location permission
3. Check browser console for geolocation errors

### No Distance Showing
1. User location must be set (click navigation button)
2. Tasks must have coordinates (lat/lng)
3. Check that both user and task have valid coordinates

## Database Schema

### Profiles Table
```sql
- location_address: text
- location_lat: number
- location_lng: number
- city: text (NEW)
```

### Tasks Table
```sql
- location_address: text
- location_lat: number
- location_lng: number
- city: text (NEW)
```

### Indexes Created
```sql
- idx_profiles_location_lat
- idx_profiles_location_lng
- idx_profiles_city
- idx_tasks_location_lat
- idx_tasks_location_lng
- idx_tasks_city
```

## Files Modified/Created

### New Files
- `src/components/LocationAutocomplete.tsx` - Reusable autocomplete component
- `src/lib/distance.ts` - Distance calculation utilities
- `supabase/migrations/add_location_enhancements.sql` - Database schema updates

### Modified Files
- `src/pages/PostTask.tsx` - Uses LocationAutocomplete
- `src/pages/TaskList.tsx` - Location filtering and distance display
- `src/App.tsx` - Saves location data when creating tasks
- `.env` - Added VITE_GOOGLE_MAPS_API_KEY
- `package.json` - Added @react-google-maps/api, @types/google.maps

## Next Steps (Optional)

### Add Profile Location
Update the Profile/Onboarding page to let users set their home location:
```tsx
import LocationAutocomplete from '../components/LocationAutocomplete';

<LocationAutocomplete
  value={userLocation}
  onChange={(address, lat, lng, city) => {
    // Save to profile
  }}
  placeholder="כתובת הבית שלך"
/>
```

### Add Location Map View
Install map component to show task locations visually:
```bash
npm install @vis.gl/react-google-maps
```

### Add Location Verification
Show map preview when users post tasks to confirm location.

## Support

For issues with:
- **Google Maps API**: [Google Maps Platform Support](https://developers.google.com/maps/support)
- **This Implementation**: Check console errors and refer to this guide

## Cost Monitoring

Monitor your usage:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **APIs & Services** → **Dashboard**
3. View API usage statistics
4. Set up budget alerts if needed

Remember: You have $200/month free - more than enough for most apps!
