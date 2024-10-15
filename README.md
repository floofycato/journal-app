# Journal App

## **Live Link**
https://journal-leaf.netlify.app

## **About**
A web app for recording thoughts and experiences. Features CRUD operations and favorite marking.

## **Technologies Used**
- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express.js, MongoDB
- **Deployment**: Netlify (Frontend), Render (Backend)

---

## **Getting Started**

### **Prerequisites**
- Node.js
- MongoDB
- Git

#### **API Endpoints**

##### **Auth**
- POST /create-account
- POST /login
- GET /get-user
##### **Journal**
- POST /add-journal-entry
- PUT /edit-journal-entry/:id
- PUT /update-isFavourite/:id
- DELETE /delete-journal-entry/:id
- GET /get-all-entries
- GET /search
- GET /date-range-filter
##### **Images**
- POST /upload-image
- DELETE /delete-image/:id

## **Deployment**

- **Frontend**: Deploy to Netlify, set build command: `npm run build`, publish directory: `frontend/journal-app/dist`.

- **Backend**: Deploy to Render, set start command: `npm start`, and configure environment variables.

## **License**
MIT License
