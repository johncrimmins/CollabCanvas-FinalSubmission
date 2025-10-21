# CollabCanvas Performance Rubric

## Section 1: Core Collaborative Infrastructure

### 1.1 Real-Time Synchronization

**Requirements:**
- Consistent synchronization under 150 ms latency
- Minor delay acceptable under heavy load

### 1.2 Conflict Resolution & State Management

**Requirements:**
- Simultaneous edits resolve correctly at least 90% of the time
- Conflict resolution strategy documented
- Visual artifacts (e.g., brief flicker) acceptable if state remains consistent
- Ghost objects, if they occur, must self-correct

**Testing Scenarios:**
- **Simultaneous Move:** Two users drag the same rectangle at the same time
- **Rapid Edit Storm:** One resizes, another recolors, another moves simultaneously
- **Delete vs Edit:** One deletes an object while another is editing it
- **Create Collision:** Two users create new objects nearly simultaneously

### 1.3 Persistence & Reconnection

**Requirements:**
- Refresh preserves at least 95% of state
- Reconnection restores session with no more than 1–2 lost operations
- Connection status clearly displayed
- System recovers gracefully from temporary network loss

**Testing Scenarios:**
- **Mid-Operation Refresh:** Refresh during drag; object position remains accurate
- **Total Disconnect:** All users disconnect, return after 2 min → full canvas restored
- **Network Simulation:** Network throttled to 0 for 30 s, restored → canvas resyncs correctly
- **Rapid Disconnect:** Rapid edits followed by immediate tab close → edits persist for others

## Section 2: Canvas Features & Performance

### 2.1 Canvas Functionality

**Requirements:**
- Supports at least two shape types
- Transformations (resize, rotate, move) function correctly
- Basic text support
- Multi-select via Shift-click or drag

### 2.2 Performance & Scalability

**Requirements:**
- Maintains smooth performance with 300+ objects
- Supports 4–5 concurrent users without major slowdown

## Section 3: Advanced Figma-Inspired Features

### Feature Requirements

**Overall Guidelines:**
- All implemented features must work consistently and intuitively
- Implement in order of Tier 

### Tier 1 Features

- Undo/redo with keyboard shortcuts (Cmd + Z / Cmd + Shift + Z)
- Keyboard shortcuts for common actions (Delete, Duplicate, Arrow keys to move)

### Tier 2 Features

- Layers panel with drag-to-reorder and hierarchy
- Z-index management (bring to front, send to back)

### Tier 3 Features
- Copy/paste functionality

## Section 4: Technical Implementation

### 4.1 Architecture Quality

**Requirements:**
- Clean, modular architecture
- Clear separation of concerns
- Scalable and maintainable code structure

### 4.2 Authentication & Security

**Requirements:**
- Secure authentication and session management
- Protected routes
- No exposed credentials
- Proper handling of user data

### 4.3 Repository & Setup

**Requirements:**
- Clear README and setup instructions
- Architecture documentation included
- Simple local run process
- All dependencies listed

### 4.4 Deployment

**Requirements:**
- Stable public deployment
- Supports at least five concurrent users
- Fast load times