# CosmicSyncCore and SharedSpheres: Data Model

## Core Entities

1. User
   - id: UUID
   - username: String
   - email: String
   - passwordHash: String
   - createdAt: DateTime
   - lastActive: DateTime
   - profile: UserProfile

2. UserProfile
   - id: UUID
   - userId: UUID (foreign key to User)
   - fullName: String
   - bio: Text
   - skills: Array<Skill>
   - interests: Array<Interest>
   - location: GeoLocation
   - privacySettings: JSON

3. Skill
   - id: UUID
   - name: String
   - category: String
   - proficiencyLevel: Enum (Beginner, Intermediate, Advanced, Expert)

4. Interest
   - id: UUID
   - name: String
   - category: String

5. Project
   - id: UUID
   - name: String
   - description: Text
   - creatorId: UUID (foreign key to User)
   - status: Enum (Proposed, Active, Completed, Archived)
   - createdAt: DateTime
   - updatedAt: DateTime
   - members: Array<ProjectMember>
   - tags: Array<String>

6. ProjectMember
   - id: UUID
   - projectId: UUID (foreign key to Project)
   - userId: UUID (foreign key to User)
   - role: String
   - joinedAt: DateTime

7. Collaboration
   - id: UUID
   - type: Enum (TimeBank, SkillSwap, KnowledgeShare)
   - requestorId: UUID (foreign key to User)
   - providerId: UUID (foreign key to User)
   - status: Enum (Proposed, Accepted, Completed, Cancelled)
   - description: Text
   - createdAt: DateTime
   - completedAt: DateTime (nullable)

8. Message
   - id: UUID
   - senderId: UUID (foreign key to User)
   - receiverId: UUID (foreign key to User)
   - content: Text
   - sentAt: DateTime
   - readAt: DateTime (nullable)

9. ForumThread
   - id: UUID
   - title: String
   - creatorId: UUID (foreign key to User)
   - category: String
   - createdAt: DateTime
   - lastActivityAt: DateTime
   - status: Enum (Active, Archived)

10. ForumPost
    - id: UUID
    - threadId: UUID (foreign key to ForumThread)
    - authorId: UUID (foreign key to User)
    - content: Text
    - createdAt: DateTime
    - editedAt: DateTime (nullable)

## Relationships

- User 1:1 UserProfile
- User 1:N Project (as creator)
- User 1:N ProjectMember
- Project 1:N ProjectMember
- User 1:N Skill
- User 1:N Interest
- User 1:N Collaboration (as requestor or provider)
- User 1:N Message (as sender or receiver)
- User 1:N ForumThread (as creator)
- User 1:N ForumPost (as author)
- ForumThread 1:N ForumPost

## Sync Considerations for CosmicSyncCore

- User and UserProfile data should be synced across the P2P network, with privacy settings respected
- Project and ProjectMember data should be distributed among relevant users
- Collaboration data should be shared between involved parties
- Messages should be end-to-end encrypted and synced between sender and receiver
- Forum data should be replicated across nodes to ensure availability

## SharedSpheres-specific Extensions

SharedSpheres may extend this core data model with additional entities or attributes specific to its user interface and advanced features, such as:

- UserPreferences: for storing UI preferences and settings
- Notification: for managing user notifications
- Badge: for gamification and recognition systems
- EventLog: for tracking user activities and system events

This data model provides a solid foundation for both CosmicSyncCore and SharedSpheres, allowing for efficient data management and synchronization across the P2P network while supporting the collaborative features of the platform.
