import moment from "moment/moment"
import React from "react"
import { FaHeart } from "react-icons/fa6"
import { FiTag } from "react-icons/fi"

const JournalEntryCard = ({
  imgUrl,
  title,
  date,
  notes,
  tag,
  isFavourite,
  onFavouriteClick,
  onClick,
}) => {
  return (
    <div className="border rounded-lg overflow-hidden bg-white hover:shadow-lg hover:shadow-slate-200 transition-all ease-in-out relative cursor-pointer">
      <img
        src={imgUrl || `${process.env.VITE_BACKEND_URL}/assets/placeholder.png`}
        alt={title}
        className="w-full h-56 object-cover rounded-lg"
        onClick={onClick}
      />

      <button
        className="w-12 h-12 flex items-center justify-center bg-white/40 rounded-lg border border-white/30 absolute top-4 right-4"
        onClick={onFavouriteClick}
      >
        <FaHeart
          className={`icon-btn ${
            isFavourite ? "text-red-500" : "text-slate-200"
          }`}
        />
      </button>

      <div className="p-4" onClick={onClick}>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <h6 className="text-sm font-medium">{title}</h6>
            <span className="text-xs text-slate-500">
              {date ? moment(date).format("Do MMM YYYY") : "-"}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 mt-2">{notes?.slice(0, 60)}</p>

        <div className="tag">
          <FiTag className="text-sm" />
          {tag.map((item, index) =>
            tag.length === index + 1 ? `${item}` : `${item}, `
          )}
        </div>
      </div>
    </div>
  )
}

export default JournalEntryCard
