import mongoose from 'mongoose';
import GatePass from '../models/GatePass.js';
import { parsePagination, buildPaginationMeta } from '../utils/pagination.js';

const LIST_FIELDS = 'gatePassNumber date visitorName companyName status createdAt';

const generateGatePassNumber = async () => {
  const currentYear = new Date().getFullYear();
  // Find the gate pass with the highest sequence number for this year
  const lastPass = await GatePass.findOne({
    gatePassNumber: { $regex: `^GP-${currentYear}-` },
  }).sort({ gatePassNumber: -1 });

  let nextSequenceNum = 1;
  if (lastPass) {
    const parts = lastPass.gatePassNumber.split('-');
    const lastSeq = parseInt(parts[2], 10);
    if (!isNaN(lastSeq)) {
      nextSequenceNum = lastSeq + 1;
    }
  }

  return `GP-${currentYear}-${String(nextSequenceNum).padStart(4, '0')}`;
};

export const createGatePass = async (req, res) => {
  try {
    const {
      date,
      unit,
      visitorName,
      idProofType,
      idNumber,
      mobileNumber,
      numberOfPersons,
      companyName,
      vehicleNumber,
      purpose,
      personToMeet,
      department,
      itemsCarrying,
      serialNumber,
      make,
      visitType,
    } = req.body;

    const visitorPhoto = req.file?.path || null;
    const gatePassNumber = await generateGatePassNumber();

    const gatePass = new GatePass({
      user: req.user._id,
      gatePassNumber,
      date,
      unit,
      visitorName,
      idProofType,
      idNumber,
      mobileNumber,
      numberOfPersons,
      companyName,
      vehicleNumber,
      purpose,
      personToMeet,
      department,
      itemsCarrying,
      serialNumber,
      make,
      visitType,
      visitorPhoto,
      status: 'Approved',
    });

    const createdPass = await gatePass.save();
    res.status(201).json(createdPass);
  } catch (error) {
    console.error('Error in createGatePass:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

export const getMyGatePassStats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const [result] = await GatePass.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          checkedIn: { $sum: { $cond: [{ $eq: ['$status', 'Checked In'] }, 1, 0] } },
          checkedOut: { $sum: { $cond: [{ $eq: ['$status', 'Checked Out'] }, 1, 0] } },
        },
      },
    ]);

    res.json({
      total: result?.total || 0,
      checkedIn: result?.checkedIn || 0,
      checkedOut: result?.checkedOut || 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyGatePasses = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter = { user: req.user._id };

    const [passes, total] = await Promise.all([
      GatePass.find(filter)
        .select(LIST_FIELDS)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      GatePass.countDocuments(filter),
    ]);

    res.json({
      passes,
      pagination: buildPaginationMeta(total, page, limit),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getGatePassById = async (req, res) => {
  try {
    const pass = await GatePass.findById(req.params.id).populate('user', 'name email');

    if (pass) {
      if (pass.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized' });
      }
      res.json(pass);
    } else {
      res.status(404).json({ message: 'Gate pass not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateGatePass = async (req, res) => {
  try {
    const pass = await GatePass.findById(req.params.id);

    if (pass) {
      if (pass.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      if (pass.status === 'Checked In' || pass.status === 'Checked Out') {
        return res.status(400).json({ message: 'Cannot edit checked-in/out passes' });
      }

      Object.assign(pass, req.body);
      if (req.file) {
        pass.visitorPhoto = req.file.path;
      }

      const updatedPass = await pass.save();
      res.json(updatedPass);
    } else {
      res.status(404).json({ message: 'Gate pass not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getGatePassForScan = async (req, res) => {
  try {
    const pass = await GatePass.findById(req.params.id).populate('user', 'name email');
    if (pass) {
      res.json(pass);
    } else {
      res.status(404).json({ message: 'Gate pass not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateGatePassScanStatus = async (req, res) => {
  try {
    const { action } = req.body;
    const pass = await GatePass.findById(req.params.id);

    if (!pass) {
      return res.status(404).json({ message: 'Gate pass not found' });
    }

    if (action === 'check-in') {
      pass.status = 'Checked In';
      pass.checkInTime = new Date();
    } else if (action === 'check-out') {
      pass.status = 'Checked Out';
      pass.outTime = new Date();
    } else {
      return res.status(400).json({ message: 'Invalid scan action' });
    }

    const updatedPass = await pass.save();
    res.json(updatedPass);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
