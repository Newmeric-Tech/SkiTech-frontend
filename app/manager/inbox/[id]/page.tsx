import { redirect } from "next/navigation";

/**
 * Inbox items have no detail view: each one links straight to the page of
 * its record (see resolveInboxLink), and the API has no single-item read.
 * Old links to /manager/inbox/<id> land on the list instead.
 */
export default function ManagerInboxItemPage() {
  redirect("/manager/inbox");
}
