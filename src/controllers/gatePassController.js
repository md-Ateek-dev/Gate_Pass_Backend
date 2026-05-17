import GatePass from '../models/GatePass.js';
import QRCode from 'qrcode';

const generateGatePassNumber = async () => {
  const currentYear = new Date().getFullYear();
  const count = await GatePass.countDocuments({
    gatePassNumber: { $regex: `^GP-${currentYear}` },
  });
  return `GP-${currentYear}-${String(count + 1).padStart(4, '0')}`;
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

    const visitorPhoto = req.file ? req.file.path : null;
    const gatePassNumber = await generateGatePassNumber();

    const qrData = JSON.stringify({
      gatePassNumber,
      visitorName,
      mobileNumber,
      companyName,
    });
    const qrCode = await QRCode.toDataURL(qrData);

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
      qrCode,
    });

    const createdPass = await gatePass.save();
    res.status(201).json(createdPass);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

export const getMyGatePasses = async (req, res) => {
  try {
    const passes = await GatePass.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(passes);
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

      if (pass.status !== 'Pending') {
        return res.status(400).json({ message: 'Can only edit pending passes' });
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
