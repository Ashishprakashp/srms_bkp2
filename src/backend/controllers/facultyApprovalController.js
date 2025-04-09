import StudentDocument from '../models/StudentDocument.js';
import Notification from '../models/Notification.js';
import StudentAcc from '../models/StudentAcc.js';

export const getPendingApprovals = async (req, res) => {
  try {
    const { facultyId } = req.params;
    
    // Get faculty role (HOD or FA)
    const faculty = await Faculty.findOne({ facultyId });
    const isHod = faculty.designation === 'Head Of Dept.';
    
    let query = {};
    if (isHod) {
      query = { 
        status: { $in: ['submitted', 'fa_approved'] },
        'hodApproval.approved': false 
      };
    } else {
      query = { 
        status: 'submitted',
        'facultyAdvisorApproval.approved': false,
        studentId: { $in: await StudentAcc.find({ facultyAdvisor: facultyId }).distinct('studentId') }
      };
    }
    
    const documents = await StudentDocument.find(query)
      .populate('templateId', 'name description')
      .populate('studentId', 'name studentId');
    
    res.status(200).json(documents);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const approveDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { facultyId, comments } = req.body;
    
    const faculty = await Faculty.findOne({ facultyId });
    const isHod = faculty.designation === 'Head Of Dept.';
    const document = await StudentDocument.findOne({ documentId: id });
    
    if (isHod) {
      document.hodApproval = {
        approved: true,
        approvedBy: facultyId,
        approvedAt: new Date(),
        comments
      };
      document.status = 'hod_approved';
    } else {
      document.facultyAdvisorApproval = {
        approved: true,
        approvedBy: facultyId,
        approvedAt: new Date(),
        comments
      };
      document.status = 'fa_approved';
    }
    
    await document.save();
    
    // Check if all approvals are done
    const template = await DocumentTemplate.findOne({ templateId: document.templateId });
    if ((!template.approvalFlow.hod || document.hodApproval.approved) &&
        (!template.approvalFlow.facultyAdvisor || document.facultyAdvisorApproval.approved)) {
      document.status = 'completed';
      await document.save();
      
      // Notify student
      await Notification.create({
        notificationId: `NOTIF-${uuidv4().substring(0, 8)}`,
        recipientId: document.studentId,
        recipientType: 'student',
        documentId: document.documentId,
        message: `Your document has been fully approved`,
        actionRequired: false
      });
    }
    
    res.status(200).json(document);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const rejectDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { facultyId, comments } = req.body;
    
    const faculty = await Faculty.findOne({ facultyId });
    const isHod = faculty.designation === 'Head Of Dept.';
    const document = await StudentDocument.findOne({ documentId: id });
    
    if (isHod) {
      document.hodApproval = {
        approved: false,
        approvedBy: facultyId,
        approvedAt: new Date(),
        comments
      };
    } else {
      document.facultyAdvisorApproval = {
        approved: false,
        approvedBy: facultyId,
        approvedAt: new Date(),
        comments
      };
    }
    
    document.status = 'rejected';
    await document.save();
    
    // Notify student
    await Notification.create({
      notificationId: `NOTIF-${uuidv4().substring(0, 8)}`,
      recipientId: document.studentId,
      recipientType: 'student',
      documentId: document.documentId,
      message: `Your document has been ${isHod ? 'rejected by HOD' : 'returned by Faculty Advisor'}`,
      actionRequired: true
    });
    
    res.status(200).json(document);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};