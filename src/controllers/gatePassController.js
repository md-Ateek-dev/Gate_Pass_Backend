import GatePass from '../models/GatePass.js';

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

    const visitorPhoto = req.file ? req.file.path : null;
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
    });

    const createdPass = await gatePass.save();
    res.status(201).json(createdPass);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

export const getMyGatePasses = async (req, res) => {
  try {
    const passes = await GatePass.find({ user: req.user._id }).populate('user', 'name email').sort({ createdAt: -1 });
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
