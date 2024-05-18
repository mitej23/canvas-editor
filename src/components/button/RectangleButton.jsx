import React from 'react'
import IconButton from './IconButton'

const RectangleButton = ({ isActive, handleOnClick }) => {
  return (
    <IconButton isActive={isActive} handleOnClick={handleOnClick}>
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M24 12H12V24H24V12ZM10 10V26H26V10H10Z"
          fill="currentColor"
        />
      </svg>
    </IconButton>
  )
}

export default RectangleButton