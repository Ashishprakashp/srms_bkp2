import DocumentTemplate from '../models/DocumentTemplate.js';
import { v4 as uuidv4 } from 'uuid';

export const createTemplate = async (req, res) => {
  try {
    const { name, description, fields, approvalFlow } = req.body;
    const templateId = `TEMP-${uuidv4().substring(0, 8)}`;
    
    const newTemplate = new DocumentTemplate({
      templateId,
      name,
      description,
      fields,
      approvalFlow
    });

    await newTemplate.save();
    res.status(201).json(newTemplate);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const getTemplates = async (req, res) => {
  try {
    const templates = await DocumentTemplate.find({ active: true });
    res.status(200).json(templates);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await DocumentTemplate.findOneAndUpdate(
      { templateId: id },
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(template);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const toggleTemplateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await DocumentTemplate.findOne({ templateId: id });
    template.active = !template.active;
    await template.save();
    res.status(200).json(template);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};