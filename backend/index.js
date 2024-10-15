import dotenv from "dotenv"
import mongoose from "mongoose"
import bcrypt from "bcrypt"
import express from "express"
import cors from "cors"
import jwt from "jsonwebtoken"
import upload from "./multer.js"
import fs from "fs"
import path from "path"
// import helmet from "helmet"

import { authenticateToken } from "./utilities.js"

import User from "./models/user.model.js"
import JournalEntry from "./models/journalEntry.model.js"

dotenv.config()
mongoose.connect(process.env.MONGO_URI)

const app = express()
app.use(express.json())
app.use(cors({ origin: "*" }))
// app.use(helmet())

// Create Account
app.post("/create-account", async (req, res) => {
  const { fullName, email, password } = req.body

  if (!fullName || !email || !password) {
    return res
      .status(400)
      .json({ error: true, message: "All fields are required" })
  }

  const isUser = await User.findOne({ email })
  if (isUser) {
    return res.status(400).json({ error: true, message: "User already exists" })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = new User({
    fullName,
    email,
    password: hashedPassword,
  })

  await user.save()

  const accessToken = jwt.sign(
    { userId: user.id },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "72h",
    }
  )

  return res.status(201).json({
    error: false,
    user: { fullName: user.fullName, email: user.email },
    accessToken,
    message: "Registration Successful",
  })
})

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: "Email and Password are required" })
  }

  const user = await User.findOne({ email })
  if (!user) {
    return res.status(400).json({ message: "User not found" })
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid Credentials" })
  }

  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "72h",
    }
  )

  return res.json({
    error: false,
    message: "Login Successful",
    user: { fullName: user.fullName, email: user.email },
    accessToken,
  })
})

// Get User
app.get("/get-user", authenticateToken, async (req, res) => {
  const { userId } = req.user

  const isUser = await User.findOne({ _id: userId })

  if (!isUser) {
    return res.sendStatus(401)
  }

  return res.json({
    user: isUser,
    message: "",
  })
})

// Route to handle image upload
app.post("/image-upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      const placeholderImgUrl = `https://journal-backend-9rv9.onrender.com/assets/placeholder.png`
      const imageUrl = placeholderImgUrl
      return res.status(200).json({ imageUrl })
    }

    const imageUrl = `https://journal-backend-9rv9.onrender.com/uploads/${req.file.filename}`

    res.status(200).json({ imageUrl })
  } catch (error) {
    res.status(500).json({ error: true, message: error.message })
  }
})

// Delete an image from uploads folder
app.delete("/delete-image", async (req, res) => {
  let { imageUrl } = req.query

  if (!imageUrl) {
    return res
      .status(400)
      .json({ error: true, message: "imageUrl parameter is required" })
  }

  try {
    // Extract the filename from the imageUrl
    const filename = path.basename(imageUrl)

    // Define the file path
    const filePath = path.join(process.cwd(), "uploads", filename)

    // Check if the file exists
    if (fs.existsSync(filePath)) {
      // Delete the file from the uploads folder
      fs.unlinkSync(filePath)
      res.status(200).json({ message: "Image deleted successfully" })
    } else {
      res.status(200).json({ error: true, message: "Image not found" })
    }
  } catch (error) {
    res.status(500).json({ error: true, message: error.message })
  }
})

// Serve static files from the uploads and assets directory
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")))
app.use("/assets", express.static(path.join(process.cwd(), "assets")))

// Add Journal Entry
app.post("/add-journal-entry", authenticateToken, async (req, res) => {
  const { title, notes, tag, imageUrl, journalDate } = req.body
  const { userId } = req.user

  // Validate required fields
  if (!title || !notes || !tag) {
    return res
      .status(400)
      .json({ error: true, message: "All fields are required" })
  }

  // Convert journalDate from milliseconds to Date object
  const parsedJournalDate = new Date(parseInt(journalDate))

  try {
    const journalEntry = new JournalEntry({
      title,
      notes,
      tag,
      userId,
      imageUrl:
        imageUrl ||
        "https://journal-backend-9rv9.onrender.com/assets/placeholder.png",
      journalDate: parsedJournalDate,
    })

    await journalEntry.save()
    res.status(201).json({ entry: journalEntry, message: "Added Successfully" })
  } catch (error) {
    res.status(400).json({ error: true, message: error.message })
  }
})

// Get All Journal Entries
app.get("/get-all-entries", authenticateToken, async (req, res) => {
  const { userId } = req.user
  try {
    const journalEntries = await JournalEntry.find({ userId: userId }).sort({
      isFavourite: -1,
    })
    res.status(200).json({ entries: journalEntries })
  } catch (error) {
    res.status(500).json({ error: true, message: error.message })
  }
})

// Edit Journal Entry
app.put("/edit-entry/:id", authenticateToken, async (req, res) => {
  const { id } = req.params
  const { title, notes, tag, imageUrl, journalDate } = req.body
  const { userId } = req.user

  // Validate required fields
  if (!title || !notes || !tag || !journalDate) {
    return res
      .status(400)
      .json({ error: true, message: "All fields are required" })
  }

  // Convert journalDate from milliseconds to Date object
  const parsedJournalDate = new Date(parseInt(journalDate))

  try {
    // Find the journal entry by ID and ensure it belongs to the authenticated user
    const journalEntry = await JournalEntry.findOne({ _id: id, userId: userId })

    if (!journalEntry) {
      return res
        .status(400)
        .json({ error: true, message: "Journal entry not found" })
    }

    const placeholderImgUrl = `https://journal-backend-9rv9.onrender.com/assets/placeholder.png`

    journalEntry.title = title
    journalEntry.notes = notes
    journalEntry.tag = tag
    journalEntry.imageUrl = imageUrl || placeholderImgUrl
    journalEntry.journalDate = parsedJournalDate

    await journalEntry.save()
    res.status(200).json({ entry: journalEntry, message: "Update Successful" })
  } catch (error) {
    res.status(500).json({ error: true, message: error.message })
  }
})

// Delete a Journal Entry
app.delete("/delete-entry/:id", authenticateToken, async (req, res) => {
  const { id } = req.params
  const { userId } = req.user

  try {
    // Find the journal entry by ID and ensure it belongs to the authenticated user
    const journalEntry = await JournalEntry.findOne({ _id: id, userId: userId })

    if (!journalEntry) {
      return res
        .status(400)
        .json({ error: true, message: "Journal entry not found" })
    }

    // Delete the journal entry from the database
    await journalEntry.deleteOne({ _id: id, userId: userId })

    // Extract the filename from the imageUrl
    const imageUrl = journalEntry.imageUrl
    const filename = path.basename(imageUrl)

    // Define the file path
    const filePath = path.join(process.cwd(), "uploads", filename)

    // Delete the image file from the uploads folder
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Failed to delete image file", err)
      }
    })

    res.status(200).json({ message: "Journal entry deleted successfully" })
  } catch (error) {
    res.status(500).json({ error: true, message: error.message })
  }
})

// Update isFavourite
app.put("/update-is-favourite/:id", authenticateToken, async (req, res) => {
  const { id } = req.params
  const { isFavourite } = req.body
  const { userId } = req.user

  try {
    const journalEntry = await JournalEntry.findOne({ _id: id, userId: userId })

    if (!journalEntry) {
      return res
        .status(400)
        .json({ error: true, message: "Journal entry not found" })
    }

    journalEntry.isFavourite = isFavourite

    await journalEntry.save()
    res.status(200).json({ entry: journalEntry, message: "Update Successful" })
  } catch (error) {
    res.status(500).json({ error: true, message: error.message })
  }
})

// Search journal entries
app.get("/search", authenticateToken, async (req, res) => {
  const { query } = req.query
  const { userId } = req.user

  if (!query) {
    return res.status(400).json({ error: true, message: "Query is required" })
  }

  try {
    const searchResults = await JournalEntry.find({
      userId: userId,
      $or: [
        { title: { $regex: query, $options: "i" } },
        { notes: { $regex: query, $options: "i" } },
        { tag: { $regex: query, $options: "i" } },
      ],
    }).sort({ isFavourite: -1 })

    res.status(200).json({ stories: searchResults })
  } catch (error) {
    res.status(500).json({ error: true, message: error.message })
  }
})

// Filter journal entries by date range
app.get("/journal-entries/filter", authenticateToken, async (req, res) => {
  const { startDate, endDate } = req.query
  const { userId } = req.user

  try {
    // Convert startDate and endDate from milliseconds to Date objects
    const start = new Date(parseInt(startDate))
    const end = new Date(parseInt(endDate))

    // Find journal entries that belong to the authenticated user and fall within the date range
    const filteredEntries = await JournalEntry.find({
      userId: userId,
      journalDate: { $gte: start, $lte: end },
    }).sort({ isFavourite: -1 })

    res.status(200).json({ entries: filteredEntries })
  } catch (error) {
    res.status(500).json({ error: true, message: error.message })
  }
})

app.listen(process.env.PORT)
export default app
