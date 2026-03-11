# API Error Codes

This document lists the standard error codes returned by the API authentication middleware.

| Error Code | HTTP Status | Description |
| :--- | :--- | :--- |
| `API_INVALID_CONTENT_TYPE` | 400 | The request body must be JSON (`Content-Type: application/json`). Required for POST, PUT, PATCH methods. |
| `API_MISSING_SECRET` | 401 | The `x-api-secret` header is missing from the request. |
| `API_INVALID_SECRET` | 401 | The provided `x-api-secret` does not match any active API key record. |
| `API_KEY_INACTIVE` | 403 | The provided API key exists but has been disabled (`status: false`). |
| `API_IP_DENIED` | 403 | The request IP address is not whitelisted for this API key. |
| `API_Internal_Error` | 500 | An unexpected internal server error occurred during authentication. |



# Test API Key

```
curl -X GET http://localhost:3001/api/v1/test \
  -H "Content-Type: application/json" \
  -H "x-api-secret: sk_test_1234567890" \
  -d "{}"
```

Response:
```
{
    "success": true,
    "message": "API authentication successful",
    "data": {
        "user": {
            "_id": "699348626edff7898512510b",
            "username": "admin",
            "email": "[EMAIL_ADDRESS]",
            "createdAt": "2026-02-16T16:47:00.000Z",
            "updatedAt": "2026-02-16T16:47:00.000Z"
        },
        "api": {
            "_id": "699348626edff7898512510c",
            "user": "699348626edff7898512510b",
            "secret": "sk_test_1234567890",
            "ip": [],
            "status": true,
            "createdAt": "2026-02-16T16:47:00.000Z",
            "updatedAt": "2026-02-16T16:47:00.000Z"
        }
    }
}
```
