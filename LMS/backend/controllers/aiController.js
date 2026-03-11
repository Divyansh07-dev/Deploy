import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import Course from "../models/courseModel.js";
dotenv.config();

export const searchWithAi = async (req, res) => {
  try {
    const { input } = req.body;

    if (!input) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); // ✅ add API key

    const prompt = `You are an intelligent assistant for an LMS platform. A user will type any query about what they want to learn. Your task is to understand the intent and return one **most relevant keyword** from the following list of course categories and levels:

- App Development  
- AI/ML  
- AI Tools  
- Data Science  
- Data Analytics  
- Ethical Hacking  
- UI UX Designing  
- Web Development  
- Others  
- Beginner  
- Intermediate  
- Advanced  

Only reply with one single keyword from the list above that best matches the query. Do not explain anything. No extra text.

Query: ${input}`

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const keyword = response.text.trim() // ✅ fixed

    // First try with original input
    let courses = await Course.find({
      published: true, // ✅ fixed from isPublished
      $or: [
        { title: { $regex: input, $options: 'i' } },
        { subTitle: { $regex: input, $options: 'i' } },
        { description: { $regex: input, $options: 'i' } },
        { category: { $regex: input, $options: 'i' } },
        { level: { $regex: input, $options: 'i' } }
      ]
    });

    // If no results, try with AI keyword
    if (courses.length === 0) {
      courses = await Course.find({
        published: true, // ✅ fixed
        $or: [
          { title: { $regex: keyword, $options: 'i' } },
          { subTitle: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } },
          { category: { $regex: keyword, $options: 'i' } },
          { level: { $regex: keyword, $options: 'i' } }
        ]
      });
    }

    return res.status(200).json(courses);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "AI search error" }); // ✅ added
  }
}