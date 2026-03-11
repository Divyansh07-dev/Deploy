import uploadOnCloudinary from "../configs/cloudinary.js";
import Course from "../models/courseModel.js";
import Lecture from "../models/lectureModel.js";
import User from "../models/userModel.js";

/* ───────────────────────── COURSE ───────────────────────── */

// Create Course
export const createCourse = async (req, res) => {
  try {
    const { title, category } = req.body;

    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!title || !category) {
      return res.status(400).json({ message: "Title and category are required" });
    }

    const course = await Course.create({
      title,
      category,
      creator: req.userId,
      published: false,
    });

    return res.status(201).json(course);
  } catch (error) {
    console.error("createCourse error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Get all published courses (PUBLIC)
export const getPublishedCourses = async (req, res) => {
  try {
    const courses = await Course.find({ published: true })
      .populate("creator", "name email")
      .populate("lectures")        // ← populate lectures with full data
      .lean();

    return res.status(200).json(courses);
  } catch (error) {
    console.error("getPublishedCourses error:", error);
    return res.status(500).json({ message: error.message });
  }
};
// Get courses created by logged-in creator
export const getCreatorCourses = async (req, res) => {
  try {
    console.log("req.userId:", req.userId)
    const courses = await Course.find({ creator: req.userId })
    console.log("courses found:", courses.length)
    console.log("courses data:", JSON.stringify(courses)) // ✅ add this
    return res.status(200).json(courses);
  } catch (error) {
    console.error("getCreatorCourses error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Edit course (CREATOR ONLY)
export const editCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, subTitle, description, category, level, price, published } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.creator.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    let thumbnail;
    if (req.file) {
      thumbnail = await uploadOnCloudinary(req.file.path);
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (subTitle) updateData.subTitle = subTitle;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (level) updateData.level = level;
    if (price !== undefined) updateData.price = price;
    if (published !== undefined) updateData.published = published;
    if (thumbnail) updateData.thumbnail = thumbnail;

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      updateData,
      { new: true }
    );

    return res.status(200).json(updatedCourse);
  } catch (error) {
    console.error("editCourse error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Get single course by ID
export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId)
      .populate("lectures reviews")
      .lean();

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (!course.published && course.creator.toString() !== req.userId) {
      return res.status(403).json({ message: "Course not published yet" });
    }

    return res.status(200).json(course);
  } catch (error) {
    console.error("getCourseById error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Delete course (CREATOR ONLY)
export const removeCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.creator.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Lecture.deleteMany({ _id: { $in: course.lectures } });
    await course.deleteOne();

    return res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("removeCourse error:", error);
    return res.status(500).json({ message: error.message });
  }
};

/* ───────────────────────── LECTURE ───────────────────────── */

// Create lecture
export const createLecture = async (req, res) => {
  try {
    const { lectureTitle } = req.body;
    const { courseId } = req.params;

    if (!lectureTitle) {
      return res.status(400).json({ message: "Lecture title required" });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.creator.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const lecture = await Lecture.create({ lectureTitle });
    course.lectures.push(lecture._id);
    await course.save();

    return res.status(201).json(lecture);
  } catch (error) {
    console.error("createLecture error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Get all lectures of a course
export const getCourseLecture = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId)
      .populate("lectures")
      .lean();

    if (!course) return res.status(404).json({ message: "Course not found" });

    return res.status(200).json(course.lectures);
  } catch (error) {
    console.error("getCourseLecture error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Edit lecture
export const editLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { lectureTitle, isPreviewFree } = req.body;

    const course = await Course.findOne({ lectures: lectureId });
    if (!course || course.creator.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) return res.status(404).json({ message: "Lecture not found" });

    if (req.file) {
      lecture.videoUrl = await uploadOnCloudinary(req.file.path);
    }

    if (lectureTitle) lecture.lectureTitle = lectureTitle;
    if (isPreviewFree !== undefined) lecture.isPreviewFree = isPreviewFree;

    await lecture.save();
    return res.status(200).json(lecture);
  } catch (error) {
    console.error("editLecture error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Delete lecture
export const removeLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;

    const course = await Course.findOne({ lectures: lectureId });
    if (!course || course.creator.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Lecture.findByIdAndDelete(lectureId);
    await Course.updateOne(
      { _id: course._id },
      { $pull: { lectures: lectureId } }
    );

    return res.status(200).json({ message: "Lecture deleted successfully" });
  } catch (error) {
    console.error("removeLecture error:", error);
    return res.status(500).json({ message: error.message });
  }
};

/* ───────────────────────── USER ───────────────────────── */

// Get creator by ID
export const getCreatorById = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId).select("-password -__v");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json(user);
  } catch (error) {
    console.error("getCreatorById error:", error);
    return res.status(500).json({ message: error.message });
  }
};