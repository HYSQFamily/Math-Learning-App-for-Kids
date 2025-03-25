# Fix Mixed Content Errors and Restore Character Selection

## Changes Made

This PR addresses several issues with the Math Learning App:

1. **Fixed Mixed Content Errors**
   - Updated all API endpoints to use HTTPS consistently
   - Added protocol enforcement with `.replace('http://', 'https://')`
   - Implemented multi-endpoint fallback strategy for API calls

2. **Fixed 405 Method Not Allowed Errors**
   - Updated API implementation to use `/problems/next` endpoint instead of GET `/generator/generate`
   - Added proper error handling for API failures

3. **Restored Character Selection Functionality**
   - Implemented full character selection with both 黄小星 and 李小毛
   - Added character preference storage in localStorage
   - Updated TutorChat component to use the selected character

## Testing

The changes have been tested and verified:
- Backend API endpoints return correct bilingual questions with character integration
- Character selection works properly in the TutorChat component
- API calls use HTTPS consistently to prevent mixed content errors

## Link to Devin run
https://app.devin.ai/sessions/f1602e7ed46f4ffc8fc27d8102e61759

## Requested by
叶方
