import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginForm from './Components/LoginForm/LoginForm';
import MainForm from './Components/MainForm/MainForm';
import MealPlan from './Components/PlanMealForm/PlanMeal';
import IngredientForm from './Components/IngredientForm/IngredientForm';
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/main" element={<MainForm />} />
        <Route path='/planmeal' element={<MealPlan />} />
        <Route path='/ingredient' element={<IngredientForm />} />
      </Routes>
    </Router>
  );
};

export default App;
