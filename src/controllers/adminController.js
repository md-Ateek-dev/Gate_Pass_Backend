import GatePass from '../models/GatePass.js';
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

export const getDashboardStats = async (req, res) => {
  try {
    const totalVisitors = await GatePass.countDocuments();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayVisitors = await GatePass.countDocuments({ date: { $gte: today } });
    
    const pendingRequests = await GatePass.countDocuments({ status: 'Pending' });
    const approvedPasses = await GatePass.countDocuments({ status: 'Approved' });
    const rejectedPasses = await GatePass.countDocuments({ status: 'Rejected' });

    res.json({
      totalVisitors,
      todayVisitors,
      pendingRequests,
      approvedPasses,
      rejectedPasses,
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
      { header: 'Visitor Name', key: 'visitorName', width: 20 },
      { header: 'Mobile', key: 'mobileNumber', width: 15 },
      { header: 'Company', key: 'companyName', width: 20 },
      { header: 'Purpose', key: 'purpose', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
    ];

    passes.forEach((pass) => {
      worksheet.addRow({
        gatePassNumber: pass.gatePassNumber,
        date: new Date(pass.date).toLocaleString(),
        unit: pass.unit,
        visitorName: pass.visitorName,
        mobileNumber: pass.mobileNumber,
        companyName: pass.companyName,
        purpose: pass.purpose,
        status: pass.status,
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
