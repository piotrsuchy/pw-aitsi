# API Documentation

The Local Archive backend uses Next.js App Router API endpoints (`/api/*`). These are standard RESTful endpoints. Authentication is handled automatically via NextAuth (cookies) for browser requests, but for demonstration purposes, `curl` commands assume the user is properly authenticated (where required).

## API Overview

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | [`/api/photos`](#1-list-photos-public) | List and filter photos | Public |
| `GET` | [`/api/photos/[id]`](#2-get-photo-details-public) | Get single photo details | Public |
| `POST` | [`/api/photos`](#3-create-photo-private---creatoradmin) | Upload new photo metadata | CREATOR / ADMIN |
| `PATCH` | [`/api/photos/[id]`](#4-update-photo-private---owner-or-admin) | Edit photo metadata | Owner / ADMIN |
| `DELETE` | [`/api/photos/[id]`](#5-delete-photo-private---owner-or-admin) | Delete a photo | Owner / ADMIN |
| `POST` | [`/api/upload`](#6-upload-image-private---creatoradmin) | Upload image file | CREATOR / ADMIN |
| `GET` | [`/api/categories`](#7-list-categories-public) | Get category tree | Public |
| `POST` | [`/api/categories`](#8-create-category-private---admin) | Create new category | ADMIN |
| `DELETE` | [`/api/categories/[id]`](#9-delete-category-private---admin) | Delete category | ADMIN |
| `PATCH` | [`/api/users/[id]/role`](#10-update-user-role) | Change user role | ADMIN |
| `PATCH` | [`/api/users/[id]/block`](#11-toggle-user-block-status) | Block/unblock user | ADMIN |

## Photos

### 1. List Photos (Public)

Fetches a paginated list of photos. Supports advanced filtering.
**Endpoint:** `GET /api/photos`
**Query Parameters:** `q`, `category`, `region`, `city`, `dateFrom`, `dateTo`, `page`, `take`

```bash
curl -X GET "http://localhost:3000/api/photos?q=tramwaj&city=Warsaw&take=12"
```

### 2. Get Photo Details (Public)

Fetches details for a single photo by ID.
**Endpoint:** `GET /api/photos/[id]`

```bash
curl -X GET "http://localhost:3000/api/photos/123e4567-e89b-12d3-a456-426614174000"
```

### 3. Create Photo (Private - CREATOR/ADMIN)

**Endpoint:** `POST /api/photos`

```bash
curl -X POST "http://localhost:3000/api/photos" \
  -H "Content-Type: application/json" \
  -H "Cookie: authjs.session-token=..." \
  -d '{"title": "Old Market", "url": "/uploads/test.jpg", "categoryId": "abc", "takenAtYear": 1930}'
```

### 4. Update Photo (Private - Owner or ADMIN)

Updates metadata or tags for a photo.
**Endpoint:** `PATCH /api/photos/[id]`

```bash
curl -X PATCH "http://localhost:3000/api/photos/123e4567-e89b-12d3-a456-426614174000" \
  -H "Content-Type: application/json" \
  -H "Cookie: authjs.session-token=..." \
  -d '{"title": "Updated Market Title", "tags": ["market", "history"]}'
```

### 5. Delete Photo (Private - Owner or ADMIN)

**Endpoint:** `DELETE /api/photos/[id]`

```bash
curl -X DELETE "http://localhost:3000/api/photos/123e4567-e89b-12d3-a456-426614174000" \
  -H "Cookie: authjs.session-token=..."
```

---

## File Upload

### 6. Upload Image (Private - CREATOR/ADMIN)

Uploads an image to the local filesystem.
**Endpoint:** `POST /api/upload`

```bash
curl -X POST "http://localhost:3000/api/upload" \
  -H "Cookie: authjs.session-token=..." \
  -F "file=@/path/to/local/image.jpg"
```

---

## Categories

### 7. List Categories (Public)

Fetches the category hierarchy.
**Endpoint:** `GET /api/categories`

```bash
curl -X GET "http://localhost:3000/api/categories"
```

### 8. Create Category (Private - ADMIN)

Creates a new geographical category/node.
**Endpoint:** `POST /api/categories`

```bash
curl -X POST "http://localhost:3000/api/categories" \
  -H "Content-Type: application/json" \
  -H "Cookie: authjs.session-token=..." \
  -d '{"name": "Gdańsk", "parentId": null}'
```

### 9. Delete Category (Private - ADMIN)

Deletes an empty category. Fails if the category has photos or subcategories.
**Endpoint:** `DELETE /api/categories/[id]`

```bash
curl -X DELETE "http://localhost:3000/api/categories/xyz-123" \
  -H "Cookie: authjs.session-token=..."
```

---

## Users (Admin Only)

### 10. Update User Role

Changes a user's role (`VIEWER`, `CREATOR`, `ADMIN`).
**Endpoint:** `PATCH /api/users/[id]/role`

```bash
curl -X PATCH "http://localhost:3000/api/users/user-123/role" \
  -H "Content-Type: application/json" \
  -H "Cookie: authjs.session-token=..." \
  -d '{"role": "CREATOR"}'
```

### 11. Toggle User Block Status

Blocks or unblocks a user from the platform.
**Endpoint:** `PATCH /api/users/[id]/block`

```bash
curl -X PATCH "http://localhost:3000/api/users/user-123/block" \
  -H "Content-Type: application/json" \
  -H "Cookie: authjs.session-token=..." \
  -d '{"blocked": true}'
```

## Examples of usage

```bash
$ curl -X GET "http://localhost:3000/api/photos/cmo8zr629000rsestw163ng58" | jq .
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   718    0   718    0     0  14272      0 --:--:-- --:--:-- --:--:-- 14360
{
  "id": "cmo8zr629000rsestw163ng58",
  "title": "Warszawa - styczeń 1945",
  "description": null,
  "url": "/uploads/1776798169653-2e67e9987af6dd80.jpg",
  "uploaderId": "cmo6c3atu000061stqy5c5d18",
  "categoryId": "cmo7n2o100004dtst72u8r28c",
  "createdAt": "2026-04-21T19:02:49.713Z",
  "updatedAt": "2026-04-21T19:13:19.279Z",
  "takenAtYear": 1945,
  "takenAtMonth": 1,
  "takenAtDay": null,
  "datePrecision": "MONTH",
  "uploader": {
    "id": "cmo6c3atu000061stqy5c5d18",
    "name": "Dev ADMIN",
    "image": null
  },
  "category": {
    "id": "cmo7n2o100004dtst72u8r28c",
    "name": "Warsaw",
    "slug": "warsaw",
    "parentId": null
  },
  "location": {
    "id": "cmo904nuj000zsest2zgcf2l7",
    "photoId": "cmo8zr629000rsestw163ng58",
    "region": "Mazowsze",
    "city": "Warsaw",
    "district": null,
    "lat": null,
    "lng": null
  },
  "tags": []
}
```

```bash
$ curl -X GET "http://localhost:3000/api/categories" | jq .
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   697    0   697    0     0  12382      0 --:--:-- --:--:-- --:--:-- 12446
[
  {
    "id": "cmo7q2jlz0006sest5910ykcc",
    "name": "Bielsko-Biala",
    "slug": "bielsko-biala",
    "parentId": null,
    "children": []
  },
  {
    "id": "cmo7n2o1i0007dtst9x7bph2b",
    "name": "Krakow",
    "slug": "krakow",
    "parentId": null,
    "children": [
      {
        "id": "cmo7n2o1k0008dtst9q0dfh5x",
        "name": "Old Town",
        "slug": "krakow-old-town",
        "parentId": "cmo7n2o1i0007dtst9x7bph2b",
        "children": []
      }
    ]
  },
  {
    "id": "cmo7n2o100004dtst72u8r28c",
    "name": "Warsaw",
    "slug": "warsaw",
    "parentId": null,
    "children": [
      {
        "id": "cmo7n2o1a0005dtstmk3kv6ck",
        "name": "City Center",
        "slug": "warsaw-city-center",
        "parentId": "cmo7n2o100004dtst72u8r28c",
        "children": []
      },
      {
        "id": "cmo7n2o1g0006dtstafyvy6km",
        "name": "Praga",
        "slug": "warsaw-praga",
        "parentId": "cmo7n2o100004dtst72u8r28c",
        "children": []
      }
    ]
  }
]
```
