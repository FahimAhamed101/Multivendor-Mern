import { Router } from "express";
import { AdminRequestController } from "./admin-request.controller";
import { guardRole } from "../../../middlewares/roleGuard";

const router = Router();

const ROLES = ["admin", "manager", "support"] as const;

// ─── List Endpoint (vendor + driver combined) ─────────────────────────────────

// GET all requests
//   ?type=vendor  → vendors only (details, no documents)
//   ?type=driver  → drivers only (details + all submitted documents required)
//   (no type)     → both vendors and drivers in one list
router.get(
  "/",
  guardRole([...ROLES]),
  AdminRequestController.getAllRequests
);

// ─── Single Request Detail ────────────────────────────────────────────────────

// GET single vendor or driver request details
// → Vendor: account details only
// → Driver: account details + full document record
router.get(
  "/:id",
  guardRole([...ROLES]),
  AdminRequestController.getRequestDetails
);

// ─── Approve / Decline (shared for vendor & driver) ──────────────────────────

// PATCH approve — auto-detects whether vendor or driver
router.patch(
  "/:id/approve",
  guardRole([...ROLES]),
  AdminRequestController.approveRequest
);

// PATCH decline — body: { reason: string } — auto-detects whether vendor or driver
router.patch(
  "/:id/decline",
  guardRole([...ROLES]),
  AdminRequestController.declineRequest
);

export const AdminRequestRoutes = router;
