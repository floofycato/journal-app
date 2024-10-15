import React, { useEffect, useState } from "react"
import Navbar from "../../components/Navbar"
import { useNavigate } from "react-router-dom"
import axiosInstance from "../../utils/axiosInstance"
import { MdAdd } from "react-icons/md"
import Modal from "react-modal"
import JournalEntryCard from "../../components/Cards/JournalEntryCard"
import AddEditJournalEntry from "./AddEditJournalEntry"
import ViewJournalEntry from "./ViewJournalEntry"

import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const Home = () => {
  const navigate = useNavigate()
  const [userInfo, setUserInfo] = useState(null)
  const [allEntries, setAllEntries] = useState([])

  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  })

  const [openViewModal, setOpenViewModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  })

  // Get User Info
  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/get-user")
      if (response.data && response.data.user) {
        // Set user info if data exists
        setUserInfo(response.data.user)
      }
    } catch (error) {
      if (error.response.status === 401) {
        // Clear storage if unauthorized
        localStorage.clear()
        navigate("/login") // Redirect to login
      }
    }
  }

  // Get all journal entries
  const getAllJournalEntries = async () => {
    try {
      const response = await axiosInstance.get("/get-all-entries")
      if (response.data && response.data.entries) {
        // Set user info if data exists
        setAllEntries(response.data.entries)
      }
    } catch (error) {
      console.log("An unexpected error occured. Please try again.")
    }
  }

  // Handle Edit Entry Click
  const handleEdit = (data) => {
    setOpenAddEditModal({ isShown: true, type: "edit", data: data })
  }

  // Handle Journal Entry Cilck
  const handleViewEntry = (data) => {
    setOpenViewModal({ isShown: true, data })
  }

  // Handle Update Favourite
  const updateIsFavourite = async (entryData) => {
    const entryId = entryData._id

    try {
      const response = await axiosInstance.put(
        "/update-is-favourite/" + entryId,
        {
          isFavourite: !entryData.isFavourite, // Toggle the favourite status
        }
      )

      if (response.data && response.data.entry) {
        toast.success("Journal Updated Successfully")
        getAllJournalEntries()
      }
    } catch (error) {
      console.log("An unexpected error occured. Please try again.")
    }
  }

  // Delete Journal Entry
  const deleteJournalEntry = async (data) => {
    const entryId = data._id

    try {
      const response = await axiosInstance.delete("/delete-entry/" + entryId)
      if (response.data && !response.data.error) {
        toast.error("Entry Deleted Successfully")
        setOpenViewModal((prevState) => ({ ...prevState, isShown: false }))
        getAllJournalEntries()
      }
    } catch (error) {
      // Handle unexpected errors
      console.log("An unexpected error occured. Please try again.")
    }
  }

  useEffect(() => {
    getAllJournalEntries()
    getUserInfo()
    return () => {}
  }, [])

  return (
    <>
      <Navbar userInfo={userInfo} />

      {/* Journal Cards */}
      <div className="container mx-auto py-10 px-6 md:px-0">
        <div className="flex gap-7">
          <div className="flex-1">
            {allEntries.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allEntries.map((item) => {
                  return (
                    <JournalEntryCard
                      key={item._id}
                      imgUrl={item.imageUrl}
                      title={item.title}
                      notes={item.notes}
                      date={item.journalDate}
                      tag={item.tag}
                      isFavourite={item.isFavourite}
                      onClick={() => handleViewEntry(item)}
                      onFavouriteClick={() => updateIsFavourite(item)}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="w-[380px] p-10">
                It's never too late to start capturing your moments!
              </div>
            )}
          </div>

          {/* Will add calendar for filtering:  */}
          <div className="absolute lg:relative lg:w-[320px]"></div>
        </div>
      </div>

      {/* Add & Edit Journal Entry Modal */}
      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
            zIndex: 999,
          },
        }}
        appElement={document.getElementById("root")}
        className="modal-box"
      >
        <AddEditJournalEntry
          type={openAddEditModal.type}
          entryInfo={openAddEditModal.data}
          onClose={() => {
            setOpenAddEditModal({ isShown: false, type: "add", data: null })
          }}
          getAllJournalEntries={getAllJournalEntries}
        />
      </Modal>

      {/* View Journal Entry Modal */}
      <Modal
        isOpen={openViewModal.isShown}
        onRequestClose={() => {}}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
            zIndex: 999,
          },
        }}
        appElement={document.getElementById("root")}
        className="modal-box"
      >
        <ViewJournalEntry
          entryInfo={openViewModal.data || null}
          onClose={() => {
            setOpenViewModal((prevState) => ({ ...prevState, isShown: false }))
          }}
          onEditClick={() => {
            setOpenViewModal((prevState) => ({ ...prevState, isShown: false }))
            handleEdit(openViewModal.data || null)
          }}
          onDeleteClick={() => {
            deleteJournalEntry(openViewModal.data || null)
          }}
        />
      </Modal>

      {/* Add Button */}
      <div className="fixed bottom-0 w-full h-32 bg-gradient-to-t from-white/100 via-white/20 to-transparent backdrop-saturate-150">
        <button
          className="btn-plus"
          onClick={() => {
            setOpenAddEditModal({ isShown: true, type: "add", data: null })
          }}
        >
          <MdAdd className="text-[32px] text-white" />
        </button>
      </div>

      <ToastContainer />
    </>
  )
}

export default Home
