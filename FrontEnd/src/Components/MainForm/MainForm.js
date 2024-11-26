/* eslint-disable jsx-a11y/img-redundant-alt */
import React from 'react';
import './MainForm.css';
import TaskBar from '../TaskBar/TaskBar';
import Footer from '../Footer/Footer';
import Rick from '../Assets/Photo/Rick.jpg';

const MainForm = () => {
  return (
    <div className='Main'>
      <div className='Heading'>
        <TaskBar />
      </div>

      {/* Carousel Section */}
      <div className='Body'>
        <div className='carousel-section'>
          <div className='carousel'>
          <img src={Rick} alt='Rick' />
          </div>
        </div>

        {/* Popular Dishes Section */}
        <div className='popular-dishes'>
          <h2>Món ăn phổ biến</h2>
          <div className='dishes-container'>
            <div className='dish-card' onClick={() => alert('Công thức 1')}>
              <img src={Rick} alt='Rick' />
              <p>Món ăn 1</p>
            </div>
            <div className='dish-card' onClick={() => alert('Công thức 2')}>
                <img src={Rick} alt='Rick' />
              <p>Món ăn 2</p>
            </div>
            <div className='dish-card' onClick={() => alert('Công thức 3')}>
              <img src={Rick} alt='Rick' />
              <p>Món ăn 3</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className='Footer'>
        <Footer />
      </div>
    </div>
  );
};

export default MainForm;
