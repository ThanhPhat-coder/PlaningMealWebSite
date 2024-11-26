/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './TaskBar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import chillMusic from '../Assets/Music/rick.MP3'; // Đường dẫn tới file nhạc chill

const TaskBar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false); // Trạng thái mở/đóng dropdown
  const [isPlaying, setIsPlaying] = useState(false); // Trạng thái phát nhạc
  const audioRef = useRef(new Audio(chillMusic)); // Tạo đối tượng audio với nhạc chill
  const [currentTime, setCurrentTime] = useState(0); // Lưu thời gian hiện tại của nhạc
  const dropdownRef = useRef(null); // Tạo ref cho dropdown
  const navigate = useNavigate(); // Dùng để điều hướng

  // Hàm bật/tắt dropdown
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Hàm bật/tắt phát nhạc
  const toggleMusic = () => {
    if (isPlaying) {
      audioRef.current.pause(); // Dừng nhạc nếu đang phát
      setIsPlaying(false);
    } else {
      audioRef.current.currentTime = currentTime; // Đặt lại thời gian hiện tại khi phát lại
      audioRef.current.play(); // Phát nhạc từ thời gian đã dừng
      setIsPlaying(true);
    }
  };

  // Cập nhật thời gian hiện tại của nhạc khi phát
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(audioRef.current.currentTime);
    };

    audioRef.current.addEventListener('timeupdate', updateTime);

    return () => {
      audioRef.current.removeEventListener('timeupdate', updateTime);
    };
  }, []);

  // Đóng dropdown khi nhấp ra ngoài
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('token'); // Xóa token khỏi localStorage
    navigate('/'); // Điều hướng về LoginForm
  };

  const handleHome = () => {
    navigate('/main'); // Điều hướng về MainForm
  };

  const handleMealPlan = () => {
    navigate('/planmeal'); // Điều hướng về PlanMealForm
  };

  const handleIngredient = () => {
    navigate('/ingredient'); // Điều hướng về IngredientForm
  }
  return (
    <div className='taskbar-container'>
      <div className='taskbar-left'>
        <div className='taskbar-icon'>
          <i className="fa fa-home" onClick={handleHome}></i>
        </div>
        <div className='music-icon' onClick={toggleMusic}>
          <i className="fa fa-music"></i>
          <span className='music-text'>{isPlaying ? 'Dừng nhạc' : 'Phát nhạc'}</span>
        </div>
      </div>
      <div className='taskbar-right'>
        <div className='taskbar-item-container'>
          <div className='taskbar-item' onClick={handleMealPlan}>Chức năng 1</div>
          <div className='taskbar-item' onClick={handleIngredient}>Chức năng 2</div>
          <div className='taskbar-item'>Chức năng 3</div>
          <div className='taskbar-item'>Chức năng 4</div>
        </div>
        <div className='user-profile' onClick={toggleDropdown} ref={dropdownRef}>
          <img src='path/to/avatar.jpg' alt='User Avatar' className='user-avatar' />
          <div className='dropdown-icon'>
            <i className="fa fa-caret-down"></i>
          </div>
          {dropdownOpen && (
            <div className='dropdown-menu'>
              <a href='#'>
                <FontAwesomeIcon icon={faCog} /> Cài đặt
              </a>
              <a href='#' onClick={handleLogout}> {/* Gọi hàm xử lý đăng xuất */}
                <FontAwesomeIcon icon={faSignOutAlt} /> Đăng xuất
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskBar;
