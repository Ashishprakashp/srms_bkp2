import express from 'express';
import {
  createTemplate,
  getTemplates,
  updateTemplate,
  toggleTemplateStatus
} from '../controllers/documentTemplateController.js';
import {
  createDocument,
  updateDocument,
  submitDocument,
  getStudentDocuments
} from '../controllers/studentDocumentController.js';
import {
  getPendingApprovals,
  approveDocument,
  rejectDocument
} from '../controllers/facultyApprovalController.js';

const router = express.Router();

// Admin routes
router.post('/templates', createTemplate);
router.get('/templates', getTemplates);
router.put('/templates/:id', updateTemplate);
router.put('/templates/:id/status', toggleTemplateStatus);

// Student routes
router.post('/students/documents', createDocument);
router.put('/students/documents/:id', updateDocument);
router.post('/students/documents/:id/submit', submitDocument);
router.get('/students/:studentId/documents', getStudentDocuments);

// Faculty routes
router.get('/faculty/:facultyId/pending-approvals', getPendingApprovals);
router.post('/faculty/approvals/:id/approve', approveDocument);
router.post('/faculty/approvals/:id/reject', rejectDocument);

export default router;
