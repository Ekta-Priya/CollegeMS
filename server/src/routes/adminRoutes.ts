import { Router } from 'express';
import {
  getSystemStats,
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getHodAccounts,
  createHodAccount,
  updateHodAccount,
  deleteHodAccount,
} from '../controllers/adminController';
import { authorizeRoles, protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect, authorizeRoles('admin'));

router.get('/stats', getSystemStats);
router.get('/departments', getAllDepartments);
router.post('/departments', createDepartment);
router.put('/departments/:id', updateDepartment);
router.delete('/departments/:id', deleteDepartment);

router.get('/hods', getHodAccounts);
router.post('/hods', createHodAccount);
router.put('/hods/:id', updateHodAccount);
router.delete('/hods/:id', deleteHodAccount);

export default router;
