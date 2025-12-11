---
name: Impersonate Specific User Feature
overview: ""
todos: []
---

# Prevent Deletion of Completed Orders and All Fees

This plan addresses the requirement to preserve data integrity by preventing the deletion of group orders once completed and disabling the deletion of all fee records.

## Backend Changes

### `backend/cramschool/api_views.py`

1.  **`OrderViewSet.destroy`**:

    -   Add a check before performing deletion.
    -   If `instance.group_order.status == 'Completed'`, raise a `PermissionDenied` or return `403 Forbidden`.
    -   Message: "無法刪除已完成團購的訂單 (Cannot delete order from a completed group order)".

2.  **`ExtraFeeViewSet.destroy`**:

    -   Override `destroy` to prevent deletion of *any* fee record.
    -   Return `403 Forbidden`.
    -   Message: "費用記錄無法刪除，請修改狀態或備註 (Fee records cannot be deleted. Please update status or notes instead)".

## Frontend Changes

### `frontend/src/views/StudentFeeTracker.vue`

1.  **Remove Delete UI**:

    -   Remove the "刪除" button from the fees table.
    -   Remove the `deleteFee` function.

2.  **UX Improvement**:

    -   Ensure the "編輯" (Edit) button remains accessible for correcting mistakes (changing amount, status to 'Paid', or adding notes).