# Real-Time Virtual Classroom Platform

## 1. Project Overview

Build a professional, production-style MVP of a real-time virtual classroom platform.

The platform allows teachers to create and manage virtual classrooms where students can join live sessions, communicate through real-time chat, participate through video/audio, share files, and interact with the teacher.

The application should demonstrate:

* Modern React frontend development
* REST API development
* Node.js and Express.js backend
* MongoDB database design
* Firebase Authentication
* Firebase token verification
* Socket.io real-time communication
* WebRTC real-time audio/video communication
* Cloudinary file storage
* Role-based authorization
* Responsive UI
* Clean software architecture
* Error handling
* Loading states
* Form validation

The goal is to build a functional MVP that can realistically be completed within approximately five days.

---

# 2. Product Goals

The MVP should provide three core experiences:

### Teacher

A teacher can:

* Register/login
* Create classrooms
* View classrooms they own
* Generate/share classroom join codes
* Start a live class
* Join the live classroom
* Enable/disable microphone
* Enable/disable camera
* Share screen
* View participating students
* Mute students
* Remove students from a classroom
* Send classroom announcements/messages
* Upload learning materials
* End the live session
* View basic attendance

### Student

A student can:

* Register/login
* Join a classroom using a classroom code
* View enrolled classrooms
* Join a live session
* Enable/disable microphone
* Enable/disable camera
* Share screen if permitted
* Send/receive real-time chat messages
* Raise/lower hand
* View teacher and participants
* Download learning materials
* Leave the classroom

### Platform

The platform should:

* Authenticate users securely
* Maintain user roles
* Persist classroom information
* Persist enrollment information
* Provide real-time communication
* Establish WebRTC connections
* Store uploaded files using Cloudinary
* Maintain basic attendance records
* Handle disconnected users gracefully

---

# 3. MVP Scope

## Must Have

These features are required for the MVP:

1. Firebase authentication
2. Teacher/student roles
3. User profile
4. Teacher classroom creation
5. Student classroom joining
6. Classroom dashboard
7. Live classroom
8. WebRTC audio/video
9. Socket.io signaling
10. Real-time chat
11. Participant list
12. Microphone toggle
13. Camera toggle
14. Screen sharing
15. Raise hand
16. Teacher mute/remove controls
17. File upload
18. Cloudinary integration
19. Basic attendance
20. Responsive professional UI
21. Error/loading/empty states

---

# 4. Features Explicitly Out of MVP Scope

Do NOT implement these unless the core MVP is already completely functional:

* Video recording
* Cloud recording
* Whiteboard
* Breakout rooms
* Online exams
* Quizzes
* Assignment grading
* Payment system
* Email notifications
* Push notifications
* Calendar integration
* AI teaching assistant
* AI transcription
* Live captions
* Advanced analytics
* Redis
* Kubernetes
* Microservices
* WebRTC SFU
* Complex admin dashboard

The priority is a stable working MVP rather than a large number of incomplete features.

---

# 5. Technology Stack

## Frontend

* React
* Vite
* React Router
* JavaScript
* Tailwind CSS
* Axios
* Socket.io Client
* Native WebRTC APIs
* Firebase Client SDK

Optional:

* Lucide React for icons

Do not introduce unnecessary UI libraries.

---

# 6. Backend

* Node.js
* Express.js
* JavaScript
* MongoDB
* Mongoose
* Socket.io
* Firebase Admin SDK
* Cloudinary SDK
* Multer where required for file processing

Backend responsibilities:

* REST APIs
* Authentication verification
* Authorization
* Classroom management
* Enrollment management
* File metadata management
* Attendance persistence
* Socket.io signaling
* Real-time classroom events

---

# 7. Authentication

Use Firebase Authentication.

Supported authentication methods for MVP:

* Email/password

Google authentication may be added later but is not required.

## Authentication Flow

### Frontend

1. User logs in using Firebase.
2. Firebase authenticates the user.
3. Firebase returns an ID token.
4. Frontend sends the ID token with protected API requests.

Example:

Authorization:

Bearer <firebase-id-token>

### Backend

The backend uses Firebase Admin SDK to verify the ID token.

After verification:

* obtain Firebase UID
* identify the application user
* attach authenticated user information to `req.user`

Example:

req.user = {
firebaseUid,
userId,
role
}

Never trust the role supplied directly by the frontend.

The backend must determine the user's role from MongoDB.

---

# 8. User Roles

Two roles are required:

## Teacher

Permissions:

* Create classroom
* Update classroom
* Delete classroom
* Start classroom
* End classroom
* View participants
* Mute participant
* Remove participant
* Upload materials
* Send announcements
* View attendance

## Student

Permissions:

* Join classroom
* Leave classroom
* View classroom
* Join live session
* Participate in video/audio
* Send chat messages
* Raise hand
* Download materials

Authorization must be enforced on the backend.

Do not rely only on hiding UI elements.

---

# 9. High-Level Architecture

```text
                        CLIENT
                React + Vite + Tailwind
                         |
             +-----------+-----------+
             |                       |
             v                       v
       Firebase Auth             REST API
             |                       |
             |                       v
             |              Node.js + Express
             |                       |
             |              +--------+--------+
             |              |        |        |
             |              v        v        v
             |          MongoDB  Cloudinary Socket.io
             |                               |
             |                               |
             +-------------------------------+
                                             |
                                      WebRTC Signaling
                                             |
                              +--------------+--------------+
                              |                             |
                              v                             v
                         Teacher                      Students
                              \                             /
                               \                           /
                                +------ WebRTC ------------+
                                      Audio / Video
```

---

# 10. Separation of Responsibilities

## Firebase

Responsible for:

* Authentication
* Identity
* Firebase UID

Firebase should NOT be the main application database.

---

## MongoDB

Responsible for:

* User profiles
* Classrooms
* Enrollments
* Messages
* Attendance
* Learning material metadata

---

## Cloudinary

Responsible for:

* Uploaded classroom files
* Images
* PDFs
* Documents
* Other permitted learning materials

Only metadata should be stored in MongoDB.

Example:

```text
MongoDB

{
  fileName,
  cloudinaryPublicId,
  secureUrl,
  resourceType,
  uploadedBy,
  classroomId
}
```

---

## Socket.io

Responsible for:

* Classroom presence
* Real-time chat
* User joined
* User left
* Raise hand
* Mute events
* Remove events
* WebRTC signaling
* Connection/disconnection events

---

## WebRTC

Responsible for:

* Audio
* Video
* Screen sharing

Actual media streams must NOT be transmitted through Socket.io.

Socket.io only helps peers discover and negotiate the WebRTC connection.

---

# 11. WebRTC Architecture

For the MVP, use a peer-to-peer WebRTC architecture.

The Socket.io server acts as the signaling server.

Basic flow:

```text
Teacher Browser
      |
      | Socket.io
      v
Signaling Server
      |
      | Socket.io
      v
Student Browser
      |
      | WebRTC
      |
      v
Audio / Video
```

WebRTC negotiation should use:

* RTCPeerConnection
* getUserMedia()
* getDisplayMedia()
* createOffer()
* createAnswer()
* setLocalDescription()
* setRemoteDescription()
* ICE candidates

The application should use STUN configuration.

Use a public STUN server for development.

Do not build a TURN server for the MVP.

Important:

Peer-to-peer WebRTC does not scale efficiently to large classrooms.

For the MVP, target approximately:

* 1 teacher
* up to 5–8 active participants

The architecture should be written cleanly enough that a future SFU can replace the peer-to-peer implementation.

---

# 12. Socket.io Events

Use clear event names.

## Classroom Presence

```text
classroom:join
classroom:leave
classroom:user-joined
classroom:user-left
classroom:participants
```

## Chat

```text
chat:send
chat:message
```

## Hand Raising

```text
hand:raise
hand:lower
hand:updated
```

## Teacher Controls

```text
participant:mute
participant:muted
participant:remove
participant:removed
```

## WebRTC

```text
webrtc:offer
webrtc:answer
webrtc:ice-candidate
```

## Classroom

```text
classroom:started
classroom:ended
```

---

# 13. Database Models

Use Mongoose.

Required models:

* User
* Classroom
* Enrollment
* Message
* Attendance
* Material

---

# 14. User Model

Suggested structure:

```text
User
├── firebaseUid
├── name
├── email
├── role
├── avatarUrl
├── createdAt
└── updatedAt
```

Constraints:

* firebaseUid unique
* email unique
* role must be either teacher or student

---

# 15. Classroom Model

```text
Classroom
├── name
├── description
├── subject
├── teacher
├── joinCode
├── isLive
├── liveStartedAt
├── liveEndedAt
├── createdAt
└── updatedAt
```

`teacher` references User.

`joinCode` must be unique.

---

# 16. Enrollment Model

```text
Enrollment
├── classroom
├── student
├── joinedAt
└── status
```

Prevent duplicate enrollment.

A student should not be able to enroll in the same classroom twice.

---

# 17. Message Model

```text
Message
├── classroom
├── sender
├── content
├── type
└── createdAt
```

Message type:

```text
CHAT
ANNOUNCEMENT
```

---

# 18. Attendance Model

```text
Attendance
├── classroom
├── student
├── sessionDate
├── joinedAt
├── leftAt
├── duration
└── status
```

For the MVP, basic join/leave tracking is sufficient.

---

# 19. Material Model

```text
Material
├── classroom
├── uploadedBy
├── name
├── description
├── cloudinaryPublicId
├── secureUrl
├── resourceType
├── fileSize
└── createdAt
```

---

# 20. REST API

Base URL:

```text
/api
```

---

## Authentication/User

### GET

```text
/api/users/me
```

Returns the authenticated user's profile.

### PUT

```text
/api/users/me
```

Updates profile information.

---

# 21. Classroom APIs

### POST

```text
/api/classrooms
```

Teacher creates classroom.

Request:

```json
{
  "name": "Data Structures",
  "description": "DSA fundamentals",
  "subject": "Computer Science"
}
```

---

### GET

```text
/api/classrooms
```

Return classrooms relevant to the authenticated user.

Teacher:

* classrooms they created

Student:

* classrooms they joined

---

### GET

```text
/api/classrooms/:id
```

Return classroom details.

---

### PUT

```text
/api/classrooms/:id
```

Teacher updates classroom.

---

### DELETE

```text
/api/classrooms/:id
```

Teacher deletes classroom.

---

# 22. Join Classroom

### POST

```text
/api/classrooms/join
```

Request:

```json
{
  "joinCode": "ABC123"
}
```

Only students can use this endpoint.

---

# 23. Classroom Participants

### GET

```text
/api/classrooms/:id/participants
```

Returns enrolled students and teacher.

---

# 24. Live Session APIs

### POST

```text
/api/classrooms/:id/start
```

Teacher starts live session.

Set:

```text
isLive = true
liveStartedAt = current timestamp
```

---

### POST

```text
/api/classrooms/:id/end
```

Teacher ends live session.

Set:

```text
isLive = false
liveEndedAt = current timestamp
```

---

# 25. Materials APIs

### POST

```text
/api/classrooms/:id/materials
```

Upload material.

Flow:

```text
React
  ↓
Express
  ↓
Cloudinary
  ↓
Cloudinary URL
  ↓
MongoDB metadata
```

---

### GET

```text
/api/classrooms/:id/materials
```

Returns classroom materials.

---

### DELETE

```text
/api/materials/:id
```

Teacher deletes material.

Delete both:

* Cloudinary asset
* MongoDB record

---

# 26. Attendance APIs

### GET

```text
/api/classrooms/:id/attendance
```

Teacher can view attendance.

Attendance records should also be updated through live session events.

---

# 27. Backend Folder Structure

Use a modular architecture.

```text
server/
│
├── src/
│   │
│   ├── config/
│   │   ├── db.js
│   │   ├── firebase.js
│   │   └── cloudinary.js
│   │
│   ├── controllers/
│   │   ├── user.controller.js
│   │   ├── classroom.controller.js
│   │   ├── material.controller.js
│   │   └── attendance.controller.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   ├── error.middleware.js
│   │   └── upload.middleware.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Classroom.js
│   │   ├── Enrollment.js
│   │   ├── Message.js
│   │   ├── Attendance.js
│   │   └── Material.js
│   │
│   ├── routes/
│   │   ├── user.routes.js
│   │   ├── classroom.routes.js
│   │   ├── material.routes.js
│   │   └── attendance.routes.js
│   │
│   ├── sockets/
│   │   ├── socket.js
│   │   ├── classroom.socket.js
│   │   ├── chat.socket.js
│   │   └── webrtc.socket.js
│   │
│   ├── services/
│   │   ├── classroom.service.js
│   │   ├── attendance.service.js
│   │   └── cloudinary.service.js
│   │
│   ├── utils/
│   │   ├── generateJoinCode.js
│   │   └── asyncHandler.js
│   │
│   ├── app.js
│   └── server.js
│
├── .env
├── .env.example
├── package.json
└── README.md
```

---

# 28. Frontend Folder Structure

```text
client/
│
├── src/
│   │
│   ├── assets/
│   │
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   ├── classroom/
│   │   ├── video/
│   │   ├── chat/
│   │   └── materials/
│   │
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Classroom.jsx
│   │   ├── LiveClassroom.jsx
│   │   ├── Profile.jsx
│   │   └── NotFound.jsx
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── SocketContext.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useSocket.js
│   │   └── useWebRTC.js
│   │
│   ├── services/
│   │   ├── api.js
│   │   ├── auth.service.js
│   │   └── classroom.service.js
│   │
│   ├── firebase/
│   │   └── firebaseConfig.js
│   │
│   ├── utils/
│   │
│   ├── routes/
│   │   └── AppRoutes.jsx
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── .env
├── .env.example
├── package.json
└── README.md
```

---

# 29. Frontend Pages

## Login

Elements:

* Application logo/name
* Email
* Password
* Login button
* Link to register
* Loading state
* Error message

---

## Register

Fields:

* Name
* Email
* Password
* Role

Role:

```text
Teacher
Student
```

After Firebase registration, create the corresponding User record in MongoDB.

---

# 30. Dashboard

The dashboard should change based on role.

## Teacher Dashboard

Show:

* Welcome message
* Total classrooms
* Active classrooms
* Create classroom button
* Classroom cards
* Recent activity

Each classroom card:

* Name
* Subject
* Number of students
* Live status
* View classroom button

---

## Student Dashboard

Show:

* Welcome message
* Enrolled classrooms
* Join classroom button
* Active live classes
* Recent materials

---

# 31. Classroom Details Page

Display:

* Classroom name
* Subject
* Description
* Teacher
* Student count
* Live status
* Join live class button
* Materials
* Join code

Teacher additionally sees:

* Edit classroom
* Start class
* Upload material
* View attendance

---

# 32. Live Classroom UI

This is the most important screen.

Layout:

```text
┌─────────────────────────────────────────────────────────┐
│ Logo        Classroom Name              Leave / End     │
├───────────────────────────────────┬─────────────────────┤
│                                   │                     │
│                                   │ Participants        │
│          Video Area               │                     │
│                                   │ Teacher             │
│                                   │ Student 1           │
│                                   │ Student 2           │
│                                   │ Student 3           │
│                                   │                     │
├───────────────────────────────────┴─────────────────────┤
│ Mic │ Camera │ Screen Share │ Raise Hand │ Chat         │
└─────────────────────────────────────────────────────────┘
```

Desktop layout:

* Main video area
* Participant sidebar
* Chat panel
* Bottom control bar

Mobile layout:

* Video area
* Collapsible participants
* Collapsible chat
* Bottom controls

---

# 33. Video UI

Each participant should have a video tile.

Tile should contain:

* Video
* Participant name
* Mic status
* Camera status
* Speaking indicator if feasible

Teacher's tile should be visually identifiable.

If camera is disabled:

Display:

* avatar/initial
* participant name

---

# 34. Chat UI

Real-time classroom chat.

Features:

* Message list
* Sender name
* Timestamp
* Message input
* Send button

Messages should be emitted through Socket.io.

Persist messages to MongoDB when appropriate.

Do not reload the page to receive messages.

---

# 35. Participant Controls

Teacher can:

* Mute participant
* Remove participant

Students can:

* Toggle microphone
* Toggle camera
* Raise hand

Teacher should see raised-hand indicators.

---

# 36. Screen Sharing

Use:

```javascript
navigator.mediaDevices.getDisplayMedia()
```

When screen sharing starts:

* replace video track
* broadcast screen stream to peers

When screen sharing stops:

* restore camera track

---

# 37. Cloudinary Upload

Allowed MVP file types:

* PDF
* DOC/DOCX
* PPT/PPTX
* PNG
* JPG/JPEG

File size should have a reasonable server-side limit.

Never expose Cloudinary secrets in the frontend.

Environment variables:

```text
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

---

# 38. Environment Variables

Frontend:

```text
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

VITE_API_URL=
VITE_SOCKET_URL=
```

Backend:

```text
PORT=
MONGODB_URI=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Never commit `.env`.

Provide `.env.example`.

---

# 39. UI/UX Design Requirements

The UI must look like a serious modern SaaS product.

Do NOT use:

* Neon colors
* Excessive gradients
* Cyberpunk styling
* Excessive glassmorphism
* Overly rounded cartoon-like components
* Excessive animations
* Huge decorative elements

Use:

* White/light neutral backgrounds
* Dark charcoal text
* One professional primary accent
* Subtle borders
* Subtle shadows
* Moderate border radius
* Clear typography hierarchy
* Good spacing
* Consistent icons
* Professional cards
* Accessible contrast

Suggested visual direction:

```text
Professional
Minimal
Clean
Modern
Academic
SaaS
Trustworthy
```

The application should feel closer to:

* Google Classroom
* Microsoft Teams
* Zoom
* Linear
* Notion

than to a gaming/cyberpunk application.

---

# 40. Responsive Design

Support:

* Desktop
* Tablet
* Mobile

Breakpoints should be handled using Tailwind CSS.

The live classroom must remain usable on mobile.

---

# 41. Error Handling

Every API request must handle:

* Loading
* Success
* Failure

Backend should return consistent error responses.

Example:

```json
{
  "success": false,
  "message": "Classroom not found"
}
```

Successful responses:

```json
{
  "success": true,
  "data": {}
}
```

Use centralized Express error handling.

---

# 42. Security Requirements

Implement:

* Firebase token verification
* Backend authorization
* Role-based access control
* Input validation
* File type validation
* File size limits
* Environment variables
* CORS configuration
* No secrets in frontend
* MongoDB validation
* Ownership checks

Example:

A student must not be able to call:

```text
POST /api/classrooms
```

and create a teacher classroom.

A student must not be able to delete another user's classroom.

---

# 43. WebSocket Authentication

Socket.io connections should authenticate the user.

The client should provide the Firebase ID token during socket connection.

Server:

1. Receive token
2. Verify Firebase token
3. Find user
4. Attach user information to socket

Example conceptual object:

```text
socket.user = {
    id,
    firebaseUid,
    role
}
```

Never trust client-provided user identity.

---

# 44. Classroom Socket Rooms

Each classroom should correspond to a Socket.io room.

Example:

```text
classroom:<classroomId>
```

When a student joins:

```text
socket.join(`classroom:${classroomId}`)
```

Use rooms for:

* Chat
* Participant updates
* Hand raising
* Classroom events
* WebRTC signaling

---

# 45. WebRTC Connection Flow

When user joins:

1. Connect Socket.io
2. Join classroom room
3. Obtain camera/microphone
4. Receive existing participants
5. Create RTCPeerConnection for required peers
6. Exchange offers
7. Exchange answers
8. Exchange ICE candidates
9. Attach remote streams
10. Render video tiles

When user leaves:

1. Close peer connections
2. Stop local tracks if appropriate
3. Notify Socket.io
4. Update participant list

---

# 46. WebRTC Error Handling

Handle:

* Camera permission denied
* Microphone permission denied
* No camera available
* No microphone available
* Peer disconnected
* Connection failure
* Browser does not support required API

The application must not crash if media permissions are denied.

A user should still be able to join the classroom without camera/microphone if possible.

---

# 47. Routing

Required routes:

```text
/login
/register
/dashboard
/classrooms/:id
/classrooms/:id/live
/profile
```

Protected routes should redirect unauthenticated users to `/login`.

Role-specific routes should verify permissions.

---

# 48. Components

Important reusable components:

```text
Navbar
Sidebar
Button
Input
Modal
Card
Loader
ErrorMessage
EmptyState
ProtectedRoute
RoleGuard

ClassroomCard
CreateClassroomModal
JoinClassroomModal
ParticipantList
ParticipantItem
VideoGrid
VideoTile
LiveControls
ChatPanel
ChatMessage
MaterialList
MaterialUpload
AttendanceTable
```

---

# 49. State Management

Do not introduce Redux unless it becomes necessary.

Use:

* React Context
* useState
* useReducer
* custom hooks

Contexts:

```text
AuthContext
SocketContext
```

WebRTC state should primarily live inside:

```text
useWebRTC()
```

Avoid unnecessary global state.

---

# 50. API Service Layer

Do not call Axios directly from every component.

Use service modules.

Example:

```text
classroom.service.js
auth.service.js
material.service.js
attendance.service.js
```

This keeps UI components clean.

---

# 51. Development Sequence

Implement in this order.

## Phase 1 — Project Setup

* Initialize React/Vite
* Initialize Node/Express
* Configure MongoDB
* Configure Firebase
* Configure Cloudinary
* Configure Socket.io
* Configure environment variables

---

## Phase 2 — Authentication

Build:

* Register
* Login
* Logout
* Firebase authentication
* Backend Firebase token verification
* User creation
* Role handling
* Protected routes

---

## Phase 3 — Classroom Management

Build:

* Teacher create classroom
* Classroom listing
* Classroom details
* Student join code
* Enrollment
* Role authorization

---

## Phase 4 — Live Classroom

Build:

* Socket.io connection
* Classroom rooms
* Participant presence
* WebRTC
* Audio/video
* Camera toggle
* Microphone toggle

This is the highest-risk technical section.

Get it working before spending too much time polishing the UI.

---

## Phase 5 — Real-Time Features

Build:

* Chat
* Raise hand
* Teacher mute
* Teacher remove
* Participant status

---

## Phase 6 — Materials

Build:

* Cloudinary upload
* Material metadata
* Material listing
* Download/open
* Delete material

---

## Phase 7 — Attendance

Build:

* Join timestamp
* Leave timestamp
* Duration
* Teacher attendance view

---

## Phase 8 — UI Polish

Add:

* Responsive design
* Empty states
* Loading states
* Error states
* Toast notifications
* Consistent spacing
* Icons
* Modal dialogs
* Professional visual hierarchy

---

# 52. Five-Day Execution Plan

## Day 1 — Foundation

Goal:

Authentication + backend + database + basic dashboard.

Implement:

* Project initialization
* React setup
* Express setup
* MongoDB
* Firebase
* Firebase Admin
* User model
* Authentication
* Protected routes
* Role-based dashboard
* Basic UI shell

End-of-day target:

```text
Register → Login → Dashboard
```

must work.

---

# Day 2 — Classroom Management

Implement:

* Classroom model
* Enrollment model
* Create classroom
* Join classroom
* Classroom listing
* Classroom details
* Join code
* Teacher/student permissions

End-of-day target:

```text
Teacher creates classroom
        ↓
Student enters code
        ↓
Student joins classroom
        ↓
Both see classroom
```

---

# Day 3 — WebRTC + Socket.io

This is the most important day.

Implement:

* Socket.io server
* Socket authentication
* Classroom rooms
* Participant presence
* WebRTC signaling
* getUserMedia
* RTCPeerConnection
* Offer/answer
* ICE candidates
* Video grid
* Camera toggle
* Mic toggle
* Leave classroom

End-of-day target:

Two browsers should be able to join the same classroom and communicate through live audio/video.

Do NOT move forward until this works.

---

# Day 4 — Real-Time Classroom Features

Implement:

* Chat
* Raise hand
* Teacher mute
* Teacher remove
* Screen sharing
* Participant list
* Classroom live state
* Attendance

Then implement:

* Cloudinary upload
* Material list
* Material deletion

---

# Day 5 — Polish + Testing

Focus on:

* UI polish
* Responsive design
* Error handling
* Loading states
* Empty states
* Authentication edge cases
* WebRTC edge cases
* Testing with multiple browser windows
* Fixing bugs
* README
* Deployment

Final deployment target:

```text
Frontend → Vercel
Backend → Railway/Render/etc.
MongoDB → MongoDB Atlas
Firebase → Firebase
Cloudinary → Cloudinary
```

---

# 53. Testing Strategy

Test with at least:

```text
Browser 1:
Teacher

Browser 2:
Student 1

Browser 3:
Student 2
```

Test:

* Login
* Logout
* Classroom creation
* Classroom joining
* Invalid join code
* Video
* Audio
* Camera off
* Mic off
* Screen share
* Chat
* Raise hand
* Teacher mute
* Teacher remove
* Student disconnect
* Teacher disconnect
* File upload
* File download
* Attendance

---

# 54. Important MVP Principle

Do not build all features simultaneously.

Build vertical slices.

For example:

```text
Authentication
    ↓
Classroom
    ↓
Live classroom
    ↓
Chat
    ↓
Materials
    ↓
Attendance
    ↓
Polish
```

At every stage, the application should remain runnable.

---

# 55. Definition of Done

The MVP is considered complete when:

* Teacher can register/login
* Student can register/login
* Teacher can create classroom
* Student can join classroom
* Teacher can start live class
* Student can join live class
* Audio/video works between multiple browsers
* Camera can be toggled
* Microphone can be toggled
* Screen sharing works
* Real-time chat works
* Participants are displayed
* Student can raise hand
* Teacher can mute/remove participant
* Materials can be uploaded
* Materials can be viewed/downloaded
* Basic attendance is recorded
* Data persists in MongoDB
* Authentication is handled by Firebase
* Files are stored through Cloudinary
* Socket.io handles real-time communication
* WebRTC handles media
* Application is responsive
* UI looks professional
* No secrets are committed
* README explains setup and architecture

---

# 56. Future Architecture

The MVP should be structured so that the following can be added later:

```text
                    Current MVP
                         |
              Peer-to-Peer WebRTC
                         |
                         v
                  Future SFU Layer
                         |
             +-----------+-----------+
             |           |           |
           mediasoup   LiveKit    Janus
```

Other future features:

* Recording
* Breakout rooms
* Whiteboard
* Quizzes
* Assignments
* Notifications
* AI transcription
* AI classroom assistant
* Analytics
* Calendar
* Admin dashboard

These should NOT block the MVP.

---

# 57. Engineering Principles

Follow these principles throughout the implementation:

1. Keep frontend and backend separated.
2. Keep controllers thin.
3. Put reusable business logic into services.
4. Keep database models focused.
5. Validate inputs.
6. Never trust client roles.
7. Never expose secrets.
8. Keep WebRTC logic isolated in a custom hook/service.
9. Keep Socket.io event handlers organized.
10. Reuse UI components.
11. Avoid unnecessary dependencies.
12. Prefer readable code over clever code.
13. Handle errors explicitly.
14. Keep the application runnable after every implementation phase.
15. Do not implement future features until the MVP works.

---

# 58. Final Architecture

```text
                         ┌───────────────────────┐
                         │       React           │
                         │       Vite            │
                         │       Tailwind        │
                         └───────────┬───────────┘
                                     │
                  ┌──────────────────┼──────────────────┐
                  │                  │                  │
                  ▼                  ▼                  ▼
            Firebase Auth       REST API           Socket.io
                  │                  │                  │
                  │                  ▼                  │
                  │           Node + Express            │
                  │                  │                  │
                  │          ┌───────┴───────┐          │
                  │          │               │          │
                  │          ▼               ▼          │
                  │      MongoDB         Cloudinary     │
                  │                                      │
                  │                                      │
                  └──────────────────────────────────────┘
                                                         │
                                                         ▼
                                                WebRTC Signaling
                                                         │
                                     ┌───────────────────┴───────────────────┐
                                     │                                       │
                                     ▼                                       ▼
                                  Teacher                                Students
                                     │                                       │
                                     └────────────── WebRTC ─────────────────┘
                                             Audio / Video / Screen
```

This architecture should be treated as the source of truth for the MVP.
