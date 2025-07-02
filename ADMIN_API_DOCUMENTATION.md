# Admin API Documentation

This document provides detailed information about the Admin API endpoints used in the God Will Provide Outreach Ministry admin dashboard.

## 🔑 Authentication

All API endpoints require authentication using a JWT token provided by Supabase Auth.

**Authorization Header Format:**
```
Authorization: Bearer <jwt_token>
```

## 📋 API Endpoints

### User Management

#### List Users
Retrieves a paginated list of users with their roles and status.

**Endpoint:** `GET /functions/v1/list-users`

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string, optional): Search term for email or name
- `role` (string, optional): Filter by role (admin, moderator, user)
- `status` (string, optional): Filter by status (active, inactive)

**Required Permission:** `admin:users:manage`

**Response:**
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "admin",
      "is_active": true,
      "created_at": "2023-01-01T00:00:00Z",
      "last_sign_in_at": "2023-01-02T00:00:00Z",
      "email_confirmed_at": "2023-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

#### List Roles
Retrieves all available user roles.

**Endpoint:** `GET /functions/v1/list-roles`

**Required Permission:** `admin:users:manage`

**Response:**
```json
{
  "roles": [
    {
      "id": "uuid",
      "name": "admin",
      "description": "Full system administrator with all permissions"
    },
    {
      "id": "uuid",
      "name": "moderator",
      "description": "Content moderator with limited admin permissions"
    },
    {
      "id": "uuid",
      "name": "user",
      "description": "Regular user with basic permissions"
    }
  ]
}
```

#### Create User
Creates a new user with specified role and permissions.

**Endpoint:** `POST /functions/v1/create-user`

**Required Permission:** `admin:users:manage`

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "securePassword123",
  "full_name": "New User",
  "role": "user",
  "is_active": true
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "newuser@example.com",
    "full_name": "New User",
    "role": "user",
    "is_active": true
  }
}
```

#### Update User Role
Updates a user's role.

**Endpoint:** `POST /functions/v1/update-user-role`

**Required Permission:** `admin:users:manage`

**Request Body:**
```json
{
  "userId": "uuid",
  "newRole": "moderator"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User role updated successfully",
  "userId": "uuid",
  "newRole": "moderator"
}
```

#### Delete User
Deletes a user from the system.

**Endpoint:** `DELETE /functions/v1/delete-user`

**Required Permission:** `admin:users:manage`

**Request Body:**
```json
{
  "userId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "userId": "uuid"
}
```

### Role Management

#### List Permissions
Retrieves all available permissions.

**Endpoint:** `GET /functions/v1/list-permissions`

**Required Permission:** `admin:system:manage`

**Response:**
```json
{
  "permissions": [
    {
      "id": "uuid",
      "name": "admin:dashboard:read",
      "resource": "dashboard",
      "action": "read",
      "description": "Access admin dashboard"
    }
  ]
}
```

## 🔒 Error Handling

All API endpoints return standardized error responses:

**Error Response Format:**
```json
{
  "error": "Error message describing the issue"
}
```

**Common Error Status Codes:**
- `400`: Bad Request - Invalid input parameters
- `401`: Unauthorized - Missing or invalid authentication
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource not found
- `409`: Conflict - Resource already exists
- `429`: Too Many Requests - Rate limit exceeded
- `500`: Internal Server Error - Server-side error

## 🔐 Security Considerations

1. **Rate Limiting**
   - All endpoints have rate limiting to prevent abuse
   - Excessive requests will return 429 status code

2. **Input Validation**
   - All inputs are validated for format and content
   - Email format validation
   - Password strength requirements
   - Role existence verification

3. **Permission Checks**
   - Every endpoint verifies appropriate permissions
   - Operations on own account are restricted (e.g., cannot delete self)

4. **Audit Logging**
   - All admin actions are logged for security audit
   - Logs include user ID, action, timestamp, and affected resources

## 📝 Implementation Notes

1. **Service Role Usage**
   - All admin functions use Supabase service role
   - This bypasses RLS for admin operations
   - Permission checks are still enforced in code

2. **Database Transactions**
   - Critical operations use transactions for data integrity
   - Role assignments and user creation are atomic operations

3. **Error Handling**
   - Detailed error logging on server side
   - Sanitized error messages to client
   - Proper HTTP status codes for different error types