//imports tag service
import * as tagService from "../services/tagService.js";

//gets tag array
export const getAllTags = async (req, res) => {
  try {
    const queryResult = await tagService.getAllTags();
    res.json(queryResult);
  }catch (err) {
    res.status(500).json({ error: "Error fetching tags." });
  }
};

//create a new tag
export const postTag = async (req, res) => {
  const name = req.body.name;

  if (!name || name.trim().length < 3) {
    return res.status(400).json({
      error: "Invalid name. Names must be longer than 3 characters. ",
    });
  }
  try {
    const newTag = await tagService.postTag(req.body);
    res.status(201).json(newTag);
  } catch (err) {
    return res.status(500).json({ error: "Error creating tag." });
  }
};

//deletes a tag
export const deleteTags = async (req, res) => {
  try {
    const result = await tagService.deleteTag(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Tag not found" });
    }
    res.status(200).json({ message: "Tag deleted" });
  } catch (err) {
    return res.status(500).json({ error: "Error deleting tag." });
  }
};
