// Purpose: Item route definitions
const express = require('express');
const router = express.Router();
const {
  listItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  markAsSold,
  markAsAvailable,
} = require('../controllers/itemController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, listItems);
router.post('/', verifyToken, createItem);
router.put('/:id', verifyToken, updateItem);
router.delete('/:id', verifyToken, deleteItem);
router.patch('/:id/mark-sold', verifyToken, markAsSold);
router.patch('/:id/mark-available', verifyToken, markAsAvailable);
router.get('/:id', getItem);

module.exports = router;
