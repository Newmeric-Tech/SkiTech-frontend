# Document Management System - Developer Guide

## 🏗️ Architecture Overview

The Document Management System is built with a modern React/Next.js stack with emphasis on:
- **Component Reusability**: Modular components for flexibility
- **State Management**: Zustand-like hook pattern with localStorage
- **Type Safety**: Full TypeScript support
- **Performance**: Efficient pagination and filtering
- **UX**: Smooth animations and responsive design

---

## 📁 File Structure

```
components/document-management/
├── DocumentTable.tsx           # Core table with all features
├── DocTabs.tsx                 # Navigation tabs
├── StatCard.tsx                # Reusable stat card
├── DocumentSkeleton.tsx        # Loading state
├── EmptyState.tsx              # Empty state display
├── SharedComponents.tsx        # Shared utilities
├── index.ts                    # Barrel export
├── README.md                   # Component docs
├── USER_GUIDE.md              # End-user guide
├── DEVELOPER_GUIDE.md         # This file
├── pages/
│   ├── page.tsx               # Main dashboard
│   ├── my-documents/
│   │   └── page.tsx           # User's documents
│   ├── updates/
│   │   └── page.tsx           # Notifications
│   └── upload/
│       └── page.tsx           # Upload page

lib/
├── document-management.ts      # Types & mock data
├── useDocumentStore.ts         # State management
├── document-api.ts             # API/mock layer

app/
└── manager/document-management/  # Route structure
```

---

## 🔧 Core Types

### DocumentType
```typescript
interface DocumentType {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  visibility: "Private" | "Team Only" | "Department" | "Organization Wide";
  department: string;
  owner: string;
  status: "Active" | "Archived" | "Draft" | "Processing" | "Urgent" | "Pending Approval";
  lastModified: string;
  uploadDate: string;
  fileType: "PDF" | "DOCX" | "XLSX" | "PNG" | "JPG";
  fileSize: string;
  isShared: boolean;
}
```

### DocumentWithExtra
Extends DocumentType with:
```typescript
{
  uploadedBy: string;
  reviewerComments?: string[];
  reviewHistory?: ReviewHistoryEntry[];
  content?: string;
  collaborators?: string[];
  versionHistory?: VersionEntry[];
}
```

### ReviewHistoryEntry
```typescript
{
  id: string;
  reviewer: string;
  status: "Pending" | "Under Review" | "Approved" | "Rejected";
  comments: string;
  timestamp: string;
}
```

---

## 🎣 State Management

### useDocumentStore Hook
```typescript
const store = useDocumentStore();

// Properties
store.documents          // All documents
store.updates           // Notifications
store.activityLogs      // Audit trail
store.dismissedUpdates  // Dismissed items

// Methods
store.addDocument(doc)           // Add new document
store.updateDocument(id, data)   // Update document
store.deleteDocument(id)         // Delete document
store.reviewDocument(id, ...)    // Submit review
store.addLog(action, actor, ...)  // Log activity
store.dismissUpdate(id)          // Dismiss notification
store.undoDismissUpdate()        // Undo dismissal
```

### localStorage Schema
```json
{
  "skitech_docs": [...documents],
  "skitech_updates": [...notifications],
  "skitech_activity_logs": [...logs],
  "skitech_dismissed_updates": [...dismissed],
  "skitech_role": "Owner|Manager|Staff"
}
```

---

## 🔌 API Layer

### documentApi Mock Endpoints

**getDocuments(role)**
- Fetches all documents for role
- Falls back to localStorage
- Returns: DocumentWithExtra[]

**uploadDocument(formData, role, onProgress)**
- Simulates file upload
- Validates title, department, file size
- Supports role-based restrictions
- Returns: DocumentWithExtra

**createDocument(docData, role)**
- Creates platform document
- Validates permissions
- Prevents staff from publishing org-wide
- Returns: DocumentWithExtra

**reviewDocument(docId, reviewer, status, comment, role)**
- Submits document review
- Validates reviewer permissions
- Updates review history
- Returns: DocumentWithExtra

---

## 🎨 Component Props

### DocumentTable
```typescript
interface DocumentTableProps {
  documents?: DocumentWithExtra[];      // Override documents
  role?: string;                        // User role
  categoryFilter?: string;              // Filter by category
  statusFilter?: string;                // Filter by status
  myDocsOnly?: boolean;                 // Only user's docs
  sharedOnly?: boolean;                 // Only shared docs
}
```

### StatCard
```typescript
interface StatCardProps {
  icon: LucideIcon;                     // Icon component
  label: string;                        // Card label
  value: number;                        // Main value
  alert?: boolean;                      // Alert styling
  trend?: string;                       // Trend text
  trendUp?: boolean;                    // Trend direction
  onClick?: () => void;                 // Click handler
  loading?: boolean;                    // Loading state
}
```

---

## 🔄 Data Flow

```
User Action
    ↓
Component State Update
    ↓
documentApi.* (mock API call)
    ↓
useDocumentStore (update store)
    ↓
localStorage (persist data)
    ↓
Component Re-render
    ↓
Toast Notification
```

---

## 📝 Common Tasks

### Adding a New Filter

1. **Add state** in DocumentTable:
```typescript
const [filterCustom, setFilterCustom] = useState<string[]>([]);
```

2. **Add filter option** in JSX:
```typescript
if (filterCustom.length > 0) {
  processedDocs = processedDocs.filter(d => filterCustom.includes(d.customField));
}
```

3. **Add UI control**:
```typescript
<select multiple onChange={...}>
  {customOptions.map(opt => <option>{opt}</option>)}
</select>
```

### Adding a New Modal

1. **Create state**:
```typescript
const [showModal, setShowModal] = useState(false);
const [selectedItem, setSelectedItem] = useState(null);
```

2. **Create JSX**:
```typescript
<AnimatePresence>
  {showModal && (
    <motion.div className="fixed inset-0 z-50 ...">
      {/* Modal content */}
    </motion.div>
  )}
</AnimatePresence>
```

3. **Add trigger**:
```typescript
<button onClick={() => setShowModal(true)}>Open</button>
```

### Adding a New Role Restriction

1. **Check permission**:
```typescript
if (role === "Staff" && doc.visibility === "Organization Wide") {
  showToast("Access Denied");
  return;
}
```

2. **Hide UI element**:
```typescript
{role !== "Staff" && <button>Action</button>}
```

---

## 🧪 Testing Tips

### Test Data
Mock documents are generated in `useDocumentStore.ts` initialization:
```typescript
const currentDocs = dummyDocuments.map(doc => ({
  ...doc,
  uploadedBy: doc.owner,
  // ... extended properties
}));
```

### Testing Different Roles
Set role via localStorage:
```typescript
localStorage.setItem("skitech_role", "Manager");
window.location.reload();
```

### Testing Filters
Manually set filter state in browser DevTools:
```javascript
// In React DevTools
state.filterStatuses = ["Pending Approval"];
```

---

## 🚀 Performance Optimization

### Current Optimizations
- ✅ Pagination (limits rendered items)
- ✅ Memoized components (React.memo)
- ✅ Debounced search (300ms)
- ✅ Conditional rendering
- ✅ LazyLoaded modals

### Future Improvements
- [ ] Virtual scrolling for very long lists
- [ ] Image lazy loading
- [ ] Code splitting for modals
- [ ] Caching strategy
- [ ] Worker thread for filtering

---

## 🔐 Security Notes

### Current Implementation
- ✅ Client-side role checking
- ✅ Activity logging
- ✅ localStorage persistence
- ✅ Form validation

### Production Considerations
- [ ] Move to backend authentication
- [ ] Implement JWT tokens
- [ ] Server-side authorization
- [ ] Encryption for sensitive data
- [ ] Rate limiting
- [ ] Audit trail encryption

---

## 🐛 Debugging

### Enable Debug Logging
```typescript
// In useDocumentStore.ts
const DEBUG = true;

if (DEBUG) console.log("Action:", action);
```

### Check localStorage
```javascript
// Browser console
JSON.parse(localStorage.getItem("skitech_docs"))
JSON.parse(localStorage.getItem("skitech_activity_logs"))
```

### React DevTools
- Inspect component state
- Track re-renders
- Profile performance
- Inspect props flow

---

## 📚 Dependencies

### Core
- `react` - UI library
- `next` - Framework
- `typescript` - Type safety

### UI
- `framer-motion` - Animations
- `lucide-react` - Icons
- `tailwindcss` - Styling
- `@radix-ui/*` - Accessible components

### Utilities
- `class-variance-authority` - CSS utilities
- `clsx` - Classname utilities

---

## 🔄 Extending the System

### Add New Document Status
1. Update `DocumentStatus` type in `document-management.ts`
2. Add status color in `StatusBadge` component
3. Update mock data to include new status
4. Add filter option in DocumentTable

### Add New File Type
1. Update `FileType` type definition
2. Add icon case in `getFileIcon()` function
3. Add file extension handling in upload validation
4. Update MIME type handling

### Add New Role
1. Update `DocumentRole` type
2. Add permission checks in DocumentTable
3. Create new page routes
4. Update activity logging

---

## 📊 Monitoring & Metrics

### Key Metrics to Track
- Document upload rate
- Average review time
- Most accessed documents
- Most common filters
- User actions per session

### Activity Log Schema
```typescript
{
  id: string;
  action: "UPLOAD" | "REVIEW" | "DELETE" | "DOWNLOAD";
  actor: string;
  documentName: string;
  timestamp: string;
  details?: string;
}
```

---

## 🤝 Contributing

### Code Style
- Use TypeScript for all new code
- Follow React best practices
- Use component composition
- Add JSDoc comments
- Keep components focused

### Commit Messages
```
feat: Add new filter type
fix: Correct pagination display
docs: Update component documentation
refactor: Extract shared logic
test: Add unit tests
```

### Before Committing
- [ ] Type check passes
- [ ] No console errors
- [ ] Tested on mobile
- [ ] Updated documentation
- [ ] Added comments where needed

---

## 🔗 Related Documentation

- [Component Documentation](./README.md)
- [User Guide](./USER_GUIDE.md)
- [Backend API Spec](../../../backend/README.md)
- [SkiTech Design System](../../../DESIGN_SYSTEM.md)

---

## 📞 Support & Questions

For development questions:
1. Check existing code comments
2. Review type definitions
3. Search component props
4. Check git history for similar implementations
5. Consult team documentation

