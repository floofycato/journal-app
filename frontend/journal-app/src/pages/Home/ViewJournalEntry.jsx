import React from "react"
import { MdAdd, MdDeleteOutline, MdUpdate, MdClose } from "react-icons/md"
import { FiTag } from "react-icons/fi"
import moment from "moment"

const ViewJournalEntry = ({
  entryInfo,
  onClose,
  onEditClick,
  onDeleteClick,
}) => {
  return (
    <div className="relative">
      <div className="flex items-center justify-end">
        <div>
          <div className="flex items-center gap-3 bg-green-50/50 p-2 rounded-l-lg">
            <button className="btn-small" onClick={onEditClick}>
              <MdUpdate className="text-lg" />
              UPDATE
            </button>

            <button className="btn-small btn-delete" onClick={onDeleteClick}>
              <MdDeleteOutline className="text-lg" />
              Delete
            </button>

            <button className="" onClick={onClose}>
              <MdClose className="text-xl text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      <div>
        <div className="flex-1 flex flex-col gap-2 py-4">
          <h1 className="text-2xl text-slare-950">
            {entryInfo && entryInfo.title}
          </h1>

          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              {entryInfo && moment(entryInfo.journalDate).format("Do MMM YYYY")}
            </span>
            <div className="tag mt-0">
              <FiTag className="text-sm" />
              {entryInfo &&
                entryInfo.tag.map((item, index) =>
                  entryInfo.tag.length === index + 1 ? `${item}` : `${item}, `
                )}
            </div>
          </div>
        </div>

        <img
          src={entryInfo && entryInfo.imageUrl}
          alt="Selected"
          className="w-full h-[300px] object-cover rounded-lg"
        />

        <div className="mt-4">
          <p className="text-sm text-slate-950 leading-6 text-justify whitespace-pre-line">
            {entryInfo.notes}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ViewJournalEntry
