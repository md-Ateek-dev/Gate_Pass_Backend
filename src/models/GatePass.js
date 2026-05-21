import mongoose from 'mongoose';

const gatePassSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    gatePassNumber: {
      type: String,
      required: true,
      unique: true,
    },
    date: {
      type: Date,
      required: true,
    },
    unit: {
      type: String,
      required: true,
      enum: ['Sugar', 'Distillery'],
    },
    visitorName: {
      type: String,
      required: true,
    },
    idProofType: {
      type: String,
      required: true,
      enum: ['Aadhaar', 'PAN', 'Company ID'],
    },
    idNumber: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
    },
    numberOfPersons: {
      type: Number,
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    vehicleNumber: {
      type: String,
    },
    purpose: {
      type: String,
      required: true,
      enum: ['Meeting', 'Interview', 'Govt Officials', 'Contractors', 'Quotation Submission'],
    },
    personToMeet: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    itemsCarrying: {
      type: String,
    },
    serialNumber: {
      type: String,
    },
    make: {
      type: String,
    },
    visitType: {
      type: String,
      required: true,
      enum: ['Official', 'Non-Official'],
    },
    visitorPhoto: {
      type: String,
    },
    checkInTime: {
      type: Date,
    },
    outTime: {
      type: Date,
    },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Approved', 'Rejected', 'Checked In', 'Checked Out'],
      default: 'Approved',
    },
  },
  { timestamps: true }
);

const GatePass = mongoose.model('GatePass', gatePassSchema);
export default GatePass;
