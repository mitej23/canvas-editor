import React from 'react'
import styles from "./IconButton.module.css";

const IconButton = ({ handleOnClick, children, isActive }) => {
  return (
    <button
      className={`${styles.button} ${isActive ? styles.button_active : ""}`}
      onClick={handleOnClick}
    >
      {children}
    </button>
  )
}

export default IconButton