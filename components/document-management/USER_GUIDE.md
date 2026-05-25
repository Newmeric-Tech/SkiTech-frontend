# Document Management System - User Guide

## 🎯 Quick Start

The Document Management System helps you organize, share, and manage documents across your organization. Here's how to get started.

---

## 📋 Main Features

### Dashboard Overview
**Access**: Click "Document Management" in your navigation menu

The dashboard shows:
- **Quick Stats Cards** (6 cards at top)
  - Total documents in system
  - Pending reviews waiting for your action
  - Approved/active documents
  - Rejected documents
  - Recent uploads
  - Shared files

- **Quick Access Workspace** (main area)
  - Recently added documents
  - Operation audit trail/activity log
  - Real-time system activity

### Click any stat card to filter results and jump to that category!

---

## 📤 Uploading Documents

### Step 1: Click "Upload File" Button
Located in the top-right corner of the Document Management page.

### Step 2: Upload Your File
**Option A - Drag & Drop**:
- Drag a file from your computer onto the dashed box

**Option B - Click to Browse**:
- Click the upload box
- Select file from your computer

### Step 3: Fill in Details
- **Title** (required): Name your document
- **Category**: Choose department (Finance, HR, Engineering, etc.)
- **Description**: Brief overview of contents
- **Access Level**: Who can see it?
  - Private: Only you
  - Team Only: Your immediate team
  - Department: Your entire department
  - Organization Wide: Everyone
- **Reviewer**: Who should approve this?
- **Tags**: Add searchable keywords (comma-separated)

### Step 4: Submit
Click **"Commit Secure Upload"** to complete.

✅ You'll see a success notification when done.

---

## 📄 Creating Documents

### Step 1: Click "Create Document" Button
Located in the top-right corner.

### Step 2: Choose a Template
- **Blank**: Start fresh
- **SOP**: Standard Operating Procedure template
- **Brief**: Technical specification template

### Step 3: Write Your Content
- Add a title
- Write description
- Enter your content in the editor
- Add tags for organization
- Add collaborators (optional)
- Add attachments (optional)

### Step 4: Save or Publish
- **Save as Draft**: Creates a draft you can edit later
- **Publish**: Makes it available to others based on access level

💡 Your work auto-saves every 15 seconds!

---

## 🔍 Finding Documents

### Search
Type in the search box to find by:
- Document name
- Description content
- Uploader name

### Filters
Click **"Filter"** button to narrow down by:
- File type (PDF, DOCX, XLSX, PNG, JPG)
- Department
- Status (Active, Draft, Pending, etc.)
- Access level

### Sorting
Click the sort dropdown to arrange by:
- Newest first
- Oldest first
- Alphabetical (A-Z)
- Alphabetical (Z-A)
- File size

### Reset Filters
Click **"Reset Filters"** to clear all filters and see all documents again.

---

## 👁️ Viewing Documents

### View Details
1. Find document in table
2. Click anywhere on the row (except buttons)
3. Modal opens showing:
   - Full metadata
   - Complete description
   - Tags and categories
   - File details
   - Review history
   - Version history

### Preview File
1. Click the eye icon or "View" button
2. Fullscreen preview opens with:
   - File display area
   - Zoom controls (for images)
   - Download button
   - File information sidebar

### Download File
1. Click the download icon in preview modal
2. File downloads to your computer

---

## ✅ Approving Documents

### For Managers & Reviewers

When documents are pending your review:

1. **Notification Alert**: You'll see a priority alert on the dashboard
2. **Click "Review"** in the actions menu
3. **Review Modal Opens** with:
   - Document details
   - Comment textarea
   - Approve/Reject buttons
   - Review history

4. **Add Comment** (optional but recommended):
   - Explain your decision
   - Point out issues
   - Suggest changes

5. **Click "Approve"** or **"Reject"**:
   - Approved → Document becomes active
   - Rejected → Document returns to author with your comment

---

## 📱 My Documents

### Access Your Documents
Click **"My Documents"** tab at top of page

Shows:
- Only documents you uploaded or created
- Quick stats for your vault
- Pinned important documents
- All your documents in table view

---

## 🔔 Updates & Notifications

### Access Updates
Click **"All Updates"** tab at top of page

See:
- Critical alerts requiring action
- System notifications
- Document review status changes
- Activity stream

### Dismiss Notifications
1. Click "Dismiss" on any notification
2. Notification disappears
3. An "Undo" snackbar appears at bottom for 5 seconds
4. Click "Undo" to restore it if needed

All dismissals are logged in the audit trail.

---

## 📊 Pagination

When viewing large document lists:

- **Previous/Next**: Navigate between pages
- **Page Numbers**: Jump to specific page
- **Items Per Page**: Choose 10, 25, or 50 items per page

---

## 🔒 Access Control

Your permissions depend on your role:

| Action | Owner | Manager | Staff |
|--------|-------|---------|-------|
| View all documents | ✅ | ✅ | ✅ |
| Upload documents | ✅ | ✅ | ✅ |
| Create documents | ✅ | ✅ | ✅ |
| Review documents | ✅ | ✅ | ❌* |
| Share organization-wide | ✅ | ✅ | ❌ |
| Delete documents | ✅ | ✅ | ❌* |
| Edit others' documents | ✅ | ❌* | ❌ |

*Can manage own documents only

---

## 📋 Document Status Meanings

- **Draft**: Not yet published, only you can see
- **Pending Approval**: Waiting for reviewer feedback
- **Active**: Published and available
- **Secure**: Approved and archived
- **Processing**: Upload/processing in progress
- **Urgent**: Requires immediate attention
- **Archived**: Older documents kept for reference
- **Rejected**: Sent back for revisions

---

## 💡 Tips & Tricks

### Organization
- Use **tags** to categorize documents
- **Pin** important documents to quick access
- Use **departments** to organize by team
- Set appropriate **access levels**

### Collaboration
- Add **collaborators** when creating documents
- Use **comments** during review process
- Check **activity log** to see who modified what
- Reference **version history** if needed

### Efficiency
- Use **templates** when creating similar documents
- Save as **draft** to finish later
- Leverage **filters** for quick searches
- Batch process using **pagination**

---

## ❓ Common Questions

### Q: Can I edit a document after uploading?
**A**: If you're the owner or have edit permissions, find the document and click the edit icon. Changes create a new version.

### Q: What file types are supported?
**A**: PDF, DOCX (Word), XLSX (Excel), PNG, and JPG image files.

### Q: Is there a file size limit?
**A**: Yes, maximum 50MB per file.

### Q: How long are documents stored?
**A**: Documents persist in local storage for this demo. In production, check with your administrator.

### Q: Can I share a document with specific people?
**A**: Set the access level to Team Only or Department. You can't share with individual users currently.

### Q: Who can delete documents?
**A**: Only Owners and the document owner/uploader can delete documents.

---

## 🆘 Troubleshooting

### Documents Not Showing?
- Clear browser cache (Ctrl+Shift+Delete)
- Check filters aren't hiding them
- Try searching by name
- Reload the page

### Upload Failed?
- Check file size (under 50MB)
- Check file format (PDF, DOCX, XLSX, PNG, JPG)
- Check internet connection
- Try a different file

### Can't Edit Document?
- Check you're the owner
- Check your role has edit permissions
- Document may be archived or locked

### Notifications Not Appearing?
- Check you're not filtering them out
- Ensure notifications aren't muted
- Check "All Updates" tab

---

## 📞 Need Help?

For additional support:
1. Check this guide for your question
2. Review the tooltip help (? icons)
3. Contact your document administrator
4. Check the activity log for what changed

---

## 🎓 Document Management Best Practices

### Naming
✅ Good: "Q4_Financial_Report_2024"
❌ Avoid: "report" or "final_FINAL_v3"

### Descriptions
✅ Good: "Quarterly financial summary including revenue, expenses, and forecasts"
❌ Avoid: "stuff" or leaving blank

### Access Levels
✅ Use "Private" for personal drafts
✅ Use "Team Only" for team discussions
✅ Use "Department" for departmental policies
✅ Use "Organization Wide" for company-wide standards

### Tags
✅ Use: "finance, q4, report, 2024"
✅ Consistent naming for better searching

### Reviews
✅ Always add reviewer comments
✅ Be specific about issues
✅ Suggest solutions
✅ Document rationale for rejections

---

Happy document managing! 📚✨

