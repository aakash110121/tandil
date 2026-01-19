# Reports Management API Requirements

This document outlines all the API endpoints needed for the Admin Reports Management feature.

## Base URL
All endpoints should be prefixed with `/api/admin/reports`

---

## 1. Get All Reports
**Endpoint:** `GET /api/admin/reports`

**Description:** Fetch all reports (pending, generated, scheduled)

**Query Parameters:**
- `status` (optional): Filter by status (`pending`, `generated`, `scheduled`)
- `type` (optional): Filter by report type (`financial`, `performance`, `customer`, `operational`, `user`, `subscription`)
- `page` (optional): Page number for pagination
- `per_page` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Monthly Financial Report",
      "type": "financial",
      "status": "pending",
      "created_at": "2024-01-15T10:00:00Z",
      "scheduled_at": null,
      "generated_at": null,
      "file_url": null,
      "created_by": {
        "id": 1,
        "name": "Admin User"
      }
    },
    {
      "id": 2,
      "title": "Weekly Performance Report",
      "type": "performance",
      "status": "generated",
      "created_at": "2024-01-14T09:00:00Z",
      "scheduled_at": null,
      "generated_at": "2024-01-14T10:30:00Z",
      "file_url": "https://example.com/reports/report-2.pdf",
      "file_size": 1024000,
      "created_by": {
        "id": 1,
        "name": "Admin User"
      }
    },
    {
      "id": 3,
      "title": "Customer Satisfaction Report",
      "type": "customer",
      "status": "scheduled",
      "created_at": "2024-01-13T08:00:00Z",
      "scheduled_at": "2024-01-20T09:00:00Z",
      "generated_at": null,
      "file_url": null,
      "created_by": {
        "id": 1,
        "name": "Admin User"
      }
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 3,
    "last_page": 1
  }
}
```

---

## 2. Get Single Report
**Endpoint:** `GET /api/admin/reports/{id}`

**Description:** Fetch details of a specific report

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Monthly Financial Report",
    "type": "financial",
    "status": "generated",
    "created_at": "2024-01-15T10:00:00Z",
    "scheduled_at": null,
    "generated_at": "2024-01-15T10:30:00Z",
    "file_url": "https://example.com/reports/report-1.pdf",
    "file_size": 2048000,
    "created_by": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com"
    },
    "parameters": {
      "start_date": "2024-01-01",
      "end_date": "2024-01-31",
      "format": "pdf"
    }
  }
}
```

---

## 3. Generate Report
**Endpoint:** `POST /api/admin/reports/generate`

**Description:** Generate a new report (async operation)

**Request Body:**
```json
{
  "type": "financial",
  "title": "Monthly Financial Report",
  "parameters": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "format": "pdf",
    "include_charts": true,
    "include_details": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Report generation started. You will be notified when it's ready.",
  "data": {
    "id": 4,
    "title": "Monthly Financial Report",
    "type": "financial",
    "status": "pending",
    "created_at": "2024-01-15T11:00:00Z",
    "scheduled_at": null,
    "generated_at": null,
    "file_url": null
  }
}
```

**Note:** The report generation should be processed asynchronously. When ready, the status should be updated to `generated` and `file_url` should be populated.

---

## 4. Schedule Report
**Endpoint:** `POST /api/admin/reports/schedule`

**Description:** Schedule a report to be generated at a specific date/time

**Request Body:**
```json
{
  "type": "financial",
  "title": "Weekly Financial Report",
  "scheduled_at": "2024-01-20 09:00:00",
  "recurrence": "weekly",  // optional: "daily", "weekly", "monthly", "yearly", null for one-time
  "parameters": {
    "start_date": "2024-01-15",
    "end_date": "2024-01-21",
    "format": "pdf",
    "include_charts": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Report scheduled successfully",
  "data": {
    "id": 5,
    "title": "Weekly Financial Report",
    "type": "financial",
    "status": "scheduled",
    "created_at": "2024-01-15T11:00:00Z",
    "scheduled_at": "2024-01-20T09:00:00Z",
    "recurrence": "weekly",
    "generated_at": null,
    "file_url": null
  }
}
```

---

## 5. Cancel Scheduled Report
**Endpoint:** `DELETE /api/admin/reports/{id}/cancel`

**Description:** Cancel a scheduled report

**Response:**
```json
{
  "success": true,
  "message": "Scheduled report cancelled successfully"
}
```

---

## 6. Download Report
**Endpoint:** `GET /api/admin/reports/{id}/download`

**Description:** Download the generated report file

**Response:** 
- Content-Type: `application/pdf` (or appropriate file type)
- Content-Disposition: `attachment; filename="report-{id}.pdf"`
- Binary file content

**Note:** This should return the actual file for download.

---

## 7. Share Report
**Endpoint:** `POST /api/admin/reports/{id}/share`

**Description:** Share a report via email or generate a shareable link

**Request Body:**
```json
{
  "method": "email",  // "email" or "link"
  "recipients": ["user1@example.com", "user2@example.com"],  // required if method is "email"
  "message": "Please find the attached report"  // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Report shared successfully",
  "data": {
    "share_link": "https://example.com/reports/share/abc123xyz",  // if method is "link"
    "sent_to": ["user1@example.com", "user2@example.com"]  // if method is "email"
  }
}
```

---

## 8. Get Report Statistics
**Endpoint:** `GET /api/admin/reports/statistics`

**Description:** Get statistics about reports (counts by status, type, etc.)

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 25,
    "pending": 5,
    "generated": 15,
    "scheduled": 5,
    "by_type": {
      "financial": 8,
      "performance": 6,
      "customer": 4,
      "operational": 3,
      "user": 2,
      "subscription": 2
    }
  }
}
```

---

## 9. Delete Report
**Endpoint:** `DELETE /api/admin/reports/{id}`

**Description:** Delete a report (only if status is not 'generated' or if generated report file is no longer needed)

**Response:**
```json
{
  "success": true,
  "message": "Report deleted successfully"
}
```

---

## Report Types

The following report types should be supported:

1. **financial** - Revenue, expenses, and profit analysis
2. **performance** - Worker productivity and ratings
3. **customer** - Customer satisfaction and retention
4. **operational** - Service efficiency and completion rates
5. **user** - User statistics and activity
6. **subscription** - Subscription analytics and trends

---

## Report Statuses

- **pending** - Report generation is in progress
- **generated** - Report has been successfully generated and is ready
- **scheduled** - Report is scheduled to be generated at a future date/time
- **failed** - Report generation failed (optional status)

---

## Report Parameters

Each report type may have different parameters. Common parameters include:

- `start_date` - Start date for data range
- `end_date` - End date for data range
- `format` - Output format (`pdf`, `excel`, `csv`)
- `include_charts` - Boolean to include charts/graphs
- `include_details` - Boolean to include detailed breakdown
- `group_by` - Grouping option (e.g., `day`, `week`, `month`)
- `filters` - Additional filters specific to report type

---

## Authentication

All endpoints require:
- Bearer token authentication
- Admin role permissions

---

## Error Responses

All endpoints should return errors in the following format:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": {
    "field_name": ["Validation error message"]
  }
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Notes for Backend Developer

1. **File Storage:** Generated reports should be stored securely and accessible via the `file_url` field. Consider using cloud storage (S3, etc.) or a secure file server.

2. **Async Processing:** Report generation should be handled asynchronously using queues (Laravel Queue, Redis Queue, etc.) to avoid blocking the API request.

3. **Notifications:** When a report is generated, consider sending a notification to the admin user (email, push notification, in-app notification).

4. **Scheduled Reports:** Implement a cron job or scheduled task system to process scheduled reports at their designated times.

5. **Recurring Reports:** If recurrence is specified, create new scheduled reports automatically based on the recurrence pattern.

6. **File Cleanup:** Implement a cleanup job to remove old report files after a certain period (e.g., 90 days) to save storage space.

7. **Rate Limiting:** Consider implementing rate limiting for report generation to prevent abuse.

8. **Permissions:** Ensure only admin users can access these endpoints.

9. **File Formats:** Support multiple formats (PDF, Excel, CSV) as specified in the parameters.

10. **Data Privacy:** Ensure sensitive data in reports is properly handled and complies with data privacy regulations.

