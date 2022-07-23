import { getRentals } from '../controllers/rentalsController.js';
import { Router } from 'express';

const router = Router();

router.get('/rentals', getRentals);
//router.get('/customers/:id', getCustomerById);
//router.post('/customers', insertCustomer);
//router.put('/customers/:id', updateCustomer);

export default router;
