import GatePass from '../models/GatePass.js';
import User from '../models/User.js';
import ExcelJS from 'exceljs';

export const getAllGatePasses = async (req, res) => {
  try {
    const passes = await GatePass.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    res.json(passes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateGatePassStatus = async (req, res) => {
  try {
    const { status, outTime } = req.body;
    const pass = await GatePass.findById(req.params.id);

    if (pass) {
      pass.status = status || pass.status;
      if (outTime) {
        pass.outTime = outTime;
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

export const deleteGatePass = async (req, res) => {
  try {
    const pass = await GatePass.findById(req.params.id);

    if (pass) {
      await pass.deleteOne();
      res.json({ message: 'Gate pass removed' });
    } else {
      res.status(404).json({ message: 'Gate pass not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteGatePassesBulk = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Select at least one gate pass to delete' });
    }

    const result = await GatePass.deleteMany({ _id: { $in: ids } });
    res.json({
      message: `${result.deletedCount} gate pass(es) deleted`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const totalVisitors = await GatePass.countDocuments();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayVisitors = await GatePass.countDocuments({ date: { $gte: today } });
    
    const insideVisitors = await GatePass.countDocuments({ status: 'Checked In' });
    const completedVisits = await GatePass.countDocuments({ status: 'Checked Out' });
    const pendingRequests = await GatePass.countDocuments({ status: 'Pending' });

    res.json({
      totalVisitors,
      todayVisitors,
      insideVisitors,
      completedVisits,
      pendingRequests,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const exportToExcel = async (req, res) => {
  try {
    const passes = await GatePass.find({}).populate('user', 'name email').sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Gate Passes');

    worksheet.columns = [
      { header: 'GP Number', key: 'gatePassNumber', width: 15 },
      { header: 'Date', key: 'date', width: 20 },
      { header: 'Unit', key: 'unit', width: 15 },
      { header: 'Visit Type', key: 'visitType', width: 15 },
      { header: 'Visitor Name', key: 'visitorName', width: 20 },
      { header: 'Mobile', key: 'mobileNumber', width: 15 },
      { header: 'ID Proof Type', key: 'idProofType', width: 15 },
      { header: 'ID Number', key: 'idNumber', width: 20 },
      { header: 'Persons', key: 'numberOfPersons', width: 10 },
      { header: 'Company', key: 'companyName', width: 20 },
      { header: 'Purpose', key: 'purpose', width: 20 },
      { header: 'Person to Meet', key: 'personToMeet', width: 20 },
      { header: 'Department', key: 'department', width: 15 },
      { header: 'Vehicle Number', key: 'vehicleNumber', width: 15 },
      { header: 'Items Carrying', key: 'itemsCarrying', width: 20 },
      { header: 'Serial Number', key: 'serialNumber', width: 15 },
      { header: 'Make', key: 'make', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'In Status', key: 'inStatus', width: 18 },
      { header: 'In Time', key: 'checkInTime', width: 20 },
      { header: 'Out Status', key: 'outStatus', width: 18 },
      { header: 'Out Time', key: 'outTime', width: 20 },
      { header: 'Requestor Name', key: 'requestor', width: 20 },
      { header: 'Created At', key: 'createdAt', width: 20 },
    ];

    passes.forEach((pass) => {
      const hasIn = Boolean(pass.checkInTime);
      const hasOut = Boolean(pass.outTime);

      worksheet.addRow({
        gatePassNumber: pass.gatePassNumber,
        date: new Date(pass.date).toLocaleString(),
        unit: pass.unit,
        visitType: pass.visitType,
        visitorName: pass.visitorName,
        mobileNumber: pass.mobileNumber,
        idProofType: pass.idProofType,
        idNumber: pass.idNumber,
        numberOfPersons: pass.numberOfPersons,
        companyName: pass.companyName,
        purpose: pass.purpose,
        personToMeet: pass.personToMeet,
        department: pass.department,
        vehicleNumber: pass.vehicleNumber || 'N/A',
        itemsCarrying: pass.itemsCarrying || 'N/A',
        serialNumber: pass.serialNumber || 'N/A',
        make: pass.make || 'N/A',
        status: pass.status,
        inStatus: hasIn ? 'Checked In' : 'Not Checked In',
        checkInTime: hasIn ? new Date(pass.checkInTime).toLocaleString() : 'N/A',
        outStatus: hasOut ? 'Checked Out' : hasIn ? 'Inside (Not Out Yet)' : 'Not Checked Out',
        outTime: hasOut ? new Date(pass.outTime).toLocaleString() : 'N/A',
        requestor: pass.user ? pass.user.name : 'Unknown',
        createdAt: new Date(pass.createdAt).toLocaleString(),
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + 'gatepasses.xlsx'
    );

    await workbook.xlsx.write(res);
    res.status(200).end();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.email === 'admin@gatepass.com') {
      return res.status(400).json({ message: 'Cannot delete the default admin user' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }

    await user.deleteOne();
    res.json({ message: 'User removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
