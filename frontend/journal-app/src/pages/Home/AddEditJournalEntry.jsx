import React, { useState } from "react"
import { MdAdd, MdDeleteOutline, MdUpdate, MdClose } from "react-icons/md"
import moment from "moment"
import { toast } from "react-toastify"
import axiosInstance from "../../utils/axiosInstance"
import DateSelector from "../../components/Inputs/DateSelector"
import ImageSelector from "../../components/Inputs/ImageSelector"
import uploadImage from "../../utils/uploadImage"
import TagInput from "../../components/Inputs/TagInput"

const AddEditJournalEntry = ({
  entryInfo,
  type,
  onClose,
  getAllJournalEntries,
}) => {
  const [title, setTitle] = useState(entryInfo?.title || "")
  const [entryImg, setEntryImg] = useState(entryInfo?.imageUrl || null)
  const [notes, setNotes] = useState(entryInfo?.notes || "")
  const [tag, setTag] = useState(entryInfo?.tag || [])
  const [journalDate, setJournalDate] = useState(entryInfo?.journalDate || null)

  const [error, setError] = useState("")

  // Add New Journal Entry
  const addNewJournalEntry = async () => {
    try {
      let imageUrl = ""
      // Upload image if present
      if (entryImg) {
        const imgUploadRes = await uploadImage(entryImg)
        // Get image URL
        imageUrl = imgUploadRes.imageUrl || ""
      }
      const response = await axiosInstance.post("/add-journal-entry", {
        title,
        notes,
        imageUrl: imageUrl || "",
        tag,
        journalDate: journalDate
          ? moment(journalDate).valueOf()
          : moment().valueOf(),
      })

      if (response.data && response.data.entry) {
        toast.success("Notes Added Successfully")
        // Refresh entries
        getAllJournalEntries()
        // Close modal
        onClose()
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message)
      } else {
        // Handle unexpected errors
        setError("An unexpected error occured. Please try again.")
      }
    }
  }

  // Update Journal Entry
  const updateJournalEntry = async () => {
    const entryId = entryInfo._id

    try {
      let imageUrl = ""

      let postData = {
        title,
        notes,
        imageUrl: entryInfo.imageUrl || "",
        tag,
        journalDate: journalDate
          ? moment(journalDate).valueOf()
          : moment().valueOf(),
      }

      if (typeof entryImg === "object") {
        // Upload New Image
        const imgUploadRes = await uploadImage(entryImg)
        imageUrl = imgUploadRes.imageUrl || ""

        postData = {
          ...postData,
          imageUrl: imageUrl,
        }
      }

      const response = await axiosInstance.put(
        "/edit-entry/" + entryId,
        postData
      )

      if (response.data && response.data.entry) {
        toast.success("Notes Updated Successfully")
        // Refresh entries
        getAllJournalEntries()
        // Close modal
        onClose()
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setError(error.response.data.message)
      } else {
        // Handle unexpected errors
        setError("An unexpected error occured. Please try again.")
      }
    }
  }

  const handleAddOrUpdateClick = () => {
    console.log("Input Data:", { title, entryImg, notes, tag, journalDate })

    if (!title) {
      setError("Please enter a title")
      return
    }

    if (!notes) {
      setError("Don't forget your notes!")
      return
    }

    setError("")

    if (type === "edit") {
      updateJournalEntry()
    } else {
      addNewJournalEntry()
    }

    if (!title) {
      setError("Please enter the title")
      return
    }
  }

  // Delete entry image and update the entry
  const handleDeleteEntryImg = async () => {
    // Deleting the Image
    const deleteImgRes = await axiosInstance.delete("/delete-image", {
      params: {
        imageUrl: entryInfo.imageUrl,
      },
    })

    if (deleteImgRes.data) {
      const entryId = entryId._id

      const postData = {
        title,
        notes,
        tag,
        journalDate: moment().valueOf(),
        imageUrl: `${process.env.VITE_BACKEND_URL}/assets/placeholder.png`,
      }

      // Updating story
      const response = await axiosInstance.put(
        "/edit-entry/" + entryId,
        postData
      )

      setEntryImg(`${process.env.VITE_BACKEND_URL}/assets/placeholder.png`)
    }
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        <h5 className="text-xl font-medium text-slate-700">
          {type === "add" ? "Add Entry" : "Update Entry"}
        </h5>

        <div>
          <div className="flex items-center gap-3 bg-green-50/50 p-2 rounded-l-lg">
            {type === "add" ? (
              <button className="btn-small" onClick={handleAddOrUpdateClick}>
                <MdAdd className="text-lg" />
                ADD NOTES
              </button>
            ) : (
              <>
                <button className="btn-small" onClick={handleAddOrUpdateClick}>
                  <MdUpdate className="text-lg" />
                  UPDATE
                </button>
              </>
            )}

            <button className="" onClick={onClose}>
              <MdClose className="text-xl text-slate-400" />
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-xs pt-2 text-right">{error}</p>
          )}
        </div>
      </div>

      <div>
        <div className="flex-1 flex flex-col gap-2 pt-4">
          <label className="input-label">TITLE</label>
          <input
            type="text"
            className="text-2xl text-slate-950 outline-none"
            placeholder="Fun Day at the Beach"
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />

          <div className="my-3">
            <DateSelector date={journalDate} setDate={setJournalDate} />
          </div>

          <ImageSelector
            image={entryImg}
            setImage={setEntryImg}
            handleDeleteImg={handleDeleteEntryImg}
          />

          <div className="flex flex-col gap-2 mt-4">
            <label className="input-label">NOTES</label>
            <textarea
              type="text"
              className="text-sm text-slate-950 outline-none bg-slate-50 p-2 rounded"
              placeholder="What's on your mind?"
              rows={10}
              value={notes}
              onChange={({ target }) => setNotes(target.value)}
            />
          </div>

          <div className="pt-3">
            <label className="input-label">TAGS</label>
            <TagInput tags={tag} setTags={setTag} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddEditJournalEntry
