# Anonymous Studying

A community-driven platform for students to ask and answer academic questions anonymously.

## Overview

Anonymous Studying is a ticket-based support system designed for educational environments. It allows students to post questions, receive answers from peers, and build reputation within the community while maintaining anonymity through OAuth-based authentication.

## Features

- **User Anonymity**: Secure OAuth authentication with email hashing for privacy
- **Topic Organization**: Questions categorized by subject areas (CS101, Biology, etc.)
- **Tag System**: Additional classification with tags like "homework" or "exam"
- **Reputation System**: Users earn karma through helpful contributions
- **Moderation**: High-reputation users (500+ points) automatically gain moderator status
- **Answer Acceptance**: Question authors can mark the most helpful answer
- **Voting System**: Community-driven quality control through upvotes and downvotes
- **Edit History**: Transparent tracking of content modifications
- **Media Support**: Image attachment capabilities for questions and answers
- **Personalization**: User preferences for notifications and UI themes

## Database Schema

### Core Tables

- **users**: User profiles and authentication information
- **topics**: Subject categories for organizing questions
- **tags**: Keywords for additional question classification
- **tickets**: The questions/issues posted by users
- **replies**: Answers and comments on tickets
- **ticket_tags**: Junction table connecting tickets to relevant tags
- **previous_edits**: Change history for tickets and replies

### Key Relationships

- Each ticket belongs to one topic and one author
- Each reply belongs to one ticket and one author
- Tickets can have multiple tags
- Edit history is maintained for both tickets and replies

## Technical Details

- MySQL database
- Automatic moderator promotion based on reputation
- Status tracking for tickets (open, answered, closed)
- Timestamp monitoring for content freshness

## Getting Started

[Installation and setup instructions would go here]

## Contributing

[Contribution guidelines would go here]

## License

[License information would go here]