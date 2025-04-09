import StudentDocument from '../models/StudentDocument.js';
import StudentAcc from '../models/StudentAcc.js';
import Faculty from '../models/Faculty.js';
import Notification from '../models/Notification.js';
import { v4 as uuidv4 } from 'uuid';
import DocumentTemplate from '../models/DocumentTemplate.js';

export const createDocument = async (req, res) => {
  try {
    const { studentId, templateId } = req.body;
    const documentId = `DOC-${uuidv4().substring(0, 8)}`;
    
    const newDocument = new StudentDocument({
      documentId,
      templateId,
      studentId,
      data: {},
      status: 'draft'
    });

    await newDocument.save();
    res.status(201).json(newDocument);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, files } = req.body;
    
    const document = await StudentDocument.findOneAndUpdate(
      { documentId: id },
      { $set: { data, files } },
      { new: true }
    );
    
    res.status(200).json(document);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const submitDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await StudentDocument.findOne({ documentId: id });
    const template = await DocumentTemplate.findOne({ templateId: document.templateId });
    const student = await StudentAcc.findOne({ studentId: document.studentId });
    
    document.status = 'submitted';
    document.submittedAt = new Date();
    await document.save();
    
    // Create notifications
    if (template.approvalFlow.facultyAdvisor) {
      await Notification.create({
        notificationId: `NOTIF-${uuidv4().substring(0, 8)}`,
        recipientId: student.facultyAdvisor,
        recipientType: 'faculty',
        documentId: document.documentId,
        message: `New document submission from ${student.name} requires your approval`,
        actionRequired: true
      });
    }
    
    if (template.approvalFlow.hod) {
      const hod = await Faculty.findOne({ designation: 'Head Of Dept.' });
      if (hod) {
        await Notification.create({
          notificationId: `NOTIF-${uuidv4().substring(0, 8)}`,
          recipientId: hod.facultyId,
          recipientType: 'faculty',
          documentId: document.documentId,
          message: `New document submission requires HOD approval`,
          actionRequired: true
        });
      }
    }
    
    res.status(200).json(document);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getStudentDocuments = async (req, res) => {
  try {
    const { studentId } = req.params;
    const documents = await StudentDocument.find({ studentId });
    res.status(200).json(documents);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};