# Document Management System - Component Documentation

## Overview
The Document Management System is a comprehensive frontend module for managing, organizing, and collaborating on documents within the SkiTech platform. It provides enterprise-grade document handling with role-based access control, audit trails, and rich filtering capabilities.

## 🎯 Core Features

### 1. View All Button
**Location**: Dashboard header
**Behavior**: Toggles between dashboard overview and full document table view
**Usage**: Click "View All Files" button in top navigation

**Features**:
- Responsive toggle between dashboard and table views
- Smooth transitions with Framer Motion animations
- Accessible to all user roles

---

### 2. View Details Button
**Location**: Each document row (table view)
**Behavior**: Opens modal with complete document metadata

**Modal Contents**:
- Document metadata (name, size, type, etc.)
- Full description
- Tags and categories
- File size and upload date
- Reviewer information
- Review history timeline
- Collaborators list
- Version history

**Animations**: Smooth scale and fade transitions

---

### 3. Quick Access Cards
**Location**: Dashboard top section (6-card grid)
**Cards Displayed**:
- **Total Files**: Count of all documents in system
- **Pending Reviews**: Documents awaiting approval
- **Approved Documents**: Active/approved documents
- **Rejected Documents**: Documents with rejection status
- **Recent Uploads**: Count of recently uploaded files
- **Shared Files**: Documents shared with others

**Interactions**:
- Hover animations (scale + shadow)
- Click filters table to show matching documents
- Alert badge on pending reviews card
- Color-coded icons

**Responsive**: Grid layout adjusts from 2 columns (mobile) to 6 columns (desktop)

---

### 4. Upload New Document Button
**Location**: Header top-right
**Opens**: Upload modal dialog

**Upload Features**:
- **Drag & Drop Area**: Full-width drag zone with visual feedback
- **File Validation**: PDF, DOCX, XLSX, PNG, JPG (max 50MB)
- **Progress Bars**: Real-time upload progress per file
- **Upload Fields**:
  - Document Title (required)
  - Description (optional)
  - Category/Department dropdown
  - Access Level (Private, Team Only, Department, Organization Wide)
  - Compliance Reviewer assignment
  - Tags (comma-separated)

**Interactions**:
- Drag-over state changes background
- Real-time file list with progress bars
- Remove individual files before upload
- Success toast notification on completion

---

### 5. Filters UI
**Location**: Table view (sticky on desktop)
**Filter Types**:
- **File Type**: PDF, DOCX, XLSX, PNG, JPG
- **Department**: Multi-select dropdown
- **Status**: Active, Draft, Pending Approval, Processing, Archived, Rejected
- **Access Level**: Private, Team Only, Department, Organization Wide

**Features**:
- Multi-select for each filter type
- Real-time filtering as selections change
- "Reset Filters" button to clear all
- Search bar for document name/content
- Sort by: Newest, Oldest, Alphabetical, Size

**Responsive**: 
- Desktop: Sticky sidebar filter panel
- Mobile: Collapsible filter drawer

---

### 6. Pagination UI
**Location**: Table view bottom
**Features**:
- Previous/Next buttons
- Page number buttons with active state
- Items-per-page selector (10, 25, 50)
- Dynamic page count calculation
- Jump to specific page

**Interactions**:
- Active page highlighted
- Disabled state for out-of-range navigation
- Toast notification on page change

---

### 7. Review Document Modal
**Location**: Opens from document table context menu
**Review Features**:
- **Approve Button**: Mark document as approved
- **Reject Button**: Mark as rejected (requires comment)
- **Comment Textarea**: Add review comments
- **Status Badges**: Current and history status display
- **Review History Timeline**: Shows all reviews chronologically

**Reviewer Information**:
- Current reviewer name
- Review timestamp
- Historical reviews with comments
- Automatic audit logging

---

### 8. Dismiss Button
**Location**: Priority alerts/notifications
**Behavior**:
- Removes alert card from view
- Shows undo snackbar at bottom
- Logs dismissal action to audit trail
- 5-second undo window

**Interactions**:
- "Dismiss" button hides alert
- "Undo" snackbar appears at bottom
- Click undo to restore alert
- Auto-hide after 5 seconds

---

### 9. View File Button
**Location**: Document row context menu
**Opens**: File preview modal

**Preview Features**:
- **File Type Detection**: 
  - PDF: Placeholder with download option
  - Images: Full preview with zoom controls
  - Documents: Text preview with formatting
- **Zoom Controls**: Zoom in/out buttons
- **Fullscreen Mode**: Expand to fullscreen view
- **Sidebar**: File info and metadata
- **Download Button**: Download file action

**Interactions**:
- Smooth animations on modal open/close
- Pinch-zoom support on mobile
- Keyboard shortcuts (ESC to close)
- Auto-hide sidebar on mobile

---

### 10. Create New Document
**Location**: Header "Create Document" button
**Opens**: Full-screen document editor

**Editor Features**:
- **Template Selection**: Blank, SOP, Technical Brief
- **Rich Text Editor**: Full-featured text editing area
- **Title Input**: Document title field
- **Description**: Short description/summary
- **Department Selection**: Categorize document
- **Access Level**: Control visibility
- **Tags Input**: Add searchable tags
- **Collaborator Tags**: Add team members
- **Attachment Area**: Add related files

**Buttons**:
- **Save as Draft**: Saves to local drafts
- **Publish**: Makes document public/visible
- **Cancel**: Discard changes

**Auto-Save**: 
- Automatic draft saving every 15 seconds
- Visual status indicator
- Local storage persistence

---

## 🏗️ Component Structure

```
components/document-management/
├── DocumentTable.tsx          # Main table with filters/pagination
├── DocTabs.tsx                # Navigation tabs (ALL, MY DOCS, UPDATES)
├── StatCard.tsx               # Reusable stat card component
├── DocumentSkeleton.tsx       # Loading skeleton UI
├── EmptyState.tsx             # Empty state displays
├── SharedComponents.tsx       # StatusBadge, getFileIcon
├── pages/
│   ├── page.tsx              # Main dashboard page
│   ├── my-documents/
│   │   └── page.tsx          # User's personal documents
│   ├── updates/
│   │   └── page.tsx          # Updates and notifications
│   └── upload/
│       └── page.tsx          # Document upload page
└── index.ts                  # Export barrel file
```

---

## 📦 Reusable Components

### StatCard
```tsx
import { StatCard } from "@/components/document-management";

<StatCard
  icon={FileText}
  label="Total Documents"
  value={42}
  alert={false}
  trend="↑12%"
  trendUp={true}
  onClick={() => handleClick()}
/>
```

**Props**:
- `icon`: LucideIcon - Display icon
- `label`: string - Card label
- `value`: number - Main value
- `alert?: boolean` - Show alert styling
- `trend?: string` - Trend indicator text
- `trendUp?: boolean` - Trend direction
- `onClick?: () => void` - Click handler
- `loading?: boolean` - Loading state

---

### DocumentSkeleton
```tsx
import { DocumentSkeleton } from "@/components/document-management";

<DocumentSkeleton count={5} view="grid" />
```

**Props**:
- `count?: number` - Number of skeleton items (default: 5)
- `view?: "list" | "grid"` - Display style

---

### EmptyState
```tsx
import { EmptyState } from "@/components/document-management";

<EmptyState
  type="no-documents"
  onAction={() => setShowUploadModal(true)}
  actionLabel="Upload First Document"
/>
```

**Props**:
- `type?: "no-documents" | "no-results" | "no-updates"` - State type
- `onAction?: () => void` - Action button click handler
- `actionLabel?: string` - Button text

---

## 🎨 Styling & Theme

### Color System
- **Primary**: Black (#030213) with white foreground
- **Borders**: rgba(0, 0, 0, 0.1) - Subtle borders
- **Shadows**: Soft shadows (0.125rem, 0.25rem)
- **Status Colors**:
  - Active: Black/Dark
  - Archived: Gray
  - Draft: Neutral
  - Pending: Orange
  - Urgent: Red
  - Approved: Green

### Typography
- **Font Family**: Merriweather (serif) for headings, Inter for body
- **Font Sizes**: 
  - Headings: 3xl (30px) font-black
  - Labels: 10px font-bold uppercase
  - Body: 14px font-light
- **Line Height**: Compact for headings, normal for body

### Spacing
- **Card Padding**: 1.25rem (p-5) to 1.5rem (p-6)
- **Gap**: 1rem (gap-4) between elements
- **Border Radius**: 1.5rem (rounded-2xl) for cards, 0.75rem for smaller elements

---

## 🔄 Data Flow

### State Management
Documents are managed via `useDocumentStore` hook (localStorage-based):
- Persist documents to localStorage
- Add/update/delete documents
- Track review history
- Log activities

### Mock API
`document-api.ts` provides:
- `getDocuments()` - Fetch all documents
- `uploadDocument()` - Upload file with progress
- `createDocument()` - Create new document
- `reviewDocument()` - Submit review
- Error handling with fallback to localStorage

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px (single column)
- **Tablet**: 768px - 1024px (2 columns)
- **Desktop**: > 1024px (3+ columns)

### Mobile Optimizations
- Stacked layout for modals
- Collapsible filter drawers
- Full-width buttons
- Larger touch targets (min 44px)
- Hide secondary columns

---

## ♿ Accessibility

- **Keyboard Navigation**: Tab through all controls
- **Screen Readers**: Semantic HTML with ARIA labels
- **Color Contrast**: WCAG AA compliant
- **Focus States**: Clear visual focus indicators
- **Animations**: Respects `prefers-reduced-motion`

---

## 🚀 Performance

- **Pagination**: Handle 1000+ documents efficiently
- **Virtualization**: List items only rendered when visible
- **Debounced Search**: 300ms delay on search input
- **Lazy Loading**: Modals load on-demand
- **Skeleton Loaders**: Show during data fetch

---

## 🔐 Security & Audit

- **Role-Based Access**: Owner > Manager > Staff
- **Activity Logging**: All actions logged with timestamp
- **Audit Trail**: Full review history preserved
- **Dismissal Tracking**: Alert dismissals logged
- **Local Storage**: Client-side persistence only (demo mode)

---

## 📚 Usage Examples

### Dashboard View
```tsx
import DocumentOverviewPage from "@/components/document-management/pages/page";

export default function Page() {
  return <DocumentOverviewPage />;
}
```

### My Documents
```tsx
import MyDocumentsPage from "@/components/document-management/pages/my-documents/page";

export default function Page() {
  return <MyDocumentsPage />;
}
```

### With Filters
```tsx
<DocumentTable
  statusFilter="Pending Approval"
  sharedOnly={true}
  role="Manager"
/>
```

---

## 🎯 Best Practices

1. **Always use the exported components** from `/index.ts`
2. **Respect role-based permissions** before showing actions
3. **Provide feedback** via toast notifications
4. **Show loading states** during async operations
5. **Use empty states** when no data available
6. **Persist state** to localStorage for demo data
7. **Test on mobile** for responsive behavior
8. **Keep animations smooth** for better UX

---

## 📞 Support

For questions or issues with the Document Management System:
1. Check component props and TypeScript types
2. Review example implementations
3. Check browser console for errors
4. Verify localStorage has space (5-10MB limit)
5. Clear cache if UI doesn't update

